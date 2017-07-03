/* global sap */

sap.ui.define([
    "com/sap/mentors/lemonaid/controller/BaseController",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, Filter, MessageToast) {
    "use strict";

    return BaseController.extend("com.sap.mentors.lemonaid.controller.MentorAddition", {

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
         * @public
         */
        onInit: function() {
        	var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("MyChannelAddition", "doStuff", this.handleDoStuff, this);

			this.view      = this.getView();
			this.component = this.getComponent();
			this.model     = this.component.getModel();
			this.router    = this.getRouter();
			this.i18n      = this.component.getModel("i18n").getResourceBundle();
			this.config    = this.component.getModel("config");
			this.ui        = new JSONModel({
        		//ServiceUrl : this.model.sServiceUrl,
				isEditMode : true,
				FullName : "Lars"
        	});
        	this.view.setModel(this.ui, "ui");
        	//console.log(this.getModel("ui"));
            this.router.getRoute("MentorAddition").attachMatched(this.onRouteMatched, this);

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
           // this.sMentorId = oEvent.getParameter("arguments").Id;
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
			   var oEventBus = sap.ui.getCore().getEventBus();
			   oEventBus.publish("MyChannel", "doStuff");
		//	console.log(this.model);
		//	console.log(this.ui);
		//	console.log(this.view);
		/*	this.model.submitChanges({
				success: function(oData) {
					MessageToast.show(this.i18n.getText("profileSavedSuccesfully"));
					this.ui.setProperty("/isEditMode", false);
				}.bind(this),
				error: function(oError) {
					MessageToast.show(this.i18n.getText("profileSavedError"));
				}.bind(this)
			});*/
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
					   var oEventBus = sap.ui.getCore().getEventBus();
			   oEventBus.publish("MyChannel", "doStuff2");
		/*	this.sMentorId = "fba652ed-32d6-46ff-a53d-1103dde715f8";
			console.log(this.getModel().createKey("/Mentors", { Id: this.sMentorId }));
            this.view.bindElement({
                path: this.getModel().createKey("/Mentors", { Id: this.sMentorId }),
                parameters: {
                    expand: this.component.metadata._getEntityTypeByName("Mentor").navigationProperty.map(function(navigationProperty) {
                        return navigationProperty.name;
                    }).join() 	// Expand all navigation properties
                }
            });
            this.ui.setProperty("/UploadUrl", this.model.sServiceUrl + "/" + this.model.createKey("Mentors", {Id: this.sMentorId}) + "/Attachments");
            var oView = this.getView();*/

        },

        onUpload: function(event) {
            var that = this,
			    imp = this.ui.getProperty("/import"),
                errorCount = 0,
                updateCount = 0,
                newCount = 0,
                requests = [];
            imp.errors = [];
            that.view.byId("btnUpload").setEnabled(false);
            this.model.detachRequestFailed(
                this.component._oErrorHandler._requestFailedHandler,
                this.component._oErrorHandler);
            jQuery.each(imp.data, function(rowIdx, row) {
            	if (!row.__skip) {
					var object = {};
					jQuery.each(row, function(fieldName, field) {
						fieldName = fieldName.replace(/\s+/g, "");
						if (that._isValidField(fieldName)) {
							object[fieldName] = field;
						}
					});
					delete object.longitude;
					delete object.latitude;
					if (object.ShirtNumber) { object.ShirtNumber = that._parseInteger(object.ShirtNumber); } else { delete object.ShirtNumber; }
					if (object.HoursAvailable) { object.HoursAvailable = that._parseInteger(object.HoursAvailable); } else { delete object.HoursAvailable; }
					if (object.InterestInMentorCommunicationStrategy) { object.InterestInMentorCommunicationStrategy = that._parseBoolean(object.InterestInMentorCommunicationStrategy); } else { delete object.InterestInMentorCommunicationStrategy; }
					if (object.InterestInMentorManagementModel) { object.InterestInMentorManagementModel = that._parseBoolean(object.InterestInMentorManagementModel); } else { delete object.InterestInMentorManagementModel; }
					if (object.InterestInMentorMix) { object.InterestInMentorMix = that._parseBoolean(object.InterestInMentorMix); } else { delete object.InterestInMentorMix; }
					if (object.InterestInOtherIdeas) { object.InterestInOtherIdeas = that._parseBoolean(object.InterestInOtherIdeas); } else { delete object.InterestInOtherIdeas; }
					if (object.TopicLeadInterest) { object.TopicLeadInterest = that._parseBoolean(object.TopicLeadInterest); } else { delete object.TopicLeadInterest; }
					if (object.HoursAvailable) { object.HoursAvailable = that._parseInteger(object.HoursAvailable); } else { delete object.HoursAvailable; }
                    requests.push(new Promise(function(resolve) {
    					if (row.__new) {
    	            		if (!object.Id) {
    	            			object.Id = that.guidGenerator.generateGuid();
    	            		}
    					    for (var i in object) {
    					        if (object[i].length === 0) {
    					            delete object[i];
    					        }
    					    }
                            that.model.create(
                                "/Mentors",
                                object,
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
                        } else {
                            that.model.update(
                                that.model.createKey("/Mentors", { Id: object.Id }),
                                object,
                                {
                                    success: function(data) {
                                        updateCount++;
                                        resolve();
                                    },
                                    error: function(error) {
                                        imp.errors.push({
        									title: that.i18n.getText("importUpdateErrorTitle"),
        									message: that.i18n.getText("importUpdateError", [
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
                        }
                    }));
                    Promise.all(requests).then(function() {
                        if (errorCount === 0) {
                            imp.errors.push({
                                title: that.i18n.getText("importSuccessTitle"),
                                picture: jQuery.sap.getModulePath("com.sap.mentors.lemonaid.images") + "/heart.png",
                                message: that.i18n.getText("importSuccess", [
                                    imp.data.length,
                                    newCount,
                                    updateCount
                                ])
                            });
                        }
                        that.model.attachRequestFailed(
                            that.component._oErrorHandler._requestFailedHandler,
                            that.component._oErrorHandler);
                        that.ui.setProperty("/import", imp);
                    });
            	}
            });
		},

		handleDoStuff : function (channel, event, data) {
		var oView = this.getView();
		var object = data.data;
		//Handle Stuff based on View calling it
		if(object.viewName.includes("data")){
			console.log(1)
		}else if(object.viewName.includes("address")){
			console.log(2)
		}else if(object.viewName.includes("bio")){
			console.log(3)
		}else if(object.viewName.includes("media")){
			console.log(4)
		} if(object.viewName.includes("shirt")){
			console.log(5)
		}else if(object.viewName.includes("expertise")){
			console.log(6)
		}else if(object.viewName.includes("topics")){
			console.log(7)
		}else if(object.viewName.includes("softskills")){
			console.log(8)
		}else if(object.viewName.includes("band")){
			console.log(9)
		}
		console.log(data);

		}

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


    });
});
