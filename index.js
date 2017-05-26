var Pico = require('./Pico');
var P = new Pico;

window.onload = function () {

	//Picoganizer parameter
	option = {
		bufferSize:Math.pow(2, 10), //fft size (defalt:1024)
		windowFunc:"rect", //nooverlapのため
		mode:"dtw",  //comparison
 		inputType:"music",
		bgm:"audio/test_overworld.wav",
//		feature:["mfcc"],
		framesec:0.02,
		duration:1.0
	};
	P.init(option); //パラメータ設定 (初期化)

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

	var ts = 0;
	var recog = 0;
	var threshold = 16;
	var str;

	//var audiofile = ['Coin.mp3', 'http://jsrun.it/assets/A/Q/q/J/AQqJ4.mp3'];

	P.recognized('https://picog.azurewebsites.net/Coin.mp3', function(cost){
		//console.log("coin cost: " + cost.toFixed(2));
		ts += option.duration;
		if (cost <= threshold) recog = 1;
		else recog = 0;
		str = $("#content").val() + ts.toFixed(2)+"\t"+recog.toFixed()+"\n";


		$("#content").keyup(function(){
			$("#content").val(str);
			$("#text").val("cost:"+ cost.toFixed(2));
		});
		$("#content").keyup();

	});

	$("#export").click(function(){  // 出力ボタンを押した場合は、setBlobUrl関数に値を渡して実行
			setBlobUrl("download", $("#content").val());
	});
	$("#stop").click(function(){
			P.stop();
	});
	$("#clear").click(function(){
			ts = 0;
			str ="";
			$("#content").val(str);
	});

};

function setBlobUrl(id, content) {
    var blob = new Blob([ content ], { "type" : "application/x-msdownload" });
    window.URL = window.URL || window.webkitURL;
    $("#" + id).attr("href", window.URL.createObjectURL(blob));
    $("#" + id).attr("download", "tmp.txt");
}
