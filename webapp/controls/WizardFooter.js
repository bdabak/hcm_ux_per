sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.controls.WizardFooter", {
    metadata: {
      properties: {},
      aggregations: {
        leftContent: {
          type: "sap.ui.core.Control",
          multiple: true,
        },
        rightContent: {
          type: "sap.ui.core.Control",
          multiple: true,
        },
      },
      events: {},
    },
    renderer: function (oRM, oControl) {
      const aLeftContent = oControl.getLeftContent() || [];
      const aRightContent = oControl.getRightContent() || [];
      //-Step footer content
      oRM
        .openStart("div", oControl)
        .class("smod-wizard-footer")
        .openEnd()
        //--Footer left content
        .openStart("div")
        .class("smod-wizard-footer-content-left")
        .openEnd();
      aLeftContent.forEach((oContent) => {
        oRM.renderControl(oContent);
      });
      oRM
        .close("div")
        //--Footer left content
        //--Footer right content
        .openStart("div")
        .class("smod-wizard-footer-content-right")
        .openEnd();
      aRightContent.forEach((oContent) => {
        oRM.renderControl(oContent);
      });
      oRM
        .close("div")
        //--Footer right content
        .close("div");
      //-Step content
    },
  });
});
