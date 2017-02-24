var DTW = require("./lib/dtw");
var Code = require("./code.js");
require("./constants.js");

var dtw = new DTW();
var cost;
var audio = {};
var source = {};
var acontext= new AudioContext();

var mediaStream;

var c;
var Pico = function(){

	var options = {
		"audioContext": acontext, // required
		"source": null, // required
		"bufferSize": null, // required
		"windowingFunction": null,
		"featureExtractors": []
	};
	var micon = false;

	this.init = function(...args){
		if (args.length < 1) {console.log("Default parameter (bufferSize: 2048, featureExtractors: powerSpectrum)");}
		if (arguments.bufferSize === undefined) options.bufferSize = 2048;
		if (arguments.windowingFunction === undefined) options.windowingFunction = "hamming";
		if (arguments.featureExtractors === undefined) options.featureExtractors = ["powerSpectrum"];
	}

	this.recognized =  function(audiofile, callback){

		var duration = 0.5; //seconds
		var audionum;
		//var data = [];
		var effectdata = [];
		//複数を判定
		if(!(audiofile instanceof Array)){
			audionum = 1;
		}
		else {
			audionum = audiofile.length;
		}
		c = new Code();

		// mic
		if (micon == false){
			usingMic();
		}

		loadAudio(audiofile, effectdata, options, function(){ // callbackを想定
			var f3 = function func3(){
				//マイクのローディングを待ってほしいのに->ボタンだったらあり？
				costCalculation(effectdata, options, duration, callback);
				return true;
			}
			c.addfunc(f3);
		};

		return;
	}

	this.stop =  function(){
		state.recog = false;
		console.log("Stoppped.");
		window.clearInterval();
		return;
	}
};

function getParams(func) {
	var source = func.toString().replace(/\/\/.*$|\/\*[\s\S]*?\*\/|\s/gm, ''); // strip comments
	var params = source.match(/\((.*?)\)/)[1].split(',');
	if (params.length === 1 && params[0] === '')
    	return [];
	return params;
}

//microphone
function usingMic(){
	console.log("using mic");
	if (!navigator.getUserMedia){
    	alert('getUserMedia is not supported.');
	}
	navigator.getUserMedia({video: false, audio: true},
	function(stream){ //success
		mediaStream = stream;
		audio.mic = new Audio();
		audio.mic.src = mediaStream;
		source.mic = acontext.createMediaStreamSource(mediaStream);
		source.mic.connect(acontext.destination);
		console.log("The microphone turned on.");
		micon = true;
		c.execfuncs();
		}, //error
		function(err){
			alert("Error accessing the microphone.");
		}
	)
}

//sound effect
function loadAudio(filename, data, options,callback){
	audio.soundeffect = new Audio();
	audio.soundeffect.src = filename;
	audio.soundeffect.crossOrigin = "anonymous";
	source.soundeffect = acontext.createMediaElementSource(audio.soundeffect);
	options.source = source.soundeffect;

	var framesec=0.05;
	var repeatTimer;
	var features;
	var featurename = options.featureExtractors[0];
	console.log("Please wait until calculation of spectrogram is over.");
	audio.soundeffect.play();

	var meyda = Meyda.createMeydaAnalyzer(options);
	meyda.start(featurename);

	audio.soundeffect.addEventListener('loadstart', function() {
		repeatTimer = setInterval(function(){
			features = meyda.get(featurename);
			if (features!=null) data.push(features);
		},1000*framesec)
	});

	audio.soundeffect.addEventListener('ended', function(){
		meyda.stop();
		clearInterval(repeatTimer);
	});

	// do callback
	callback();
}

//for dtw
function costCalculation(effectdata, options, duration, callback) {
	var data=[];
	var framesec=0.05;

	if (duration<options.bufferSize/acontext.sampleRate){
		throw new Error("bufferSize should be smaller than duration.");
	}

	audio.mic.play();
	options.source = source.mic;

	var meyda = Meyda.createMeydaAnalyzer(options);
	console.log("calculating cost");
	meyda.start(options.featureExtractors);

	setInterval(function(){
		var features = meyda.get(options.featureExtractors[0]);
		if (features!=null) data.push(features);
	},1000*framesec)

	//cost算出
	setInterval(function(){
		cost = dtw.compute(data, effectdata);
		if (callback != null) callback(cost);
		data = [];
	},1000*duration)
}

function specNormalization(freq, options){
	var maxval = Math.max.apply([], freq);
	for (n=0; n<options.bufferSize; n++){
		freq[n] = freq[n]/maxval;
	}
	return freq;
}

module.exports = Pico;
