sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.components.SidePanel", {
    metadata: {
      properties: {},
      aggregations: {
        content: {
          type: "sap.ui.core.Control",
          multiple: false,
        },
      },
      defaultAggregation: "content",
    },
    init: function () {
      var sLibraryPath = jQuery.sap.getModulePath("com.thy.ux.per"); //get the server location of the app

      jQuery.sap.includeStyleSheet(sLibraryPath + "/components/SidePanel.css");
    },
    renderer: function (oRM, oControl) {
      oRM
        .openStart("div", oControl)
        .class("smod-side-panel")
        .openEnd()
        .openStart("div")
        .class("smod-design-box-overlay")
        .openEnd()
        .close("div")
        .renderControl(oControl.getContent())
        .close("div");
    },
    open: function(){
      this.$(".smod-side-panel").style("width", "250px");
    },
    close: function(){
      this.$(".smod-side-panel").style("width", "0");
    }
  });
});
