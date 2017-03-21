var DTW = require("./lib/dtw");
var Code = require("./code.js");
require("./constants.js");

var options = {};
options.distanceMetric = 'asymmetric';

var dtw = new DTW(options);

var audio = {};
var source = {};
var acontext= new AudioContext();
var mediaStream;
var c = new Code();

var Pico = function(){

	var options = {
		"audioContext": acontext, // required
		"source": null, // required
		"bufferSize": null, // required
		"windowingFunction": null,
		"featureExtractors": []
	};
	var micstate = {
		"micon":false,
		"output":false
	};

	this.init = function(...args){
		if (args.length < 1) {console.log("Default parameter (bufferSize: 2048, featureExtractors: powerSpectrum)");}
		if (arguments.bufferSize === undefined) options.bufferSize = Math.pow(2,11);
		else options.bufferSize = arguments.bufferSize;
		if (arguments.windowingFunction === undefined) options.windowingFunction = "hamming";
		else options.windowingFunction = arguments.windowingFunction
		if (arguments.featureExtractors === undefined) options.featureExtractors = ["powerSpectrum"];
		else options.featureExtractors = arguments.featureExtractors
		if (arguments.micOutput === undefined) micstate.output = false;
	}

	this.recognized =  function(audiofile, callback){

		var duration = 1.0; //seconds
		var audionum;
		var data = [];
		var effectdata = {};
		//複数を判定
		if(!(audiofile instanceof Array)){
			audionum = 1;
			loadAudio(audiofile, data, options);
			effectdata[0] = data;
		}
		else {
			audionum = audiofile.length;
			for (var n=0; n<audionum; n++){
				data = [];
				var key = String(n);
				loadAudio(audiofile[n], data, options);
				effectdata[key] = data;
			}
		}

		//mic
		if (micstate.micon == false){
			usingMic(micstate);
		}

		var f3 = function func3(){
			costCalculation(effectdata, options, duration, callback);
			return true;
		}
		c.addfunc(f3);
		return;
	}

	this.stop =  function(){
		state.recog = false;
		console.log("Stoppped.");
		window.clearInterval();
		return;
	}
};

//microphone
function usingMic(micstate){
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
		console.log("The microphone turned on.");
		if (micstate.output== true) source.mic.connect(acontext.destination);
		micstate.micon = true;
		c.execfuncs();
		},
		function(err){//error
			alert("Error accessing the microphone.");
		}
	)
}

function checkSpectrum(options){
	if (options.featureExtractors.indexOf('powerSpectrum') != -1 || options.featureExtractors.indexOf('amplitudeSpectrum') != -1) return true;
	else return false;
}

//sound effect
function loadAudio(filename, data, options){
	audio.soundeffect = new Audio();
	audio.soundeffect.src = filename;
	audio.soundeffect.crossOrigin = "anonymous";
	source.soundeffect = acontext.createMediaElementSource(audio.soundeffect);
	options.source = source.soundeffect;

	var framesec=0.05;
	var repeatTimer;
	var featurename = options.featureExtractors[0];
	console.log("Please wait until calculation of spectrogram is over.");

	var meyda = Meyda.createMeydaAnalyzer(options);
	audio.soundeffect.play();
	meyda.start(featurename);

	var checkspec = checkSpectrum(options);

	audio.soundeffect.addEventListener('playing', function() {
		repeatTimer = setInterval(function(){
			var features = meyda.get(featurename);
			if (features!=null){
				if (checkspec==true){
					features = specNormalization(features, options);
					features = features.slice(0, parseInt(options.bufferSize/2));///1/2を取り出す
				}
				data.push(features);
			}
			//if
		},1000*framesec)
	});

	audio.soundeffect.addEventListener('ended', function(){
		meyda.stop();
		clearInterval(repeatTimer);
	});

}

//for dtw
function costCalculation(effectdata, options, duration, callback) {
	var framesec = 0.05;
	var RingBufferSize;
	var maxnum;

	if (duration<options.bufferSize/acontext.sampleRate){
		throw new Error("bufferSize should be smaller than duration.");
	}

	audio.mic.play();
	options.source = source.mic;
	var checkspec = checkSpectrum(options);
	var effectlen = Object.keys(effectdata).length;

	maxnum = effectdata[0].length;
	if (effectlen > 1){
		for (var keyString in effectdata) {
			if (maxnum < effectdata[keyString].length)
			maxnum = effectdata[keyString].length;
		}
	}
	RingBufferSize = parseInt(maxnum*1.5);

	var meyda = Meyda.createMeydaAnalyzer(options);
	console.log("calculating cost");
	meyda.start(options.featureExtractors);

	//buffer
	var buff = new RingBuffer(RingBufferSize);

	setInterval(function(){
		var features = meyda.get(options.featureExtractors[0]);
		if (checkspec==true) {
			features = specNormalization(features, options);
			features = features.slice(0, parseInt(options.bufferSize/2));///1/2を取り出す
		}
		if (features != null) buff.add(features);
	},1000*framesec)

	//cost
	setInterval(function(){
		var buflen = buff.getCount();
		if ( buflen < RingBufferSize){
			console.log('Now buffering');
		}
		else{
			if (effectlen==1){
				var cost = dtw.compute(buff.buffer, effectdata[0]);
			}
			else{
				var cost=[];
				for (var keyString in effectdata) {
					var tmp = dtw.compute(buff.buffer, effectdata[keyString]);
					cost.push(tmp);
				}
			}
			if (callback != null) callback(cost);
		}
	},1000*duration)
}

var RingBuffer = function(bufferCount){
		if (bufferCount === undefined) bufferCount = 0;
        this.buffer = new Array(bufferCount);
        this.count = 0;
    };

RingBuffer.prototype = {
	add: function(data){
		var lastIndex = (this.count % this.buffer.length);
			this.buffer[lastIndex] = data;
			this.count++;
			return (this.count <= this.buffer.length ? 0 : 1);
		},

	get: function(index){
		if (this.buffer.length < this.count)
			index += this.count;
			index %= this.buffer.length;
			return this.buffer[index];
	},
    getCount: function(){
		return Math.min(this.buffer.length, this.count);
	}
};

function specNormalization(freq, options){
	var maxval = Math.max.apply([], freq);
	if (maxval == 0){
		return freq;
	}
	else{
		for (n=0; n<options.bufferSize; n++){
			freq[n] = freq[n]/maxval;
		}
		for (n=0; n<options.bufferSize; n++){
			if (freq[n]<0.01) freq[n]=0;
		}
		return freq;
	}
}

module.exports = Pico;
