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
        this.getRouter()
        .getRoute("requestlist")
        .attachPatternMatched(this._handleRequestListMatched, this);
      },
      /**
       * @public
       */
      onExit: function() {
        window.removeEventListener("hashchange", this._hashChangeListener);  
      },
      onNewRequest: function () {
        this.getRouter().navTo("createrequest");
      },
      onEditRequest: function(oEvent){
        const sRequestId = oEvent.getSource().data("requestId");
        const sVersion = oEvent.getSource().data("version");

        if(sRequestId){
          this.getRouter().navTo("editrequest", {
            requestId: sRequestId,
            version: sVersion
          });
        }
      },

      onDeleteRequest: function(oEvent){
        const sRequestId = oEvent.getSource().data("requestId");
        const sVersion = oEvent.getSource().data("version");
        const sRequestTitle = oEvent.getSource().data("requestTitle");
        const oModel = this.getModel();
        const sPath = oModel.createKey("/RequestHeaderSet", {
          RequestId: sRequestId,
          Version: sVersion
        });

        const doDelete = ()=>{
          this.openBusyFragment();
          oModel.remove(sPath,{
            success:()=>{
              this.closeBusyFragment();
              this._refreshList();
            },
            error:()=>{
              this.closeBusyFragment();
            }
          })
        };

        this.confirmDialog({
          title: this.getText("DELETE_CONFIRMATION", []),
          html: this.getText("REQUEST_WILL_BE_DELETED", [sRequestTitle]),
          icon: "warning",
          confirmButtonText: this.getText("DELETE_ACTION", []),
          confirmButtonColor: "#3085d6",
          confirmCallbackFn: doDelete.bind(this),
        });
        
      },

      onPrintOut: function(oEvent){
        const sRequestId = oEvent.getSource().data("requestId");
        const sVersion = oEvent.getSource().data("version");
        const oModel = this.getModel();
        const sPath =  oModel.createKey("/RequestHeaderSet", {
          RequestId: sRequestId,
          Version: sVersion
        });
        this.toastMessage("I", "MESSAGE_INFORMATION", "FILE_IS_BEING_DOWNLOADED", []);
        sap.m.URLHelper.redirect(`/sap/opu/odata/sap/ZHCM_UX_PER_SRV/${sPath}/$value`, true);
      },
      onNavHome: function(){
        var oNav = sap.ushell.Container.getService(
          "CrossApplicationNavigation"
        );

        if (oNav) {
          oNav.toExternal({
            target: {
              semanticObject: "Shell-home",
            },
          });
        }
      },
      /* =========================================================== */
      /* Event handlers                                              */
      /* =========================================================== */
      _registerHasChange: function () {
        var that = this;
        window.removeEventListener("hashchange", that._hashChangeListener);

        window.addEventListener(
          "hashchange",
          that._hashChangeListener.bind(that),
          false
        );
      },
      _hashChangeListener: function (e) {
        if (sap?.ushell?.Container) {
          if (e.newURL && e.newURL.includes("#Shell-home")) {
            var oRenderer = sap.ushell.Container.getRenderer("fiori2");
            if (oRenderer) {
              oRenderer.setHeaderVisibility(true, true, ["app"]);
            }
          }
        }
      },

      _refreshList:function(){
        this.byId("idRequestList").getBinding("items").refresh(true);
      },
      _handleRequestListMatched: function(){
        this.byId("idRequestList").getBinding("items").refresh(true);
        
        this._registerHasChange();

        var oRenderer = sap.ushell.Container.getRenderer("fiori2");
        if (oRenderer) {
          oRenderer.setHeaderVisibility(false, false, ["app"]);
        }

      }
    });
  }
);
