/* global sap */

sap.ui.define([
    "com/sap/mentors/lemonaid/controller/BaseController",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	'sap/m/Button',
	'sap/m/Dialog',
	"sap/m/MessageToast"
], function(BaseController, JSONModel, Filter, MessageToast, Dialog, Button) {
    "use strict";

    return BaseController.extend("com.sap.mentors.lemonaid.controller.MentorDetails", {

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
         * @public
         */
        onInit: function() {

			this.view      = this.getView();
			this.component = this.getComponent();
			this.model     = this.component.getModel();
			this.router    = this.getRouter();
			this.i18n      = this.component.getModel("i18n").getResourceBundle();
			this.config    = this.component.getModel("config");
			this.ui        = new JSONModel({
        		ServiceUrl : this.model.sServiceUrl,
				isEditMode : true//false
        	});
        	this.view.setModel(this.ui, "ui");
            this.router.getRoute("Mentor").attachMatched(this.onRouteMatched, this);

            // Remove sections/blocks that are not meant for a general audience
            this.config._loaded.then(function() {
                if (!this.config.getProperty("/IsProjectMember") && !this.config.getProperty("/IsMentor")) {
                	this.byId("ObjectPageLayout").removeSection(this.view.getId() + "--Media");
                	this.byId("PersonalInfo").removeBlock(this.view.getId() + "--BlockAddress");
                }
            }.bind(this));

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        onRouteMatched: function(oEvent) {
            this.sMentorId = oEvent.getParameter("arguments").Id;
            this.model.metadataLoaded().then(this.bindView.bind(this));
        },

		/**
		 *
		 * @param {sap.ui.base.Event} oEvent - 'press' event of Edit button
		 */
		onEdit: function(oEvent) {
			this.ui.setProperty("/isEditMode", true);
		},

		/**
		 *
		 * @param {sap.ui.base.Event} oEvent - 'press' event of Save button
		 */
		onSave: function(oEvent) {
			this.model.submitChanges({
				success: function(oData) {
					MessageToast.show(this.i18n.getText("profileSavedSuccesfully"));
					this.ui.setProperty("/isEditMode", false);
				}.bind(this),
				error: function(oError) {
					MessageToast.show(this.i18n.getText("profileSavedError"));
				}.bind(this)
			});
		},

		/**
		 *
		 * @param {sap.ui.base.Event} oEvent - 'press' event of Cancel button
		 */
		onCancel: function(oEvent) {
			this.model.resetChanges();
			this.ui.setProperty("/isEditMode", false);
		},

		bindView: function() {
            this.view.bindElement({
                path: this.getModel().createKey("/Mentors", { Id: this.sMentorId }),
                parameters: {
                    expand: this.component.metadata._getEntityTypeByName("Mentor").navigationProperty.map(function(navigationProperty) {
                        return navigationProperty.name;
                    }).join() 	// Expand all navigation properties
                }
            });
            this.ui.setProperty("/UploadUrl", this.model.sServiceUrl + "/" + this.model.createKey("Mentors", {Id: this.sMentorId}) + "/Attachments");
        },

        onDelete: function(){
        	var that = this;
			var dialog = new Dialog({
				title: 'Delete Profil',
				type: 'Message',
				content: new sap.m.Text({ text: 'Are you sure you want to delete this profil?' }),
				beginButton: new sap.m.Button({
					text: 'Delete',
					type: 'Reject',
					press: function(){
						console.log(that.model.oData["Mentors('"+that.sMentorId+"')"])
						     that.model.remove(
                                "/Mentors('"+that.sMentorId+"')",
                                //that.model.oData["Mentors('"+that.sMentorId+"')"],
                                {
                                    success: function(data) {
                                        newCount++;
                                        resolve();
                                    },
                                    error: function(error) {
                                        imp.errors.push({
        									title: that.i18n.getText("importCreateErrorTitle"),
        									message: that.i18n.getText("importCreateError", [
        										object.Id,
        										object.fullName,
                                                error.responseText
        									])
        								});
                                        errorCount++;
                                        resolve();
                                    }
                                }
                            );
        				sap.m.MessageToast.show('Profile deleted!');
        				dialog.close();
    				 }

				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
        }

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


    });
});
