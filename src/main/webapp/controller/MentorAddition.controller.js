/* global sap */

sap.ui.define([
	"com/sap/mentors/lemonaid/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"com/sap/mentors/lemonaid/util/GuidGenerator",
], function(BaseController, JSONModel, Filter, MessageToast, GuidGenerator) {
	"use strict";

	return BaseController.extend("com.sap.mentors.lemonaid.controller.MentorAddition", {

		guidGenerator: GuidGenerator,

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

			this.view = this.getView();
			this.component = this.getComponent();
			this.model = this.component.getModel();
			this.router = this.getRouter();
			this.i18n = this.component.getModel("i18n").getResourceBundle();
			this.config = this.component.getModel("config");
			this.ui = new JSONModel({
				//ServiceUrl : this.model.sServiceUrl,
				isEditMode: true,
				FullName: "Lars"
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
			this.handleCounter = 0;
			this.handleCounteraccessed = false;
			this.objectToUpload = {};

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
					if (object.ShirtNumber) {
						object.ShirtNumber = that._parseInteger(object.ShirtNumber);
					} else {
						delete object.ShirtNumber;
					}
					if (object.HoursAvailable) {
						object.HoursAvailable = that._parseInteger(object.HoursAvailable);
					} else {
						delete object.HoursAvailable;
					}
					if (object.InterestInMentorCommunicationStrategy) {
						object.InterestInMentorCommunicationStrategy = that._parseBoolean(object.InterestInMentorCommunicationStrategy);
					} else {
						delete object.InterestInMentorCommunicationStrategy;
					}
					if (object.InterestInMentorManagementModel) {
						object.InterestInMentorManagementModel = that._parseBoolean(object.InterestInMentorManagementModel);
					} else {
						delete object.InterestInMentorManagementModel;
					}
					if (object.InterestInMentorMix) {
						object.InterestInMentorMix = that._parseBoolean(object.InterestInMentorMix);
					} else {
						delete object.InterestInMentorMix;
					}
					if (object.InterestInOtherIdeas) {
						object.InterestInOtherIdeas = that._parseBoolean(object.InterestInOtherIdeas);
					} else {
						delete object.InterestInOtherIdeas;
					}
					if (object.TopicLeadInterest) {
						object.TopicLeadInterest = that._parseBoolean(object.TopicLeadInterest);
					} else {
						delete object.TopicLeadInterest;
					}
					if (object.HoursAvailable) {
						object.HoursAvailable = that._parseInteger(object.HoursAvailable);
					} else {
						delete object.HoursAvailable;
					}
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
								object, {
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
								that.model.createKey("/Mentors", {
									Id: object.Id
								}),
								object, {
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

		handleDoStuff: function(channel, event, data) {
			var oView = this.getView();
			var object = data.data;
			var checkAccess = false;
			//Handle Stuff based on View calling it

			while (checkAccess == false) {
				if (this.accessHandleCounter("write") != null) {
					checkAccess = true;
				}
			}
			if (object.viewName.includes("data")) {
				this.objectToUpload["Language1Id"] = object.language1;
				this.objectToUpload["Language2Id"] = object.language2;
				this.objectToUpload["Language3Id"] = object.language3;
				this.objectToUpload["Public"] = object.public;
				this.objectToUpload["RegionId"] = object.region;
				this.objectToUpload["RelationshipToSapId"] = object.relationshipToSap;
				this.objectToUpload["StatusId"] = object.status;
			} else if (object.viewName.includes("address")) {
				this.objectToUpload["Address1"] = object.address1;
				this.objectToUpload["Address2"] = object.address2;
				this.objectToUpload["City"] = object.city;
				this.objectToUpload["Company"] = object.company;
				this.objectToUpload["CountryId"] = object.country;
				this.objectToUpload["FullName"] = object.fullName;
				this.objectToUpload["JobTitle"] = object.jobTitle;
				this.objectToUpload["Phone"] = object.phone;
				this.objectToUpload["State"] = object.state;
				this.objectToUpload["Zip"] = object.zip;
			} else if (object.viewName.includes("bio")) {
				this.objectToUpload["Bio"] = object.bio;
				this.objectToUpload["Industry1Id"] = object.industry1;
				this.objectToUpload["Industry2Id"] = object.industry2;
				this.objectToUpload["Industry3Id"] = object.industry3;
				this.objectToUpload["MentorSince"] = object.mentorSince;
			} else if (object.viewName.includes("media")) {
				this.objectToUpload["Email1"] = object.email1;
				this.objectToUpload["Email2"] = object.email2;
				this.objectToUpload["FacebookUrl"] = object.facebook;
				this.objectToUpload["LinkedInUrl"] = object.linkedIn;
				this.objectToUpload["ScnUrl"] = object.scnUrl;
				this.objectToUpload["SlackId"] = object.slackUrl;
				this.objectToUpload["TwitterId"] = object.twitterUrl;
				this.objectToUpload["XingUrl"] = object.xing;
			}else if (object.viewName.includes("shirt")) {
			//	this.objectToUpload["ShirtMFId"] = object.shirtMF;
			//	this.objectToUpload["ShirtNumber"] = this._parseInteger(object.shirtNumber);
			//	this.objectToUpload["ShirtSizeId"] = object.shirtSize;
			//	this.objectToUpload["ShirtText"] = object.shirtText;
			} else if (object.viewName.includes("expertise")) {
				this.objectToUpload["SapExpertise1Id"] = object.expertise1;
				this.objectToUpload["SapExpertise2Id"] = object.expertise2;
				this.objectToUpload["SapExpertise3Id"] = object.expertise3;
				this.objectToUpload["SapExpertise1LevelId"] = object.expertiseLevel1;
				this.objectToUpload["SapExpertise2LevelId"] = object.expertiseLevel2;
				this.objectToUpload["SapExpertise3LevelId"] = object.expertiseLevel3;
			} else if (object.viewName.includes("topics")) {
				this.objectToUpload["Topic1Id"] = object.topic1;
				this.objectToUpload["Topic2Id"] = object.topic2;
				this.objectToUpload["Topic3Id"] = object.topic3;
				this.objectToUpload["Topic4Id"] = object.topic4;
			} else if (object.viewName.includes("softskills")) {
				this.objectToUpload["SoftSkill1Id"] = object.softSkill1;
				this.objectToUpload["SoftSkill2Id"] = object.softSkill2;
				this.objectToUpload["SoftSkill3Id"] = object.softSkill3;
				this.objectToUpload["SoftSkill4Id"] = object.softSkill4;
				this.objectToUpload["SoftSkill5Id"] = object.softSkill5;
				this.objectToUpload["SoftSkill6Id"] = object.softSkill6;
			} else if (object.viewName.includes("band")) {
				this.objectToUpload["JambandBarcelona"] = object.jamBandBarcelona;
				this.objectToUpload["JambandLasVegas"] = object.jamBandLasVegas;
				this.objectToUpload["JambandInstrument"] = object.jamInstruments;
				this.objectToUpload["JambandMusician"] = object.jamMusician;
			}

			checkAccess = false;
			var checkSum = false
			while (checkAccess == false) {
				checkSum = this.accessHandleCounter("read")
				if (checkSum != null) {
					console.log(checkSum);
					if(checkSum == true){
						console.log(this.objectToUpload);
						var that = this;
						//TEST UPLOAD
						var requests = [];
						//var imp = this.ui.getProperty("/import");
						//imp.errors = [];
						requests.push(new Promise(function(resolve) {

							if (!that.objectToUpload.Id) {
								that.objectToUpload.Id = that.guidGenerator.generateGuid();
							}
							for (var i in that.objectToUpload) {
								if (that.objectToUpload[i].length === 0) {
									//delete that.objectToUpload[i];
								}
							}
							console.log(that.objectToUpload);
							that.model.create(
								"/Mentors",
								that.objectToUpload, {
									success: function(data) {
										newCount++;
										resolve();
									},
									error: function(error) {
									/*	imp.errors.push({
											title: that.i18n.getText("importCreateErrorTitle"),
											message: that.i18n.getText("importCreateError", [
												this.objectToUpload.Id,
												othis.objectToUpload.FullName,
												error.responseText
											])
										});*/
										errorCount++;
										resolve();
									}
								}
							);
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



						this.objectToUpload = {};
					}
					checkAccess = true;
				}
			}


		},

		accessHandleCounter: function(mode) {
			if (!this.handleCounteraccessed) {
				this.handleCounteraccessed = true;
				switch (mode) {
					case "read":
						if (this.handleCounter >= 9) {
							this.handleCounteraccessed = false;
							return true;
						} else {
							this.handleCounteraccessed = false;
							return false;
						}
						break;
					case "write":
						this.handleCounter++;
						console.log(this.handleCounter)
						this.handleCounteraccessed = false;
						return true;
						break;
					default:
						this.handleCounteraccessed = false;
						return false;
				}
				this.handleCounteraccessed = false;
			}
			return null;
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_toggleFieldGroup: function(path, state) {
			jQuery.each(this.ui.getProperty(path + "/Fields"), function(idx, field) {
				field.Value = state;
			});
			this.ui.refresh();
		},

		_buildFieldGroups: function(entityType) {
			var fieldGroups = [];
			var fieldGroup;
			this.ui.setProperty("/FieldGroups", fieldGroups);
			jQuery.each(this.component.metadata.oMetadata.dataServices.schema, function(schemaIdx, schema) {
				jQuery.each(schema.annotations, function(annodationsIdx, annotations) {
					if (annotations.target === "Model.Mentor") {
						jQuery.each(annotations.annotation, function(annotationIdx, annotation) {
							if (annotation.term === "UI.FieldGroup") {
								jQuery.each(annotation.extensions, function(extensionIdx, extension) {
									if (extension.name === "Qualifier") {
										fieldGroup = { Id: extension.value, Name: extension.value.replace(/([A-Z0-9])/g, " $1").trim(), Fields: [] };
										fieldGroups.push(fieldGroup);
									}
								});
								if (annotation.record.type === "UI.FieldGroupType") {
									jQuery.each(annotation.record.propertyValue, function(propertyValueIdx, propertyValue) {
										if (propertyValue.property === "Data") {
											jQuery.each(propertyValue.collection.record, function(recordIdx, record) {
												if (record.type === "UI.DataField") {
													jQuery.each(record.propertyValue, function(propValueIdx, propValue) {
														if (propValue.property === "Value") {
															fieldGroup.Fields.push( { Id: propValue.path, Name: propValue.path.replace(/([A-Z0-9])/g, " $1").trim(), Value: propValue.path === "Id" } );
														}
													});
												}
											});
										}
									});
								}
							}
						});
					}
				});
			});
		},

		_isValidField: function(fieldName) {
			for (var i = 0; i < this.metadata.getServiceMetadata().dataServices.schema.length; i++) {
				var schema = this.metadata.getServiceMetadata().dataServices.schema[i];
				for (var j = 0; j < schema.entityType.length; j++) {
					var entityType = schema.entityType[j];
					if (entityType.name === "Mentor") {
						for (var k = 0; k < entityType.property.length; k++) {
							var property = entityType.property[k];
							if (property.name === fieldName) {
								return true;
							}
						}
					}
				}
			}
			return false;
		},

		_parseBoolean: function(value) {
			if (value) {
				if (value.toUpperCase() === "YES" ||
					value.toUpperCase() === "TRUE" ||
					value.toUpperCase() === "Y" ||
					value.toUpperCase() === "T" ||
					value === "1" ||
                    value === true ||
                    value === 1) {
					return true;
				}
			}
			return false;
		},

		_parseInteger: function(value) {
			if (typeof value === "undefined") { return; }
			if (typeof value === "number") { return value; }
			var res = value.split(" ");
			for (var i = 0; i < res.length; i++) {
				var iValue = parseInt(res[i]);
				if (!isNaN(iValue)) {
					return iValue;
				}
			}
			return 0;
		}
	});
});
