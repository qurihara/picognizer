var DTW = require("./lib/dtw");
require("./constants.js");

var dtw = new DTW();

var Pico = function () {
	var state = { feature: 'powerSpectrum', // 'amplitudeSpectrum'
		          bufSize: 1024, //FFTsize
		          duration: 0.1, //second
		          recog: false};

	this.recognized =  function(audiofile, callback){
		state.recog = true;
		init(audiofile, state);
		cost = inputMic(state,callback);
		return;
	}

	this.stop =  function(){
		state.recog = false;
		console.log("Stoppped.");
		window.clearInterval();
		return;
	}

};

function init(audiofile, state){
	var audio = new Audio(audiofile);
	
	audio.addEventListener('loadedmetadata', function() {
		state.maxframe = Math.ceil(audio.duration/state.duration);
	});
	
	state.acontext = new AudioContext();
	state.source = state.acontext.createMediaElementSource(audio);

	return state;
}

function inputMic(state, callback) {
	var data1 = [];
	var data2 = [];

	var meyda = new Meyda(state.acontext, state.source, state.bufSize);
	var framecount = 0;

    // microphone
	console.log("using mic");
	if (!navigator.getUserMedia){
    	alert('getUserMedia is not supported.');
	}
	
	navigator.getUserMedia({video: false, audio: true},
		//success
		function(mediaStream){
			state.source2 = state.acontext.createMediaStreamSource(mediaStream);
			console.log("calculating cost");

	    	setInterval(function(){
	    		framecount++;
    			meyda.setSource(state.source2);
				data2.push(featureExtraction(meyda, state));
				if (framecount>state.maxframe+2){
					if(meyda.get("rms")>0.0001){ //not silence
						cost = dtw.compute(data1, data2);
						if (state.recog == true){
							if (callback != null) callback(cost);
						}
					}
					data2.shift();
				}
				else if (framecount==state.maxframe+1){
					data1.shift();
				}
				else{
					meyda.setSource(state.source);
					data1.push(featureExtraction(meyda, state));
	    		}
	    		
	        },1000*state.duration)

		},
		//error
		function(err){
			alert("Error accessing the microphone.");
		}
	)

}

function specNormalization(freq, bufSize){
	var maxval = Math.max.apply([], freq);
	for (n=0; n<bufSize; n++){
		freq[n] = freq[n]/maxval;
	}
	return freq;
}

function featureExtraction(meydaAnalyzer, state){
    var f = meydaAnalyzer.get(state.feature);
    f = specNormalization(f, state.bufSize);
    return f;
}

module.exports = Pico;
