sap.ui.define(
  ["com/thy/ux/per/controller/BaseController", "../model/formatter"],
  function (BaseController, formatter) {
    "use strict";

    return BaseController.extend("com.thy.ux.per.controller.RequestList", {
      formatter: formatter,
      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the design controller is instantiated.
       * @public
       */
      onInit: function () {

      },
      onNewRequest: function () {
        this.getRouter().navTo("requestdetail", {
          requestId: "NEW",
        });
      },
      onEditRequest: function(oEvent){
        const sRequestId = oEvent.getSource().data("request-id");

        if(sRequestId){
          this.getRouter().navTo("requestdetail", {
            requestId: sRequestId,
          });
        }
      },
      onDeleteRequest: function(oEvent){
      }
    });
  }
);
