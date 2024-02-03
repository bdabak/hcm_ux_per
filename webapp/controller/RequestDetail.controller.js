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
          .attachPatternMatched(this._handleRequestDetailMatched, this);
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

      onOrgUnitSelected: function () {
        this._refreshBudget();
      },

      onWizardNextStep: async function (oEvent) {
        const fnCallback = oEvent.getParameter("callbackFn");
        const oCurrentStep = oEvent.getParameter("currentStep");
        const oTargetStep = oEvent.getParameter("targetStep");
        const oViewModel = this.getModel("detailView");
        const sMode = oViewModel.getProperty("/Mode");

        if (sMode === "CREATE") {
          this._handleNextStepCreate(fnCallback, oCurrentStep, oTargetStep);
        } else if (sMode === "EDIT") {
          this._handleNextStepEdit(fnCallback, oCurrentStep, oTargetStep);
        }
      },
      onWizardPrevStep: function (oEvent) {
        const fnCallback = oEvent.getParameter("callbackFn");

        if (typeof fnCallback === "function") {
          fnCallback();
        }
      },

      onSaveAsDraft: async function () {
        try {
          let bSuccess = await this._saveRequestDetails();

          this._triggerUploadAttachments();

          if (bSuccess) {
            this.toastMessage(
              "S",
              "MESSAGE_SUCCESS",
              "REQUEST_SAVED_AS_DRAFT",
              []
            );
          }
        } catch (e) {
          //--Error message given already
        }
      },
      onSendForApproval: function () {},
      onFileTypeMismatch: function () {
        this.toastMessage("E", "MESSAGE_FAILED", "FILE_TYPE_MISMATCH", []);
      },
      onFileSizeExceeded: function () {
        this.toastMessage("E", "MESSAGE_FAILED", "FILE_SIZE_EXCEEDED", []);
      },
      onBeforeUploadStarts: function (oEvent) {
        const oModel = this.getModel();
        const oUploadSet = this.byId("idRequestAttachmentUpload");
        const oItem = oEvent.getParameter("item");
        //--Refresh security token
        oModel.refreshSecurityToken();

        oUploadSet.removeHeaderField("x-csrf-token");
        oUploadSet.removeHeaderField("Content-Disposition");
        oUploadSet.addHeaderField(
          new sap.ui.core.Item({
            key: "x-csrf-token",
            text: oModel.getSecurityToken(),
          })
        );

        oUploadSet.addHeaderField(
          new sap.ui.core.Item({
            key: "Content-Disposition",
            text: encodeURIComponent(oItem.getFileName()),
          })
        );
      },
      onUploadCompleted: function () {
        const oUploadSet = this.byId("idRequestAttachmentUpload");

        oUploadSet.removeAllIncompleteItems();

        this.toastMessage(
          "S",
          "MESSAGE_SUCCESS",
          "FILE_UPLOAD_COMPLETE",
          []
        );
        this._refreshAttachmentList();
      },
      onFileDelete: function (oEvent) {
        oEvent.preventDefault();

        const oItem = oEvent.getParameter("item");
        const oModel = this.getModel();

        if (!oItem) {
          return;
        }

        const doDelete = () => {
          const sPath = oModel.createKey("/RequestAttachmentSet", {
            AttachmentId: oItem.data("attachment-id"),
          });
          this.openBusyFragment("ATTACHMENT_IS_BEING_DELETED");
          oModel.remove(`${sPath}/$value`, {
            success: () => {
              this.toastMessage(
                "S",
                "MESSAGE_SUCCESS",
                "ATTACHMENT_DELETED",
                []
              );
              this._refreshAttachmentList();
            },
            error: () => {
              this._refreshAttachmentList();
            },
          });
        };

        this.confirmDialog({
          title: this.getText("DELETE_CONFIRMATION", []),
          html: this.getText("ATTACHMENT_WILL_BE_REMOVED", []),
          icon: "warning",
          confirmButtonText: this.getText("DELETE_ACTION", []),
          confirmButtonColor: "#3085d6",
          confirmCallbackFn: doDelete.bind(this),
        });
      },
      onTriggerUpload: function () {
        const oUploadSet = this.byId("idRequestAttachmentUpload");

        if (!oUploadSet) {
          return;
        }

        const aItems = oUploadSet.getIncompleteItems();

        if (aItems.length === 0) {
          this.toastMessage(
            "W",
            "MESSAGE_WARNING",
            "ATTACHMENT_SHOULD_BE_ADDED",
            []
          );
          return;
        }

        this._triggerUploadAttachments();
      },
      onRefreshBudget: function () {
        this._refreshBudget();
      },
      /* =========================================================== */
      /* Private methods                                             */
      /* =========================================================== */
      _refreshBudget: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        let oReqHeader = _.omit(oViewModel.getProperty("/RequestHeader"), [
          "RequestDetailSet",
        ]);
        let oReqOperation = {
          Operation: "BUDGET",
          RequestHeader: oReqHeader,
          ReturnSet: [],
        };
        this.openBusyFragment("BUDGET_BEING_READ");
        oModel.create("/RequestOperationSet", oReqOperation, {
          success: (oData) => {
            const bError =
              oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;
            oViewModel.setProperty(
              "/RequestHeader/ApprovedBudget",
              oData.RequestHeader.ApprovedBudget
            );
            oViewModel.setProperty(
              "/RequestHeader/EmployeeCount",
              oData.RequestHeader.EmployeeCount
            );
            oViewModel.setProperty(
              "/RequestHeader/RemainingBudget",
              oData.RequestHeader.RemainingBudget
            );

            if (bError) {
              //--Give error
              this._showErrors(oData.ReturnSet.results);
            } else {
              this.toastMessage(
                "S",
                "MESSAGE_SUCCESS",
                "BUDGET_INFO_FETCHED",
                []
              );
            }
            this.closeBusyFragment();
          },
          error: (oError) => {
            this.closeBusyFragment();
          },
        });
      },
      _handleRequestDetailMatched: function (oEvent) {
        const sRequestId = oEvent.getParameter("arguments").requestId;
        const oViewModel = this.getModel("detailView");

        oViewModel.setData(this._initiateModel());

        this.byId("idRequestWizard").initiateWizardState();

        if (sRequestId === "NEW") {
          oViewModel.setProperty("/PageTitle", this.getText("NEW_REQUEST", []));
          oViewModel.setProperty("/Mode", "CREATE");
          this._getRequestDefaults();
        } else {
          oViewModel.setProperty(
            "/PageTitle",
            this.getText("EDIT_REQUEST", [])
          );
          oViewModel.setProperty("/Mode", "EDIT");
          oViewModel.setProperty("/RequestHeader/RequestId", sRequestId);
          this._getRequest();
        }
      },

      _initiateModel: function () {
        return {
          Busy: false,
          PageTitle: null,
          Mode: null,
          RequestHeader: {
            RequestDetailSet: [],
          },
          RequestAttachmentSet: [],
          ProcessHeader: {},
          ProcessDetail: {},
          FormHeader: {
            FormComponentSet: [],
          },
          ProcessFieldSet: [],
          ProcessFieldValueSet: [],
          ProcessFieldBindingSet: [],
          ComponentPool: ComponentPool.loadPool(),
        };
      },
      _invalidateDetailPage: function () {
        const oBox = this.byId("idRequestDetailsBox");
        if (oBox) {
          oBox.destroyItems();
        }
      },
      
      _showBudgetWarning: function(){
        const oViewModel = this.getModel("detailView");
        const oProcessHeader = oViewModel.getProperty("/ProcessHeader");
        const oRequestHeader = oViewModel.getProperty("/RequestHeader");
        let bDownloaded = false;

        const redirectForDownload = (sUrl)=>{
          bDownloaded = true;
          sap.m.URLHelper.redirect(sUrl, true);  
          this.toastMessage("I", "MESSAGE_INFORMATION", "FILE_IS_BEING_DOWNLOADED", [])
        };

        const p = new Promise((resolve, reject) => {
          if(oRequestHeader.RemainingBudget > 0){
            resolve(true);
          }else{
            if(oProcessHeader.BudgetWarning){

              Swal.fire({
                icon: "warning",
                allowOutsideClick: false,
                allowEscapeKey: false,
                title: this.getText("BUDGET_WARNING",[]),
                html: `
                  <div class="budget-warning-container">
                    <span class="budget-warning-text">${oProcessHeader.BudgetWarningText}</span>
                    <div class="budget-attachment-container" role="button" tabIndex="0" data-download-url="/sap/opu/odata/sap/ZHCM_UX_PER_SRV/ProcessHeaderSet('${oProcessHeader.ProcessId}')/$value">
                      <span class="budget-attachment-icon">download</span>
                      <span class="budget-attachment-name">${oProcessHeader.AttachmentName}</span>
                    </div>
                  </div>
                  `,
                confirmButtonText: this.getText("CONFIRM_ACTION", []),
                cancelButtonText:  this.getText("CANCEL_ACTION", []),
                showCancelButton: true,
                focusConfirm: false,
                didOpen: () => {
                  const popup = Swal.getPopup();
                  let attachContainerButton = popup.querySelector('.budget-attachment-container');
                  attachContainerButton.onclick = (event) => {
                    bDownloaded = true;
                    Swal.clickConfirm();
                    redirectForDownload(`/sap/opu/odata/sap/ZHCM_UX_PER_SRV/ProcessHeaderSet('${oProcessHeader.ProcessId}')/$value`);
                  }
                },
                preConfirm: () => {
                  // const username = usernameInput.value
                  // const password = passwordInput.value
                  // if (!username || !password) {
                  //   Swal.showValidationMessage(`Please enter username and password`)
                  // }
                  // return { username, password }
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  if(!bDownloaded){
                    redirectForDownload(`/sap/opu/odata/sap/ZHCM_UX_PER_SRV/ProcessHeaderSet('${oProcessHeader.ProcessId}')/$value`);  
                  }
                  resolve(true);
                }else{
                  resolve(false);
                }
              });
            }
          }
        });

        return p;
      },
      _handleNextStepCreate: async function (
        fnCallback,
        oCurrentStep,
        oTargetStep
      ) {
        let bRequestHeader;
        let bProcess;
        let bBudget;
        let bCheckRequest;

        switch (oCurrentStep.getNumber()) {
          case 1:
            if (!this._checkForm("idRequestHeaderForm")) {
              return false;
            }

            try {
              bRequestHeader = await this._decideRequestHeader();
              if (!bRequestHeader) {
                return false;
              }

              bProcess = await this._getProcessDetails();
              if (!bProcess) {
                return false;
              }

              bBudget = await this._showBudgetWarning();
              if (!bBudget) {
                return false;
              }

              this._constructUI();
            } catch (e) {
              console.error(e);
              return false;
            }

            break;
          case 2:
            if (!this._checkForm("idRequestDetailsBox")) {
              return false;
            }

            try {
              this._setRequestDetailsFromProcessData();

              bCheckRequest = await this._checkRequestDetails();

              if (!bCheckRequest) {
                return false;
              }
            } catch (e) {
              console.error(e);
              return false;
            }
            break;
          case 3:
            try {
              bCheckRequest = await this._previewForm();

              if (!bCheckRequest) {
                return false;
              }
            } catch (e) {
              console.error(e);
              return false;
            }
            break;
        }

        if (typeof fnCallback === "function") {
          fnCallback();
        }
      },
      _handleNextStepEdit: async function (
        fnCallback,
        oCurrentStep,
        oTargetStep
      ) {
        let bRequestHeader;
        let bBudget;
        let bCheckRequest;

        switch (oCurrentStep.getNumber()) {
          case 1:
            if (!this._checkForm("idRequestHeaderForm")) {
              return false;
            }

            bBudget = await this._showBudgetWarning();
            if (!bBudget) {
              return false;
            }

            try {
              this._constructUI();
            } catch (e) {
              console.error(e);
              return false;
            }

            break;
          case 2:
            if (!this._checkForm("idRequestDetailsBox")) {
              return false;
            }

            try {
              this._setRequestDetailsFromProcessData();

              bCheckRequest = await this._checkRequestDetails();

              if (!bCheckRequest) {
                return false;
              }
            } catch (e) {
              console.error(e);
              return false;
            }
            break;
          case 3:
            try {
              bCheckRequest = await this._previewForm();

              if (!bCheckRequest) {
                return false;
              }
            } catch (e) {
              console.error(e);
              return false;
            }
        }

        if (typeof fnCallback === "function") {
          fnCallback();
        }
      },
      _constructUI: function () {
        const oBox = this.byId("idRequestDetailsBox");
        const oViewModel = this.getModel("detailView");
        const aCompPool = oViewModel.getProperty("/ComponentPool");
        const aCompSet = oViewModel.getProperty("/FormComponentSet");
        const oProcessDetail = oViewModel.getProperty("/ProcessDetail");
        const aProcessFieldSet = oViewModel.getProperty("/ProcessFieldSet");
        const aProcessFieldValueSet = oViewModel.getProperty(
          "/ProcessFieldValueSet"
        );
        const aProcessFieldBindingSet = oViewModel.getProperty(
          "/ProcessFieldBindingSet"
        );

        const aProcessFieldEventSet = oViewModel.getProperty(
          "/ProcessFieldEventSet"
        );

        //--Avoid duplicate entries clear the page
        this._invalidateDetailPage();

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

        const setDefaultValue = (sValuePath) => {
          switch (sType) {
            case "boolean":
              return "sap.ui.model.type.Boolean";
            default:
              return "sap.ui.model.type.String";
          }
        };

        const createUIRecursively = (oParentInstance, oElem, sAddMethod) => {
          const oComp = _.find(aCompPool, ["Type", oElem.Type]);
          if (oComp) {
            const oElementInstance = new oComp["Class"](oElem.ElementId);
            const oProcessField = _.find(aProcessFieldSet, [
              "ElementUid",
              oElem.ElementUid,
            ]);

            // if (oElem.ElementId === "idMdChipComponent1304933955") {
            //   if (typeof oElementInstance.attachChanged === "function") {
            //     const oChangeFunc = new Function(
            //       "e",
            //       ` let bSelected = e.getSource().getSelected() || false;
            //         const oTabs = this.byId("idMdTabContainerComponent2502418796") || sap.ui.getCore().byId("idMdTabContainerComponent2502418796");
            //         if(bSelected){
            //           if(oTabs){
            //             oTabs.setActiveTabIndex(1);
            //               oTabs.getAggregation("tabs")[0].setActive(false);
            //               oTabs.getAggregation("tabPanels")[0].setHidden(true);
            //               oTabs.getAggregation("tabs")[1].setActive(true);
            //               oTabs.getAggregation("tabPanels")[1].setHidden(false);
            //               this.toastMessage("S", "MESSAGE_SUCCESS", "TITLE_ACTIVE");

            //               var body = $("html, body");
            //               body.stop().animate({scrollTop:oTabs.$().offset().top}, '500');
            //           }
            //         }else{
            //             if(oTabs){
            //               oTabs.setActiveTabIndex(0);
            //               oTabs.getAggregation("tabs")[0].setActive(true);
            //               oTabs.getAggregation("tabPanels")[0].setHidden(false);
            //               oTabs.getAggregation("tabs")[1].setActive(false);
            //               oTabs.getAggregation("tabPanels")[1].setHidden(true);
            //             }
            //         }
            //     `
            //     ).bind(this);

            //     oElementInstance.attachChanged((e) => {
            //       oChangeFunc(e);
            //     });
            //   }
            // }

            if (oProcessField && oComp?.BindingProperties) {
              if (oComp.BindingProperties?.ValueField) {
                let sValuePath =
                  oComp.BindingProperties.ValueField.Type === "object"
                    ? `detailView>/ProcessDetail/${oProcessField.ProcessFieldId}/Values` //Array like structures
                    : `detailView>/ProcessDetail/${oProcessField.ProcessFieldId}/Value`; //String and other flat structures

                oElementInstance?.bindProperty(
                  oComp.BindingProperties.ValueField.Name,
                  {
                    path: sValuePath,
                  }
                );
              }

              if (oComp.BindingProperties?.ValueListField) {
                let sValuePath = `/ProcessDetail/${oProcessField.ProcessFieldId}/ValueList`;

                oElementInstance?.bindProperty(
                  oComp.BindingProperties.ValueListField.Name,
                  {
                    path: sValuePath,
                    model: "detailView",
                  }
                );
              }

              if (oComp.BindingProperties?.ValueListAggregation) {
                try {
                  if (!oComp.BindingProperties?.ValueListAggregation?.Name) {
                    throw new Error(
                      `Value list aggregation name is obligatory for list binding!`
                    );
                  }

                  const oAggr =
                    _.find(oComp?.Aggregations, [
                      "Name",
                      oComp.BindingProperties?.ValueListAggregation?.Name,
                    ]) || null;
                  if (!oAggr) {
                    throw new Error(
                      `${oComp.BindingProperties?.ValueListAggregation.Name} not found in the aggregation list of ${oComp.Type}!`
                    );
                  }
                  const oAggrComp =
                    _.find(aCompPool, ["Type", oAggr.Type]) || null;

                  if (!oAggrComp) {
                    throw new Error(
                      `${oAggr.Type} not found in the component pool!`
                    );
                  }
                  const oAggrInstance = new oAggrComp["Class"]();
                  if (!oAggrInstance) {
                    throw new Error(
                      `${oAggrComp.Type} could not be instantiated!`
                    );
                  }

                  if (
                    oComp.BindingProperties.ValueListAggregation?.KeyField ||
                    oComp.BindingProperties.ValueListAggregation?.ValueField
                  ) {
                    oComp.BindingProperties.ValueListAggregation?.KeyField
                      ? oAggrInstance?.bindProperty(
                          oComp.BindingProperties.ValueListAggregation.KeyField,
                          {
                            path: "key",
                            model: "detailView",
                          }
                        )
                      : null;

                    oComp.BindingProperties.ValueListAggregation?.ValueField
                      ? oAggrInstance?.bindProperty(
                          oComp.BindingProperties.ValueListAggregation
                            ?.ValueField,
                          {
                            path: "value",
                            model: "detailView",
                          }
                        )
                      : null;

                    oElementInstance.bindAggregation(
                      oComp.BindingProperties?.ValueListAggregation.Name,
                      {
                        path: `detailView>/ProcessDetail/${oProcessField.ProcessFieldId}/ValueList`,
                        template: oAggrInstance,
                        templateShareable: false,
                      }
                    );
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            }

            oElem.FormComponentPropertySet.forEach((oProp) => {
              if (oProp.IsStyleClass) {
                oElementInstance.addStyleClass(oProp.PropertyValue);
              } else {
                if (
                  oProp.PropertyName !==
                    oComp?.BindingProperties?.ValueField?.Name &&
                  oProp.PropertyName !==
                    oComp?.BindingProperties?.ValueListField?.Name
                ) {
                  oElementInstance.setProperty(
                    oProp.PropertyName,
                    convertType(oProp.PropertyType, oProp.PropertyValue),
                    false
                  );
                }
              }
            });

            //--Set binding
            if (oProcessField) {
              const aFieldBinding =
                _.filter(aProcessFieldBindingSet, {
                  ProcessId: oProcessField.ProcessId,
                  ProcessFieldId: oProcessField.ProcessFieldId,
                }) || [];
              aFieldBinding.forEach((oBinding) => {
                this._setPropertyBinding(oElementInstance, oBinding);
              });

              const aFieldEvent =
                _.filter(aProcessFieldEventSet, {
                  ProcessId: oProcessField.ProcessId,
                  ProcessFieldId: oProcessField.ProcessFieldId,
                }) || [];

              if (oElementInstance?.attachEvent) {
                aFieldEvent.forEach((oFieldEvent) => {
                  try {
                    const oEventFunc = new Function(
                      "oEvent",
                      oFieldEvent.ProcessFieldEventCode
                    ).bind(this);

                    oElementInstance.attachEvent(
                      oFieldEvent.ProcessFieldEventName,
                      (e) => {
                        oEventFunc(e);
                      }
                    );
                  } catch (oEx) {
                    console.error(oEx);
                  }
                });
              }
            }

            if (oParentInstance[sAddMethod] && oElementInstance) {
              oParentInstance[sAddMethod](oElementInstance);
            }

            const aChildren = _.filter(aCompSet, [
              "ParentUid",
              oElem.ElementUid,
            ]);

            aChildren.forEach((oChild) => {
              const oAggr = _.find(oComp?.Aggregations, {
                Type: oChild.Type,
                Name: oChild.AggregationName,
              });
              if (oAggr) {
                createUIRecursively(oElementInstance, oChild, oAggr.AddMethod);
              }
            });
          }
        };

        //--First find the root element
        const oRootElem = _.find(aCompSet, ["ParentUid", ""]);

        if (!oRootElem) {
          return;
        }

        const aFirstLevel = _.filter(aCompSet, [
          "ParentUid",
          oRootElem.ElementUid,
        ]);

        aFirstLevel.forEach((oElem) => {
          createUIRecursively(oBox, oElem, "addItem");
        });
      },
      _setPropertyBinding: function (oElementInstance, oBinding) {
        try {
          const oProp = oElementInstance?.getProperty(oBinding.PropertyName);

          if (oProp === null || oProp === undefined) {
            return;
          }

          if (oBinding?.PropertyBinding) {
            let oParser = sap.ui.base.BindingParser.complexParser(
              oBinding.PropertyBinding,
              null,
              true,
              true,
              true,
              true
            );
            if (!oParser) {
              return;
            }

            oElementInstance?.bindProperty(oBinding.PropertyName, {
              parts: oParser.parts,
              formatter: oParser?.formatter,
            });
          } else if (oBinding?.PropertyValue !== null) {
            oElementInstance?.setProperty(
              oBinding.PropertyName,
              oBinding.PropertyValue,
              false
            );
          }
        } catch (e) {
          //
          return;
        }
      },
      _checkForm: function (sFormId) {
        this.bHasFormErrors = false;
        const oForm = this.byId(sFormId);
        if (!oForm) {
          return true;
        }
        //--Recursive check for aggregation
        this._checkAggregation(oForm);

        if (this.bHasFormErrors) {
          this.toastMessage("E", "FORM_HAS_ERRORS", "FILL_REQUIRED_FIELDS", []);
        }

        return !this.bHasFormErrors;
      },
      _getFields: function (oAggr) {
        let aField = [];

        if (!oAggr) {
          return [];
        }

        const oValidAggr = _.pick(oAggr, ["content", "items", "tabPanels"]);

        for (const a in oValidAggr) {
          if (!oValidAggr[a]) {
            continue;
          }
          if (typeof oValidAggr[a] === "object") {
            if (Array.isArray(oValidAggr[a])) {
              oValidAggr[a].forEach((oItem) => {
                aField.push(oItem);
              });
            } else {
              aField.push(oValidAggr[a]);
            }
          }
        }

        return aField;
      },
      _invalidateHiddenFields: function (oElem) {
        const aField = this._getFields(oElem?.mAggregations);

        if (aField.length === 0) {
          return;
        }

        aField.forEach((oField) => {
          this._invalidateHiddenSingleField(oField);
          this._invalidateHiddenFields(oField);
        });
      },

      _invalidateHiddenSingleField: function (oField) {
        if (oField?.setError) {
          oField?.setError(false);
        }

        if (oField?.setErrorText) {
          oField?.setErrorText("");
        }

        if (oField?.getValue) {
          oField?.setValue(null);
        }
        if (oField?.getSelectedKey) {
          oField?.setSelectedKey(null);
        }
        if (oField?.getSelectedKeys) {
          oField?.setSelectedKeys([]);
        }

        if (oField?.getSelectedItems) {
          oField?.setSelectedItems([]);
        }

        if (oField?.getValueSet) {
          let aValueSet = oField.getValueSet();
          aValueSet.forEach((oValue) => {
            if (oValue.hasOwnProperty("checked")) {
              oValue.checked === true ? (oValue.checked = false) : null;
            }
          });
          oField.setValueSet(aValueSet);
        }

        if (oField?.getChecked) {
          oField?.setChecked(false);
        }

        if (oField?.getSelected) {
          oField?.setSelected(false);
        }
      },

      _checkAggregation: function (oElem) {
        const aField = this._getFields(oElem?.mAggregations);

        if (aField.length === 0) {
          return;
        }

        aField.forEach((oField) => {
          oField?.setError ? oField?.setError(false) : null;
          oField?.setErrorText ? oField?.setErrorText("") : null;
          const bVisible = oField?.getVisible && oField.getVisible();
          let bField = false;

          if (bVisible) {
            //--Check it self
            if (oField?.getError && oField?.getRequired) {
              bField = true;
              this._checkSingleField(oField);
            } else {
              this._checkAggregation(oField);
            }
          } else {
            if (oField?.getError && oField?.getRequired) {
              this._invalidateHiddenSingleField(oField);
            } else {
              this._invalidateHiddenFields(oField);
            }
          }
        });

        return;
      },
      _checkSingleField: function (oField) {
        if (
          oField?.getRequired &&
          oField?.getVisible &&
          oField?.getRequired() &&
          oField?.getVisible()
        ) {
          let sValue = null;
          if (oField?.getValue && oField?.getValue()) {
            sValue = oField?.getValue();
          }
          if (oField?.getSelectedKey && oField.getSelectedKey()) {
            sValue = oField?.getSelectedKey();
          }
          if (oField?.getSelectedKeys && oField.getSelectedKeys()) {
            sValue = oField?.getSelectedKeys()[0];
          }
          if (sValue === null || sValue === "" || sValue === undefined) {
            this.bHasFormErrors = true;
            oField.setError(true);
            oField.setErrorText(this.getText("FIELD_IS_OBLIGATORY", []));
          }
        }

        return;
      },
      _getRequestDefaults: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        let oReqOperation = {
          Operation: "NEW",
          RequestHeader: {},
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
            if (oData.RequestHeader.OrgUnitCode === "00000000") {
              oData.RequestHeader.OrgUnitCode = null;
            }
            oViewModel.setProperty("/RequestHeader", {
              ...oData.RequestHeader,
            });
            this.closeBusyFragment();
          },
          error: (oError) => {
            this.closeBusyFragment();
          },
        });
      },

      _decideRequestHeader: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");

        const p = new Promise((resolve, reject) => {
          let oReqOperation = {
            Operation: "DECIDE",
            RequestHeader: {
              ...oViewModel.getProperty("/RequestHeader"),
              RequestDetailSet: [],
            },
            ReturnSet: [],
          };
          this.openBusyFragment("PROCESS_BEING_DECIDED");
          oModel.create("/RequestOperationSet", oReqOperation, {
            success: (oData) => {
              const bError =
                oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;
              oViewModel.setProperty("/RequestHeader", {
                ...oData.RequestHeader,
              });

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
      _getRequest: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        const oRequest = oViewModel.getProperty("/RequestHeader");
        const that = this;
        const sPath = oModel.createKey("/RequestHeaderSet", {
          RequestId: oRequest.RequestId,
          Version: "001",
        });

        //--Avoid duplicate entries clear the page
        this._invalidateDetailPage();

        this.openBusyFragment("REQUEST_DETAILS_BEING_READ");
        oModel.read(sPath, {
          urlParameters: {
            $expand: `ProcessHeader,RequestDetailSet,ProcessHeader/FormHeader,ProcessHeader/FormHeader/FormComponentSet,ProcessHeader/FormHeader/FormComponentSet/FormComponentPropertySet,ProcessHeader/ProcessFieldSet,ProcessHeader/ProcessFieldSet/ProcessFieldValueSet,ProcessHeader/ProcessFieldSet/ProcessFieldBindingSet,ProcessHeader/ProcessFieldSet/ProcessFieldEventSet,RequestAttachmentSet`,
          },
          success: function (oData) {
            that._setProcessDataFromRequest(oData);

            //--Close busy dialog
            that.closeBusyFragment();
          },
          error: function (oError) {
            // resolve(false);
            //--Error occurred
            that.closeBusyFragment();
          },
        });
      },
      _setProcessDataFromRequest: function (oData) {
        const oViewModel = this.getModel("detailView");
        const oProcessHeader = _.cloneDeep(oData.ProcessHeader);
        const aRequestDetail = _.omit(
          _.cloneDeep(oData.RequestDetailSet.results),
          ["__metadata"]
        );

        const aRequestAttachment = _.omit(
          _.cloneDeep(oData.RequestAttachmentSet.results),
          ["__metadata"]
        );

        if (oData.OrgUnitCode === "00000000") {
          oData.OrgUnitCode = null;
        }

        //--Set Request Header
        oViewModel.setProperty(
          "/RequestHeader",
          _.omit(oData, [
            "__metadata",
            "ProcessHeader",
            "FormHeader",
            "RequestDetailSet",
            "RequestAttachmentSet",
          ])
        );

        oViewModel.setProperty(
          "/RequestHeader/RequestDetailSet",
          aRequestDetail
        );

        oViewModel.setProperty("/RequestAttachmentSet", aRequestAttachment);

        //--Set process data
        this._setProcessData(oProcessHeader, null);
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
        this._invalidateDetailPage();

        const p = new Promise((resolve, reject) => {
          this.openBusyFragment("PROCESS_DETAILS_BEING_READ");
          oModel.read(sPath, {
            urlParameters: {
              $expand: `FormHeader,FormHeader/FormComponentSet,FormHeader/FormComponentSet/FormComponentPropertySet,ProcessFieldSet,ProcessFieldSet/ProcessFieldValueSet,ProcessFieldSet/ProcessFieldBindingSet,ProcessFieldSet/ProcessFieldEventSet`,
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

      _setProcessData: function (oProcessHeader, fnCallback) {
        const oViewModel = this.getModel("detailView");
        const sMode = oViewModel.getProperty("Mode");
        const aRequestDetail = oViewModel.getProperty(
          "/RequestHeader/RequestDetailSet"
        );
        const aCompPool = oViewModel.getProperty("/ComponentPool");
        let aFormComponentSet = [];
        let aProcessFieldSet = [];
        let aProcessFieldValueSet = [];
        let aProcessFieldBindingSet = [];
        let aProcessFieldEventSet = [];
        let oProcessDetail = {};
        let bError = false;

        const castValueList = (oField, aValues = []) => {
          let aValueList = [];
          const oComp = aCompPool.find((o) => o.Type === oField.Type);
          if (oComp && oComp?.BindingProperties) {
            aValueList = oField.ProcessFieldValueSet.results.map(
              (oFieldValue) => {
                let oValue = {};
                switch (oField.Type) {
                  case "MdMultiSelect":
                    oValue[oComp.BindingProperties.ValueListField.KeyField] =
                      oFieldValue.Key;
                    oValue[oComp.BindingProperties.ValueListField.LabelField] =
                      oFieldValue.Value;
                    oValue[oComp.BindingProperties.ValueListField.ValueField] =
                      aValues.includes(oFieldValue.Key);
                    break;
                  default:
                    if (oComp.BindingProperties?.ValueListField) {
                      oValue[oComp.BindingProperties.ValueListField.KeyField] =
                        oFieldValue.Key;
                      oValue[
                        oComp.BindingProperties.ValueListField.LabelField
                      ] = oFieldValue.Value;
                      oValue[
                        oComp.BindingProperties.ValueListField.ValueField
                      ] = oFieldValue.Key;
                    } else if (oComp.BindingProperties?.ValueListAggregation) {
                      oValue[
                        oComp.BindingProperties.ValueListAggregation.KeyField
                      ] = oFieldValue.Key;
                      oValue[
                        oComp.BindingProperties.ValueListAggregation.ValueField
                      ] = oFieldValue.Value;
                    }

                    break;
                }
                return oValue;
              }
            );
          }

          return aValueList;
        };

        //--Set form header
        oViewModel.setProperty(
          "/FormHeader",
          _.omit(oProcessHeader.FormHeader, ["FormComponentSet", "__metadata"])
        );

        //--Form components and properties
        try {
          aFormComponentSet =
            oProcessHeader.FormHeader.FormComponentSet.results.map((oComp) => {
              let oCompModified = _.omit(oComp, [
                "FormComponentPropertySet",
                "__metadata",
              ]);
              oCompModified["FormComponentPropertySet"] =
                oComp.FormComponentPropertySet.results.map((oProp) =>
                  _.omit(oProp, ["_metadata"])
                );
              return oCompModified;
            });
        } catch (e) {
          aFormComponentSet = [];
          bError = true;
          this._detailFormGenerationFailed();
        }
        oViewModel.setProperty("/FormComponentSet", aFormComponentSet);

        //--Process fields and value sets
        try {
          oProcessHeader.ProcessFieldSet.results.forEach((oField) => {
            //--Fill process fields
            let oFieldModified = _.omit(oField, [
              "ProcessFieldValueSet",
              "ProcessFieldBindingSet",
              "__metadata",
            ]);
            aProcessFieldSet.push(oFieldModified);

            //--Define new process detail field for binding

            oProcessDetail[oField.ProcessFieldId] = {
              Value: null, //For single selection
              Values: [], //For multi selection
              ValueList: castValueList(oField, []),
              ...oFieldModified,
            };

            if (sMode === "CREATE") {
              oProcessDetail[oField.ProcessFieldId] = {
                Value: null, //For single selection
                Values: [], //For multi selection
                ValueList: castValueList(oField),
                ...oFieldModified,
              };
            } else {
              oProcessDetail[oField.ProcessFieldId] = {
                Value: null, //For single selection
                Values: [], //For multi selection
                ValueList: [],
                ...oFieldModified,
              };
              const oRequestField = _.find(aRequestDetail, [
                "ProcessFieldId",
                oField.ProcessFieldId,
              ]);

              //--Generate value and values
              if (
                oRequestField &&
                oRequestField.hasOwnProperty("ProcessFieldValue") &&
                oRequestField?.ProcessFieldValue !== null
                // oField?.ProcessFieldValue !== null
              ) {
                const sFieldLength = oRequestField.ProcessFieldValue.length;
                if (
                  oRequestField.ProcessFieldValue === "true" ||
                  oField.Type === "MdCheckBox" ||
                  oField.Type === "MdSwitch" ||
                  oField.Type === "CheckBox" ||
                  oField.Type === "MdRadio"
                ) {
                  oProcessDetail[oField.ProcessFieldId].Value =
                    oRequestField.ProcessFieldValue === "true";
                } else if (
                  oRequestField.ProcessFieldValue.charAt(0) === "[" &&
                  oRequestField.ProcessFieldValue.charAt(sFieldLength - 1) ===
                    "]"
                ) {
                  try {
                    oProcessDetail[oField.ProcessFieldId].Values =
                      JSON.parse(oRequestField.ProcessFieldValue) || [];
                  } catch (x) {
                    oProcessDetail[oField.ProcessFieldId].Values = [];
                  }
                } else {
                  oProcessDetail[oField.ProcessFieldId].Value =
                    oRequestField.ProcessFieldValue;
                  if (oProcessDetail[oField.ProcessFieldId].Value === "") {
                    oProcessDetail[oField.ProcessFieldId].Value = null;
                  }
                }
              }

              oProcessDetail[oField.ProcessFieldId]["ValueList"] =
                castValueList(
                  oField,
                  oProcessDetail[oField.ProcessFieldId].Values
                );
            }

            //--Property bindings
            oField.ProcessFieldBindingSet.results.forEach((oBinding) => {
              let oBindingModified = _.omit(oBinding, ["__metadata"]);
              aProcessFieldBindingSet.push(oBindingModified);
            });
            //--Property events
            oField.ProcessFieldEventSet.results.forEach((oEvent) => {
              let oEventModified = _.omit(oEvent, ["__metadata"]);
              aProcessFieldEventSet.push(oEventModified);
            });
            //--Fill field value set
            oField.ProcessFieldValueSet.results.forEach((oValue) => {
              let oValueModified = _.omit(oValue, ["__metadata"]);
              aProcessFieldValueSet.push(oValueModified);
            });
          });
        } catch (e) {
          aProcessFieldSet = [];
          aProcessFieldValueSet = [];
          oProcessDetail = {};
          aProcessFieldBindingSet = [];
          aProcessFieldEventSet = [];
          bError = true;
          this._detailFormGenerationFailed();
        }

        //--Set generated fields
        oViewModel.setProperty("/ProcessFieldSet", aProcessFieldSet);
        oViewModel.setProperty("/ProcessFieldValueSet", aProcessFieldValueSet);
        oViewModel.setProperty(
          "/ProcessFieldBindingSet",
          aProcessFieldBindingSet
        );
        oViewModel.setProperty("/ProcessFieldEventSet", aProcessFieldEventSet);
        oViewModel.setProperty("/ProcessDetail", oProcessDetail);
        oViewModel.setProperty("/ProcessHeader", _.omit(oProcessHeader, ["__metadata"]));

        if (fnCallback && typeof fnCallback === "function") fnCallback(!bError);
      },
      _setRequestDetailsFromProcessData: function () {
        const oViewModel = this.getModel("detailView");
        const aProcessFieldSet = oViewModel.getProperty("/ProcessFieldSet");
        const oProcessDetail = oViewModel.getProperty("/ProcessDetail");
        const oRequestHeader = oViewModel.getProperty("/RequestHeader");

        let aRequestDetail = [];

        oViewModel.setProperty("/RequestHeader/RequestDetailSet", []);

        const constructValueFromArray = (aVal) => {
          let sVal;
          aVal.forEach((oVal) => {
            sVal = sVal ? sVal + ',"' + oVal + '"' : '["' + oVal + '"';
          });
          return sVal + "]";
        };

        const castValue = (v) => {
          return v.toString();
        };

        aProcessFieldSet.forEach((oField) => {
          let oRequestField = oProcessDetail[oField.ProcessFieldId];
          if (oRequestField.ProcessFieldType === "DF") {
            aRequestDetail.push({
              RequestId: oRequestHeader.RequestId,
              Version: oRequestHeader.Version,
              ProcessFieldId: oField.ProcessFieldId,
              ProcessFieldValue:
                oRequestField.Value !== null
                  ? castValue(oRequestField.Value)
                  : oRequestField.Values?.length &&
                    oRequestField.Values?.length > 0
                  ? constructValueFromArray(oRequestField.Values)
                  : null,
            });
          }
        });

        oViewModel.setProperty(
          "/RequestHeader/RequestDetailSet",
          aRequestDetail
        );
      },
      _checkRequestDetails: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        const oRequestHeader = oViewModel.getProperty("/RequestHeader");

        const p = new Promise((resolve, reject) => {
          let oReqOperation = {
            Operation: "CHECK",
            RequestHeader: _.cloneDeep(oRequestHeader),
            ReturnSet: [],
          };
          this.openBusyFragment("REQUEST_DETAILS_BEING_CHECKED");
          oModel.create("/RequestOperationSet", oReqOperation, {
            success: (oData) => {
              const bError =
                oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;

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

      _setPdfSource: function (sBase64File, resolve) {
        const oPdfViewer = this.byId("idRequestPreview");
        let aFileData = Uint8Array.from(atob(sBase64File), (c) =>
          c.charCodeAt(0)
        );
        const oBlob = new Blob([aFileData], { type: "application/pdf" });

        const sPdfUrl = URL.createObjectURL(oBlob);
        jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist

        if (sBase64File && oPdfViewer && sPdfUrl) {
          oPdfViewer.setSource(sPdfUrl);
          resolve(true);
        } else {
          resolve(false);
        }
      },

      _previewForm: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        const oRequestHeader = oViewModel.getProperty("/RequestHeader");

        const p = new Promise((resolve, reject) => {
          let oReqOperation = {
            Operation: "PREVIEW",
            RequestHeader: _.cloneDeep(oRequestHeader),
            ReturnSet: [],
          };
          this.openBusyFragment("REQUEST_PREVIEW_BEING_FETCHED");
          oModel.create("/RequestOperationSet", oReqOperation, {
            success: (oData) => {
              const bError =
                oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;

              if (bError) {
                //--Give error
                this._showErrors(oData.ReturnSet.results);
                resolve(false);
              }

              this._setPdfSource(oData.RequestHeader.PrintOut, resolve);

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
      _refreshAttachmentList: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        const oRequest = oViewModel.getProperty("/RequestHeader");
        const that = this;
        const sPath =
          oModel.createKey("/RequestHeaderSet", {
            RequestId: oRequest.RequestId,
            Version: oRequest.Version,
          }) + "/RequestAttachmentSet";

        this.openBusyFragment();

        oViewModel.setProperty("/RequestAttachmentSet", []);

        oModel.read(sPath, {
          // urlParameters: {
          //   $expand: `RequestAttachmentSet`,
          // },
          success: function (oData) {
            oViewModel.setProperty(
              "/RequestAttachmentSet",
              _.omit(oData.results, ["__metadata"])
            );
            //--Close busy dialog
            that.closeBusyFragment();
          },
          error: function (oError) {
            //--Error occurred
            that.closeBusyFragment();
          },
        });
      },
      _triggerUploadAttachments: function () {
        const oUploadSet = this.byId("idRequestAttachmentUpload");
        const oViewModel = this.getModel("detailView");
        const oRequestHeader = oViewModel.getProperty("/RequestHeader");

        if (!oUploadSet) {
          return;
        }

        const aItems = oUploadSet.getIncompleteItems();

        if (aItems.length === 0) {
          return;
        }
        const oModel = this.getModel();

        const sPath = oModel.createKey("RequestHeaderSet", {
          RequestId: oRequestHeader.RequestId,
          Version: oRequestHeader.Version,
        });

        //--Set upload URL
        oUploadSet.setUploadUrl(
          `${oModel.sServiceUrl}/${sPath}/RequestAttachmentSet`
        );

        oUploadSet.upload();
      },
      _saveRequestDetails: function () {
        const oModel = this.getModel();
        const oViewModel = this.getModel("detailView");
        const oRequestHeader = oViewModel.getProperty("/RequestHeader");

        const p = new Promise((resolve, reject) => {
          let oReqOperation = {
            Operation: "SAVE",
            RequestHeader: _.cloneDeep(oRequestHeader),
            ReturnSet: [],
          };
          this.openBusyFragment("REQUEST_BEING_SAVED");
          oModel.create("/RequestOperationSet", oReqOperation, {
            success: (oData) => {
              const bError =
                oData.ReturnSet?.results && oData.ReturnSet.results.length > 0;

              if (bError) {
                //--Give error
                this._showErrors(oData.ReturnSet.results);
                resolve(false);
              }

              //--Save to get upload url
              if (oData.RequestHeader.OrgUnitCode === "00000000") {
                oData.RequestHeader.OrgUnitCode = null;
              }
              oViewModel.setProperty("/RequestHeader", {
                ...oData.RequestHeader,
              });

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
      _detailFormGenerationFailed: function () {
        //TODO: Give failed message and return
      },
      _showErrors: function (aReturn) {
        const aError = _.filter(aReturn, ["Type", "E"]);

        this.closeBusyFragment();

        aError.forEach((oError) => {
          this.alertMessage("E", "ERROR_TEXT", "GENERIC_ERROR", oError.Message);
        });
      },
    });
  }
);
