var Pico = require('./Pico');
var P = new Pico;

window.onload = function () {

	////coin
	P.recognized('http://jsrun.it/assets/a/k/U/T/akUT5.mp3', function(cost){
		console.log("coin cost: " + cost.toFixed(2));
	});
	
	////gainlife
	//P.recognized('http://jsrun.it/assets/A/Q/q/J/AQqJ4.mp3', function(cost){
	//	console.log("gainlife cost: " + cost.toFixed(2));
	//});
};

document.onkeydown = function (e){
	if(!e) e = window.event;
	
	/////space key
	if(e.keyCode == 32){ 
		P.stop();
	}
	/////enter key
	else if(e.keyCode == 13){

	}
};