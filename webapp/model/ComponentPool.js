sap.ui.define(
  [
    "com/thy/ux/per/controls/FormWizard",
    "com/thy/ux/per/controls/FormContainer",
    "com/thy/ux/per/controls/MessageAlert",
  ],
  function (FormWizard, FormContainer, MessageAlert) {
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
                {
                  Name: "items",
                  Type: "PerFormContainer",
                  AddMethod: "addItem",
                },
                { Name: "items", Type: "Panel", AddMethod: "addItem" },
              ],
            },
            {
              Group: "Container",
              Class: com.thy.ux.per.controls.FormContainer,
              Type: "PerFormContainer",
              Description: "Form Container",
              DefaultProps: {
                title: "Default Form Title",
              },
              Aggregations: [
                { Name: "items", Type: "MdTextField", AddMethod: "addItem" },
                { Name: "items", Type: "MdSelect", AddMethod: "addItem" },
                { Name: "items", Type: "MdCheckBox", AddMethod: "addItem" },
                { Name: "items", Type: "MdRadioGroup", AddMethod: "addItem" },
                { Name: "items", Type: "MdMultiSelect", AddMethod: "addItem" },
                { Name: "items", Type: "MdSelectList", AddMethod: "addItem" },
                { Name: "items", Type: "MdChipSet", AddMethod: "addItem" },
                { Name: "items", Type: "MdDivider", AddMethod: "addItem" },
                { Name: "items", Type: "MdSwitch", AddMethod: "addItem" },
                { Name: "items", Type: "MdButton", AddMethod: "addItem" },
                { Name: "items", Type: "MdChip", AddMethod: "addItem" },
                { Name: "items", Type: "PerFormContainer", AddMethod: "addItem" },
                { Name: "items", Type: "MdTabContainer", AddMethod: "addItem" },
                { Name: "items", Type: "HBox", AddMethod: "addItem" },
                { Name: "items", Type: "VBox", AddMethod: "addItem" },
                { Name: "items", Type: "MessageAlert", AddMethod: "addItem" },
              ],
            },

            {
              Group: "Layout",
              Class: sap.m.HBox,
              Type: "HBox",
              Description: "Horizontal Box",
              Aggregations: [
                { Name: "items", Type: "MdTextField", AddMethod: "addItem" },
                { Name: "items", Type: "MdSelect", AddMethod: "addItem" },
                { Name: "items", Type: "MdCheckBox", AddMethod: "addItem" },
                { Name: "items", Type: "MdRadioGroup", AddMethod: "addItem" },
                { Name: "items", Type: "MdMultiSelect", AddMethod: "addItem" },
                { Name: "items", Type: "MdSelectList", AddMethod: "addItem" },
                { Name: "items", Type: "MdChipSet", AddMethod: "addItem" },
                { Name: "items", Type: "MdDivider", AddMethod: "addItem" },
                { Name: "items", Type: "MdSwitch", AddMethod: "addItem" },
                { Name: "items", Type: "MdButton", AddMethod: "addItem" },
                { Name: "items", Type: "MdChip", AddMethod: "addItem" },
                {
                  Name: "items",
                  Type: "PerFormContainer",
                  AddMethod: "addItem",
                },
                { Name: "items", Type: "Panel", AddMethod: "addItem" },
                { Name: "items", Type: "HBox", AddMethod: "addItem" },
                { Name: "items", Type: "VBox", AddMethod: "addItem" },
                { Name: "items", Type: "MessageAlert", AddMethod: "addItem" },
              ],
            },
            {
              Group: "Layout",
              Class: sap.m.VBox,
              Type: "VBox",
              Description: "Vertical Box",
              Aggregations: [
                { Name: "items", Type: "MdTextField", AddMethod: "addItem" },
                { Name: "items", Type: "MdSelect", AddMethod: "addItem" },
                { Name: "items", Type: "MdCheckBox", AddMethod: "addItem" },
                { Name: "items", Type: "MdRadioGroup", AddMethod: "addItem" },
                { Name: "items", Type: "MdMultiSelect", AddMethod: "addItem" },
                { Name: "items", Type: "MdSelectList", AddMethod: "addItem" },
                { Name: "items", Type: "MdChipSet", AddMethod: "addItem" },
                { Name: "items", Type: "MdDivider", AddMethod: "addItem" },
                { Name: "items", Type: "MdSwitch", AddMethod: "addItem" },
                { Name: "items", Type: "MdButton", AddMethod: "addItem" },
                { Name: "items", Type: "MdChip", AddMethod: "addItem" },
                {
                  Name: "items",
                  Type: "PerFormContainer",
                  AddMethod: "addItem",
                },
                { Name: "items", Type: "Panel", AddMethod: "addItem" },
                { Name: "items", Type: "HBox", AddMethod: "addItem" },
                { Name: "items", Type: "VBox", AddMethod: "addItem" },
                { Name: "items", Type: "MessageAlert", AddMethod: "addItem" },
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
              Aggregations: [
                {
                  Name: "content",
                  Type: "PerFormContainer",
                  AddMethod: "addContent",
                },
                { Name: "content", Type: "HBox", AddMethod: "addContent" },
                { Name: "content", Type: "VBox", AddMethod: "addContent" },
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
                {
                  Name: "tabPanels",
                  Type: "MdTabPanel",
                  AddMethod: "addTabPanel",
                },
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
                { Name: "icon", Type: "MdIcon", AddMethod: "setIcon" },
              ],
            },
            {
              Group: "Container",
              Class: com.smod.ux.mat.controls.TabPanel,
              Type: "MdTabPanel",
              Description: "TabPanel MD",
              Aggregations: [
                {
                  Name: "content",
                  Type: "PerFormContainer",
                  AddMethod: "setContent",
                },
              ],
            },

            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.TextField,
              Type: "MdTextField",
              Description: "Text Field (MD)",
              DefaultProps: {
                label: "Default Label",
                placeholder: "Descriptive text...",
              },
              Aggregations: [
                {
                  Name: "layoutData",
                  Type: "GridData",
                  AddMethod: "setLayoutData",
                },
              ],
              BindingProperties: {
                ValueField: { Name: "value", Type: "string", Multiple: false },
              },
            },

            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.Select,
              Type: "MdSelect",
              Description: "Select Field (MD)",
              DefaultProps: {
                label: "Default Label",
              },
              Aggregations: [
                {
                  Name: "options",
                  Type: "MdSelectOption",
                  AddMethod: "addOption",
                },
              ],
              BindingProperties: {
                ValueField: {
                  Name: "selectedKey",
                  Type: "string",
                  Multiple: false,
                },
                ValueListAggregation: {
                  Name: "options",
                  KeyField: "key",
                  ValueField: "value",
                },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.SelectOption,
              Type: "MdSelectOption",
              Description: "Select Option (MD)",
              DefaultProps: {
                key: new Date().getTime() + parseInt(Math.random() * 10000, 10),
                value: "Option Value",
              },
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
              BindingProperties: {
                ValueField: {
                  Name: "checked",
                  Type: "boolean",
                  Multiple: false,
                },
              },
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
              BindingProperties: {
                ValueField: { Name: "value", Type: "string", Multiple: false },
                ValueListAggregation: {
                  Name: "items",
                  KeyField: "value",
                  ValueField: "checked",
                },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.Radio,
              Type: "MdRadio",
              Description: "Radio Button (MD)",
              DefaultProps: {
                checked: false,
              },
              BindingProperties: {
                ValueField: { Name: "checked", Type: "object", Multiple: true },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.Icon,
              Type: "MdIcon",
              Description: "Icon (MD)",
              DefaultProps: {
                icon: "home",
              },
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
              BindingProperties: {
                ValueField: {
                  Name: "selectedKeys",
                  Type: "object",
                  Multiple: true,
                },
                ValueListAggregation: {
                  Name: "chips",
                  KeyField: "key",
                  ValueField: "label",
                },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.MultiSelect,
              Type: "MdMultiSelect",
              Description: "Multi Select (MD)",
              DefaultProps: {
                label: "Multi select",
                valueSet: [
                  { key: "01", value: "Value 1", checked: false },
                  { key: "02", value: "Value 2", checked: false },
                ],
                selectedKeys: [],
              },
              BindingProperties: {
                ValueField: {
                  Name: "selectedKeys",
                  Type: "object",
                  Multiple: true,
                },
                ValueListField: {
                  Name: "valueSet",
                  LabelField: "value",
                  KeyField: "key",
                  ValueField: "checked",
                },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.SelectList,
              Type: "MdSelectList",
              Description: "Select List (MD)",
              DefaultProps: {
                label: "Select from a wide list",
                placeholder: "Search for entries",
                valueSet: [
                  { key: "01", value: "Value 1" },
                  { key: "02", value: "Value 2" },
                ],
              },
              BindingProperties: {
                ValueField: {
                  Name: "selectedKey",
                  Type: "string",
                  Multiple: false,
                },
                ValueListField: {
                  Name: "valueSet",
                  LabelField: "value",
                  KeyField: "key",
                  ValueField: "key",
                },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.Switch,
              Type: "MdSwitch",
              Description: "Switch (MD)",
              DefaultProps: {
                label: "Switch",
              },
              BindingProperties: {
                ValueField: {
                  Name: "selected",
                  Type: "boolean",
                  Multiple: false,
                },
              },
            },
            {
              Group: "Element",
              Class: com.smod.ux.mat.controls.Button,
              Type: "MdButton",
              Description: "Button (MD)",
              DefaultProps: {
                text: "Button",
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
              Description: "Chip (Md)",
              DefaultProps: {
                selected: false,
                label: "Chip text",
              },
              BindingProperties: {
                ValueField: {
                  Name: "selected",
                  Type: "boolean",
                  Multiple: false,
                },
              },
            },

            {
              Group: "Element",
              Class: com.thy.ux.per.controls.MessageAlert,
              DefaultProps: {
                showIcon: true,
                text: "Message will be displayed like this!",
                title: "Default Title",
                type: "Information",
              },
              Type: "MessageAlert",
              Description: "Message Alert",
            },
          ];
        },
      }
    );
  }
);
