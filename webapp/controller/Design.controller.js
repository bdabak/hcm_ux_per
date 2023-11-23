sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/dnd/DragInfo",
    "sap/ui/core/dnd/DropInfo",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/library",
    "../model/formatter",
  ],
  function (
    BaseController,
    JSONModel,
    DragInfo,
    DropInfo,
    MessageBox,
    Fragment,
    coreLibrary,
    formatter
  ) {
    "use strict";

    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;

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
              Properties: null,
            },
          ],
          ComponentPool: [
            {
              Group: "Container",
              Class: sap.f.GridContainer,
              Type: "GridContainer",
              Description: "Grid Container",
              Aggregations: [
                { Name: "items", Type: "Panel", AddMethod: "addItem" },
                { Name: "items,", Type: "Form", AddMethod: "addItem" },
              ],
              Visible: true,
            },
            {
              Group: "Container",
              Class: sap.m.Panel,
              Type: "Panel",
              Description: "Panel",
              DefaultProps: {
                headerText: "New Panel",
                width: "100%",
              },
              DefaultAggregations: [
                {
                  Name: "headerToolbar",
                  Type: "Toolbar",
                },
              ],
              Aggregations: [
                {
                  Name: "headerToolbar",
                  Type: "Toolbar",
                  AddMethod: "setHeaderToolbar",
                },
                { Name: "content", Type: "Panel", AddMethod: "addContent" },
                { Name: "content", Type: "Form", AddMethod: "addContent" },
              ],
              Visible: true,
            },
            {
              Group: "Layout",
              Class: sap.ui.layout.form.Form,
              Type: "Form",
              Description: "Form",
              DefaultProps: {
                editable: true,
              },
              DefaultAggregations: [
                {
                  Name: "layout",
                  Type: "ResponsiveGridLayout",
                },
                {
                  Name: "formContainers",
                  Type: "FormContainer",
                },
              ],
              Aggregations: [
                {
                  Name: "layout",
                  Type: "ResponsiveGridLayout",
                  AddMethod: "setLayout",
                },
                {
                  Name: "formContainers",
                  Type: "FormContainer",
                  AddMethod: "insertFormContainer",
                },
              ],
              Visible: true,
            },
            {
              Group: "ResponsiveGridLayout",
              Class: sap.ui.layout.form.ResponsiveGridLayout,
              Type: "ResponsiveGridLayout",
              DefaultProps: {
                labelSpanXL: 4,
                labelSpanL: 4,
                labelSpanM: 12,
                labelSpanS: 12,
                adjustLabelSpan: false,
                emptySpanXL: 0,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                columnsXL: 2,
                columnsL: 2,
                columnsM: 1,
                singleContainerFullSize: false,
              },
              Description: "Reponsive Grid Layout",
              Visible: true,
            },
            {
              Group: "Layout",
              Class: sap.ui.layout.form.FormContainer,
              Type: "FormContainer",
              Description: "Form Container",
              DefaultProps: {
                expandable: false,
                expanded: true,
                visible: true,
              },
              DefaultAggregations: [
                {
                  Name: "title",
                  Type: "CoreTitle",
                },
                {
                  Name: "formElements",
                  Type: "FormElement",
                },
              ],
              Aggregations: [
                {
                  Name: "formElements",
                  Type: "FormElement",
                  AddMethod: "addFormElement",
                },
                {
                  Name: "title",
                  Type: "CoreTitle",
                  AddMethod: "setTitle",
                },
              ],
            },
            {
              Group: "Layout",
              Class: sap.m.Toolbar,
              Type: "Toolbar",
              Description: "Toolbar",
              DefaultAggregations: [
                {
                  Name: "items",
                  Type: "Title",
                },
              ],
              Aggregations: [
                {
                  Name: "content",
                  Type: "Title",
                  AddMethod: "addContent",
                },
                {
                  Name: "content",
                  Type: "Text",
                  AddMethod: "addContent",
                },
                {
                  Name: "content",
                  Type: "ToolbarSpacer",
                  AddMethod: "addContent",
                },
                {
                  Name: "content",
                  Type: "ToolbarSeparator",
                  AddMethod: "addContent",
                },
                {
                  Name: "content",
                  Type: "Button",
                  AddMethod: "addContent",
                },
              ],
            },
            {
              Group: "Layout",
              Class: sap.ui.layout.form.FormElement,
              Type: "FormElement",
              Description: "Form Element",
              Aggregations: [
                {
                  Name: "fields",
                  Type: "Input",
                  AddMethod: "addField",
                },
                {
                  Name: "label",
                  Type: "Label",
                  AddMethod: "setLabel",
                },
              ],
            },
            {
              Group: "Layout",
              Class: sap.m.FlexBox,
              Type: "FlexBox",
              Description: "Flex Box",
            },
            {
              Group: "Layout",
              Class: sap.m.HBox,
              Type: "HBox",
              Description: "Horizontal Box",
            },
            {
              Group: "Layout",
              Class: sap.m.VBox,
              Type: "VBox",
              Description: "Vertical Box",
            },
            {
              Group: "Element",
              Class: sap.m.Input,
              Type: "Input",
              Description: "Input",
            },
            {
              Group: "Element",
              Class: sap.m.Label,
              DefaultProps: {
                text: "Label",
              },
              Type: "Label",
              Description: "Label",
            },
            {
              Group: "Element",
              Class: sap.m.Text,
              Type: "Text",
              Description: "Text",
            },
            {
              Group: "Element",
              Class: sap.m.Title,
              Type: "Title",
              DefaultProps: {
                text: "Default Title",
              },
              Description: "Title",
            },
            {
              Group: "Element",
              Class: sap.m.Button,
              Type: "Button",
              DefaultProps: {
                text: "Button",
              },
              Description: "Button",
            },
            {
              Group: "Element",
              Class: sap.m.ToolbarSpacer,
              Type: "ToolbarSpacer",
              Description: "ToolbarSpacer",
            },
            {
              Group: "Element",
              Class: sap.m.ToolbarSeparator,
              Type: "ToolbarSeparator",
              Description: "ToolbarSeparator",
            },
            {
              Group: "Element",
              Class: sap.ui.core.Title,
              DefaultProps: {
                text: "Default Title",
              },
              Type: "CoreTitle",
              Description: "Title (Core)",
            },
            {
              Group: "Element",
              Class: sap.m.TextArea,
              Type: "TextArea",
              Description: "Text Area",
            },
            {
              Group: "Element",
              Class: "sap.m.ComboBox",
              Type: "ComboBox",
              Description: "Combo Box",
            },
            {
              Group: "Element",
              Class: "sap.m.MultiComboBox",
              Type: "MultiComboBox",
              Description: "Multi Combo Box",
            },
          ],
          AddMenuOptions: [],
          ConfigOptions: [],
        });

        this._selectedUIComponent = null;

        this.setModel(oViewModel, "designView");

        //--Define initial drag and drop
        // this._attachDragAndDrop();
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */
      onCompTreeItemSelected: function (oEvent) {
        var oItem = oEvent.getParameter("listItem");
        var oViewModel = this.getModel("designView");
        var sRefComp = oItem.data("RefComp");
        oViewModel.setProperty("/ConfigOptions", []);

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
        var oUIControl = null;

        oUIControl = new sap.m.ColumnListItem(sId, {
          cells: [
            new sap.m.Text({
              text: {
                path: "designView>Name",
              },
            }),
          ],
        });

        switch (oContext.getProperty("Type")) {
          case "boolean":
            oUIControl.addCell(
              new sap.m.CheckBox({
                selected: {
                  path: "designView>Value",
                },
                select: this.onSaveConfiguration.bind(this),
              })
            );
            break;
          default:
            oUIControl.addCell(
              new sap.m.Input({
                value: {
                  path: "designView>Value",
                },
                submit: this.onSaveConfiguration.bind(this),
              })
            );
            break;
        }

        return oUIControl;
      },
      onSaveConfiguration: function () {
        var oViewModel = this.getModel("designView");
        var aOptions = oViewModel.getProperty("/ConfigOptions");

        if (!this._selectedUIComponent) {
          return;
        }

        aOptions.forEach((o) => {
          try {
            this._selectedUIComponent?.setProperty(o.Name, o.Value);
          } catch (e) {}
        });
      },
      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */
      _handleAddComponent(oParent, sChildType) {
        var sParentType = oParent.data("CompType");

        if (!sParentType || !sChildType) {
          return;
        }

        this._createComponent(oParent, sChildType);
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
            oViewModel.setProperty("/ComponentTree", aCompTree);

            //Refresh Component List
            aCompList.push({
              ElementId: oChildInstance.getId(),
              ParentId: oParent.getId(),
              Component: oChildInstance,
              Type: sChildType,
              Properties: { ...oChildComp.DefaultProps },
            });

            oViewModel.setProperty("/ComponentList", aCompList);

            if (
              oChildComp?.DefaultAggregations &&
              oChildComp?.DefaultAggregations?.length > 0
            ) {
              for (var oSubAggr of oChildComp.DefaultAggregations) {
                this._createComponent(oChildInstance, oSubAggr.Type);
              }
            }
          }
        } catch (e) {
          MessageBox.show("Hata oluştu:" + e, {
            icon: MessageBox.Icon.ERROR,
            title: "Hata Oluştu",
          });
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
        var oViewModel = this.getModel("designView");
        var aCompList = oViewModel.getProperty("/ComponentList");

        var oComp = aCompList.find((o) => o.ElementId === sId);

        if (oComp) {
          return oComp.Component;
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
