sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.controls.FormContainer", {
    metadata: {
      properties: {
        rowGap: {
          type: "sap.ui.core.CSSSize",
          bindable: true,
          defaultValue: "0.7rem",
        },
        title: {
          type: "string",
          bindable: true,
          defaultValue: null,
        }
      },
      aggregations: {
        items: {
          type: "sap.ui.core.Control",
          multiple: true,
          singularName: "item",
        },
      },
      defaultAggregation: "items",
      events: {},
    },
    init: function () {
      const libraryPath = jQuery.sap.getModulePath("com.thy.ux.per"); //get the server location of the ui library
      jQuery.sap.includeStyleSheet(libraryPath + "/controls/FormContainer.css");
    },
    renderer: function (oRM, oControl) {
      const aItems = oControl.getItems() || [];
      const sTitle = oControl.getTitle();
      oRM
        .openStart("div", oControl)
        .class("smod-form-container")
        .style("row-gap", oControl.getRowGap())
        .openEnd();
      if (sTitle && sTitle !== "") {
        oRM
          .openStart("div")
          .class("smod-form-container-title")
          .openEnd()
          .text(sTitle)
          .close("div");
      }
      aItems.forEach((oItem) => {
        oRM.renderControl(oItem);
      });

      oRM.close("div");
    },
  });
});
