sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.controls.WizardStep", {
    metadata: {
      properties: {
        number: {
          type: "int",
          bindable: true,
        },
        title: {
          type: "string",
          bindable: true,
        },
        description: {
          type: "string",
          bindable: true,
        },
        active: {
          type: "boolean",
          bindable: false,
          defaultValue: false,
        },
      },
      aggregations: {},
      events: {},
    },
    renderer: function (oRM, oControl) {
      //-Step
      oRM
        .openStart("div", oControl)
        .class("smod-wizard-step")
        .attr("data-wizard-type", "step")
        .attr("data-wizard-state", oControl.getActive() ? "current" : "pending")
        .openEnd()
        //--Wrapper
        .openStart("div")
        .class("smod-wizard-wrapper")
        .openEnd()
        //---Wizard number
        .openStart("div")
        .class("smod-wizard-number")
        .openEnd()
        .text(oControl.getNumber())
        .close("div")
        //---Wizard number

        //---Wizard label
        .openStart("div")
        .class("smod-wizard-label")
        .openEnd()
        //----Wizard title
        .openStart("div")
        .class("smod-wizard-title")
        .openEnd()
        .text(oControl.getTitle())
        .close("div")
        //----Wizard title
        //----Wizard desc
        .openStart("div")
        .class("smod-wizard-desc")
        .openEnd()
        .text(oControl.getDescription())
        .close("div")
        //----Wizard desc
        .close("div")
        //---Wizard label

        .close("div")
        //--Wrapper

        .close("div");
      //-Step
    },
  });
});
