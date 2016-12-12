var Pico = require('./Pico');
var P = new Pico;

window.onload = function () {

	//test coin
	P.recognized('http://jsrun.it/assets/a/k/U/T/akUT5.mp3', function(cost){
		//if (cost<155){ //
			console.log("Recognized. cost: " + cost.toFixed(2));
		//}
	});
};

document.onkeydown = function (e){
	if(!e) e = window.event;
	
	/////space key
	if(e.keyCode == 32){ 
		P.stop();
	}
	/////enter key
	else if(e.keyCode == 13){
		P.recognized('http://jsrun.it/assets/a/k/U/T/akUT5.mp3', function(cost){
			console.log("Recognized. cost: " + cost.toFixed(2));
		});
	}
};