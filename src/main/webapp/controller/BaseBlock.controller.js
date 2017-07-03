/* global sap */

sap.ui.define([
    "com/sap/mentors/lemonaid/controller/BaseController",
    "com/sap/mentors/lemonaid/util/formatters"
], function(BaseController, formatters) {
    "use strict";

    return BaseController.extend("com.sap.mentors.lemonaid.controller.BaseBlock", {

		formatters: formatters,
		        onInit: function() {
        	 var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("MyChannel", "doStuff", this.handleDoStuff, this);
			oEventBus.subscribe("MyChannel", "doStuff2", this.handleDoStuff2, this);
},

handleDoStuff : function (channel, event, data) {
	var oEventBus = sap.ui.getCore().getEventBus();
   var oView = this.getView();
	var controlsArray = oView.getContent()[0]._aElements;
	var oData = [];
	var oTest = {}
	oTest["viewName"] = oView.getId()
	var notFoundLableCounter = 0;
	//console.log(oView.getContent()[0]._aElements);
	for(var i in controlsArray){
		var controlsId = controlsArray[i].sId;
		if(controlsId.includes("input")){
			oData.push(controlsArray[i].getValue());
			//if(controlsArray[i-1].sId.includes("label")){
			oTest[controlsId.split("-")[4]] = controlsArray[i].getValue();
			/*}else{
					var label = "label"+notFoundLableCounter;
					oTest[label] = controlsArray[i].getValue();
					notFoundLableCounter++;

			}*/
		}else if(controlsId.includes("select")){
			oData.push(	controlsArray[i].getSelectedKey());
		//	if(controlsArray[i-1].sId.includes("label")){
				oTest[controlsId.split("-")[4]] = controlsArray[i].getSelectedKey();
		/*	}else{
				var label = "label"+notFoundLableCounter;
				oTest[label] =controlsArray[i].getSelectedKey();
				notFoundLableCounter++;
			}*/
		}else if(controlsId.includes("switch")){
			oData.push(controlsArray[i].getState());
		//	if(controlsArray[i-1].sId.includes("label")){
				oTest[controlsId.split("-")[4]] = controlsArray[i].getState();
		/*	}else{
				var label = "label"+notFoundLableCounter;
				oTest[label] =controlsArray[i].getState();
				notFoundLableCounter++;
			}*/
		}
	}
   oEventBus.publish("MyChannelAddition", "doStuff",{data:oTest});

},

handleDoStuff2 : function (channel, event, data) {
	var oView = this.getView();
	var controlsArray = oView.getContent()[0]._aElements;
	//console.log(oView.getContent()[0]._aElements);
	for(var i in controlsArray){
		var controlsId = controlsArray[i].sId;
		if(controlsId.includes("input")){
		controlsArray[i].unbindAggregation("value",true)
		}else if(controlsId.includes("select")){
			controlsArray[i].unbindAggregation("selectedKey",true)
		}else if(controlsId.includes("switch")){
			controlsArray[i].unbindAggregation("state",true)
		}
	}
/*	var input = oView.byId("FullName")
	if( input != undefined){
		oView.byId("FullName").unbindAggregation("value",true);
		oView.unbindAggregation("model",true);
   }*/

},


    });

});
