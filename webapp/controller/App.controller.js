sap.ui.define([
    "./BaseController",
    "com/thy/ux/per/utils/swal",
    "com/smod/ux/lib/thirdparty/lodash",
], function (BaseController,
	SwalJS, LodashJS) {
    "use strict";

    return BaseController.extend("com.thy.ux.per.controller.App", {

        onInit : function () {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });

});