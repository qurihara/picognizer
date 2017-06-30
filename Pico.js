var DTW = require("./lib/dtw");
var dist = require("./lib/distanceFunctions/asymmetric.js");
var Code = require("./code.js");
require("./constants.js");

var options = {};
options.distanceFunction = dist.distance;
var dtw = new DTW(options);
var audio = {};
var source = {};
var acontext = new AudioContext();
var mediaStream;
var c = new Code();
var c1 = new Code();
var repeatTimer;
var repeatTimer1;
var meyda;
var effectdata;
var start_time;

var Pico = function() {

  options = {
    "audioContext": acontext, // required
    "source": null, // required
    "bufferSize": null, // required
    "windowingFunction": null,
    "featureExtractors": [],
    "framesec": null,
    "duration": null
  };
  var inputState = {
    "inputOn": false,
    "output": false,
    "type": null,
    "bgm": null
  };

  this.init = function(args) {
    if (args === undefined) {
      console.log("Default parameter (bufferSize: 1024, window:hamming, feature: powerSpectrum)");
    }

    if (args.windowFunc === undefined) options.windowingFunction = "hamming";
    else options.windowingFunction = args.windowFunc;

    if (args.feature === undefined) options.featureExtractors = ["powerSpectrum"];
    else options.featureExtractors = args.feature;

    if (args.mode === undefined) options.mode = "dtw";
    else options.mode = args.mode;

    if (args.inputType === undefined) inputState.type = "aud";
    else {
      inputState.type = args.inputType;
      inputState.bgm = args.bgm;
    }

    if (args.micOutput === undefined) inputState.output = false;

    if (args.framesec === undefined) options.framesec = 0.02;
    else options.framesec = args.framesec;

    if (args.duration === undefined) options.duration = 1.0;
    else options.duration = args.duration;

    if (args.bufferSize === undefined) options.bufferSize = detectPow(options.framesec*48000);
    else options.bufferSize = args.bufferSize;

    if (options.bufferSize <= options.framesec*48000){
      console.log("bufferSize should be a power of 2 greater than %d",options.framesec*48000);
      options.bufferSize = detectPow(options.framesec*48000);
      console.log("Set bufferSize: %d", options.bufferSize);
    }

    return;
  };

  this.recognized = function(audiofile, callback) {

    var audionum;
    var data = [];
    effectdata = {};

    //mic
    if (inputState.type == "audio" && inputState.inputOn == false) {
      var inputData = function func() {
        usingAudio(inputState);
      }
    }
    if (inputState.type == "mic" && inputState.inputOn == false) {
      var inputData = function func() {
        usingMic(inputState);
      }
    }
    c1.addfunc(inputData);

    if (!(audiofile instanceof Array)) {
      audionum = 1;
      loadAudio(audiofile, data, options);
      effectdata[0] = data;
    } else {
      audionum = audiofile.length;
      for (var n = 0; n < audionum; n++) {
        data = [];
        var key = String(n);
        loadAudio(audiofile[n], data, options);
        effectdata[key] = data;
      }
    }

    var costcal = function func() {
      costCalculation(effectdata, options, callback);
      return true;
    }
    c.addfunc(costcal);
    return;
  };

  this.stop = function() {
    console.log("Stoppped.");
    meyda.stop();
    clearInterval(repeatTimer);
    return;
  };
};

function detectPow(value) {
  var n = 0;
  while (Math.pow(2, n) < value) {
      n++;
  }
  return Math.pow(2,n);
}

//playしたら終わるモード
function usingAudio(inputState) {

  audio.inputsound = new Audio();
  audio.inputsound.src = inputState.bgm;
  audio.inputsound.crossOrigin = "anonymous";
  audio.inputsound.addEventListener('loadstart', function() {
    console.log("Audio file loaded!");
    source.input = acontext.createMediaElementSource(audio.inputsound);
    source.input.connect(acontext.destination);
    inputState.inputOn = true;
    audio.inputsound.play();
  });

  audio.inputsound.addEventListener('play', function() {
    start_time = acontext.currentTime;
    c.execfuncs();
  });

  audio.inputsound.addEventListener('ended', function() {
    meyda.stop();
    clearInterval(repeatTimer);
    console.log("Stopped.");
  });
}

//microphone
function usingMic(inputState) {
  console.log("using mic");
  if (!navigator.getUserMedia) {
    alert('getUserMedia is not supported.');
  }
  navigator.getUserMedia({
      video: false,
      audio: true
    },
    function(stream) { //success
      mediaStream = stream;
      audio.inputsound = new Audio();
      audio.inputsound.src = mediaStream;
      source.input = acontext.createMediaStreamSource(mediaStream);
      console.log("The microphone turned on.");
      if (inputState.output == true) source.input.connect(acontext.destination);
      inputState.inputOn = true;
      c.execfuncs();
    },
    function(err) { //error
      alert("Error accessing the microphone.");
    }
  )
}

function checkSpectrum(options) {
  if (options.featureExtractors.indexOf('powerSpectrum') != -1 || options.featureExtractors.indexOf('amplitudeSpectrum') != -1) return true;
  else return false;
}

function loadEffectAudio(audiofile, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', audiofile, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    acontext.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    });
  }
  request.send();
}

