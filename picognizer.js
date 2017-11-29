var DTW = require("./lib/dtw");
var dist = require("./lib/distanceFunctions/asymmetric.js");
var Code = require("./code.js");
require("./constants.js");

var options = {};
var audio = {};
var source = {};
var repeatTimer;
var meyda;
var effectdata;

var con = new AudioContext();
var mediaStream;
var costfunc = new Code();
var micfunc = new Code();
const sr = 48000;

options.distanceFunction = dist.distance;
var dtw = new DTW(options);

var Pico = function() {

  //for input
  var inputState = {
    "inputOn": false,
    "output": false,
    "type": null,
    "file": null
  };

  //for meyda & estimation
  options = {
    "audioContext": con,
    "source": null,
    "bufferSize": null,
    "windowingFunction": null,
    "featureExtractors": [],
    "framesec": null,
    "duration": null,
    "slice": []
  };

  this.init = function(args) {
    if (args === undefined) {
      console.log("Default parameter (bufferSize: auto, window:hamming, feature: powerSpectrum)");
    }

    if (args === undefined) {
      console.log("Default parameter");
    }

    if (args.windowFunc === undefined) {
      console.log("window:hamming");
      options.windowingFunction = "hamming";
    } else {
      options.windowingFunction = args.windowFunc;
    }

    if (args.feature === undefined) {
      console.log("feature: powerSpectrum");
      options.featureExtractors = ["powerSpectrum"];
    } else {
      options.featureExtractors = args.feature;
    }

    if (args.mode === undefined) {
      options.mode = "direct";
    } else {
      options.mode = args.mode;
    }

    if (args.inputType === undefined) {
      inputState.type = "mic";
    } else {
      inputState.type = args.inputType;
      inputState.file = args.file;
    }

    if (args.micOutput === undefined) {
      inputState.output = false;
    }

    if (args.framesec === undefined) {
      options.framesec = 0.05;
    } else {
      options.framesec = args.framesec;
    }

    if (args.duration === undefined) {
      options.duration = 1.0;
    } else {
      options.duration = args.duration;
    }

    if (args.bufferSize === undefined) {
      options.bufferSize = detectPow(options.framesec * sr);
    } else {
      options.bufferSize = args.bufferSize;
    }

    if (options.slice != undefined) {
      options.slice = args.slice;
    }

    if (options.bufferSize <= options.framesec * sr) {
      console.log("bufferSize should be a power of 2 greater than %d", options.framesec * sr);
      options.bufferSize = detectPow(options.framesec * sr);
      console.log("Set bufferSize: %d", options.bufferSize);
    }
    return;
  };

  this.oncost = function(audiofile, callback) {

    var audionum;
    var data = [];
    effectdata = {};

    //input source
    if (inputState.type === "audio" && inputState.inputOn === false) {
      var inputData = function func() {
        usingAudio(inputState);
      }
    }
    if (inputState.type === "mic") {
      var inputData = function func() {
        usingMic(inputState);
      }
    }
    micfunc.addfunc(inputData);

    if (!(audiofile instanceof Array)) {
      audionum = 1;
      loadAudio(audiofile, data, options, true);
      effectdata[0] = data;
    } else {
      audionum = audiofile.length;
      for (let n = 0; n < audionum; n++) {
        data = [];
        var key = String(n);
        if (n == audionum-1) { //last file
          loadAudio(audiofile[n], data, options, true);
        }
        else {
          loadAudio(audiofile[n], data, options, false);
        }
        effectdata[key] = data;
      }
    }

    var costcal = function func() {
      costCalculation(effectdata, options, callback);
      return true;
    }
    costfunc.addfunc(costcal);
    return;
  };

  this.stop = function() {
    console.log("Stoppped.");
    meyda.stop();
    clearInterval(repeatTimer);
    return;
  };
};

function usingAudio(inputState) {

  audio.inputsound = new Audio();
  audio.inputsound.src = inputState.file;
  audio.inputsound.crossOrigin = "anonymous";

  audio.inputsound.addEventListener('loadstart', function() {
    console.log("Audio file loaded!");
    source.input = con.createMediaElementSource(audio.inputsound);
    source.input.connect(con.destination);
    inputState.inputOn = true;
    audio.inputsound.play();
  });

  audio.inputsound.addEventListener('play', function() {
    costfunc.execfuncs();
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
      source.input = con.createMediaStreamSource(mediaStream);
      console.log("The microphone turned on.");

      if (inputState.output === true) {
        source.input.connect(con.destination);
      }

      inputState.inputOn = true;
      costfunc.execfuncs();

    },
    function(err) { //error
      alert("Error accessing the microphone.");
    }
  )
}

function loadEffectAudio(audiofile, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', audiofile, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    con.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    });
  }
  request.send();
}

