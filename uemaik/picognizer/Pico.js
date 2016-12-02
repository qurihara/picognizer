var DTW = require("./lib/dtw");
var dtw = new DTW();


var Pico = function () {
	var state = { feature: 'amplitudeSpectrum',
		          duration: 0.1,
		          bufSize: 512,
		          recog: false};
	
	this.start = function(audiofile){
		state = init(audiofile, state);
		var cost = inputMic(state); //ここ
		console.log(cost);
		return cost;
	}
	
	this.recognized =  function(audiofile, threshold){
		state.recog = true;
		state.threshold = threshold;
		init(audiofile, state);
		var cost = inputMic(state);
		return;
	}
	
	this.stop =  function(){
		console.log("stoppped");
		window.clearInterval();
		return;
	}
};
	
function init(audiofile, state){
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audio = new Audio(audiofile);
	audio.id = "audio";
	
	state.acontext = new AudioContext();
	state.source = state.acontext.createMediaElementSource(audio);
	
	state.maxframe = 6;//Math.ceil(audio.duration/state.duration); //ここもなおす
	return state;

}

function inputMic(state) {
	var data1 = [];
	var data2 = [];
	
	var meyda = new Meyda(state.acontext, state.source, state.bufSize);
	var framecount = 0;

    // microphone
	console.log("using mic");
	console.log("calculating cost");
	
	navigator.getUserMedia = ( navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia);
	
	navigator.getUserMedia({video: false, audio: true},
		//success
		function(mediaStream){
			state.source2 = state.acontext.createMediaStreamSource(mediaStream);
			
	    	setInterval(function(){
	    		framecount++;
    			meyda.setSource(state.source2);
				data2.push(featureExtraction(meyda, state));
				if (framecount>state.maxframe+1){
					var cost = dtw.compute(data1, data2);
					
					if (state.recog == true && cost < state.threshold){
						console.log("Cost: " + cost + " recognized");
					}
					data2.shift();
					return cost;
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
