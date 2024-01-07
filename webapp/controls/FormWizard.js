sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.controls.FormWizard", {
    metadata: {
      properties: {},
      aggregations: {
        items: {
          type: "sap.ui.core.Control",
          multiple: true,
          singularName: "item",
        },
      },
      defaultAggregation: "content",
    },
    init: function () {
      const libraryPath = jQuery.sap.getModulePath("com.thy.ux.per"); //get the server location of the ui library
      jQuery.sap.includeStyleSheet(libraryPath + "/controls/Wizard.css");
    },
    renderer: function (oRM, oControl) {
      const aItems = oControl.getItems();
      oRM
        //------Form Wizard
        .openStart("div", oControl)
        .class("smod-form-wizard")
        .openEnd()
        //------Wizard Body
        .openStart("div")
        .class("smod-wizard-body")
        .openEnd()
        //------Wizard Body Container
        .openStart("div")
        .class("smod-wizard-body-container")
        .openEnd()
        //------Wizard Body Row
        .openStart("div")
        .class("smod-wizard-body-row")
        .openEnd()

        //-------Form
        // .openStart("form")
        .openStart("div")
        .class("smod-wizard-body-form")
        // .attr("onsubmit", "event.preventDefault()")
        .openEnd();

      //--Render items
      aItems.forEach((oItem, i) => {
        oRM.renderControl(oItem);
      });
      //--Render items

      oRM
        // .close("form")
        .close("div")
        //-------Form

        .close("div")
        //------Wizard Body Row
        .close("div")
        //------Wizard Body Container
        .close("div")
        //------Wizard Body
        .close("div");
      //------Form Wizard
    },
  });
});
