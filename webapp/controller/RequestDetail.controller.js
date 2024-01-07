sap.ui.define(
  [
    "com/thy/ux/per/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/ComponentPool",
    "../model/formatter",
    "sap/ui/core/routing/History",
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,
    ComponentPool,
    formatter,
    History
  ) {
    "use strict";

    return BaseController.extend("com.thy.ux.per.controller.RequestDetail", {
      formatter: formatter,
      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the design controller is instantiated.
       * @public
       */
      onInit: function () {
        const oViewModel = new JSONModel(this._initiateModel());
        this.setModel(oViewModel, "detailView");

        this.getRouter()
          .getRoute("requestdetail")
          .attachPatternMatched(this._onRequestDetailMatched, this);
      },
      /* =========================================================== */
      /* Event handlers                                              */
      /* =========================================================== */
      onNavBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("requestlist", {}, {}, true);
        }
      },
      onWizardNextStep: async function (oEvent) {
        const fnCallback = oEvent.getParameter("callbackFn");
        const oCurrentStep = oEvent.getParameter("currentStep");
        const oTargetStep = oEvent.getParameter("targetStep");

        let bRequestHeader;
        let bProcess;

        switch (oCurrentStep.getNumber()) {
          case 1:
            if (!this._checkForm("idRequestHeaderForm")) {
              return false;
            }

            try {
              bRequestHeader = await this._getRequestHeader();
              if (!bRequestHeader) {
                return false;
              }
              bProcess = await this._getProcessDetails();
              if (!bProcess) {
                return false;
              }

              this._constructUI();
            } catch (e) {
              return false;
            }

            break;
          case 2:
            break;
        }

        if (typeof fnCallback === "function") {
          fnCallback();
        }
      },
      onWizardPrevStep: function (oEvent) {
        const fnCallback = oEvent.getParameter("callbackFn");

        if (typeof fnCallback === "function") {
          fnCallback();
        }
      },
      onWizardSubmit: function (oEvent) {},

      _s: function () {
        let oUIControl = null;
        const sType = oContext.getProperty("Type");
        const aCompPool = oViewModel.getProperty("/ComponentPool");
        const oComp = aCompPool.find((o) => o.Type === sType);

        var oElementInstance = new oChildComp["Class"](oChild.ElementId, {
          ...oSavedProps,
        });

        oUIControl = new sap.m.Text({
          text: oContext.getProperty("Type"),
        });

        return oUIControl;
      },
      /* =========================================================== */
      /* Private methods                                             */
      /* =========================================================== */
      _invalidateDetailPage: function(){
        const oBox = this.byId("idRequestDetailsBox");
        if (oBox) {
          oBox.destroyItems();
        }
      },
      _constructUI: function () {
        const oBox = this.byId("idRequestDetailsBox");
        const oViewModel = this.getModel("detailView");
        const aCompPool = oViewModel.getProperty("/ComponentPool");
        const aCompSet  = oViewModel.getProperty("/FormComponentSet");
        const oProcessDetail  = oViewModel.getProperty("/ProcessDetail");
        const aProcessFieldSet  = oViewModel.getProperty("/ProcessFieldSet");
        const aProcessFieldValueSet  = oViewModel.getProperty("/ProcessFieldValueSet");

        if (oBox) {
          oBox.destroyItems();
        }

        const convertType = (sType, sValue) => {
          let sVal;
          switch (sType) {
            case "object":
              sVal = _.cloneDeep(JSON.parse(sValue));
              break;
            case "boolean":
              sVal = sValue === "true";
              break;
            case "int":
              sVal = parseInt(sValue, 10);
              break;
            default:
              sVal = sValue;
          }
          return sVal;
        };


        const createUIRecursively = (oParentInstance, oElem, sAddMethod) => {
          const oComp = _.find(aCompPool, ["Type", oElem.Type]);
          if (oComp) {
            const oElementInstance = new oComp["Class"](oElem.ElementId);
            const oProcessField = _.find(aProcessFieldSet, ["ElementUid", oElem.ElementUid]);

            if(oProcessField && oComp?.BindingProperties ){
              if(oComp.BindingProperties?.ValueField){
                let sValuePath = oComp.BindingProperties.ValueField.Type === "object" ? 
                `detailView>/ProcessDetail/${oProcessField.ProcessFieldId}/Values` : //Array like structures
                `detailView>/ProcessDetail/${oProcessField.ProcessFieldId}/Value` //String and other flat structures
                
                oElementInstance?.bindProperty(oComp.BindingProperties.ValueField.Name,{
                  path: sValuePath
                });
              }

              if(oComp.BindingProperties?.ValueListField){
                let sValuePath =  `detailView>/ProcessDetail/${oProcessField.ProcessFieldId}/ValueList`;
                
                oElementInstance?.bindProperty(oComp.BindingProperties.ValueListField.Name,{
                  path: sValuePath
                });
              }
            }


            oElem.FormComponentPropertySet.forEach((oProp) => {
              if (oProp.IsStyleClass) {
                oElementInstance.addStyleClass(oProp.PropertyValue);
              }else{
                if(oProp.PropertyName !== oComp?.BindingProperties?.ValueField?.Name && oProp.PropertyName !== oComp?.BindingProperties?.ValueListField?.Name){
                  oElementInstance.setProperty(oProp.PropertyName, convertType(oProp.PropertyType, oProp.PropertyValue));
                }
              }
            });

            if (oParentInstance[sAddMethod] && oElementInstance) {
              oParentInstance[sAddMethod](oElementInstance);
            }

            const aChildren = _.filter(aCompSet,["ParentUid", oElem.ElementUid]);

            aChildren.forEach((oChild)=>{
              const oAggr = _.find(oComp?.Aggregations, {"Type": oChild.Type, "Name": oChild.AggregationName});
              if(oAggr){
                createUIRecursively(oElementInstance, oChild, oAggr.AddMethod );
              }
            });

          }
        };

        //--First find the root element
        const oRootElem = _.find(aCompSet, ["ParentUid", ""]);

        if (!oRootElem) {
          return;
        }

        const aFirstLevel = _.filter(aCompSet, ["ParentUid", oRootElem.ElementUid]);

        aFirstLevel.forEach((oElem)=>{
          createUIRecursively(oBox, oElem, "addItem");
        });

      },
      _checkForm: function (sFormId) {
        let bError = false;
        const oForm = this.byId(sFormId);
        if (!oForm) {
          return true;
        }
        const aField = oForm.getItems() || [];

        if (aField.length === 0) {
          return true;
        }

        aField.forEach((oField) => {
          //--Reset
          oField?.setError(false);
          oField?.setErrorText("");

          if (oField?.getRequired()) {
            let sValue = null;
            if (oField?.getValue && oField?.getValue()) {
              sValue = oField?.getValue();
            }
            if (oField?.getSelectedKey && oField.getSelectedKey()) {
              sValue = oField?.getSelectedKey();
            }
            if (sValue === null || sValue === "" || sValue === undefined) {
              bError = true;
              oField.setError(true);
              oField.setErrorText(this.getText("FIELD_IS_OBLIGATORY", []));
            }
          }
        });

        if (bError) {
          this.toastMessage("E", "FORM_HAS_ERRORS", "CORRECT_ERRORS_RETRY", []);
        }

        return !bError;
      },
      _initiateModel: function () {
        return {
          Busy: false,
          PageTitle: null,
          RequestHeader: {},
          ProcessHeader: {},
          ProcessDetail: {},
          FormHeader: {
            FormComponentSet: [],
          },
          ProcessFieldSet: [],
          ProcessFieldValueSet: [],
          ComponentPool: ComponentPool.loadPool(),
        };
      },
      _onRequestDetailMatched: function (oEvent) {
        const sRequestId = oEvent.getParameter("arguments").requestId;
        const oViewModel = this.getModel("detailView");

        oViewModel.setData(this._initiateModel());

        this.byId("idRequestWizard").initiateWizardState();

        if (sRequestId === "NEW") {
          oViewModel.setProperty("/PageTitle", this.getText("NEW_REQUEST", []));
          this._getRequestDefaults();
        } else {
          oViewModel.setProperty(
            "/PageTitle",
            this.getText("EDIT_REQUEST", [])
          );
          oViewModel.setProperty("/RequesHeader/RequestId", sRequestId);
        }
      },
      _getRequestDefaults: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        let oReqOperation = {
          Operation: "NEW",
          Request: {},
          ReturnSet: [],
        };

        this.openBusyFragment();
        oModel.create("/RequestOperationSet", oReqOperation, {
          success: (oData) => {
            const bError =
              oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;
            if (bError) {
              //--Give error
              this._showErrors(oData.ReturnSet.results);
              return;
            }
            oViewModel.setProperty("/RequestHeader", { ...oData.Request });
            this.closeBusyFragment();
          },
          error: (oError) => {
            this.closeBusyFragment();
          },
        });
      },

      _getRequestHeader: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");

        const p = new Promise((resolve, reject) => {
          let oReqOperation = {
            Operation: "DECIDE",
            Request: { ...oViewModel.getProperty("/RequestHeader") },
            ReturnSet: [],
          };
          this.openBusyFragment("PROCESS_BEING_DECIDED");
          oModel.create("/RequestOperationSet", oReqOperation, {
            success: (oData) => {
              const bError =
                oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;
              oViewModel.setProperty("/RequestHeader", { ...oData.Request });

              if (bError) {
                //--Give error
                this._showErrors(oData.ReturnSet.results);
                resolve(false);
              }
              resolve(true);
              this.closeBusyFragment();
            },
            error: (oError) => {
              resolve(false);
              this.closeBusyFragment();
            },
          });
        });

        return p;
      },
      _getProcessDetails: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        const oRequest = oViewModel.getProperty("/RequestHeader");
        const that = this;
        const sPath = oModel.createKey("/ProcessHeaderSet", {
          ProcessId: oRequest.ProcessId,
        });
        
        //--Avoid duplicate entries clear the page
        this._invalidateDetailPage( );

        const p = new Promise((resolve, reject) => {
          this.openBusyFragment("PROCESS_DETAILS_BEING_READ");
          oModel.read(sPath, {
            urlParameters: {
              $expand:
                `FormHeader,FormHeader/FormComponentSet,FormHeader/FormComponentSet/FormComponentPropertySet,ProcessFieldSet,ProcessFieldSet/ProcessFieldValueSet`,
            },
            success: function (oData) {
              that._setProcessData(oData, resolve);

              //--Close busy dialog
              that.closeBusyFragment();
            },
            error: function (oError) {
              resolve(false);
              //--Error occurred
              that.closeBusyFragment();
            },
          });
        });

        return p;
      },
      _setProcessData: function (oData, fnCallback) {
        const oViewModel = this.getModel("detailView");
        const aCompPool = oViewModel.getProperty("/ComponentPool");
        let aFormComponentSet = [];
        let aProcessFieldSet = [];
        let aProcessFieldValueSet = [];
        let oProcessDetail = {};
        let bError = false;

        const castValueList = (oField)=>{
          let aValueList = [];
          const oComp = aCompPool.find((o) => o.Type === oField.Type);
          if(oComp && oComp?.BindingProperties && oComp.BindingProperties?.ValueListField){
            aValueList = oField.ProcessFieldValueSet.results.map((oFieldValue)=>{
              let oValue = {};
              switch(oField.Type){
                case "MdMultiSelect" :
                  oValue[oComp.BindingProperties.ValueListField.KeyField] = oFieldValue.Key;
                  oValue[oComp.BindingProperties.ValueListField.LabelField] = oFieldValue.Value;
                  oValue[oComp.BindingProperties.ValueListField.ValueField] = false;
                 break;
                default:
                 break;
             }
              return oValue;
            });
          }

          return aValueList;
        };

        //--Set form header
        oViewModel.setProperty(
          "/FormHeader",
          _.omit(oData.FormHeader, ["FormComponentSet", "__metadata"])
        );

        //--Form components and properties
        try {
          aFormComponentSet = oData.FormHeader.FormComponentSet.results.map(
            (oComp) => {
              let oCompModified = _.omit(oComp, [
                "FormComponentPropertySet",
                "__metadata",
              ]);
              oCompModified["FormComponentPropertySet"] =
                oComp.FormComponentPropertySet.results.map((oProp) =>
                  _.omit(oProp, ["_metadata"])
                );
              return oCompModified;
            }
          );
        } catch (e) {
          aFormComponentSet = [];
          bError = true;
          this._detailFormGenerationFailed();
        }
        oViewModel.setProperty("/FormComponentSet", aFormComponentSet);


        //--Process fields and value sets
        try {
          oData.ProcessFieldSet.results.forEach(
            (oField) => {
              //--Fill process fields
              let oFieldModified = _.omit(oField, [
                "ProcessFieldValueSet",
                "__metadata",
              ]);
              aProcessFieldSet.push(oFieldModified);

              //--Define new process detail field for binding
              oProcessDetail[oField.ProcessFieldId] = {
                Value: "", //For single selection
                Values: [], //For multi selection
                ValueList: castValueList(oField),
                ...oFieldModified
              };//--TODO: Write code for conditions
                
              
              //--Fill field value set
              oField.ProcessFieldValueSet.results.forEach((oValue)=>{
                let oValueModified = _.omit(oValue, [
                  "__metadata",
                ]);
                aProcessFieldValueSet.push(oValueModified);

                
              });
            }
          );
        } catch (e) {
          aProcessFieldSet = [];
          aProcessFieldValueSet = [];
          oProcessDetail = {};
          bError = true;
          this._detailFormGenerationFailed();
        }

        //--Set generated fields
        oViewModel.setProperty("/ProcessFieldSet", aProcessFieldSet);
        oViewModel.setProperty("/ProcessFieldValueSet", aProcessFieldValueSet);
        oViewModel.setProperty("/ProcessDetail", oProcessDetail);

        fnCallback(!bError);

      },
      _detailFormGenerationFailed: function(){
        //TODO: Give failed message and return 
      },
      _showErrors: function (aReturn) {
        const aError = _.filter(aReturn, ["Type", "E"]);

        aError.forEach((oError) => {
          this.alertMessage("E", "ERROR_TEXT", "GENERIC_ERROR", oError.Message);
        });
      },
    });
  }
);
