sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library"
], function (Controller, UIComponent, mobileLibrary) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.thy.ux.per.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter : function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel : function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        getText: function (sTextCode, aParam) {
			var aTextParam = aParam;
			if (!aTextParam) {
				aTextParam = [];
			}
			return this.getResourceBundle().getText(sTextCode, aTextParam);
		},

       
		alertMessage: function (sType, sTitle, sMessage, aMessageParam) {
			var sIcon;

			switch (sType) {
				case "W":
					sIcon = "warning";
					break;
				case "E":
					sIcon = "error";
					break;
				case "S":
					sIcon = "success";
					break;
				case "I":
					sIcon = "information";
					break;
				default:
					sIcon = "success";
			}

			this.showMessage({
				text: this.getText(sMessage, aMessageParam),
				title: this.getText(sTitle),
				icon: sIcon,
				showConfirmButton: true,
				timer: undefined,
			});

		},

        toastMessage: function (sType, sTitle, sMessage, aMessageParam) {
			var sIcon;

			switch (sType) {
				case "W":
					sIcon = "warning";
					break;
				case "E":
					sIcon = "error";
					break;
				case "S":
					sIcon = "success";
					break;
				case "I":
					sIcon = "information";
					break;
				default:
					sIcon = "success";
			}

			this.showMessage({
				text: this.getText(sMessage, aMessageParam),
				title: this.getText(sTitle),
				icon: sIcon,
				showConfirmButton: sIcon !== "success",
			});

		},

		// toastMessage: function (sMessage, aParam) {
		// 	MessageToast.show(this.getText(sMessage, aParam));
		// },

		showMessage: function (
			opts
		) {
			var options = {
				title: null,
				text: null,
				html: null,
				icon: "info",
				position: "bottom",
				showConfirmButton: false,
				confirmButtonText: this.getText("CONFIRM_ACTION", []),
				confirmButtonColor: "#3085d6",
				showCancelButton: false,
				cancelButtonText: this.getText("CANCEL_ACTION", []),
				cancelButtonColor: "#d33",
				showCloseButton: false,
				toast: true,
				timer: 3000,
				timerProgressBar: false,
				customClass: {
					popup: "colored-toast"
				},
				iconColor: "white",
				backdrop:false
			};

			for (var k in options) {
				if (opts.hasOwnProperty(k)) {
					options[k] = opts[k];
				}
			}

			Swal.fire({ ...options }).then(function (result) {
				if (result.isConfirmed) {
					if (opts.confirmCallbackFn !== undefined) {
						try {
							opts.confirmCallbackFn();
						} catch (e) {

						}
					}
				}
				if (result.isCancelled) {
					if (opts.cancelCallbackFn !== undefined) {
						try {
							opts.cancelCallbackFn();
						} catch (e) {

						}
					}
				}
			});
		},
		confirmDialog: function (opts) {
			var options = {
				title: null,
				html: null,
				icon: "info",
				position: "center",
				timer: undefined,
				timerProgressBar: false,
				showConfirmButton: true,
				confirmButtonText: this.getText("CONFIRM_ACTION", []),
				confirmButtonColor: "#3085d6",

				showCancelButton: true,
				cancelButtonText: this.getText("CANCEL_ACTION", []),
				cancelButtonColor: "#d33",
				showCloseButton: false,
				focusConfirm: true,
				toast: false,
				timer: undefined,
				timerProgressBar: false,
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: true,
				input: undefined,
				inputLabel: "",
				inputPlaceholder: "",
				inputAttributes: {},
				preConfirm: null
			};

			for (var k in options) {
				if (opts.hasOwnProperty(k)) {
					options[k] = opts[k];
				}
			}

			Swal.fire({ ...options }).then(function (result) {
				if (result.isConfirmed) {
					if (opts.confirmCallbackFn !== undefined) {
						try {
							opts.confirmCallbackFn();
						} catch (e) {

						}
					}
				}
				if (result.isCancelled) {
					if (opts.cancelCallbackFn !== undefined) {
						try {
							opts.cancelCallbackFn();
						} catch (e) {

						}
					}
				}
			});
		},
		openBusyFragment: function (sTextCode = null, aMessageParameters = []) {
			var oDialog = this._getBusyFragment();
			var that = this;
			if (sTextCode) {
			  oDialog.setText(this.getText(sTextCode, aMessageParameters));
			} else {
			  oDialog.setText(this.getText("PLEASE_WAIT", [] ));
			}
	
			setTimeout(function () {
			  oDialog.open();
			}, 100);
		  },
	
		  closeBusyFragment: function () {
			var oDialog = this._getBusyFragment();
			var that = this;
			var _close = function () {
			  oDialog.close();
			};
			setTimeout(_close, 500);
		  },
	

		 /**
		 * Convenience method for get generic Busy fragment
		 * @private
		 * @returns {com.thy.ux.per.fragment.BusyDialog} the router for this component
		 */
		  _getBusyFragment: function () {
			  this.oBusyDialog = sap.ui.getCore().byId("GenericBusyDialog") || null;

			  if (!this.oBusyDialog) {
				this.oBusyDialog = sap.ui.xmlfragment(
				  "com.thy.ux.per.fragment.GenericBusyDialog",
				  this
				);
	  
				this.getView().addDependent(this.oBusyDialog);
			  } 
	  
			  return this.oBusyDialog;
			},
    });

});