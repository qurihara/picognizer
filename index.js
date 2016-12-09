var Pico = require('./Pico');
var P = new Pico;
var c = document.getElementById('console');
window.onload = function () {
	//var cost = P.start('./audio/Coin.mp3'); //確認中
	//console.log("Cost: " + cost);

	//test
	P.recognized('./audio/Coin.mp3', 5, function(cost){
		////cost<5のとき
		console.log("recognized. cost: " + cost);
	});
};
