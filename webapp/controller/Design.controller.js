sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/dnd/DragInfo",
    "sap/ui/core/dnd/DropInfo",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/library",
    "com/thy/ux/per/model/ComponentPool",
    "../model/formatter",
  ],
  function (
    BaseController,
	JSONModel,
	DragInfo,
	DropInfo,
	MessageBox,
	Fragment,
	library,
	ComponentPool,
	formatter
  ) {
    "use strict";

    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = library.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = library.dnd.DropPosition;

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
          ComponentTree: [
            {
              ElementId: this.byId("idDesignGrid").getId(),
              Type: "GridContainer",
              ParentId: null,
              Description: "Main Grid",
              Children: [],
            },
          ],
          ComponentList: [
            {
              ElementId: this.byId("idDesignGrid").getId(),
              Type: "GridContainer",
              Component: this.byId("idDesignGrid"),
              Properties: null,
              ParentId: null,
              AggregationName: null,
            },
          ],
          ComponentPool: ComponentPool.getPool(),
          AddMenuOptions: [],
          ConfigOptions: [],
          CustomStyles: [],
          IconList: this._getIconList()
        });

        this._selectedUIComponent = null;

        oViewModel.setSizeLimit(999);

        this.setModel(oViewModel, "designView");

      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */
      onCompTreeItemSelected: function (oEvent) {
        var oItem = oEvent.getParameter("listItem");
        var oViewModel = this.getModel("designView");
        var sRefComp = oItem.data("RefComp");
        oViewModel.setProperty("/ConfigOptions", []);
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

        // this.byId("idConfigPanel").open();

        var aCustomStyles = [];

        if(oElem?.aCustomStyleClasses){
          aCustomStyles = [...oElem.aCustomStyleClasses].map((o,i)=>{
            return {
              Key: "key_" + i + "_" + new Date().getTime(),
              Value: o
            }
          });
        }

        oViewModel.setProperty("/CustomStyles", aCustomStyles);

      },

      onStyleUpdated: function(oEvent){
        var aRemoved = oEvent.getParameter("removedTokens");
        var oViewModel = this.getModel("designView");
        var aCustomStyles =  oViewModel.getProperty("/CustomStyles");

        aRemoved.forEach((r)=>{
          var i = aCustomStyles.findIndex((s)=> s.Key === r.getProperty("key"));
          if(i !== -1) aCustomStyles.splice(i, 1);
        });


        oViewModel.setProperty("/CustomStyles", aCustomStyles);

        this.onSaveConfiguration();
      },

      onStyleAdded: function(oEvent){
        var oViewModel = this.getModel("designView");
        var aCustomStyles =  oViewModel.getProperty("/CustomStyles");
        var sNew = oEvent.getParameter("value");

        aCustomStyles.push({
          Key: "key_" + (aCustomStyles.length+1) + "_" + new Date().getTime(),
          Value: sNew
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
          confirmCallbackFn: function(){
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
           
            if(oContext.getProperty("Name") === "icon"){
              oEl = new sap.m.Input({
                value: {
                  path: "designView>Value",
                },
                submit: this.onSaveConfiguration.bind(this),
                showSuggestion: true,
                suggestionItems:{
                  path: "designView>/IconList",
                  template: new sap.ui.core.Item({
                    key: "{designView>Key}",
                    text: "{designView>Icon}",
                  })
                },
                suggestionItemSelected: function(oEvent){
                  var oItem = oEvent.getParameter("selectedItem");

                  oEl.setValue(oItem?.getKey());
                }
              });

            }else{
              
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
            if (sType.includes("sap.") && oObj && typeof oObj === "object") {
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
      onSaveConfiguration: function () {
        var oViewModel = this.getModel("designView");
        var aOptions = oViewModel.getProperty("/ConfigOptions");
        var aCustomStyles = oViewModel.getProperty("/CustomStyles");
        var that = this;
       

        if (!this._selectedUIComponent) {
          return;
        }

        //Get current styles
        var aCurrentStyles = this._selectedUIComponent?.aCustomStyleClasses ? [...this._selectedUIComponent?.aCustomStyleClasses] : [];

        aOptions.forEach((o) => {
          try {
            that._selectedUIComponent?.setProperty(o.Name, o.Value);
          } catch (e) {}
        });

        aCurrentStyles.forEach((s)=>{
          that._selectedUIComponent.removeStyleClass(s);
        });

        aCustomStyles.forEach((s)=>{
          that._selectedUIComponent.addStyleClass(s.Value);
        });

      },
      checkIsDeletable: function (sId) {
        var oComp = this._findUIComponent(sId);
        if (!oComp || !oComp.ParentId) {
          return false;
        }
        return true;
      },
      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */
      _handleAddComponent(oParent, sChildType) {
        var sParentType = oParent.data("CompType");

        if (!sParentType || !sChildType) {
          return;
        }

        var bSuccess = this._createComponent(oParent, sChildType);
        if(bSuccess){
          this.toastMessage("S", "MESSAGE_SUCCESSFUL", "ADD_COMPONENT_SUCCESSFUL", []);
          this.byId("idComponentTree").expandToLevel(3);
        }
      },
      _handleDeleteComponent(oElement) {
        var oViewModel = this.getModel("designView");
        var aCompPool = oViewModel.getProperty("/ComponentPool");
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
      _createComponent: function (oParent, sChildType) {
        var oViewModel = this.getModel("designView");
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
            `${this.getView().getId()}-${sChildType}Component-${
              aCompList.length + 1
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
            var addChildNodeRecursive = function (aTree, sId, oNew) {
              for (var oItem of aTree) {
                if (oItem.ElementId === sId) {
                  oItem.Children.push(oNew);
                } else {
                  addChildNodeRecursive(oItem.Children, sId, oNew);
                }
              }
            };

            var oNewItem = {
              ElementId: oChildInstance.getId(),
              Type: sChildType,
              Description: oChildComp.Description,
              ParentId: oParent.getId(),
              Children: [],
            };

            addChildNodeRecursive(aCompTree, oParent.getId(), oNewItem);
            

            //Refresh Component List
            aCompList.push({
              ElementId: oChildInstance.getId(),
              ParentId: oParent.getId(),
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
                this._createComponent(oChildInstance, oSubAggr.Type);
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
      _findUIComponent: function (sId) {
        var oViewModel = this.getModel("designView");
        var aCompList = oViewModel.getProperty("/ComponentList");

        var oComp = aCompList.find((o) => o.ElementId === sId);

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
              Name: p.name,
              Type: p.type,
              Group: p.group,
              Value: c?.getProperty(key),
            });
          }
        }

        return aProp;
      },
      _getIconList: function(){
        var aIcons = sap.ui.core.IconPool.getIconNames();

        return aIcons.map((i)=>{
          return {
            Key: "sap-icon://" + i,
            Icon: i
          }
        });
      }
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
