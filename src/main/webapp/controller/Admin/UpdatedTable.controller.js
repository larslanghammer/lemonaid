/* global sap, jQuery */

sap.ui.define([
    "com/sap/mentors/lemonaid/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.sap.mentors.lemonaid.controller.Admin.UpdatedTable", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the view controller is instantiated.
		 * @public
		 */
onInit: function() {
        	this.table = this.byId("mentorsTable");
        	this.map = this.byId("map");
            this.ui = new JSONModel({ tableBusyDelay: 0, count: 0 });
            this.model = this.getComponent().getModel();
            this.view = this.getView();
            this.router = this.getRouter();
            this.view.setModel(this.ui, "ui");
            this.router.getRoute("Mentors").attachMatched(this.onRouteMatched, this);

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			if (this.table) {
				var that = this,
					originalBusyDelay = this.table.getBusyIndicatorDelay();
				this.table.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for worklist's table
					that.ui.setProperty("/tableBusyDelay", originalBusyDelay);
				});
			}
        },

        onSearchPressed: function(event) {
            var search = event.getParameters().query;
            this.searchFilter = search ? new Filter("FullName", FilterOperator.Contains, search) : null;
            this._applyFilters();
        },

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function(event) {
			var that = this;
			var count = event.getParameter("total");
			this.ui.setProperty("/count", count);
			if (count && event.getSource().getBinding("items").isLengthFinal()) {
				$.each(this.filters, function (name, filters) {
					that.model.read("/Mentors/$count", {
						filters: [ filters ],
						success: function (oData) {
							that.ui.setProperty("/" + name, oData);
						}
					});
				});
			}
		},



		onRouteMatched: function() {
		},

		/**
         * Event handler for Map Marker click
         * @param  {sap.ui.base.Event} oEvent for click event
         * @public
         */
        onMarkerClick: function(oEvent) {
            if (this.activeMarker) {
                if (this.activeMarker.isOpen) {
                    this.activeMarker.infoWindowClose();
                    this.activeMarker.isOpen = false;
                } else {
                    this.activeMarker.isOpen = true; //same marker reopen
                }
            }

            if (this.activeMarker !== oEvent.getSource()) {
                this.activeMarker = oEvent.getSource();
                this.activeMarker.isOpen = true;
            }
        },

        //Dialog Fragment
        		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.sap.mentors.lemonaid.view.Admin.UpdatedTableDialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleConfirm: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("idProductsTable");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			if (mParams.groupItem) {
				var sPath = mParams.groupItem.getKey();
				var bDescending = mParams.groupDescending;
				var vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			var sPath = mParams.sortItem.getKey();
			var bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = aSplit[3];
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);

			// update filter bar
			oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			oView.byId("vsdFilterLabel").setText(mParams.filterString);
		}
    });

});
