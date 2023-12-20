/*global _*/
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/f/GridContainer",
    "sap/f/GridContainerSettings",
    "com/thy/ux/per/model/ComponentPool",
    "../model/formatter",
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,
    GridContainer,
    GridContainerSettings,
    ComponentPool,
    formatter
  ) {
    "use strict";

    return BaseController.extend("com.thy.ux.per.controller.Design", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the design controller is instantiated.
       * @public
       */
      onInit: function () {
        var oViewModel = new JSONModel({
          ComponentTree: [],
          ComponentList: [],
          ComponentPool: ComponentPool.loadPool(),
          AddMenuOptions: [],
          ConfigOptions: [],
          FieldProperties: {},
          CustomStyles: [],
          IconList: this._getIconList(),
          FormTitle: "",
          TreeRefreshToken: new Date().getTime(),
          State:null,
          FormId: null
        });

        oViewModel.setSizeLimit(2000);
        this.setModel(oViewModel, "designView");

        //--Set view variables for later usage
        this._selectedUIComponent = null;
        this._currentFormId = null;

        this.getRouter()
          .getRoute("design")
          .attachPatternMatched(this._onDesignMatched, this);
      },

      _prepareOdataPayload: function (bRefresh = false, bAs = false) {
        var oViewModel = this.getModel("designView");
        var aCompList = oViewModel.getProperty("/ComponentList");
        var sFormId = bAs ? "" : this._currentFormId;

        var oPayload = {
          FormId: sFormId,
          FormTitle: oViewModel.getProperty("/FormTitle"),
          FormComponentSet: bRefresh ? { results: [] } : [],
        };

        if(bAs){
          aCompList.forEach((oComp,i)=>{
            const sNewUid = this._getNewUid();
            var aChild = _.filter(aCompList, ["ParentUid", oComp.ElementUid]) || [];
            aChild.forEach((oChildComp,j)=>{
              aChild[j].ParentUid = sNewUid;
            });
            aCompList[i].ElementUid = sNewUid;
          });
          debugger;
        }

        aCompList.forEach((oComp) => {
          var oCompSet = {
            FormId: sFormId,
            FieldId: oComp.FieldId,
            FieldDescription: oComp.FieldDescription,
            Bindable: oComp.Bindable,
            ElementUid: oComp.ElementUid,
            ElementId: oComp.ElementId,
            ParentUid: oComp.ParentUid,
            Type: oComp.Type,
            AggregationName: oComp.AggregationName,
            FormComponentPropertySet: bRefresh ? { results: [] } : [],
          };

          var aOptions = this._getComponentProperties(oComp.Component) || [];

          aOptions.forEach((oOpt) => {
            if (oOpt.Value !== null) {
              if (
                Array.isArray(oOpt.Value) ||
                typeof oOpt.Value === "object" ||
                oOpt.Value === oOpt.DefaultValue
              ) {
                return;
              }
              var oProp = {
                FormId: sFormId,
                ElementUid: oComp.ElementUid,
                PropertyName: oOpt.Property,
                PropertyValue: oOpt.Value.toString(),
                PropertyType: oOpt.Type,
                IsStyleClass: false,
              };
              bRefresh
                ? oCompSet.FormComponentPropertySet.results.push(oProp)
                : oCompSet.FormComponentPropertySet.push(oProp);
            }
          });

          if (oComp.Component?.aCustomStyleClasses) {
            [...oComp.Component?.aCustomStyleClasses].forEach((o, i) => {
              var oProp = {
                FormId: sFormId,
                ElementUid: oComp.ElementUid,
                PropertyName: "customStyle" + i,
                PropertyValue: o.toString(),
                PropertyType: "string",
                IsStyleClass: true,
              };
              bRefresh
                ? oCompSet.FormComponentPropertySet.results.push(oProp)
                : oCompSet.FormComponentPropertySet.push(oProp);
            });
          }

          bRefresh
            ? oPayload.FormComponentSet.results.push(oCompSet)
            : oPayload.FormComponentSet.push(oCompSet);
        });

        return oPayload;
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */
      onSaveForm: async function () {
        this._handleSave(false);
      },
      onSaveAsForm: function(){
        this._handleSave(true);
      },
      _handleSave: async function(bAs = false){
        var oViewModel = this.getModel("designView");
        var oModel = this.getModel();
        // var aCompList = oViewModel.getProperty("/ComponentList");
        var that = this;

        const { value: FormTitle } = await Swal.fire({
          title: bAs ? "Formu Farklı Kaydet" : "Formu Kaydet",
          input: "text",
          inputLabel: "Formun tanımı",
          inputPlaceholder: "Bir form tanımı giriniz",
          inputValue: bAs ? oViewModel.getProperty("/FormTitle") + " Kopyası": oViewModel.getProperty("/FormTitle"),
          inputAttributes: {
            maxlength: "40",
            autocapitalize: "off",
            autocorrect: "off",
          },
          showCancelButton: true,
          cancelButtonText: this.getText("CANCEL_ACTION", []),
          inputValidator: (value) => {
            if (!value) {
              return "Form tanımı girmelisiniz!";
            }
          },
        });
        if (FormTitle) {
          oViewModel.setProperty("/FormTitle", FormTitle);

          var oPayload = this._prepareOdataPayload(false, bAs);

          // console.log(oPayload);
          this.openBusyFragment(bAs ? "SAVE_AS_IN_PROGRESS" : "SAVE_IN_PROGRESS", []);
          oModel.create("/FormHeaderSet", oPayload, {
            success: function (oData, oResponse) {
              that.toastMessage("S", "MESSAGE_SUCCESSFUL", "FORM_SAVED", []);
              that.closeBusyFragment();
              if(bAs){
                that.getRouter().navTo("design", {
                  formId: oData.FormId
                }, false);
              }
            },
            error: function (oError) {
              that.toastMessage("E", "MESSAGE_FAILED", "FORM_NOT_SAVED", []);
              that.closeBusyFragment();
            },
          });
        }
      },
      onCompTreeItemSelected: function (oEvent) {
        var oItem = oEvent.getParameter("listItem");
        var oViewModel = this.getModel("designView");
        var sRefComp = oItem.data("RefComp");
        oViewModel.setProperty("/ConfigOptions", []);
        oViewModel.setProperty("/FieldProperties", {});
        oViewModel.setProperty("/CustomStyles", []);

        var oElem = $("#" + sRefComp).control()[0];

        if (!oElem) {
          oElem = this._getUIComponent(sRefComp);
        }

        if (!oElem) {
          return;
        }

        //--Emphasize element on tree
        $(".emphasizedElement").removeClass("emphasizedElement");

        if (oElem) {
          $("#" + oItem.data("RefComp")).addClass("emphasizedElement");
        }

        //--Get properties
        var aOptions = this._getComponentProperties(oElem);
        oViewModel.setProperty("/ConfigOptions", aOptions);

        var aCustomStyles = [];

        if (oElem?.aCustomStyleClasses) {
          aCustomStyles = [...oElem.aCustomStyleClasses].map((o, i) => {
            return {
              Key: "key_" + i + "_" + new Date().getTime(),
              Value: o,
            };
          });
        }

        oViewModel.setProperty("/CustomStyles", aCustomStyles);

        var oComp = _.clone(this._findUIComponent(sRefComp, null));
        oViewModel.setProperty("/FieldProperties", {
          ElementId: oComp.ElementId,
          FieldId: oComp.FieldId,
          FieldDescription: oComp.FieldDescription,
          Bindable: oComp.Bindable
        });
       
        
      },
      onFieldPropertyChanged: function () {
        var oViewModel = this.getModel("designView");
        var oFieldProp = oViewModel.getProperty("/FieldProperties");
        var aCompList = oViewModel.getProperty("/ComponentList");

        var i = _.findIndex(aCompList, ["ElementId", oFieldProp.ElementId]);

        if (i === -1) {
          return;
        }

        var j = _.findIndex(aCompList, ["FieldId", oFieldProp.FieldId]);

        if (j !== -1 && j !== i)  {
          oViewModel.setProperty("/FieldProperties/FieldId", aCompList[i].FieldId);
          this.alertMessage("E", "MESSAGE_ERROR", "DUPLICATE_FIELD_ID", [oFieldProp.FieldId]);
          return;
        }


        oFieldProp.FieldId = oFieldProp.FieldId?.replace(/\s/g, "");


        if ( !oFieldProp.FieldDescription || !oFieldProp.FieldId ||
          oFieldProp.FieldDescription?.trim().length === 0 ||
          oFieldProp.FieldId?.trim().length === 0
        ) {
          this.alertMessage("E", "MESSAGE_ERROR", "FIELD_PROPERTY_EMPTY", []);
          return;
        }

        //--Make the changes
        aCompList[i].FieldId = oFieldProp.FieldId;
        aCompList[i].FieldDescription = oFieldProp.FieldDescription;
        aCompList[i].Bindable = oFieldProp.Bindable;

        oViewModel.setProperty("/ComponentList", aCompList);
        oViewModel.setProperty("/TreeRefreshToken", new Date().getTime());

      },
      onStyleUpdated: function (oEvent) {
        var aRemoved = oEvent.getParameter("removedTokens");
        var oViewModel = this.getModel("designView");
        var aCustomStyles = oViewModel.getProperty("/CustomStyles");

        aRemoved.forEach((r) => {
          var i = aCustomStyles.findIndex(
            (s) => s.Key === r.getProperty("key")
          );
          if (i !== -1) aCustomStyles.splice(i, 1);
        });

        oViewModel.setProperty("/CustomStyles", aCustomStyles);

        this.onSaveConfiguration();
      },

      onStyleAdded: function (oEvent) {
        var oViewModel = this.getModel("designView");
        var aCustomStyles = oViewModel.getProperty("/CustomStyles");
        var sNew = oEvent.getParameter("value");

        aCustomStyles.push({
          Key: "key_" + (aCustomStyles.length + 1) + "_" + new Date().getTime(),
          Value: sNew,
        });

        oViewModel.setProperty("/CustomStyles", aCustomStyles);

        oEvent.getSource().setValue(null);

        this.onSaveConfiguration();
      },

      onAddComponent: function (oEvent) {
        var oSource = oEvent.getSource();
        var sRefComp = oSource.data("RefComp");

        if (!sRefComp) {
          return;
        }

        var oElem = $("#" + sRefComp).control()[0];

        if (!oElem) {
          oElem = this._getUIComponent(sRefComp);
        }

        if (!oElem) {
          return;
        }

        this._openAddMenu(oElem, oSource);
      },
      onDeleteComponent: function (oEvent) {
        var oSource = oEvent.getSource();
        var sRefComp = oSource.data("RefComp");

        if (!sRefComp) {
          return;
        }

        var oElem = this._findUIComponent(sRefComp);

        if (!oElem) {
          return;
        }

        this.confirmDialog({
          title: this.getText("DEL_COMPONENT_TITLE", []),
          html: this.getText("DEL_COMPONENT_TEXT", [oElem.Type]),
          icon: "warning",
          confirmButtonText: this.getText("DELETE_ACTION"),
          confirmCallbackFn: function () {
            this._handleDeleteComponent(oElem);
          }.bind(this),
        });
      },
      onAddMenuSelected: function (oEvent) {
        var oItem = oEvent.getParameter("item");
        var oRef = this._oAddMenu.data("RefComp");
        var sChildType = oItem.getKey();
        this._handleAddComponent(oRef, sChildType);
      },
      onAddMenuClosed: function () {
        if (!this._oAddMenu) {
          var oViewModel = this.getModel("designView");
          oViewModel.setProperty("/AddMenuOptions", []);
          this._oAddMenu.data("RefComp", null);
        }
      },

      createConfigOptionRows: function (sId, oContext) {
        var oUIControl = null,
          oEl = null,
          oObj = null;

        oUIControl = new sap.m.ColumnListItem(sId, {
          cells: [
            new sap.m.Text({
              text: {
                path: "designView>Name",
              },
            }),
          ],
        });
        var sType = oContext.getProperty("Type");
        switch (sType) {
          case "boolean":
            oEl = new sap.m.CheckBox({
              selected: {
                path: "designView>Value",
              },
              select: this.onSaveConfiguration.bind(this),
            });

            break;
          case "sap.ui.core.CSSSize":
          case "sap.ui.core.URI":
            if (oContext.getProperty("Name") === "icon") {
              oEl = new sap.m.Input({
                value: {
                  path: "designView>Value",
                },
                submit: this.onSaveConfiguration.bind(this),
                showSuggestion: true,
                suggestionItems: {
                  path: "designView>/IconList",
                  template: new sap.ui.core.Item({
                    key: "{designView>Key}",
                    text: "{designView>Icon}",
                  }),
                },
                suggestionItemSelected: function (oEvent) {
                  var oItem = oEvent.getParameter("selectedItem");

                  oEl.setValue(oItem?.getKey());
                },
              });
            } else {
              oEl = new sap.m.Input({
                value: {
                  path: "designView>Value",
                },
                submit: this.onSaveConfiguration.bind(this),
              });
            }

            break;

          default:
            try {
              oObj = eval(sType);
            } catch (e) {}
            if (
              (sType.includes("sap.") || sType.includes("com.smod")) &&
              oObj &&
              typeof oObj === "object"
            ) {
              oEl = new sap.m.Select({
                items: (() => {
                  var aValue = [];

                  for (const [key, value] of Object.entries(oObj)) {
                    aValue.push(
                      new sap.ui.core.Item({
                        key: key,
                        text: value,
                      })
                    );
                  }
                  return aValue;
                })(),
                change: this.onSaveConfiguration.bind(this),
                selectedKey: {
                  path: "designView>Value",
                },
              });
            } else {
              oEl = new sap.m.Input({
                value: {
                  path: "designView>Value",
                },
                submit: this.onSaveConfiguration.bind(this),
              });
            }
            break;
        }

        oUIControl.addCell(oEl);
        return oUIControl;
      },
      onCloseConfiguration: function () {
        var oViewModel = this.getModel("designView");
        oViewModel.setProperty("/ConfigOptions", []);
      },
      onSaveConfiguration: function () {
        var oViewModel = this.getModel("designView");
        var aOptions = oViewModel.getProperty("/ConfigOptions");
        var aCustomStyles = oViewModel.getProperty("/CustomStyles");
        var that = this;
        var oObj;
        var sVal;

        if (!this._selectedUIComponent) {
          return;
        }

        //Get current styles
        var aCurrentStyles = this._selectedUIComponent?.aCustomStyleClasses
          ? [...this._selectedUIComponent?.aCustomStyleClasses]
          : [];

        aOptions.forEach((o) => {
          try {
            switch (o.Type) {
              case "int":
                sVal = parseInt(o.Value, 10);
                break;
              case "sap.ui.core.CSSSize":
              case "sap.ui.core.URI":
                sVal = o.Value;
                break;
              default:
                oObj = null;
                try {
                  oObj = eval(o.Type);
                } catch (e) {}
                if (
                  (o.Type.includes("sap.") || o.Type.includes("com.smod")) &&
                  oObj &&
                  typeof oObj === "object"
                ) {
                  sVal = oObj[o.Value];
                } else {
                  sVal = o.Value;
                }
            }

            that._selectedUIComponent?.setProperty(o.Name, sVal);
          } catch (e) {}
        });

        aCurrentStyles.forEach((s) => {
          that._selectedUIComponent.removeStyleClass(s);
        });

        aCustomStyles.forEach((s) => {
          that._selectedUIComponent.addStyleClass(s.Value);
        });
      },

      getFieldDescription: function(sElementId, sToken){
        var oComp = this._findUIComponent(sElementId);
        if(!oComp){
          return ""
        }
        return `(${oComp.FieldDescription})`;
      },
      checkIsDeletable: function (sId) {
        var oComp = this._findUIComponent(sId);
        if (!oComp || !oComp.ParentId) {
          return false;
        }
        return true;
      },

      checkIsMoveableToUp: function (oComp) {
        if (!oComp.ParentId) {
          return false;
        }

        var oChild = this._findUIComponent(oComp.ElementId);
        var oParent = this._findUIComponent(oComp.ParentId);

        if (!oChild || !oParent) {
          return false;
        }

        try {
          var aAggr = oParent?.Component.getAggregation(oComp.AggregationName);

          if (!Array.isArray(aAggr)) return false;

          if (aAggr.length <= 1) {
            return false;
          }

          var iInd = -1;

          aAggr.forEach((oAggr, i) => {
            if (oAggr.getId() === oComp.ElementId) {
              iInd = i;
              return false;
            }
          });
        } catch (e) {
          return false;
        }

        return iInd > 0;
      },

      checkIsMoveableToDown: function (oComp) {
        if (!oComp.ParentId) {
          return false;
        }

        var oChild = this._findUIComponent(oComp.ElementId);
        var oParent = this._findUIComponent(oComp.ParentId);

        try {
          if (!oChild || !oParent) {
            return false;
          }

          var aAggr = oParent?.Component.getAggregation(oComp.AggregationName);

          if (!Array.isArray(aAggr)) return false;

          if (aAggr.length <= 1) {
            return false;
          }

          var iInd = -1;

          aAggr.forEach((oAggr, i) => {
            if (oAggr.getId() === oComp.ElementId) {
              iInd = i;
              return false;
            }
          });
        } catch (e) {
          onMoveUp;
        }

        return iInd < aAggr.length - 1;
      },

      onMoveUp: function (oEvent) {
        this._handleComponentSwap(oEvent, "Up");
      },

      onMoveDown: function (oEvent) {
        this._handleComponentSwap(oEvent, "Down");
      },
      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */
      _handleComponentSwap: function (oEvent, sDirection) {
        var oSource = oEvent.getSource();
        var sElementId = oSource.data("ElementId");
        var sAggregationName = oSource.data("AggregationName");

        var oChild = this._findUIComponent(sElementId);
        var oParent = this._findUIComponent(oChild.ParentId);

        if (!oChild || !oParent) {
          return;
        }

        var aAggr = oParent?.Component.getAggregation(sAggregationName);

        if (!Array.isArray(aAggr)) return;

        if (aAggr.length <= 1) {
          return false;
        }

        var iInd = -1;

        aAggr.forEach((oAggr, i) => {
          if (oAggr.getId() === sElementId) {
            iInd = i;
            return false;
          }
        });

        if (
          iInd < 0 ||
          (iInd === 0 && sDirection === "Up") ||
          (iInd === aAggr.length && sDirection === "Down")
        ) {
          return;
        }

        var oTarget = sDirection === "Up" ? aAggr[iInd - 1] : aAggr[iInd + 1];

        if (!oTarget) {
          return;
        }

        this._rearrangeComponentHierarchy(
          oParent.ElementId,
          sAggregationName,
          sElementId,
          oTarget.getId()
        );
      },
      _rearrangeComponentHierarchy: function (
        sParentId,
        sAggregationName,
        sSourceElementId,
        sTargetElementId
      ) {
        var oViewModel = this.getModel("designView");
        var aCompTree = oViewModel.getProperty("/ComponentTree");
        var aCompList = oViewModel.getProperty("/ComponentList");
        var iSourceIndex = -1;
        var iTargetIndex = -1;
        var oSourceElement = null;
        var oTargetElement = null;
        var that = this;

        var arrangeItem = function () {
          iSourceIndex = _.findIndex(aCompList, {
            ElementId: sSourceElementId,
            ParentId: sParentId,
            AggregationName: sAggregationName,
          });
          iTargetIndex = _.findIndex(aCompList, {
            ElementId: sTargetElementId,
            ParentId: sParentId,
            AggregationName: sAggregationName,
          });

          if (iSourceIndex !== -1 && iTargetIndex !== -1) {
            oSourceElement = _.cloneDeep(aCompList[iSourceIndex]);
            oTargetElement = _.cloneDeep(aCompList[iTargetIndex]);

            aCompList[iSourceIndex] = null;
            aCompList[iTargetIndex] = null;

            aCompList[iSourceIndex] = _.cloneDeep(oTargetElement);
            aCompList[iTargetIndex] = _.cloneDeep(oSourceElement);
          }
        };

        //--Save arranged list
        iSourceIndex = -1;
        iTargetIndex = -1;
        oSourceElement = null;
        oTargetElement = null;
        arrangeItem();

        var aNewCompList = [];

        //--Reindex list
        aNewCompList[0] = _.clone(aCompList[0]);
        var reIndexChildren = (sParentId) => {
          var oParent = _.find(aCompList, ["ElementId", sParentId]);
          // aNewCompList.push(oParent);

          if (oParent) {
            var aChildren = _.filter(aCompList, ["ParentId", sParentId]) || [];

            aChildren.forEach((oChild) => {
              aNewCompList.push(oChild);
              reIndexChildren(oChild.ElementId);
            });
          }
        };

        reIndexChildren(aCompList[0].ElementId);

        // oViewModel.setProperty("/ComponentTree", aCompTree);
        oViewModel.setProperty("/ComponentList", aNewCompList);

        var oPayload = this._prepareOdataPayload(true, false);

        this._constructUI(oPayload);

        this.toastMessage(
          "S",
          "MESSAGE_SUCCESSFUL",
          "SWAP_COMPONENT_SUCCESSFUL",
          []
        );
      },
      _onDesignMatched: function (oEvent) {
        var sFormId = oEvent.getParameter("arguments").formId;
        var oViewModel = this.getModel("designView");

        if (sFormId === "NEW") {
          oViewModel.setProperty("/State", "NEW");
          oViewModel.setProperty("/FormId", null);
          this._currentFormId = "";
          this._createRootGrid();
          this.byId("idDesignContainerTitle").unbindProperty("text");
          this.byId("idDesignContainerTitle").setVisible(false);
        } else {
          oViewModel.setProperty("/State", "EDIT");
          oViewModel.setProperty("/FormId", sFormId);
          this._currentFormId = sFormId;
          this._callFormDetailsService();
          this.byId("idDesignContainerTitle").bindProperty("text", {path:`/FormHeaderSet('${sFormId}')/FormTitle`});
          this.byId("idDesignContainerTitle").setVisible(true);
        }
      },
      _callFormDetailsService: function () {
        var oModel = this.getModel();
        var that = this;
        var sFormPath = oModel.createKey("/FormHeaderSet", {
          FormId: this._currentFormId,
        });

        this.openBusyFragment();
        oModel.read(sFormPath, {
          urlParameters: {
            $expand:
              "FormComponentSet,FormComponentSet/FormComponentPropertySet",
          },
          success: function (oData) {
            //--Construct UI
            that._constructUI(oData);
            //--Close busy dialog
            that.closeBusyFragment();
          },
          error: function (oError) {
            //--Error occurred
            that.closeBusyFragment();
          },
        });
      },
      _initializeComponentModel: function () {
        var oViewModel = this.getModel("designView");

        //--Initialize component list
        oViewModel.setProperty("/ComponentTree", []);
        oViewModel.setProperty("/ComponentList", []);
        oViewModel.setProperty("/FormTitle", "");
      },
      _createRootGrid: function (oData = null) {
        var oBox = this.byId("idDesignContainer");
        var oGrid =
          this.byId("idDesignGrid") || sap.ui.getCore().byId("idDesignGrid");
        var oViewModel = this.getModel("designView");

        var sRootUid =
          oData === null ? this._getNewUid() : this._getRootGridUid(oData);

        //--Initialize component first
        this._initializeComponentModel();

        if (oData) {
          oViewModel.setProperty("/FormTitle", oData.FormTitle);
        }

        try {
          if (oGrid && oGrid?.destroy) {
            oGrid.destroy();
          }

          oGrid = new GridContainer("idDesignGrid", {
            // width: "100%",
            layout: new GridContainerSettings({
              columns: 1,
              rowSize: "3rem",
              columnSize: "100%",
              gap: "0.5rem",
            }),
          })
            .data("CompType", "GridContainer")
            .addStyleClass("mainGrid")
            .addStyleClass("sapUiTinyMarginTop");

          oBox.addItem(oGrid);

          oViewModel.setProperty("/ComponentTree", [
            {
              ElementId: oGrid.getId(),
              Type: "GridContainer",
              ParentId: null,
              AggregationName: null,
              Description: "Root Grid",
              Children: [],
            },
          ]);
          oViewModel.setProperty("/ComponentList", [
            {
              ElementUid: sRootUid,
              ElementId: oGrid.getId(),
              FieldId: "FieldRootGrid0",
              FieldDescription: "Root Grid",
              Bindable: false,
              Type: "GridContainer",
              Component: oGrid,
              Properties: null,
              ParentId: null,
              ParentUid: null,
              AggregationName: null,
            },
          ]);
          return true;
        } catch (e) {
          return false;
        }
      },
      _getRootGridUid: function (oData) {
        var oGrid = oData.FormComponentSet.results.find((oComp) => {
          return !oComp.ParentUid && oComp.Type === "GridContainer";
        });

        return oGrid.ElementUid;
      },
      _constructUI: function (oData) {
        var bRoot = this._createRootGrid(oData);

        if (!bRoot) {
          return;
        }
        try {
          oData.FormComponentSet.results.forEach((oComp) => {
            if (!oComp.ParentUid && oComp.Type === "GridContainer") {
              //Do not add root again
              return;
            } else {
              this._createComponentUI(oComp);
            }
          });

          this._treeBindingRefresh();
        } catch (e) {}
      },

      _treeBindingRefresh: function () {
        setTimeout(() => {
          this.byId("idComponentTree").getBinding("items").refresh(true);
          this.byId("idComponentTree").collapseAll();
          this.byId("idComponentTree").expandToLevel(6);
        }, 500);
      },
      _handleAddComponent(oParent, sChildType) {
        var sParentType = oParent.data("CompType");

        if (!sParentType || !sChildType) {
          return;
        }

        var bSuccess = this._createComponentFromPool(oParent, sChildType);
        if (bSuccess) {
          this.toastMessage(
            "S",
            "MESSAGE_SUCCESSFUL",
            "ADD_COMPONENT_SUCCESSFUL",
            []
          );
          this._treeBindingRefresh();
        }
      },
      _handleDeleteComponent(oElement) {
        var oViewModel = this.getModel("designView");
        var aCompTree = oViewModel.getProperty("/ComponentTree");
        var aCompList = oViewModel.getProperty("/ComponentList");

        var oParent = this._getUIComponent(oElement.ParentId);

        try {
          oParent?.removeAggregation(
            oElement.AggregationName,
            oElement.ElementId
          );

          oElement.Component.destroy();

          var deleteItem = function (oEl) {
            var i = aCompList.findIndex((o) => o.ElementId === oEl.ElementId);
            if (i !== -1) {
              aCompList.splice(i, 1);
            }
          };

          var deleteChildNodeRecursive = function (aTree, sId, bDel) {
            for (var [i, oItem] of aTree.entries()) {
              if (oItem.ElementId === sId || bDel) {
                deleteChildNodeRecursive(oItem.Children, null, true);
                aTree.splice(i, 1);
                deleteItem(oItem);
              } else {
                deleteChildNodeRecursive(oItem.Children, sId, false);
              }
            }
          };

          deleteChildNodeRecursive(aCompTree, oElement.ElementId, false);

          oViewModel.setProperty("/ComponentTree", aCompTree);
          oViewModel.setProperty("/ComponentList", aCompList);
          oViewModel.setProperty("/ConfigOptions", []);
          oViewModel.setProperty("/CustomStyles", []);
        } catch (e) {}
      },

      _refreshComponentUI: function (oChild) {
        var oViewModel = this.getModel("designView");
        var oParent = this._findUIComponent(null, oChild.ParentUid);
        var aCompPool = oViewModel.getProperty("/ComponentPool");

        try {
          var oParentComp = aCompPool.find((o) => o.Type === oParent.Type);

          if (!oParentComp) {
            return null;
          }

          var oAggr = oParentComp?.Aggregations.find(
            (a) => a.Type === oChild.Type && a.Name === oChild.AggregationName
          );

          if (!oAggr) {
            return null;
          }

          var oChildComp = aCompPool.find((o) => o.Type === oChild.Type);

          if (!oChildComp) {
            return null;
          }

          var oChildInstance = oChild?.Component;

          if (
            oAggr?.AddMethod &&
            oParent.Component[oAggr.AddMethod] &&
            oChildInstance
          ) {
            //Try Adding Child
            oParent.Component[oAggr.AddMethod](oChildInstance);
            return true;
          }
        } catch (e) {
          this.toastMessage("E", "MESSAGE_ERROR", "ADD_COMPONENT_FAILED", [e]);

          return false;
        }
      },

      _createComponentUI: function (oChild) {
        var oViewModel = this.getModel("designView");
        var oParent = this._findUIComponent(null, oChild.ParentUid);
        var aCompPool = oViewModel.getProperty("/ComponentPool");
        var aCompTree = oViewModel.getProperty("/ComponentTree");
        var aCompList = oViewModel.getProperty("/ComponentList");

        try {
          var oParentComp = aCompPool.find((o) => o.Type === oParent.Type);

          if (!oParentComp) {
            return null;
          }

          var oAggr = oParentComp?.Aggregations.find(
            (a) => a.Type === oChild.Type && a.Name === oChild.AggregationName
          );

          if (!oAggr) {
            return null;
          }

          var oChildComp = aCompPool.find((o) => o.Type === oChild.Type);

          if (!oChildComp) {
            return null;
          }

          var oSavedProps = {};
          var aCustomStyleClasses = [];
          oChild.FormComponentPropertySet.results.map((oProp) => {
            if (oProp.IsStyleClass) {
              aCustomStyleClasses.push(oProp.PropertyValue);
            } else {
              switch (oProp.PropertyType) {
                case "boolean":
                  oSavedProps[oProp.PropertyName] =
                    oProp.PropertyValue === "true";
                  break;
                case "int":
                  oSavedProps[oProp.PropertyName] = parseInt(
                    oProp.PropertyValue,
                    10
                  );
                  break;
                default:
                  oSavedProps[oProp.PropertyName] = oProp.PropertyValue;
              }
            }
          });

          var oChildInstance = new oChildComp["Class"](oChild.ElementId, {
            ...oSavedProps,
          });

          if (
            oAggr?.AddMethod &&
            oParent.Component[oAggr.AddMethod] &&
            oChildInstance
          ) {
            //Set Component Type as data
            oChildInstance.data("CompType", oAggr.Type);

            //Try Adding Child
            oParent.Component[oAggr.AddMethod](oChildInstance);
            //Refresh Component Tree
            var addComponentTreeRecursive = function (aTree, sId, oNew) {
              for (var oItem of aTree) {
                if (oItem.ElementId === sId) {
                  oItem.Children.push(oNew);
                } else {
                  addComponentTreeRecursive(oItem.Children, sId, oNew);
                }
              }
            };

            var oNewItem = {
              ElementId: oChild.ElementId,
              Type: oChild.Type,
              AggregationName: oChild.AggregationName,
              Description: oChildComp.Description,
              ParentId: oParent.ElementId,
              Children: [],
            };

            addComponentTreeRecursive(aCompTree, oParent.ElementId, oNewItem);

            //Refresh Component List
            aCompList.push({
              ElementUid: oChild.ElementUid,
              ElementId: oChild.ElementId,
              FieldId: oChild.FieldId,
              FieldDescription: oChild.FieldDescription,
              Bindable: oChild.Bindable,
              ParentId: oParent.ElementId,
              ParentUid: oParent.ElementUid,
              Component: oChildInstance,
              Type: oChild.Type,
              AggregationName: oChild.AggregationName,
              Properties: { ...oSavedProps },
            });

            aCustomStyleClasses.forEach((s) => {
              oChildInstance.addStyleClass(s);
            });

            oViewModel.setProperty("/ComponentList", aCompList);
            oViewModel.setProperty("/ComponentTree", aCompTree);

            return true;
          }
        } catch (e) {
          this.toastMessage("E", "MESSAGE_ERROR", "ADD_COMPONENT_FAILED", [e]);

          return false;
        }
      },
      _createComponentFromPool: function (oParent, sChildType) {
        var oViewModel = this.getModel("designView");
        var oParentUI = this._findUIComponent(oParent.getId(), null);
        var aCompPool = oViewModel.getProperty("/ComponentPool");
        var aCompTree = oViewModel.getProperty("/ComponentTree");
        var aCompList = oViewModel.getProperty("/ComponentList");

        try {
          var oParentComp = aCompPool.find(
            (o) => o.Type === oParent.data("CompType")
          );

          if (!oParentComp) {
            return null;
          }

          var oAggr = oParentComp?.Aggregations.find(
            (a) => a.Type === sChildType
          );

          if (!oAggr) {
            return null;
          }

          var oChildComp = aCompPool.find((o) => o.Type === sChildType);

          if (!oChildComp) {
            return null;
          }

          var oChildInstance = new oChildComp["Class"](
            `id${sChildType}Component${
              crypto.getRandomValues(new Uint32Array(1))[0]
            }`,
            {
              ...oChildComp.DefaultProps,
            }
          );

          if (oAggr?.AddMethod && oParent[oAggr.AddMethod] && oChildInstance) {
            //Set Component Type as data
            oChildInstance.data("CompType", oAggr.Type);

            //Try Adding Child
            oParent[oAggr.AddMethod](oChildInstance);

            //Refresh Component Tree
            var addComponentTreeRecursive = function (aTree, sId, oNew) {
              for (var oItem of aTree) {
                if (oItem.ElementId === sId) {
                  oItem.Children.push(oNew);
                } else {
                  addComponentTreeRecursive(oItem.Children, sId, oNew);
                }
              }
            };

            //--Give a name and id
            var sFieldId = "Field" + sChildType + (aCompList.length + 1);
            var sFieldDesc = "Field description";

            var oNewItem = {
              ElementId: oChildInstance?.getId(),
              Type: sChildType,
              AggregationName: oAggr.Name,
              Description: oChildComp.Description,
              ParentId: oParent.getId(),
              Children: [],
            };

            addComponentTreeRecursive(aCompTree, oParent.getId(), oNewItem);

            //Refresh Component List
            aCompList.push({
              ElementUid: this._getNewUid(),
              ElementId: oChildInstance?.getId(),
              FieldId: sFieldId,
              FieldDescription: sFieldDesc,
              Bindable: false,
              ParentId: oParent?.getId(),
              ParentUid: oParentUI?.ElementUid || null,
              Component: oChildInstance,
              Type: sChildType,
              AggregationName: oAggr.Name,
              Properties: { ...oChildComp.DefaultProps },
            });

            oViewModel.setProperty("/ComponentList", aCompList);
            oViewModel.setProperty("/ComponentTree", aCompTree);

            if (
              oChildComp?.DefaultAggregations &&
              oChildComp?.DefaultAggregations?.length > 0
            ) {
              for (var oSubAggr of oChildComp.DefaultAggregations) {
                this._createComponentFromPool(oChildInstance, oSubAggr.Type);
              }
            }

            return true;
          }
        } catch (e) {
          this.toastMessage("E", "MESSAGE_ERROR", "ADD_COMPONENT_FAILED", [e]);

          return false;
        }
      },

      _findComponentByType: function (sType) {
        var oViewModel = this.getModel("designView");
        var aCompPool = oViewModel.getProperty("/ComponentPool");

        var oComp = aCompPool.find((o) => o.Type === sType);

        if (oComp) {
          return oComp;
        }
      },
      _getUIComponent: function (sId) {
        var oComp = this._findUIComponent(sId);

        if (oComp) {
          return oComp.Component;
        }
      },
      _findUIComponent: function (sId, sUid = null) {
        var oViewModel = this.getModel("designView");
        var aCompList = oViewModel.getProperty("/ComponentList");

        var oComp = sId
          ? aCompList.find((o) => o.ElementId === sId)
          : aCompList.find((o) => o.ElementUid === sUid);

        if (oComp) {
          return oComp;
        }
      },
      _openAddMenu: function (oRef, oSource) {
        var sType = oRef.data("CompType");

        if (!sType) {
          return;
        }

        var oViewModel = this.getModel("designView");
        var aOpts = [];
        oViewModel.setProperty("/AddMenuOptions", []);

        var oComp = this._findComponentByType(sType);

        if (!oComp) {
          return;
        }

        for (var oAggr of oComp.Aggregations) {
          var oOptComp = this._findComponentByType(oAggr.Type);
          var oOpts = { ...oAggr, Description: oOptComp.Description };
          aOpts.push(oOpts);
        }
        if (aOpts.length === 0) {
          return;
        }
        oViewModel.setProperty("/AddMenuOptions", aOpts);

        if (!this._oAddMenu) {
          this._oAddMenu = Fragment.load({
            id: this.getView().getId(),
            name: "com.thy.ux.per.fragment.AddMenu",
            controller: this,
          }).then(
            function (oMenu) {
              oMenu.openBy(oSource);
              oMenu.data("RefComp", oRef);
              this._oAddMenu = oMenu;
              this.getView().addDependent(oMenu);
              return this._oAddMenu;
            }.bind(this)
          );
        } else {
          this._oAddMenu.data("RefComp", oRef);
          this._oAddMenu.openBy(oSource);
        }
      },
      _getComponentProperties: function (c) {
        this._selectedUIComponent = c;

        if (!c?.getMetadata) {
          return null;
        }

        var aProp = [];
        for (const [key, p] of Object.entries(
          c.getMetadata()._mAllProperties
        )) {
          if (p?.visibility === "public") {
            aProp.push({
              Property: key,
              Name: p?.name,
              Type: p?.type,
              Group: p?.group || "Misc",
              Value: c?.getProperty(key),
              DefaultValue: p?.defaultValue,
            });
          }
        }

        return aProp;
      },
      _getIconList: function () {
        var aIcons = sap.ui.core.IconPool.getIconNames();

        return aIcons.map((i) => {
          return {
            Key: "sap-icon://" + i,
            Icon: i,
          };
        });
      },
      _getNewUid: function () {
        return crypto.randomUUID().replace(/-/g, "");
      },
      // onDrop: function (oInfo) {
      //   var oDragged = oInfo.getParameter("draggedControl"),
      //     oDropped = oInfo.getParameter("droppedControl"),
      //     oDragProps = oDragged?.data("props"),
      //     oDropProps,
      //     sInsertPosition = oInfo.getParameter("dropPosition");

      //   // iDragPosition = oDraggedParent.indexOfItem(oDragged),
      //   // iDropPosition = oDroppedParent.indexOfItem(oDropped);

      //   var oEl;

      //   if (oDropped && oDragProps) {
      //     switch (oDragProps.Type) {
      //       case "Panel":
      //         oEl = new sap.m.Panel({
      //           ...oDragProps.DefaultProps,
      //         });
      //         break;
      //       case "Form":
      //         oEl = new sap.ui.layout.form.Form();
      //         break;
      //       case "FormContainer":
      //         oEl = new sap.ui.layout.form.FormContainer();
      //         break;
      //       case "FormElement":
      //         oEl = new sap.ui.layout.form.FormElement();
      //         break;
      //       case "Input":
      //         oEl = new sap.m.Input();
      //         break;
      //       default:
      //         break;
      //     }

      //     if (oEl) {
      //       try {
      //         var oDB = new DesignBox({
      //           content: oEl,
      //         });

      //         oDB.addDragDropConfig(
      //           new DragInfo({
      //             groupName: "addToMainGrid",
      //           })
      //         );

      //         oDB.addDragDropConfig(
      //           new DropInfo({
      //             groupName: "addToMainGrid",
      //             drop: this.onDrop.bind(this),
      //             dropPosition: "OnOrBetween",
      //           })
      //         );

      //         if (oDragProps.AddMethod) {
      //           oEl = oEl?.addStyleClass && oEl.addStyleClass("dropChild");
      //           oEl.data("props", oDragProps);
      //         }

      //         var oParent;

      //         if (oDropped.isA("com.thy.ux.per.components.SidePanel")) {
      //           oParent = oDropped.getContent();
      //           oDropProps = oParent?.data("props") || null;
      //         } else {
      //           oParent = oDropped;
      //           oDropProps = null;
      //         }

      //         if (oDropProps && oDropProps.AddMethod) {
      //           if (typeof oParent[oDropProps.AddMethod] !== "undefined") {
      //             oParent[oDropProps.AddMethod](oDB);
      //           } else {
      //             MessageBox.show(
      //               "Eklemede hata:Uygun bileşen ya da metod değil",
      //               {
      //                 icon: MessageBox.Icon.ERROR,
      //                 title: "Hata Oluştu",
      //               }
      //             );
      //           }
      //         } else {
      //           if (typeof oDropped.addItem !== "undefined") {
      //             oDropped.addItem(oDB);
      //           } else if (typeof oDropped.addContent !== "undefined") {
      //             oDropped.addContent(oDB);
      //           } else {
      //             MessageBox.show("Eklemede hata:Uygun bileşen değil", {
      //               icon: MessageBox.Icon.ERROR,
      //               title: "Hata Oluştu",
      //             });
      //           }
      //         }

      //         // if (oDropProps && oDropProps.AddMethod) {
      //         //   if (typeof oDropped[oDropProps.AddMethod] !== "undefined") {
      //         //     oDropped[oDropProps.AddMethod](oEl);
      //         //   } else {
      //         //     MessageBox.show(
      //         //       "Eklemede hata:Uygun bileşen ya da metod değil",
      //         //       {
      //         //         icon: MessageBox.Icon.ERROR,
      //         //         title: "Hata Oluştu",
      //         //       }
      //         //     );
      //         //   }
      //         // } else {
      //         //   if (typeof oDropped.addItem !== "undefined") {
      //         //     oDropped.addItem(oEl);
      //         //   } else if (typeof oDropped.addContent !== "undefined") {
      //         //     oDropped.addContent(oEl);
      //         //   } else {
      //         //     MessageBox.show("Eklemede hata:Uygun bileşen değil", {
      //         //       icon: MessageBox.Icon.ERROR,
      //         //       title: "Hata Oluştu",
      //         //     });
      //         //   }
      //         // }
      //       } catch (e) {
      //         MessageBox.show("Eklemede hata:" + e, {
      //           icon: MessageBox.Icon.ERROR,
      //           title: "Hata Oluştu",
      //         });
      //       }
      //     }
      //   }
      // },
      // _getDropIndicatorSize: function (oDraggedControl) {
      //   // var oBindingContext = oDraggedControl.getBindingContext(),
      //   // 	oData = oBindingContext.getModel().getProperty(oBindingContext.getPath());

      //   // if (oDraggedControl.isA("sap.m.StandardListItem")) {
      //   return {
      //     rows: 1,
      //     columns: 1,
      //   };
      //   // }
      // },
      // _attachDragAndDrop: function () {
      //   var oList = this.byId("idDesignItems");
      //   oList.addDragDropConfig(
      //     new DragInfo({
      //       groupName: "addToMainGrid",
      //       sourceAggregation: "items",
      //     })
      //   );

      //   // oList.addDragDropConfig(new DropInfo({
      //   // 	targetAggregation: "items",
      //   // 	dropPosition: DropPosition.Between,
      //   // 	dropLayout: DropLayout.Vertical,
      //   // 	drop: this.onDrop.bind(this)
      //   // }));

      //   var oGrid = this.byId("idDesignGrid");
      //   // var oGrid = this.byId("idDesignForm");
      //   // oGrid.addDragDropConfig(
      //   //   new DragInfo({
      //   //     sourceAggregation: "items",
      //   //   })
      //   // );

      //   oGrid.addDragDropConfig(
      //     new DropInfo({
      //       groupName: "addToMainGrid",
      //       drop: this.onDrop.bind(this),
      //       dropPosition: "On",
      //     })
      //   );

      //   // oGrid.addDragDropConfig(new GridDropInfo({
      //   // 	targetAggregation: "items",
      //   // 	dropPosition: DropPosition.Between,
      //   // 	dropLayout: DropLayout.Horizontal,
      //   // 	dropIndicatorSize: this._getDropIndicatorSize.bind(this),
      //   // 	drop: this.onDrop.bind(this)
      //   // }));
      //   // oGrid.addDragDropConfig(new GridDropInfo({
      //   // 	targetAggregation: "content",
      //   // 	dropPosition: DropPosition.Between,
      //   // 	dropLayout: DropLayout.Horizontal,
      //   // 	dropIndicatorSize: this._getDropIndicatorSize.bind(this),
      //   // 	drop: this.onDrop.bind(this)
      //   // }));
      // }
    });
  }
);
