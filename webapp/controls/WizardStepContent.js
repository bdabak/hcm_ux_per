sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.controls.WizardStepContent", {
    metadata: {
      properties: {
        number: {
          type: "int",
          bindable: true,
        },
        active: {
          type: "boolean",
          bindable: false,
          defaultValue: false,
        },
      },
      aggregations: {
        content:{
          type: "sap.ui.core.Control",
          multiple: false
        },
       
      },
      defaultAggregation: "content",
      events: {},
    },
    renderer: function (oRM, oControl) {
      //-Step content
      oRM
        .openStart("div", oControl)
        .class("smod-wizard-step-content")
        .attr("data-wizard-type", "step-content")
        .attr("data-wizard-state", oControl.getActive() ? "current" : "")
        .openEnd()
        .renderControl(oControl.getContent())
        .close("div");
      //-Step content
    },
  });
});