//sound effect
function loadAudio(filename, data, options, flg) {

  var checkspec = checkSpectrum(options);
  var signal;
  var framesize = sr * options.framesec;

  loadEffectAudio(filename, function(buffer) {
    signal = buffer.getChannelData(0);
    let maxframe = Math.ceil(signal.length / framesize);
    let frame = 0;
    let startframe = 0;
    let endframe = startframe + framesize;
    var features;
    let pad, padtmp;

    if (options.slice != undefined) {
      if (options.slice[1] * sr >= signal.length) {
        console.log("Slice size should be smaller than %f", signal.length / sr);
        console.log("Set end of slice  to singal size");
      } else {
        var index0 = parseInt(options.slice[0] * sr);
        var index1 = parseInt(options.slice[1] * sr);
        signal = signal.slice(index0, index1);
      }
    }

    Meyda.bufferSize = options.bufferSize;

    for (let n = 0; n < maxframe; n++) {
      pad = new Array(options.bufferSize).fill(0);
      padtmp = signal.slice(startframe, endframe);
      for (let loop = 0; loop < padtmp.length; loop++) {
        pad[loop] = padtmp[loop];
      }
      features = Meyda.extract(options.featureExtractors[0], pad);
      if (checkspec === true) {
        features = specNormalization(features, options);
      }
      data.push(features);
      startframe = startframe + framesize;
      endframe = startframe + framesize;

      if (n === maxframe - 1 && flg  == true) {
        micfunc.execfuncs();
      }
    }
  });
}

//costCalculation
function costCalculation(effectdata, options, callback) {

  var RingBufferSize;
  var maxnum;
  var checkspec = checkSpectrum(options);
  var effectnum = Object.keys(effectdata).length;
  var cost;
  const silence = 0.00005;

  options.source = source.input;

  maxnum = effectdata[0].length;
  if (options.mode === "dtw") {
    RingBufferSize = parseInt(options.duration / options.framesec);
  } else {
    if (effectnum > 1) {
      for (let keyString in effectdata) {
        if (maxnum < effectdata[keyString].length)
          maxnum = effectdata[keyString].length;
      }
    }
    RingBufferSize = maxnum;
  }

  meyda = Meyda.createMeydaAnalyzer(options);

  console.log("calculating cost");

  //buffer
  var buff = new RingBuffer(RingBufferSize); //for cost calculation
  var silbuff = new RingBuffer(RingBufferSize); //for silence ditection

  clearInterval(repeatTimer);

  //　一緒にしたけど毎回判定する盤
  setInterval(function() {
    var features = meyda.get(options.featureExtractors[0]);
    silbuff.add(meyda.get("rms"));
    if (features != null) {
      if (checkspec === true) features = specNormalization(features, options);
      buff.add(features);
    }
    //if (options.mode === "direct") {
    //  cost = distCalculation(effectdata, buff, effectnum, RingBufferSize);
    //}
  }, 1000 * options.framesec)

  //cost
  repeatTimer = setInterval(function() {
    //console.time('a');
    var buflen = buff.getCount();
    if (average(silbuff.buffer) < silence) {
      cost = silenceCost(effectnum);
      callback(cost);
    } else {
      if (buflen >= RingBufferSize) {
        if (options.mode === "dtw") {
          if (effectnum === 1) {
            cost = dtw.compute(buff.buffer, effectdata[0]);
          } else {
            cost = [];
            for (let keyString in effectdata) {
              var tmp = dtw.compute(buff.buffer, effectdata[keyString]);
              cost.push(tmp);
            }
          }
        }
        else if (options.mode === "direct") {
          cost = distCalculation(effectdata, buff, effectnum, RingBufferSize);
        }
        if (callback != null) {
          callback(cost);
        }
      }
    }
    //console.timeEnd('a');
  }, 1000 * options.duration)

}

//silence Cost
function silenceCost(effectnum) {
  let d;
  if (effectnum === 1) {
    d = Infinity;
  } else {
    d = [];
    for (let keyString in effectdata) {
      d.push(Infinity);
    }
  }
  return d;
}

// for direct comparison
function distCalculation(effectdata, buff, effectnum, BufferSize) {
  if (effectnum === 1) {
    var d = 0;
    for (let n = 0; n < BufferSize; n++) {
      d = d + dist.distance(buff.get(n), effectdata[0][n]);
    }
  } else {
    var d = [];
    for (var keyString in effectdata) {
      L = effectdata[keyString].length;
      var tmp = 0;
      for (let n = L - 1; n > BufferSize - L; n--) {
        tmp = tmp + dist.distance(buff.get(n), effectdata[keyString][n]);
      }
      d.push(tmp);
    }
  }
  return d;
}

//ringBuffer
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
  let maxval = Math.max.apply([], freq);
  if (maxval === 0) {
    return freq;
  } else {
    for (let n = 0; n < options.bufferSize; n++) {
      freq[n] = freq[n] / maxval;
    }
    for (let n = 0; n < options.bufferSize; n++) {
      if (freq[n] < 0.001) freq[n] = 0;
    }
    return freq;
  }
}

function average(a) {
  return a.reduce(function(x, y) {
    if (y === a[a.length - 1]) return (x + y) / a.length;
    return x + y;
  });
}

function checkSpectrum(options) {
  if (options.featureExtractors.indexOf('powerSpectrum') != -1 || options.featureExtractors.indexOf('amplitudeSpectrum') != -1) {
    return true;
  } else {
    return false;
  }
}

function detectPow(value) {
  let n = 0;
  while (Math.pow(2, n) < value) {
    n++;
  }
  return Math.pow(2, n);
}

module.exports = picognizer;
