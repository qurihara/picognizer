Picognizer
===============

Picognizer is the 100% JavaScript library for detecting synthesized sounds (e.g. sound effects of video games, replayed speech or music, and sound alerts of home appliances).
You can run it on your web browser without any server-side systems.

## Demo movie
https://www.youtube.com/watch?v=-2MtArZAtfg (Japanese)

https://www.youtube.com/watch?v=CoYJmNdxPNY (English)


## Browser example (works best with Firefox on PC/Mac/Android)

Click this:
https://qurihara.github.io/picognizer/script.html?cri=48&surl=https://rawgit.com/qurihara/picognizer/gh-pages/scripts/bg_red.js&src=https://rawgit.com/Fulox/FullScreenMario-JSON/master/Sounds/Sounds/mp3/Coin.mp3&frame=0.04&dur=0.01

This example can detect a famous sound effect of getting a coin in Super Mario Brothers.
Press "Picognize" button and add permission of using your mic.
With "play" button you can play the target sound as an emulation.
The browser's background turnes red when the sound is detected.
With "fire" button you can check what will happen after detection.
Change the slider bar to adjust the threshold.

You can execute any JavaScript code on detection.
Refer to https://github.com/qurihara/picognizer/blob/gh-pages/scripts/bg_red.js as an example.
The setup() funciton is executed only once when the page is loaded.
The onfire() function is executed for each detection.

## Node.js example with beefy

The current implementation of Picognizer is web-oriented.
However you can also introduce Picognizer with Node.js coding style using beefy[https://www.npmjs.com/package/beefy].

    npm i beefy browserify debug -g
    beefy node_beefy_example.js --live --open

Then a browser opens to run the example.
If you don't use Firefox as your default browser, reopen the page with Firefox.

See node_beefy_example.js for checking up the actual coding mannar.

## How to code
    // for web browser
    var Pico = require('picognizer');
    // for Node.js/beefy
    //var Meyda = require("./lib/meyda.min");
    //var Pico = require('./picognizer');

    var P = new Pico;

    //parameter
    option = {
      bufferSize:Math.pow(2, 10), // Feature buffer size (defalt: automatic)
      windowFunc:"hamming", // Window function (default: hamming)
      feature:["mfcc"], // Feature name (default: ["powerSpectrum"])
      mode:"direct",  // Cost calculation algorithms (default: direct)
      inputType:"audio", // Input type (default: mic)
      file:"input_audio_name", // Filename of input audio when you use inputType:"audio"
      framesec:0.1,  // Interval seconds for each feature extraction (default: 0.02)
      duration:1.0, // Interval seconds for each cost calculation (default: 1.0)
      slice:[0,1.0] // Slice time[s] for the target feature, slice[0] is start and slice[1] is end
    };
    P.init(option); //set parameter

    P.oncost('url_for_audiofilename.mp3', function(cost){
      // do something with cost      
    }

### option
#### bufferSize
"buffeSize" is the size of the feature to extract. When you use spectral features, it is necessary to a power of two greater than samples in framesec. If bufferSize is undefined, it is automatically calculated according to the framesec.

#### mode
It is an option to set cost calculation algorithms.
The target feature vector and the input feature vector are calculated using dynamic time warping as "dtw" or direct comparison "direct."

#### inputType
You can select either input data from the microphone as "mic" or the audio file as "audio". If "audio" is defined, it is necessary to specify the audio file with "file."

#### slice
If the sound source of the target is long, you can cut out the specified seconds and extract feature vectors. The slice [0] represents the start time and slice [1] accounts for the end time. Please describe it all in seconds.

Please see [meyda wiki][] for parameters (bufferSize, windowFunc, feature) on features since meyda is used for feature extraction.

[meyda wiki]:https://github.com/meyda/meyda/wiki/audio-features "meyda wiki"
