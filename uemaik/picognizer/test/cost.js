window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

var c = document.getElementById('console');

var DTW = require("../lib/dtw");
var dtw = new DTW();

//parameter
var bufSize = 1024;

//audio for mic
var acontext = new AudioContext();

//sound effect
var audiofile = '../audio/GainLife.mp3';
var previous=0;
var audio = new Audio(audiofile);
audio.addEventListener('canplay',start); //start
audio.loop =false;
audio.src = audiofile;
var duration = 0.1; //[s]

function start(){ //あとで書き換える
	var data1 =[];
	var data2 = [];
    var source = acontext.createMediaElementSource(audio);
    source.connect(acontext.destination);
    
	var feature = 'amplitudeSpectrum';
	var meyda = new Meyda(acontext,source,bufSize);
	var framecount = 0;
	meyda.setSource(source);
	
	meyda.get(feature)
	console.log(audio.duration);
	//maxframe of soundeffect
	var maxframe = Math.ceil(audio.duration/duration);

    // microphone
    console.log("using mic");
	navigator.getUserMedia({video: false, audio: true},
		//success
		function(mediaStream) {
			var source2 = acontext.createMediaStreamSource(mediaStream);
			//source2.connect(acontext.destination); //output

			//spectrogram
	    	setInterval(function(){ 
	    		framecount++;
    			meyda.setSource(source2);
        		data2.push(featureExtraction(meyda, feature));
        		
        		if (framecount>maxframe+1){
        			var cost = costCalculation(data1, data2);
        			//return cost;
					data2.shift();
        		}
        		else if (framecount==maxframe+1){
        			data1.shift();
        		}
        		else{
        			meyda.setSource(source);
    				data1.push(featureExtraction(meyda, feature));
        		}
	        },1000*duration)

		},
		//error
		function(err) {
			alert("Error accessing the microphone.");
		}
	)

	audio.removeEventListener('canplay',start);
}

function specNormalization(freq){
	var maxval = Math.max.apply([], freq);
	for (n=0; n<bufSize; n++){
		freq[n] = freq[n]/maxval;
	}
	return freq;
}

function featureExtraction(meydaAnalyzer, feature){
    var f = meydaAnalyzer.get(feature);
    f = specNormalization(f);
    return f;
}

function costCalculation(data1, data2) {
	var cost = dtw.compute(data1, data2);
	console.log("Cost: "+cost);
	return cost;
}

