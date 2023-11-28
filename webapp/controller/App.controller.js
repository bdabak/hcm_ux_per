sap.ui.define([
    "./BaseController",
    "com/thy/ux/per/utils/swal"
], function (BaseController,
	SwalJS) {
    "use strict";

    return BaseController.extend("com.thy.ux.per.controller.App", {

        onInit : function () {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });

});