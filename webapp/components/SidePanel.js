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
        .class("smod-side-panel-overlay")
        .openEnd()
        .close("div")
        .openStart("div")
        .class("smod-side-panel-content")
        .openEnd()
        .renderControl(oControl.getContent())
        .close("div")
        .close("div");
    },
    open: function(){
      $(this.$()[0]).addClass("open");
    },
    close: function(){
      $(this.$()[0]).removeClass("open");
    }
  });
});
