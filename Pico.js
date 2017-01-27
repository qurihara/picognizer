var DTW = require("./lib/dtw");
require("./constants.js");

var dtw = new DTW();
var cost;

var audio = new Audio();
var acontext= new AudioContext();
var mic = null;
var micon = false;

var Pico = function () {
	// プライベート変数

	// default
	var duration = 0.1; //seconds
	var options = {
		"audioContext": acontext, // required
		"source": null, // required
		"bufferSize": 4096, // required
		"windowingFunction": "hamming", // optional
		"featureExtractors": ["powerSpectrum"],
		"callback": function(output){ features = output; }
	};
	
	//options
	//this.setparameter = function(){
	//	
	//}
	
	this.recognized =  function(audiofile, callback){
		var promise = Promise.resolve();
		var effectdata=[];
		promise.then(function(){
			if (micon == false){
				usingMic();
			}
		})
		.then(function(){
				effectdata = loadAudio(audiofile, effectdata, options);
		})
		.then(function(){
			audio.addEventListener('loadstart', function(){ 
				costCalculation(effectdata, options, duration, callback)
			})
		});
		return;
	}

	this.stop =  function(){
		state.recog = false;
		console.log("Stoppped.");
		window.clearInterval();
		return;
	}
};

//getparameter
/*function getParams(func) {
    var source = func.toString()
        .replace(/\/\/.*$|\/\*[\s\S]*?\*\/|\s/gm, ''); // strip comments
    var params = source.match(/\((.*?)\)/)[1].split(',');
    if (params.length === 1 && params[0] === '')
        return [];
    return params;
}*/

//microphone
function usingMic(){
	console.log("using mic");
	if (!navigator.getUserMedia){
    	alert('getUserMedia is not supported.');
	}
	navigator.getUserMedia({video: false, audio: true},
	function(mediaStream){ //success
			audio.src = mediaStream;
			mic = acontext.createMediaStreamSource(mediaStream);
			micon = true;
			console.log("The microphone turned on.");
		}, //error
		function(err){
			alert("Error accessing the microphone.");
		}
	)
}

//sound effect
function loadAudio(filename, data, options){
	var effectaudio = new Audio();
	effectaudio.src =  filename;
	asource = acontext.createMediaElementSource(effectaudio);
	var eachframesec=0.01;
	
	console.log("Please wait until calculation of spectrogram is over.");
	
	effectaudio.addEventListener('loadstart', function() {
		options["source"] = asource;
		var meyda = Meyda.createMeydaAnalyzer(options);
		meyda.start(options["featureExtractors"][0]);
		setInterval(function(){
			if (features !=null) data.push(features);
			meyda.stop();
		},1000*eachframesec)
	})
	
	return data;
}

//for dtw
function costCalculation(effectdata, options, duration, callback) {
	var data=[];
	var eachframesec=0.01;
	
	//audio.addEventListener('loadstart', function(){//mic
		if (duration<options["bufferSize"]/acontext.sampleRate){
			throw new Error("bufferSize should be smaller than duration.");
		}

		options["source"] = mic;
		var meyda = Meyda.createMeydaAnalyzer(options);
		console.log("calculating cost");
		meyda.start(options["featureExtractors"][0]);
		
		setInterval(function(){
			data.push(features);
			meyda.stop();
		},1000*eachframesec)
		
		setInterval(function(){
			//costの計算
			cost = dtw.compute(data, effectdata);
			if (callback != null) callback(cost);
			data = [];
		},1000*duration)
	//})
}

function specNormalization(freq, bufSize){
	var maxval = Math.max.apply([], freq);
	for (n=0; n<bufSize; n++){
		freq[n] = freq[n]/maxval;
	}
	return freq;
}
module.exports = Pico;
