sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("com.thy.ux.per.controller.Form", {
    onNewForm: function () {
      this.getRouter().navTo("design", {
        formId: "NEW",
      });
    },
    onEditForm: function (oEvent) {
      var oSource = oEvent.getSource();
      // console.log(oSource);
      this.getRouter().navTo("design", {
        formId: oSource.getBindingContext().getProperty("FormId"),
      });
    },
    onDeleteForm: function (oEvent) {
      var oSource = oEvent.getSource();
      var sFormId = oSource.getBindingContext().getProperty("FormId");
      var sFormTitle = oSource.getBindingContext().getProperty("FormTitle");

      this.confirmDialog({
        title: this.getText("DEL_FORM_TITLE", []),
        html: this.getText("DEL_FORM_TEXT", [sFormTitle]),
        icon: "warning",
        confirmButtonText: this.getText("DELETE_ACTION"),
        confirmCallbackFn: function () {
          this._handleDeleteForm(sFormId);
        }.bind(this),
      });
    },

    /* =========================================================== */
    /* internal methods                                            */
    /* =========================================================== */
    _handleDeleteForm: function(sFormId){
      var oModel = this.getModel();
      var that = this;
      var sFormPath = oModel.createKey("/FormHeaderSet", {
        FormId: sFormId,
      });

      this.openBusyFragment();
      oModel.remove(sFormPath, {
        success: function (oData) {
          //--Success
          that.toastMessage(
            "S",
            "MESSAGE_SUCCESSFUL",
            "DEL_FORM_SUCCESSFUL",
            []
          );
          //--Refresh
          that.byId("idFormDesignTable").getBinding("items").refresh();
          //--Close busy dialog
          that.closeBusyFragment();
        },
        error: function (oError) {
          //--Error occurred
          that.closeBusyFragment();
        },
      });
    }
  });
});
