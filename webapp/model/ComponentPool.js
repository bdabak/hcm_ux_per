sap.ui.define([], function () {
  "use strict";
  return (
    "com.thy.ux.per.model.ComponentPool",
    {
      getPool: function () {
        return [
          {
            Group: "Container",
            Class: sap.f.GridContainer,
            Type: "GridContainer",
            Description: "Grid Container",
            Aggregations: [
              { Name: "items", Type: "Panel", AddMethod: "addItem" },
              { Name: "items,", Type: "Form", AddMethod: "addItem" },
              { Name: "items", Type: "HBox", AddMethod: "addItem" },
              { Name: "items", Type: "VBox", AddMethod: "addItem" },
              { Name: "items", Type: "FlexBox", AddMethod: "addItem" },
            ],
          },
          {
            Group: "Container",
            Class: sap.m.Panel,
            Type: "Panel",
            Description: "Panel",
            DefaultProps: {
              expandable: true,
              expanded: true
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
              { Name: "content", Type: "HBox", AddMethod: "addContent" },
              { Name: "content", Type: "VBox", AddMethod: "addContent" },
              { Name: "content", Type: "FlexBox", AddMethod: "addContent" },
            ],
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
          },
          {
            Group: "Layout",
            Class: sap.ui.layout.form.FormContainer,
            Type: "FormContainer",
            Description: "Form Container",
            DefaultProps: {
              expandable: false,
              expanded: true,
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
            Aggregations: [
              { Name: "items", Type: "Panel", AddMethod: "addItem" },
              { Name: "items", Type: "Form", AddMethod: "addItem" },
              { Name: "items", Type: "HBox", AddMethod: "addItem" },
              { Name: "items", Type: "VBox", AddMethod: "addItem" },
              { Name: "items", Type: "FlexBox", AddMethod: "addItem" },
            ],
          },
          {
            Group: "Layout",
            Class: sap.m.HBox,
            Type: "HBox",
            Description: "Horizontal Box",
            Aggregations: [
              { Name: "items", Type: "Panel", AddMethod: "addItem" },
              { Name: "items", Type: "Form", AddMethod: "addItem" },
              { Name: "items", Type: "HBox", AddMethod: "addItem" },
              { Name: "items", Type: "VBox", AddMethod: "addItem" },
              { Name: "items", Type: "FlexBox", AddMethod: "addItem" },
            ],
          },
          {
            Group: "Layout",
            Class: sap.m.VBox,
            Type: "VBox",
            Description: "Vertical Box",
            Aggregations: [
              { Name: "items", Type: "Panel", AddMethod: "addItem" },
              { Name: "items", Type: "Form", AddMethod: "addItem" },
              { Name: "items", Type: "HBox", AddMethod: "addItem" },
              { Name: "items", Type: "VBox", AddMethod: "addItem" },
              { Name: "items", Type: "FlexBox", AddMethod: "addItem" },
            ],
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
        ];
      },
    }
  );
});
