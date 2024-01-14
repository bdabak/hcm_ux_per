sap.ui.define(
  ["sap/ui/core/Control", "sap/ui/core/routing/Target"],
  function (Control) {
    "use strict";

    return Control.extend("com.thy.ux.per.controls.MessageAlert", {
      metadata: {
        properties: {
          type: {
            type: "sap.ui.core.MessageType",
            bindable: true,
            defaultValue: "Information",
          },
          text: {
            type: "string",
            bindable: true,
            defaultValue: "",
          },
          title: {
            type: "string",
            bindable: true,
            defaultValue: "",
          },
          customIcon: {
            type: "string",
            bindable: true,
            defaultValue: null,
          },

          showIcon: {
            type: "boolean",
            bindable: true,
            defaultValue: true,
          },
        },
        aggregations: {},
        events: {},
      },
      init: function () {
        const libraryPath = jQuery.sap.getModulePath("com.thy.ux.per"); //get the server location of the ui library
        jQuery.sap.includeStyleSheet(
          libraryPath + "/controls/MessageAlert.css"
        );
      },
      _getIcon: function () {
        const mIcon = new Map([
          ["information", "info"],
          ["warning", "warning"],
          ["success", "check_circle"],
          ["error", "error"],
        ]);

        return mIcon.get(this.getType()) || "info";
      },
      renderer: function (oRM, oControl) {
        const bShowIcon = oControl.getShowIcon();
        const sCustomIcon = oControl.getCustomIcon() || null;
        const sIcon = bShowIcon
          ? sCustomIcon
            ? sCustomIcon
            : oControl._getIcon()
          : null;
        const sTitle = oControl.getTitle();
        const sText = oControl.getText();
        // <div class="alert alert-primary d-flex align-items-center p-5 mb-10">
        oRM
          .openStart("div", oControl)
          .class("smod-message-alert")
          .class("smod-message-alert-" + oControl.getType().toLowerCase())
          .openEnd();
        //     <span>
        if (sIcon) {
          oRM
            .openStart("span")
            .class("smod-message-alert-icon")
            .openEnd()
            .text(sIcon)
            .close("span");
        }
        //     </span>

        //  <div class="d-flex flex-column">
        oRM.openStart("div").class("smod-message-alert-body").openEnd();
        //         <h4 class="mb-1 text-primary">
        if (sTitle) {
          oRM
            .openStart("h4")
            .class("smod-message-alert-title")
            .openEnd()
            .text(sTitle)
            .close("h4");
        }
        //</h4>

        //<span>
        oRM
          .openStart("span")
          .class("smod-message-alert-text")
          .openEnd()
          .text(sText) // Text
          .close("span")
          //</span>

          // </div>
          .close("div");

        if (sIcon) {
          oRM
            .openStart("button")
            .class("smod-message-alert-dismiss-button")
            .openEnd()
            .openStart("span")
            .class("smod-message-alert-icon")
            .openEnd()
            .text("close")
            .close("span")
            .close("button");
        }
        // </div>
        oRM.close("div");
      },
      ontap: function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (
          $(e.target).hasClass("smod-message-alert-dismiss-button") ||
          $(e.target).hasClass("smod-message-alert-icon")
        ) {
          this.$().fadeOut({
            duration: 300,
            complete: ()=>{
                this.setVisible(false);
            }
          });
          
        }
      },
    });
  }
);
