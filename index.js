var Pico = require('./Pico');
var P = new Pico;

window.onload = function () {

	P.init(); //パラメータ設定 (初期化)

	/*
	//check ローカル1音: OK
	P.recognized('1up.mp3', function(cost){
		console.log("gainlife cost: " + cost.toFixed(2));
	});
	*/
	
	
	//check ローカル2音: OK
	/*var audiofile = ['Coin.mp3', '1up.mp3'];
	P.recognized(audiofile, function(cost){
		console.log("coin cost: " + cost[0].toFixed(2));
		console.log("gainlife cost: " + cost[1].toFixed(2));
	});
	*/
	
	//check web 1音: 
	P.recognized('https://picog.azurewebsites.net/Coin.mp3', function(cost){
		console.log("coin cost: " + cost.toFixed(2));
	});
	//var audiofile = ['Coin.mp3', 'http://jsrun.it/assets/A/Q/q/J/AQqJ4.mp3'];
	
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