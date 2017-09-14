picognizer
===============


## How to use
    var Pico = require('picognizer');
    var P = new Pico;

    //parameter
    option = {
      bufferSize:Math.pow(2, 10), // fft size (defalt: automatic)
      windowFunc:"hamming", // window function (default: hamming)
      feature:["mfcc"], // features (default: ["powerSpectrum"])
      mode:"direct",  // method for recognition (default: direct)
      inputType:"audio", // if you input audio without using mic (default: mic)
      bgm:"input_audio_name", // filename of input audio without using mic  
      framesec:0.1,  // seconds for a feature extraction (default: 0.02)
      duration:1.0, // seconds for cost calculation (default: 1.0)
      slice:[0,1.0] // slice time[s] for recognition feature, slice[0] is start and slice[1] is end
    };
    P.init(option); //set parameter

    P.oncost(audiofilename, function(cost){
      // script
    }

Please see [meyda wiki][] for parameters (bufferSize, windowFunc, feature) on features since meyda is used for feature extraction.

[meyda wiki]:https://github.com/meyda/meyda/wiki "meyda wiki"

## Browser example (works best with Firefox on PC/Mac/Android)

https://qurihara.github.io/picognizer/script.html?cri=48&surl=https://rawgit.com/qurihara/picognizer/master/scripts/bg_red.js&src=https://rawgit.com/Fulox/FullScreenMario-JSON/master/Sounds/Sounds/mp3/Coin.mp3&frame=0.04&dur=0.01

## Node.js example with beefy
    npm i beefy browserify -g
    beefy node_beefy_example.js --live --open

Then a browser opens to run the example.
If you don't use Firefox as your default browser, reopen the page with Firefox.
