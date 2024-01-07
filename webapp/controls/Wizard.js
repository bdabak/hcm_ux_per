sap.ui.define(
  [
    "sap/ui/core/Control",
    "./WizardFooter",
    "sap/m/Button",
    "sap/ui/core/CustomData",
  ],
  function (Control, WizardFooter, Button, CustomData) {
    "use strict";

    return Control.extend("com.thy.ux.per.controls.Wizard", {
      metadata: {
        properties: {
          activeStep: {
            type: "int",
            bindable: true,
            defaultValue: 1,
          },
        },
        aggregations: {
          steps: {
            type: "com.thy.ux.per.controls.WizardStep",
            multiple: true,
            singularName: "step",
          },
          stepContents: {
            type: "com.thy.ux.per.controls.WizardStepContent",
            multiple: true,
            singularName: "stepContent",
          },
          _footer: {
            type: "com.thy.ux.per.controls.WizardFooter",
            multiple: false,
          },
        },
        events: {
          submit: {
            parameters: {},
          },
          nextStep: {
            parameters: {
              callbackFn: { type: "function" },
              currentStep: { type: "com.thy.ux.per.controls.WizardStep" },
              targetStep: { type: "com.thy.ux.per.controls.WizardStep" },
            },
          },
          prevStep: {
            parameters: {
              callbackFn: { type: "function" },
              currentStep: { type: "com.thy.ux.per.controls.WizardStep" },
              targetStep: { type: "com.thy.ux.per.controls.WizardStep" },
            },
          },
        },
      },
      init: function () {
        const libraryPath = jQuery.sap.getModulePath("com.thy.ux.per"); //get the server location of the ui library
        jQuery.sap.includeStyleSheet(libraryPath + "/controls/Wizard.css");

        //--Create and set footer
        const oFooter = new WizardFooter({
          leftContent: [
            new Button({
              text: "{i18n>WIZARD_PREV_STEP}",
              type: "Emphasized",
              press: this._handlePrev.bind(this),
            }).addCustomData(
              new CustomData({
                key: "wizard-type",
                value: "action-prev",
                writeToDom: true,
              })
            ),
          ],
          rightContent: [
            new Button({
              text: "{i18n>WIZARD_SUBMIT}",
              type: "Accept",
              press: this._handleSubmit.bind(this),
            })
              .addStyleClass("sapUiTinyMarginEnd")
              .addCustomData(
                new CustomData({
                  key: "wizard-type",
                  value: "action-submit",
                  writeToDom: true,
                })
              ),
            new Button({
              text: "{i18n>WIZARD_NEXT_STEP}",
              type: "Emphasized",
              press: this._handleNext.bind(this),
            }).addCustomData(
              new CustomData({
                key: "wizard-type",
                value: "action-next",
                writeToDom: true,
              })
            ),
          ],
        });

        this.setAggregation("_footer", oFooter);
      },

      renderer: function (oRM, oControl) {
        const iActiveStep = parseInt(oControl.getActiveStep(), 10);
        const aSteps = oControl.getSteps() || [];
        const aStepContents = oControl.getStepContents() || [];
        const iTotalSteps = aSteps.length;

        //-Main
        oRM
          .openStart("div", oControl)
          .class("smod-wizard")
          .class("smod-wizard-d-flex")
          .class("smod-wizard-flex-column-fluid")
          .openEnd()
          //--Container
          .openStart("div")
          .class("smod-wizard-container")
          .openEnd()

          //---Card
          .openStart("div")
          .class("smod-wizard-card")
          .openEnd()

          //----Card body
          .openStart("div")
          .class("smod-wizard-card-body")
          .openEnd()

          //-----Wizard Content
          .openStart("div")
          .class("smod-wizard-content")
          .attr(
            "data-wizard-state",
            iActiveStep === 1
              ? "first"
              : iActiveStep === iTotalSteps
              ? "last"
              : "between"
          )
          .openEnd()

          //------Wizard Nav
          .openStart("div")
          .class("smod-wizard-nav")
          .openEnd()

          //------Wizard Steps
          .openStart("div")
          .class("smod-wizard-steps")
          .attr("data-total-steps", aSteps.length)
          .openEnd();

        //--Render steps
        aSteps.forEach((oStep, i) => {
          // oStep.setNumber(i);
          oStep.setActive(iActiveStep === parseInt(oStep.getNumber(), 10));
          oRM.renderControl(oStep);
        });
        //--Render steps
        oRM
          .close("div")
          //------Wizard Steps
          .close("div")
          //------Wizard Nav

          //------Wizard Body
          .openStart("div")
          .class("smod-wizard-body")
          .openEnd()
          //------Wizard Body Container
          .openStart("div")
          .class("smod-wizard-body-container")
          .openEnd()
          //------Wizard Body Row
          .openStart("div")
          .class("smod-wizard-body-row")
          .openEnd()

          //-------Form
          .openStart("form")
          .class("smod-wizard-body-form")
          .attr("onsubmit","event.preventDefault()")
          .openEnd();
        //--Render step contents
        aStepContents.forEach((oStepContent, i) => {
          // oStepContent.setNumber(i);
          oStepContent.setActive(
            iActiveStep === parseInt(oStepContent.getNumber(), 10)
          );
          oRM.renderControl(oStepContent);
        });
        //--Render step contents

        //--Footer
        oRM.renderControl(oControl.getAggregation("_footer"));
        //--Footer

        oRM
          .close("form")
          //-------Form

          .close("div")
          //------Wizard Body Row
          .close("div")
          //------Wizard Body Container
          .close("div")
          //------Wizard Body

          .close("div")
          //-----Wizard Content

          .close("div")
          //----Card body

          .close("div")
          //---Card

          .close("div")
          //--Container

          .close("div");
        //-Main
      },
      initiateWizardState:function(){
        this.setActiveStep(1);
      },
      _geti18nText: function (sTextKey) {
        return this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sTextKey);
      },
      _goToPrevStep: function () {
        this.setActiveStep(this.getActiveStep() - 1);
      },
      _goToNextStep: function () {
        this.setActiveStep(this.getActiveStep() + 1);
      },
      _getCurrentStep: function(){
        const iActiveStep = parseInt(this.getActiveStep(), 10);
        const aSteps = this.getSteps() || [];

        //--Get current step
        return aSteps.find((oStep, i) => {
           return iActiveStep === parseInt(oStep.getNumber(), 10); 
        });
      },
      _getNextStep: function(){
        const iActiveStep = parseInt(this.getActiveStep(), 10) + 1;
        const aSteps = this.getSteps() || [];

        //--Get current step
        return aSteps.find((oStep, i) => {
           return iActiveStep === parseInt(oStep.getNumber(), 10); 
        });
      },

      _getPrevStep: function(){
        const iActiveStep = parseInt(this.getActiveStep(), 10) - 1;
        const aSteps = this.getSteps() || [];

        //--Get current step
        return aSteps.find((oStep, i) => {
           return iActiveStep === parseInt(oStep.getNumber(), 10); 
        });
      },
      _handlePrev: function (oEvent) {
        if(!this.mEventRegistry?.prevStep){
            this._goToPrevStep();
            return;
        }
        this.firePrevStep({
            callbackFn: this._goToPrevStep.bind(this),
            currentStep: this._getCurrentStep(),
            targetStep: this._getPrevStep()
        })
      },
      _handleNext: function (oEvent) {
        if(!this.mEventRegistry?.nextStep){
            this._goToNextStep();
            return;
        }
        this.fireNextStep({
            callbackFn: this._goToNextStep.bind(this),
            currentStep: this._getCurrentStep(),
            targetStep: this._getNextStep()
        })
      },
      _handleSubmit: function (oEvent) {
      },
    });
  }
);
