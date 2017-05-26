picognizer
===============


## How to use
    var Pico = require('./Pico');
    var P = new Pico;

    //parameter
    option = {
      bufferSize:Math.pow(2, 10), // fft size (defalt: 4096)
      windowFunc:"hamming", // window function (default: hamming)
      feature:["mfcc"], // features (default: ["powerSpectrum"])
      mode:"direct",  // method for recognition (default: direct)
      inputType:"music", // if you input audio without using mic
  		bgm:"input_audio_name", // filename of input audio without using mic  
      framesec:0.1,  // seconds for a feature extraction (default: 0.02)
      duration:1.0 // seconds for cost calculation (default: 1.0)
    };
    P.init(option); //set parameter

    P.recognized(audiofilename, function(cost){
      // script
    }

Please see [meyda wiki][] for parameters (bufferSize, windowFunc, feature) on features since meyda is used for feature extraction.

[meyda wiki]:https://github.com/meyda/meyda/wiki "meyda wiki"
