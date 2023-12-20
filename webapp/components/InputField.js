sap.ui.define(["sap/ui/core/Control"], function (Control) {
  "use strict";

  return Control.extend("com.thy.ux.per.components.InputField", {
    metadata: {
      properties: {
        label:{
            type: "string",
            bindable: true
        },
        placeholder:{
            type: "string",
            bindable: true,
            defaultValue: null
        },
        required:{
            type: "boolean",
            bindable: true,
            defaultValue: false
        },
        value: {
            type: "string",
            bindable: true,
            defaultValue: null
        },
        type:{
            type: "string",
            bindable: true,
            defaultValue: "text"
        },
        editable: {
            type: "boolean",
            bindable: true,
            defaultValue: true
        }
      },
      aggregations: {
      }
    },
    init: function () {
      var sLibraryPath = jQuery.sap.getModulePath("com.thy.ux.per"); //get the server location of the app

      jQuery.sap.includeStyleSheet(sLibraryPath + "/components/InputField.css");
    },
    renderer: function (oRM, oControl) {
      oRM
        //--Div root
        .openStart("div", oControl)
        .class("smod-input-field-root")
        .openEnd()

        //--Label
        .openStart("label")
        .class("smod-input-field-label")
        .openEnd()
        .text(oControl.getLabel())

        //--Span required
        .openStart("span")
        .class("smod-input-field-label-required")
        .openEnd()
        .text(oControl.getRequired() ? " *" : "")
        .close("span")
         //--Span required

        .close("label")
         //--Label

         //--Div input wrapper
        .openStart("div")
        .class("smod-input-field-wrapper")
        .openEnd()
        
        //--Input
        .openStart("input")
        .class("smod-input-field")
        .attr("value", oControl.getValue());
        oControl.getEditable() ? null : oRM.attr("disabled", "disabled");
        oRM.attr("placeholder", oControl.getPlaceholder())
        .attr("autocomplete", "off")
        .openEnd()

        .close("input")
        //--Input

        .close("div")
        //--Div input wrapper

        .close("div");
        //--Div root
    },

    onfocusin: function(oEvent){
        oEvent.stopPropagation();
        this.$().find(".smod-input-field-label").attr("data-floating", true);
        this.$().find(".smod-input-field").attr("data-floating", true);
    },
    onfocusout: function(oEvent){
        oEvent.stopPropagation();
        if(this.$().find(".smod-input-field").val() === ""){
            this.$().find(".smod-input-field-label").removeAttr("data-floating");
            this.$().find(".smod-input-field").removeAttr("data-floating");
        }
    },
    onkeyup: function(oEvent){
        this.setProperty("value", this.$().find(".smod-input-field").val(), true);
    }
  });
});