//sound effect
function loadAudio(filename, data, options) {
  //信号を特徴量zeropadding
  var checkspec = checkSpectrum(options);
  var signal;
  var framesize = 48000 * options.framesec;

  loadEffectAudio(filename, function(buffer) {
    signal = buffer.getChannelData(0);
    var maxframe = Math.ceil(signal.length/ framesize); //フレーム数

    //フレーム処理
    Meyda.bufferSize = options.bufferSize;
    var frame = 0;
    var startframe = 0;
    var endframe = startframe + framesize;

    for (var n = 0; n < maxframe; n++) {
      var pad = new Array(options.bufferSize).fill(0);
      var padtmp = signal.slice(startframe, endframe);
      for (var loop = 0; loop < padtmp.length; loop++)
        pad[loop] = padtmp[loop];
      var features = Meyda.extract(options.featureExtractors[0], pad);
      if (checkspec == true) features = specNormalization(features, options);
      data.push(features);
      startframe = startframe + framesize;
      endframe = startframe + framesize;

      if (n == maxframe-1) {
        //localStorage.setItem("data", JSON.stringify(data));
          c1.execfuncs();
      }
    }
  });

}

//costCalculation
function costCalculation(effectdata, options, callback) {

  var RingBufferSize;
  var maxnum;

  options.source = source.input;
  var checkspec = checkSpectrum(options);
  var effectlen = Object.keys(effectdata).length;

  maxnum = effectdata[0].length;
  if (effectlen > 1) {
    for (var keyString in effectdata) {
      if (maxnum < effectdata[keyString].length)
        maxnum = effectdata[keyString].length;
    }
  }
  RingBufferSize = maxnum;

  meyda = Meyda.createMeydaAnalyzer(options);

  console.log("calculating cost");
  //buffer
  var buff = new RingBuffer(RingBufferSize);
  //var initarray = Array.apply(null, new Array(options.bufferSize)).map(Number.prototype.valueOf,0);
  var initarray = Array.apply(null, new Array(options.bufferSize/2)).map(function (){ return 0});
  for (var n=0; n<RingBufferSize; n++) buff.add(initarray);
  //console.log(buff);
  //buff.count = 0;

  clearInterval(repeatTimer);

  if (options.mode == "dtw") {

    console.log("========= dtw mode =========");
    meyda.start(options.featureExtractors);
    setInterval(function() {
      var features = meyda.get(options.featureExtractors[0]);
      if (features != null) {
        if (checkspec == true) features = specNormalization(features, options);
        buff.add(features);
      }
    }, 1000 * options.framesec)
    //cost
    repeatTimer = setInterval(function() {
      var buflen = buff.getCount();
      //if (buflen < RingBufferSize) {
      //  console.log('Now buffering');
      //} else {
        if (effectlen == 1) {
          var cost = dtw.compute(buff.buffer, effectdata[0]);
        } else {
          var cost = [];
          for (var keyString in effectdata) {
            var tmp = dtw.compute(buff.buffer, effectdata[keyString]);
            cost.push(tmp);
          }
        }
        if (callback != null) {
          var tt = acontext.currentTime-start_time;
          //callback(cost, tt);
          callback(cost);
        }
      //}
    }, 1000 * options.duration)

  }
  if (options.mode == "direct") {
    meyda.start(options.featureExtractors);
    console.log("========= direct comparison mode =========");
    setInterval(function() {

      var features = meyda.get(options.featureExtractors[0]);
      if (features != null) {
        if (checkspec == true) features = specNormalization(features, options);
        buff.add(features);
      }
      buflen = buff.getCount();
      //if (buflen >= RingBufferSize) {
        cost = distCalculation(effectdata, buff, effectlen, RingBufferSize);
      //}
    }, 1000 * options.framesec)

    //cost
    repeatTimer = setInterval(function() {
      var tt =  acontext.currentTime - start_time;
      buflen = buff.getCount();
      if (buflen >= RingBufferSize) {
        if (callback != null) {
          //callback(cost, tt);
          callback(cost);
        }
      }
    }, 1000 * options.duration)
  }
}

// for direct comparison
function distCalculation(effectdata, buff, effectlen, BufferSize) {

  if (effectlen == 1) {
    var d = 0;
    for (var n = 0; n < BufferSize; n++) {
      d = d + dist.distance(buff.get(n), effectdata[0][n]);
    }

  } else {
    var d = [];
    for (var keyString in effectdata) {
      L = effectdata[keyString].length;
      var tmp = 0;
      for (var n = L - 1; n > BufferSize - L; n--) {
        tmp = tmp + dist.distance(buff.get(n), effectdata[keyString][n]);
      }
      d.push(tmp);
    }
  }
  return d;
}

var RingBuffer = function(bufferCount) {
  if (bufferCount === undefined) bufferCount = 0;
  this.buffer = new Array(bufferCount);
  this.count = 0;
};

RingBuffer.prototype = {
  add: function(data) {
    var lastIndex = (this.count % this.buffer.length);
    this.buffer[lastIndex] = data;
    this.count++;
    return (this.count <= this.buffer.length ? 0 : 1);
  },

  get: function(index) {
    if (this.buffer.length < this.count)
      index += this.count;
    index %= this.buffer.length;
    return this.buffer[index];
  },
  getCount: function() {
    return Math.min(this.buffer.length, this.count);
  }
};

function specNormalization(freq, options) {
  freq[0] = 0;
  var maxval = Math.max.apply([], freq);
  if (maxval == 0) {
    return freq;
  } else {
    for (n = 0; n < options.bufferSize; n++) {
      freq[n] = freq[n] / maxval;
    }
    for (n = 0; n < options.bufferSize; n++) {
      if (freq[n] < 0.001) freq[n] = 0;
    }
    return freq;
  }
}

module.exports = Pico;
