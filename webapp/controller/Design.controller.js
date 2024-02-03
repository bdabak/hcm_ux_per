/*global _*/
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/f/GridContainer",
    "sap/f/GridContainerSettings",
    "com/thy/ux/per/controls/FormWizard",
    "com/thy/ux/per/model/ComponentPool",
    "../model/formatter",
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,
    GridContainer,
    GridContainerSettings,
    FormWizard,
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
          State: null,
          FormId: null,
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

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */
      onSaveForm: async function () {
        this._handleSave(false);
      },
      onSaveAsForm: function () {
        this._handleSave(true);
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
          Bindable: oComp.Bindable,
          FormSection: oComp.FormSection,
          ExcludeFromPrintOut: oComp.ExcludeFromPrintOut,
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

        if (j !== -1 && j !== i) {
          oViewModel.setProperty(
            "/FieldProperties/FieldId",
            aCompList[i].FieldId
          );
          this.alertMessage("E", "MESSAGE_ERROR", "DUPLICATE_FIELD_ID", [
            oFieldProp.FieldId,
          ]);
          return;
        }

        oFieldProp.FieldId = oFieldProp.FieldId?.replace(/\s/g, "");

        if (
          !oFieldProp.FieldDescription ||
          !oFieldProp.FieldId ||
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
        aCompList[i].FormSection = oFieldProp.FormSection;
        aCompList[i].ExcludeFromPrintOut = oFieldProp.ExcludeFromPrintOut;

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
      onCopyComponent: function (oEvent) {
        const oSource = oEvent.getSource();
        const sRefComp = oSource.data("RefComp");

        if (!sRefComp) {
          return;
        }

        const oElem = $("#" + sRefComp).control()[0];

        if (!oElem) {
          oElem = this._getUIComponent(sRefComp);
        }

        const oViewModel = this.getModel("designView");
        let aCompList = _.cloneDeep(oViewModel.getProperty("/ComponentList"));

        const oComp = _.find(aCompList, ["ElementId", sRefComp]);

        if (!oComp) {
          this.toastMessage("E", "MESSAGE_ERROR", "COPY_ELEMENT_NOT_FOUND", []);
          return;
        }

        const oParent = _.find(aCompList, ["ElementUid", oComp.ParentUid]);

        if (!oParent) {
          this.toastMessage(
            "E",
            "MESSAGE_ERROR",
            "PARENT_ELEMENT_NOT_FOUND",
            []
          );
          return;
        }

        let aNewCompList = [];

        const copyRecursively = (o, sPUid) => {
          let c = _.cloneDeep(o);
          c.ElementId = `id${c.Type}Component${
            crypto.getRandomValues(new Uint32Array(1))[0]
          }`;
          c.ElementUid = this._getNewUid();
          c.ParentUid = sPUid;
          c.FieldId = c.FieldId + "Copy";
          c.Component = null;

          aNewCompList.push(c);

          const aChildren =
            _.filter(aCompList, ["ParentUid", o.ElementUid]) || [];

          aChildren.forEach((oChild) => {
            copyRecursively(oChild, c.ElementUid);
          });
        };

        //--Call recusrsively
        copyRecursively(oComp, oParent.ElementUid);

        aNewCompList.forEach((oNewComp)=>{
          aCompList.push(oNewComp);
        });

        aNewCompList = [];
        const rebuildCompList = (p) => {
          let i = _.findIndex(aNewCompList, ["ElementUid", p.ElementUid]);

          if (i === -1) {
            aNewCompList.push(p);
          }

          let aChildren = _.filter(aCompList, ["ParentUid", p.ElementUid]);

          aChildren.forEach((c) => {
            let j = _.findIndex(aNewCompList, ["ElementUid", c.ElementUid]);
            if (j === -1) {
              aNewCompList.push(c);
            }
            rebuildCompList(c);
          });
        };

        rebuildCompList(_.cloneDeep(aCompList[0]));


        oViewModel.setProperty("/ComponentList", aNewCompList);
        oViewModel.setProperty("/ComponentTree", []);

        //--Regenerate payload and reconsturct UI
        const oPayload = this._prepareOdataPayload(true, false);

        oViewModel.setProperty("/ComponentList", []);
        oViewModel.setProperty("/ComponentTree", []);

        this._constructUI(oPayload);

        this.toastMessage(
          "S",
          "MESSAGE_SUCCESS",
          "ELEMENT_COPIED_SUCCESSFULLY",
          []
        );
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
          case "object":
            oEl = new sap.m.TextArea({
              value: {
                path: "designView>Value",
                formatter: (oObj) => {
                  return JSON.stringify(oObj);
                },
              },
              rows: 3,
              width: "100%",
              change: this.onSaveConfiguration.bind(this),
            });

            break;
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
                        key: value,
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
              case "object":
                sVal = _.cloneDeep(JSON.parse(o.Value));
                break;
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
                  sVal = oObj.hasOwnProperty(o.Value) ? oObj[o.Value] : o.Value;
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

      getFieldDescription: function (sElementId, sToken) {
        var oComp = this._findUIComponent(sElementId);
        if (!oComp) {
          return "";
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
      onDragStart: function (oEvent) {
        var oTree = this.byId("idComponentTree");
        var oBinding = oTree.getBinding("items");
        var oDragSession = oEvent.getParameter("dragSession");
        var oDraggedItem = oEvent.getParameter("target");
        var iDraggedItemIndex = oTree.indexOfItem(oDraggedItem);
        var aSelectedIndices = oTree.getBinding("items").getSelectedIndices();
        var aSelectedItems = oTree.getSelectedItems();
        var aDraggedItemContexts = [];

        var oViewModel = this.getModel("designView");

        oViewModel.setProperty("/ConfigOptions", []);

        if (aSelectedItems.length > 0) {
          aSelectedItems.forEach((oItem) => {
            oTree.setSelectedItem(oItem, false);
          });
        }
        //   // If items are selected, do not allow to start dragging from a item which is not selected.
        //   if (aSelectedIndices.indexOf(iDraggedItemIndex) === -1) {
        //     oEvent.preventDefault();
        //   } else {
        //     for (var i = 0; i < aSelectedItems.length; i++) {
        //       aDraggedItemContexts.push(
        //         oBinding.getContextByIndex(aSelectedIndices[i])
        //       );
        //     }
        //   }
        // } else {
        aDraggedItemContexts.push(
          oBinding.getContextByIndex(iDraggedItemIndex)
        );
        // }

        oDragSession.setComplexData("hierarchymaintenance", {
          draggedItemContexts: aDraggedItemContexts,
        });
      },

      onDrop: function (oEvent) {
        const oTree = this.byId("idComponentTree");
        const oBinding = oTree.getBinding("items");
        const oDragSession = oEvent.getParameter("dragSession");
        const oDroppedItem = oEvent.getParameter("droppedControl");
        const aDraggedItemContexts = oDragSession.getComplexData(
          "hierarchymaintenance"
        ).draggedItemContexts;
        const iTreeItemIndex = oTree.indexOfItem(oDroppedItem);
        const oNewParentContext = oBinding.getContextByIndex(iTreeItemIndex);
        const oViewModel = this.getModel("designView");
        const sDropPosition = oDragSession.getDropPosition();
        //--Check if dragged item exists
        if (aDraggedItemContexts.length === 0 || !oNewParentContext) {
          return;
        }

        //--Get pool data for checks
        const aCompPool = oViewModel.getProperty("/ComponentPool");

        //--Avoid memory leaks
        const aCompOrig = oViewModel.getProperty("/ComponentList");
        let aCompList = _.cloneDeep(oViewModel.getProperty("/ComponentList"));

        //--Find dragged - dropped component in the tree
        const oParentTree = oViewModel.getProperty(
          oDroppedItem.getBindingContextPath()
        );
        const oChildTree = oViewModel.getProperty(
          aDraggedItemContexts[0].getPath()
        );

        if (!oParentTree || !oChildTree) {
          this.toastMessage(
            "E",
            "MESSAGE_FAILED",
            "DROP_NOT_FOUND_ON_TREE",
            []
          );
          return;
        }

        if (
          oParentTree.ElementId === oChildTree.ElementId ||
          oParentTree.ParentId === oChildTree.ElementId
        ) {
          return;
        }

        //--Find components in the component list
        const oParentComp = this._findUIComponent(
          sDropPosition === "On" ? oParentTree.ElementId : oParentTree.ParentId,
          null
        );
        const oChildComp = this._findUIComponent(oChildTree.ElementId, null);

        //--Simulate component list without the node
        let iCompIndex = _.findIndex(aCompList, [
          "ElementId",
          oChildTree.ElementId,
        ]);

        if (iCompIndex === -1 || !oParentComp || !oChildComp) {
          this.toastMessage(
            "E",
            "MESSAGE_FAILED",
            "DROP_NOT_FOUND_ON_LIST",
            []
          );
          return;
        }

         //--Find parent and child is valid for each other
         const oParentPool = aCompPool.find((o) => o.Type === oParentComp.Type);

         if (!oParentPool) {
           this.toastMessage(
             "E",
             "MESSAGE_FAILED",
             "DROP_PARENT_ELEMENT_NOT_FOUND",
             []
           );
           return;
         }
 
         if (!oParentPool?.Aggregations) {
           this.toastMessage(
             "E",
             "MESSAGE_FAILED",
             "DROP_PARENT_ELEMENT_NOT_APPLICABLE",
             [oParentComp.Type]
           );
           return;
         }
 
         const oAggrPool = _.find(oParentPool?.Aggregations, {
           Type: oChildComp.Type,
         });
 
         if (!oAggrPool) {
           this.toastMessage(
             "E",
             "MESSAGE_FAILED",
             "DROP_ELEMENT_NOT_VALID_AGGR_TYPE",
             [oChildComp.Type, oParentComp.Type]
           );
           return;
         }


        //--Delete old position
        let aCloneNode = [];

        const calcCloneNode = (oRef, bRoot) => {
          let oCloneComp = _.cloneDeep(oRef);
          if (bRoot) {
            //--Set new assignments
            oCloneComp.ParentId = oParentComp.ElementId;
            oCloneComp.ParentUid = oParentComp.ElementUid;
            oCloneComp.AggregationName = oAggrPool.Name;
          }
          aCloneNode.push(oCloneComp);
          const aChildNodes = _.filter(aCompList, [
            "ParentUid",
            oRef.ElementUid,
          ]);

          aChildNodes.forEach((oChildNode) => {
            calcCloneNode(oChildNode, false);
          });

          //--Splice from array
          const i = _.findIndex(aCompList, ["ElementUid", oRef.ElementUid]);
          if (i !== -1) {
            aCompList.splice(i, 1);
          }
        };

        calcCloneNode(aCompList[iCompIndex], true);

        //--Find drop index
        let iDroppedIndex = -1;
        let aChildren =
          _.filter(aCompList, ["ParentUid", oParentComp.ElementUid]) || [];
        if (sDropPosition === "On") {
          iDroppedIndex = aChildren.length;
        } else {
          aChildren.forEach((c, i) => {
            if (c.ElementId === oParentTree.ElementId) {
              iDroppedIndex = i + 1;
            }
          });
        }

        if (iDroppedIndex === -1) {
          this.toastMessage("E", "MESSAGE_FAILED", "DROP_TARGET_NOT_VALID", []);
          return;
        }

        //--Recalculate index
        aChildren =
          _.filter(aCompList, ["ParentUid", oParentComp.ElementUid]) || [];

        //--Insert element to the new position
        let iNewIndex = -1;
        let iChildIndex = 0;

        let iChildCount = aChildren.length;

        if (iChildCount === 0) {
          iNewIndex = _.findIndex(aCompList, [
            "ElementUid",
            oParentComp.ElementUid,
          ]);

          if (iNewIndex === -1) {
            return;
          }

          iNewIndex++;
        } else {
          aCompList.forEach((c, i) => {
            if (c.ParentUid === oParentComp.ElementUid) {
              if (sDropPosition === "Before") {
                iChildIndex++;
                if (iChildIndex === iDroppedIndex) {
                  iNewIndex = i;
                }
              } else {
                iChildIndex++;
                if (iChildIndex === iDroppedIndex) {
                  iNewIndex = i + 1;
                }
              }
            }
          });
        }

        if (iNewIndex === -1) {
          this.toastMessage("E", "MESSAGE_FAILED", "DROP_INDEX_NOT_VALID", []);
          return;
        }

        //--Insert new one
        aCloneNode.forEach((oCloneNode)=>{
          aCompList.splice(iNewIndex, 0, oCloneNode);
          iNewIndex++;
        });

        let aNewCompList = [];

        const rebuildCompList = (p) => {
          let i = _.findIndex(aNewCompList, ["ElementUid", p.ElementUid]);

          if (i === -1) {
            aNewCompList.push(p);
          }

          let aChildren = _.filter(aCompList, ["ParentUid", p.ElementUid]);

          aChildren.forEach((c) => {
            let j = _.findIndex(aNewCompList, ["ElementUid", c.ElementUid]);
            if (j === -1) {
              aNewCompList.push(c);
            }
            rebuildCompList(c);
          });
        };

        rebuildCompList(_.cloneDeep(aCompList[0]));

        if (aNewCompList.length !== aCompOrig.length) {
          this.toastMessage(
            "E",
            "MESSAGE_FAILED",
            "DROP_AFTER_COMP_LIST_INCONSISTENT",
            []
          );
          return;
        }

        //-Set the tree
        let oNewParent = oNewParentContext.getProperty();

        // In the JSON data of this example the children of a node are inside an array with the name "categories".
        if (!oNewParent.children) {
          oNewParent.children = []; // Initialize the children array.
        }

        for (var i = 0; i < aDraggedItemContexts.length; i++) {
          if (
            oNewParentContext
              .getPath()
              .indexOf(aDraggedItemContexts[i].getPath()) === 0
          ) {
            // Avoid moving a node into one of its child nodes.
            continue;
          }

          // Copy the data to the new parent.
          oNewParent.children.push(aDraggedItemContexts[i].getProperty());

          // Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
          oViewModel.setProperty(
            aDraggedItemContexts[i].getPath(),
            undefined,
            aDraggedItemContexts[i],
            true
          );
        }

        this.toastMessage("S", "MESSAGE_SUCCESS", "DROP_SUCCESSFUL", []);

        oViewModel.setProperty("/ComponentList", aNewCompList);

        const oPayload = this._prepareOdataPayload(true, false);

        this._constructUI(oPayload);
      },
      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      _handleSave: async function (bAs = false) {
        var oViewModel = this.getModel("designView");
        var oModel = this.getModel();
        // var aCompList = oViewModel.getProperty("/ComponentList");
        var that = this;

        const { value: FormTitle } = await Swal.fire({
          title: bAs ? "Formu Farklı Kaydet" : "Formu Kaydet",
          input: "text",
          inputLabel: "Formun tanımı",
          inputPlaceholder: "Bir form tanımı giriniz",
          inputValue: bAs
            ? oViewModel.getProperty("/FormTitle") + " Kopyası"
            : oViewModel.getProperty("/FormTitle"),
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
          this.openBusyFragment(
            bAs ? "SAVE_AS_IN_PROGRESS" : "SAVE_IN_PROGRESS",
            []
          );
          oModel.create("/FormHeaderSet", oPayload, {
            success: function (oData, oResponse) {
              that.toastMessage("S", "MESSAGE_SUCCESS", "FORM_SAVED", []);
              that.closeBusyFragment();
              if (bAs) {
                that.getRouter().navTo(
                  "design",
                  {
                    formId: oData.FormId,
                  },
                  false
                );
              }
            },
            error: function (oError) {
              that.toastMessage("E", "MESSAGE_FAILED", "FORM_NOT_SAVED", []);
              that.closeBusyFragment();
            },
          });
        }
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

        if (bAs) {
          aCompList.forEach((oComp, i) => {
            const sNewUid = this._getNewUid();
            var aChild =
              _.filter(aCompList, ["ParentUid", oComp.ElementUid]) || [];
            aChild.forEach((oChildComp, j) => {
              aChild[j].ParentUid = sNewUid;
            });
            aCompList[i].ElementUid = sNewUid;
          });
        }

        aCompList.forEach((oComp) => {
          var oCompSet = {
            FormId: sFormId,
            FieldId: oComp.FieldId,
            FieldDescription: oComp.FieldDescription,
            Bindable: oComp.Bindable,
            FormSection: oComp.FormSection,
            ExcludeFromPrintOut: oComp.ExcludeFromPrintOut,
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
              if (oOpt.Value === oOpt.DefaultValue) {
                return;
              }

              if (Array.isArray(oOpt.Value) || typeof oOpt.Value === "object") {
                let iLen = Array.isArray(oOpt.Value)
                  ? oOpt.Value.length
                  : Object.keys(oOpt.Value.length) || 0;

                if (iLen <= 0) {
                  return;
                }
                oOpt.Value = JSON.stringify(oOpt.Value);
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
          "MESSAGE_SUCCESS",
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
          this._createRootContainer();
          this.byId("idDesignContainerTitle").unbindProperty("text");
          this.byId("idDesignContainerTitle").setVisible(false);
        } else {
          oViewModel.setProperty("/State", "EDIT");
          oViewModel.setProperty("/FormId", sFormId);
          this._currentFormId = sFormId;
          this._callFormDetailsService();
          this.byId("idDesignContainerTitle").bindProperty("text", {
            path: `/FormHeaderSet('${sFormId}')/FormTitle`,
          });
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
      _createRootContainer: function (oData = null) {
        var oBox = this.byId("idDesignContainer");
        var oRoot =
          this.byId("idDesignPaneRoot") ||
          sap.ui.getCore().byId("idDesignPaneRoot");
        var oViewModel = this.getModel("designView");

        var sRootUid =
          oData === null ? this._getNewUid() : this._getRootGridUid(oData);

        //--Initialize component first
        this._initializeComponentModel();

        if (oData) {
          oViewModel.setProperty("/FormTitle", oData.FormTitle);
        }

        try {
          if (oRoot && oRoot?.destroy) {
            oRoot.destroy();
          }

          oRoot = new FormWizard("idDesignPaneRoot")
            .data("CompType", "FormWizard")
            .addStyleClass("mainGrid");

          oBox.addItem(oRoot);

          oViewModel.setProperty("/ComponentTree", [
            {
              ElementId: oRoot.getId(),
              Type: "FormWizard",
              ParentId: null,
              AggregationName: null,
              Description: "Root Container",
              Children: [],
            },
          ]);
          oViewModel.setProperty("/ComponentList", [
            {
              ElementUid: sRootUid,
              ElementId: oRoot.getId(),
              FieldId: "FieldRootContainer0",
              FieldDescription: "Root Container",
              Bindable: false,
              FormSection: null,
              ExcludeFromPrintOut: false,
              Type: "FormWizard",
              Component: oRoot,
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
        var oRoot = oData.FormComponentSet.results.find((oComp) => {
          return !oComp.ParentUid && oComp.Type === "FormWizard";
        });

        return oRoot.ElementUid;
      },
      _constructUI: function (oData) {
        var bRoot = this._createRootContainer(oData);

        if (!bRoot) {
          return;
        }
        try {
          oData.FormComponentSet.results.forEach((oComp) => {
            if (!oComp.ParentUid && oComp.Type === "FormWizard") {
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
          
          if(!this.treeExpanded){
            this.treeExpanded = true;
            this.byId("idComponentTree").collapseAll();
            this.byId("idComponentTree").expandToLevel(3);
          }else{
            // this.byId("idComponentTree").expandToLevel(6);
          }
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
            "MESSAGE_SUCCESS",
            "ADD_COMPONENT_SUCCESSFUL",
            []
          );
          this._treeBindingRefresh();
        }
      },
      _handleDeleteComponent(oElement) {
        const oViewModel = this.getModel("designView");
        let aCompTree = oViewModel.getProperty("/ComponentTree");
        let aCompList = oViewModel.getProperty("/ComponentList");

        const oParent = this._getUIComponent(oElement.ParentId);

        try {
          oParent?.removeAggregation(
            oElement.AggregationName,
            oElement.ElementId
          );

          oElement.Component.destroy();

          const deleteItem = function (oEl) {
            const i = aCompList.findIndex((o) => o.ElementId === oEl.ElementId);
            if (i !== -1) {
              const aChildren =
                _.filter(aCompList, ["ParentUid", oEl.ElementUid]) || [];
              aChildren.forEach((oChild) => {
                deleteItem(oChild);
              });
              aCompList.splice(i, 1);
            }
          };

          deleteItem(oElement);

          const deleteChildNodeRecursive = function (aTree, sId, bDel) {
            for (let [i, oItem] of aTree.entries()) {
              if (oItem.ElementId === sId || bDel) {
                aTree.splice(i, 1);
                deleteChildNodeRecursive(oItem.Children, null, true);
                // deleteItem(oItem);
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

          // //--Regenerate payload and reconsturct UI
          // const oPayload = this._prepareOdataPayload(true, false);

          // this._constructUI(oPayload);

          // this.toastMessage(
          //   "S",
          //   "MESSAGE_SUCCESS",
          //   "DEL_COMPONENT_SUCCESSFUL",
          //   []
          // );
        } catch (e) {
          console.log(e);
        }
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
          console.log(e, oChild);
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
                case "object":
                  oSavedProps[oProp.PropertyName] = _.cloneDeep(
                    JSON.parse(oProp.PropertyValue)
                  );
                  break;
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
              ExcludeFromPrintOut: oChild.ExcludeFromPrintOut,
              FormSection: oChild.FormSection,
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
          console.log(e, oChildInstance);
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
            _.cloneDeep(oChildComp.DefaultProps)
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
              FormSection: null,
              ExcludeFromPrintOut: false,
              ParentId: oParent?.getId(),
              ParentUid: oParentUI?.ElementUid || null,
              Component: oChildInstance,
              Type: sChildType,
              AggregationName: oAggr.Name,
              Properties: _.cloneDeep(oChildComp.DefaultProps),
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

        var oComp= sId
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
            name: "com.thy.ux.per.fragment.design.AddMenu",
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
    });
  }
);
