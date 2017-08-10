var Pico = require('Pico');
var P = new Pico;

window.onload = function () {

	//Picoganizer parameter
	option = {
		bufferSize:Math.pow(2, 11), //fft size (defalt:1024)
		windowFunc:"rect", //nooverlapのため
		mode:"direct",  //comparison
		//mode:"dtw",  //comparison
 		inputType:"mic",
		//bgm:"audio/set1/03.wav",
		//		feature:["mfcc"],
		framesec:0.04,
		duration:0.04
	};
	P.init(option); //パラメータ設var定 (初期化)

	var tt = 0;
	var str;
	var t = null;

	//P.recognized('./audio/effect/Coin.wav', function(cost, t){
	//P.recognized('./audio/effect/Jump Small.wav', function(cost,t){
	P.recognized('./audio/effect/Gain Life.wav', function(cost){
		//tt += option.duration;
		str = $("#content").val() + "\t"+cost.toFixed(2)+"\n";
		//str = $("#content").val() + t.toFixed(3) + "\t"+cost.toFixed(2)+"\n";
		///str = $("#content").val() + tt.toFixed(3)+"\t"+cost.toFixed(2)+"\n";

		$("#content").keyup(function(){
			$("#content").val(str);
			//$("#text").val("cost:"+ cost.toFixed(2));
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
			tt = 0;
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
