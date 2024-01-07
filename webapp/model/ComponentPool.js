sap.ui.define([
  "com/thy/ux/per/controls/FormWizard",
  "com/thy/ux/per/controls/FormContainer"], function (
	FormWizard,
	FormContainer
  ) {
  "use strict";
  return (
    "com.thy.ux.per.model.ComponentPool",
    {
      loadPool: function () {
        return [
          {
            Group: "Container",
            Class: com.thy.ux.per.controls.FormWizard,
            Type: "FormWizard",
            Description: "Form Wizard",
            Aggregations: [
              { Name: "items", Type: "PerFormContainer", AddMethod: "addItem" },
              { Name: "items", Type: "Panel", AddMethod: "addItem" },
            ],
          },
          {
            Group: "Container",
            Class: com.thy.ux.per.controls.FormContainer,
            Type: "PerFormContainer",
            Description: "Form Container",
            DefaultProps:{
              title: "Default Form Title"
            },
            Aggregations: [
              { Name: "items", Type: "MdTextField",   AddMethod: "addItem" },
              { Name: "items", Type: "MdSelect",      AddMethod: "addItem" },
              { Name: "items", Type: "MdCheckBox",    AddMethod: "addItem" },
              { Name: "items", Type: "MdRadioGroup",  AddMethod: "addItem" },
              { Name: "items", Type: "MdMultiSelect", AddMethod: "addItem" },
              { Name: "items", Type: "MdChipSet",     AddMethod: "addItem" },
              { Name: "items", Type: "MdDivider",     AddMethod: "addItem" },
              { Name: "items", Type: "MdSwitch",      AddMethod: "addItem" },
              { Name: "items", Type: "HBox",          AddMethod: "addItem" },
              { Name: "items", Type: "VBox",          AddMethod: "addItem" },
            ],
          },
          {
            Group: "Container",
            Class: com.smod.ux.mat.controls.TabContainer,
            Type: "MdTabContainer",
            Description: "Tab Container MD",
            DefaultAggregations: [
              {
                Name: "tabs",
                Type: "MdTab",
              },
              {
                Name: "tabPanels",
                Type: "MdTabPanel",
              },
            ],
            Aggregations: [
              { Name: "tabs", Type: "MdTab", AddMethod: "addTab" },
              { Name: "tabPanels", Type: "MdTabPanel", AddMethod: "addTabPanel" },
            ],
          },
          {
            Group: "Container",
            Class: com.smod.ux.mat.controls.Tab,
            Type: "MdTab",
            Description: "Tab MD",
            DefaultProps: {
              title: "Tab Title",
            },
            Aggregations: [
              { Name: "icon", Type: "MdIcon", AddMethod: "setIcon" }
            ],
          },
          {
            Group: "Container",
            Class: com.smod.ux.mat.controls.TabPanel,
            Type: "MdTabPanel",
            Description: "TabPanel MD",
            Aggregations: [
              { Name: "content,", Type: "Form", AddMethod: "setContent" },
              { Name: "content", Type: "HBox", AddMethod: "setContent" },
              { Name: "content", Type: "VBox", AddMethod: "setContent" },
            ],
          },

          {
            Group: "Container",
            Class: sap.m.Panel,
            Type: "Panel",
            Description: "Panel",
            DefaultProps: {
              expandable: true,
              expanded: true,
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
              { Name: "content", Type: "PerFormContainer", AddMethod: "addContent" },
              { Name: "content", Type: "HBox", AddMethod: "addContent" },
              { Name: "content", Type: "VBox", AddMethod: "addContent" },
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
                AddMethod: "addFormContainer",
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
            Class: sap.ui.layout.GridData,
            Type: "GridData",
            Description: "Grid Data",
            DefaultProps: {
              spanXL: 4,
              spanL: 4,
              spanM: 6,
              spanS: 12,
            },
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
                Type: "MdTextField",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "MdSelect",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "MdRadioGroup",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "Input",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "SmodInput",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "CheckBox",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "RadioButtonGroup",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "ComboBox",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "MultiComboBox",
                AddMethod: "addField",
              },
              {
                Name: "fields",
                Type: "TextArea",
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
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
            BindingProperties:{
              ValueField: {Name: "value", Type: "string", Multiple: false }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.TextField,
            Type: "MdTextField",
            Description: "Text Field (MD)",
            DefaultProps: {
              label: "Default Label",
              placeholder: "Descriptive text..."
            },
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
            BindingProperties:{
              ValueField: {Name: "value", Type: "string", Multiple: false }
            }
          },
          
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.Select,
            Type: "MdSelect",
            Description: "Select Field (MD)",
            DefaultProps: {
              label: "Default Label"
            },
            DefaultAggregations:[
              {
                Name: "options",
                Type: "MdSelectOption",
              },
              {
                Name: "options",
                Type: "MdSelectOption",
              }
            ],  
            Aggregations: [
              {
                Name: "options",
                Type: "MdSelectOption",
                AddMethod: "addOption",
              }
            ],
            BindingProperties:{
              ValueField: {Name: "selectedKey", Type: "string", Multiple: false },
              ValueListAggregation: {Name: "options", KeyField: "key", ValueField: "value" }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.CheckBox,
            Type: "MdCheckBox",
            Description: "Checkbox (MD)",
            DefaultProps: {
              label: "Default Label",
            },
            Aggregations: [],
            BindingProperties:{
              ValueField: {Name: "checked", Type: "boolean", Multiple: false }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.RadioGroup,
            Type: "MdRadioGroup",
            Description: "RadioGroup (MD)",
            DefaultProps: {
              name: "DefaultGroup",
            },
            Aggregations: [
              {
                Name: "items",
                Type: "MdRadio",
                AddMethod: "addItem",
              },
            ],
            BindingProperties:{
              ValueField: {Name: "value", Type: "string", Multiple: false },
              ValueListAggregation: {Name: "items", KeyField: "value", ValueField: "checked" }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.Radio,
            Type: "MdRadio",
            Description: "Radio Button (MD)",
            DefaultProps: {
              checked: false,
            },
            BindingProperties:{
              ValueField: {Name: "checked", Type: "object", Multiple: true }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.Icon,
            Type: "MdIcon",
            Description: "Icon (MD)",
            DefaultProps: {
              icon: "home",
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.SelectOption,
            Type: "MdSelectOption",
            Description: "Select Option (MD)",
            DefaultProps: {
              key: new Date().getTime() + parseInt(Math.random() * 10000,10),
              value: "Option Value"
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.ChipSet,
            Type: "MdChipSet",
            Description: "Chip Set (MD)",
            Aggregations: [
              {
                Name: "chips",
                Type: "MdChip",
                AddMethod: "addChip",
              },
            ],
            BindingProperties:{
              ValueField: {Name: "selectedKeys", Type: "object", Multiple: true },
              ValueListAggregation: {Name: "chips", KeyField: "key", ValueField: "label" }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.MultiSelect,
            Type: "MdMultiSelect",
            Description: "Multi Select (MD)",
            DefaultProps: {
              label: "Multi select",
              valueSet: [
                {key: "01", value: "Value 1", checked: false},
                {key: "02", value: "Value 2", checked: false}
              ],
              selectedKeys:[]
            },
            BindingProperties:{
              ValueField: {Name: "selectedKeys", Type: "object", Multiple: true },
              ValueListField: {Name: "valueSet", LabelField: "value", KeyField: "key", ValueField: "checked" }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.Switch,
            Type: "MdSwitch",
            Description: "Switch (MD)",
            DefaultProps: {
              label: "Switch"
            },
            BindingProperties:{
              ValueField: {Name: "selected", Type: "boolean", Multiple: false }
            }
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.Divider,
            Type: "MdDivider",
            Description: "Divider (MD)",
          },
          {
            Group: "Element",
            Class: com.smod.ux.mat.controls.Chip,
            Type: "MdChip",
            Description: "Chip",
            DefaultProps: {
              selected: false,
              label: "Chip text"
            }
          },
          // {
          //   Group: "Element",
          //   Class: com.thy.ux.per.components.InputField,
          //   Type: "SmodInput",
          //   Description: "Custom Input",
          //   Aggregations: [
          //     {
          //       Name: "layoutData",
          //       Type: "GridData",
          //       AddMethod: "setLayoutData",
          //     },
          //   ],
          // },
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
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
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
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
          },
          {
            Group: "Element",
            Class: sap.m.ToolbarSpacer,
            Type: "ToolbarSpacer",
            Description: "Toolbar Spacer",
          },
          {
            Group: "Element",
            Class: sap.m.ToolbarSeparator,
            Type: "ToolbarSeparator",
            Description: "Toolbar Separator",
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
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
          },
          {
            Group: "Element",
            Class: sap.m.CheckBox,
            Type: "CheckBox",
            Description: "Check Box",
          },
          {
            Group: "Element",
            Class: sap.m.RadioButtonGroup,
            Type: "RadioButtonGroup",
            Description: "Radio Button Group",
            Aggregations: [
              {
                Name: "buttons",
                Type: "RadioButton",
                AddMethod: "addButton",
              },
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
          },
          {
            Group: "Element",
            Class: sap.m.RadioButton,
            Type: "RadioButton",
            Description: "Radio Button",
            Aggregations: []
          },
          {
            Group: "Element",
            Class: sap.m.ComboBox,
            Type: "ComboBox",
            Description: "Combo Box",
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
          },
          {
            Group: "Element",
            Class: sap.m.MultiComboBox,
            Type: "MultiComboBox",
            Description: "Multi Combo Box",
            Aggregations: [
              {
                Name: "layoutData",
                Type: "GridData",
                AddMethod: "setLayoutData",
              },
            ],
          },
        ];
      },
    }
  );
});
