(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":3,"_process":1}],3:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":4}],4:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],5:[function(require,module,exports){
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

var Pico = function() {

    options = {
        "audioContext": acontext, // required
        "source": null, // required
        "bufferSize": null, // required
        "windowingFunction": null,
        "featureExtractors": []
    };
    var micstate = {
        "micon": false,
        "output": false
    };

    this.init = function(args) {
        if (args.length < 1) {
            console.log("Default parameter (bufferSize: 2048, featureExtractors: powerSpectrum)");
        }
        if (args.bufferSize === undefined) options.bufferSize = Math.pow(2, 11);
        else options.bufferSize = args.bufferSize;
        if (args.windowingFunction === undefined) options.windowingFunction = "hamming";
        else options.windowingFunction = args.windowingFunction;
        if (args.featureExtractors === undefined) options.featureExtractors = ["powerSpectrum"];
        else options.featureExtractors = args.featureExtractors;
        if (args.mode === undefined) options.mode = "dtw";
        else options.mode = args.mode;
        if (args.micOutput === undefined) micstate.output = false;
    }

    this.recognized = function(audiofile, callback) {

        var duration = 1.0; //seconds
        var audionum;
        var data = [];
        var effectdata = {};
        //複数を判定
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

        //mic
        if (micstate.micon == false) {
            usingMic(micstate);
        }

        var costcal = function func() {
            costCalculation(effectdata, options, duration, callback);
            return true;
        }
        c.addfunc(costcal);
        return;
    }

    this.stop = function() {
        state.recog = false;
        console.log("Stoppped.");
        window.clearInterval();
        return;
    }
};

//microphone
function usingMic(micstate) {
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
            audio.mic = new Audio();
            audio.mic.src = mediaStream;
            source.mic = acontext.createMediaStreamSource(mediaStream);
            console.log("The microphone turned on.");
            if (micstate.output == true) source.mic.connect(acontext.destination);
            micstate.micon = true;
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

//sound effect
function loadAudio(filename, data, options) {
    audio.soundeffect = new Audio();
    audio.soundeffect.src = filename;
    audio.soundeffect.crossOrigin = "anonymous";
    source.soundeffect = acontext.createMediaElementSource(audio.soundeffect);
    options.source = source.soundeffect;

    var framesec = 0.1;
    var repeatTimer;
    var featurename = options.featureExtractors[0];
    console.log("Please wait until calculation of spectrogram is over.");

    var meyda = Meyda.createMeydaAnalyzer(options);
    audio.soundeffect.play();
    meyda.start(featurename);

    var checkspec = checkSpectrum(options);

    audio.soundeffect.addEventListener('playing', function() {
        repeatTimer = setInterval(function() {
            var features = meyda.get(featurename);
            if (features != null) {
                if (checkspec == true) features = specNormalization(features, options);
                //features = features.slice(0, parseInt(options.bufferSize / 2));
                data.push(features);
            }
            //if
        }, 1000 * framesec)
    });

    audio.soundeffect.addEventListener('ended', function() {
        meyda.stop();
        clearInterval(repeatTimer);
    });

}

//for dtw
function costCalculation(effectdata, options, duration, callback) {
    var framesec = 0.1;
    var RingBufferSize;
    var maxnum;

    if (duration < options.bufferSize / acontext.sampleRate) {
        throw new Error("bufferSize should be smaller than duration.");
    }

    audio.mic.play();
    options.source = source.mic;
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

    var meyda = Meyda.createMeydaAnalyzer(options);
    console.log("calculating cost");
    meyda.start(options.featureExtractors);

    //buffer
    var buff = new RingBuffer(RingBufferSize);
    ///////DTW
    if (options.mode == "dtw") {
        console.log("========= dtw mode =========");
        setInterval(function() {
            var features = meyda.get(options.featureExtractors[0]);
            if (checkspec == true) features = specNormalization(features, options);
            //features = features.slice(0, parseInt(options.bufferSize / 2));
            if (features != null) buff.add(features);
        }, 1000 * framesec)

        //cost
        setInterval(function() {
            var buflen = buff.getCount();
            if (buflen < RingBufferSize) {
                console.log('Now buffering');
            } else {
                if (effectlen == 1) {
                    var cost = dtw.compute(buff.buffer, effectdata[0]);
                } else {
                    var cost = [];
                    for (var keyString in effectdata) {
                        var tmp = dtw.compute(buff.buffer, effectdata[keyString]);
                        cost.push(tmp);
                    }
                }
                if (callback != null) callback(cost);
            }
        }, 1000 * duration)

    }
    if (options.mode == "direct") {
        console.log("========= direct comparison mode =========");

        setInterval(function() {
            var features = meyda.get(options.featureExtractors[0]);
            if (checkspec == true) {
                features = specNormalization(features, options);
                //features = features.slice(0, parseInt(options.bufferSize / 2)); ///1/2を取り出す
            }
            if (features != null) buff.add(features);
            buflen = buff.getCount();
            if (buflen >= RingBufferSize) {
                cost = distCalculation(effectdata, buff, effectlen, RingBufferSize);
            }

        }, 1000 * framesec)

        //cost
        setInterval(function() {
            buflen = buff.getCount();
            if (buflen >= RingBufferSize) {
                //var cost = distCalculation(effectdata, buff, effectlen, RingBufferSize);
                if (callback != null) callback(cost);
            }
        }, 1000 * duration)
    }

}

// for direct comparison
function distCalculation(effectdata, buff, effectlen, BufferSize) {

    if (effectlen == 1) {
        var d = 0;
        for (var n = 0; n < BufferSize; n++) {
            d = d + dist.distance(buff.get(n), effectdata[0][n]);
        }
        //d = d/BufferSize; //1フレーム平均
    } else {
        var d = [];
        for (var keyString in effectdata) {
            L = effectdata[keyString].length;
            var tmp = 0;
            for (var n = L - 1; n > BufferSize - L; n--) {
                tmp = tmp + dist.distance(buff.get(n), effectdata[keyString][n]);
            }
            // tmp = tmp/L; //1フレーム平均
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
    var maxval = Math.max.apply([], freq);
    if (maxval == 0) {
        return freq;
    } else {
        for (n = 0; n < options.bufferSize; n++) {
            freq[n] = freq[n] / maxval;
        }
        for (n = 0; n < options.bufferSize; n++) {
            if (freq[n] < 0.01) freq[n] = 0;
        }
        return freq;
    }
}

module.exports = Pico;

},{"./code.js":6,"./constants.js":7,"./lib/distanceFunctions/asymmetric.js":10,"./lib/dtw":14}],6:[function(require,module,exports){
var Code = function () {
  var funcs = {};

  this.execfuncs = function(){
    for (var key in funcs) {
      console.log("executing " + key);
      var do_again = false;
      try{
        do_again = funcs[key]();
      }
      catch(e){
        console.log("execfuncs error. deleting this function: " + e);
      }
      if (do_again === false){
        this.delfunc(key);
      }
    }
  }

  this.addfunc_by_str = function(str){
    try{
      eval(str);
      this.addfunc(func);
    }
    catch(e){
      console.log("addfunc_by_str error: " + e);
    }
  }

  this.addfunc = function(f){
    try{
      funcs[f.name] = f;
    }
    catch(e){
      console.log("addfunc error: " + e);
    }
  }

  this.delfunc = function(f_name){
    try{
      delete funcs[f_name];
    }
    catch(e){
      console.log("dellfunc error: " + e);
    }
  }

  this.listcode = function(){
    for (var key in funcs) {
      console.log(key);
    }
  }
}

module.exports = Code;

// test

// var m = "code:\nvar a = 1;<eof>".match(/^code:([\s\S]*)<eof>/);
// console.log(m[0]);
// console.log(m[1]);

// 
// var f1 = function func1(){
//   console.log("hello");
//   return true;
// }
//
// var f2 = function func2(){
//   console.log("world");
//   return false;
// }
//
// var str = 'var func = function func3(){console.log("eval");return false;}';
// var str2 = 'var func = function func4(){console.log("eval2");return truse;}';
//
// var c = new Code();
// c.addfunc(f1);
// c.addfunc(f2);
// c.addfunc_by_str(str);
// c.addfunc_by_str(str2);
// c.listcode();
// console.log("[frist trial]");
// c.execfuncs();
// c.listcode();
// console.log("[second trial]");
// c.execfuncs();

},{}],7:[function(require,module,exports){
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var URL = window.URL || window.webkitURL;
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;

var mediaC = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': false
  }
};

},{}],8:[function(require,module,exports){
var Pico = require('./Pico');
var P = new Pico;

window.onload = function () {

	option = {
		bufferSize:Math.pow(2, 10), //fft size
		mode:"direct" //comparison
	};
	P.init(option); //パラメータ設定 (初期化)

	/*
	//check ローカル1音: OK
	P.recognized('1up.mp3', function(cost){
		console.log("gainlife cost: " + cost.toFixed(2));
	});
	*/


	//check ローカル2音: OK
	/*var audiofile = ['Coin.mp3', '1up.mp3'];
	P.recognized(audiofile, function(cost){
		console.log("coin cost: " + cost[0].toFixed(2));
		console.log("gainlife cost: " + cost[1].toFixed(2));
	});
	*/

	//check web 1音:
	P.recognized('https://picog.azurewebsites.net/Coin.mp3', function(cost){
		console.log("coin cost: " + cost.toFixed(2));
	});
	//var audiofile = ['Coin.mp3', 'http://jsrun.it/assets/A/Q/q/J/AQqJ4.mp3'];

};

document.onkeydown = function (e){
	if(!e) e = window.event;

	/////space key
	if(e.keyCode == 32){
		P.stop();
	}
	/////enter key
	else if(e.keyCode == 13){

	}
};

},{"./Pico":5}],9:[function(require,module,exports){
var EPSILON = 2.2204460492503130808472633361816E-16;

var nearlyEqual = function (i, j, epsilon) {
    var iAbsolute= Math.abs(i);
    var jAbsolute = Math.abs(j);
    var difference = Math.abs(i - j);
    var equal = i === j;
    if (!equal) {
        equal = difference < EPSILON;
        if (!equal) {
            equal = difference <= Math.max(iAbsolute, jAbsolute) * epsilon;
        }
    }

    return equal;
};

module.exports = {
    EPSILON: EPSILON,
    nearlyEqual: nearlyEqual
};
},{}],10:[function(require,module,exports){
var distance = function(x,y){
      var squaredEuclideanDistance = 0;
      for(var i=0;i<x.length;i++){
        var x2 = Math.min(x[i],y[i]);
        var difference = x2 - y[i];
        squaredEuclideanDistance += difference*difference;
      }
      return Math.sqrt(squaredEuclideanDistance);
  };

module.exports = {
    distance: distance
};
},{}],11:[function(require,module,exports){
var distance = function (x, y) {
    var squaredEuclideanDistance = 0;
    for(var i=0;i<x.length;i++){
      var difference = x[i] - y[i];
      squaredEuclideanDistance += difference*difference;
    }
    return Math.sqrt(squaredEuclideanDistance);
};

module.exports = {
    distance: distance
};

},{}],12:[function(require,module,exports){
var distance = function (x, y) {
    var manhattanDistance = 0;
    for(var i=0;i<x.length;i++){
      var difference = x[i] - y[i];
      manhattanDistance += Math.abs(difference);
    }
    return manhattanDistance;
};

module.exports = {
    distance: distance
};

},{}],13:[function(require,module,exports){
var distance = function (x, y) {
  var squaredEuclideanDistance = 0;
  for(var i=0;i<x.length;i++){
    var difference = x[i] - y[i];
    squaredEuclideanDistance += difference*difference;
  }
  return squaredEuclideanDistance;
};

module.exports = {
    distance: distance
};

},{}],14:[function(require,module,exports){
/**
 * @title DTW API
 * @author Elmar Langholz
 */

var debug = require('debug')('dtw');
var validate = require('./validate');
var matrix = require('./matrix');
var comparison = require('./comparison');

function validateOptions(options) {
    if (typeof options !== 'object') {
        throw new TypeError('Invalid options type: expected an object');
    } else if (typeof options.distanceMetric !== 'string' && typeof options.distanceFunction !== 'function') {
        throw new TypeError('Invalid distance types: expected a string distance type or a distance function');
    } else if (typeof options.distanceMetric === 'string' && typeof options.distanceFunction === 'function') {
        throw new Error('Invalid parameters: provide either a distance metric or function but not both');
    }

    if (typeof options.distanceMetric === 'string') {
        var normalizedDistanceMetric = options.distanceMetric.toLowerCase();
        if (normalizedDistanceMetric !== 'manhattan' && normalizedDistanceMetric !== 'euclidean'
            && normalizedDistanceMetric !== 'squaredeuclidean') {
            throw new Error('Invalid parameter value: Unknown distance metric \'' + options.distanceMetric + '\'');
        }
    }
}

function retrieveDistanceFunction(distanceMetric) {
    var normalizedDistanceMetric = distanceMetric.toLowerCase();
    var distanceFunction = null;
    if (normalizedDistanceMetric === 'manhattan') {
        distanceFunction = require('./distanceFunctions/manhattan').distance;
    } else if (normalizedDistanceMetric === 'euclidean') {
        distanceFunction = require('./distanceFunctions/euclidean').distance;
    } else if (normalizedDistanceMetric === 'squaredeuclidean') {
        distanceFunction = require('./distanceFunctions/squaredEuclidean').distance;
    }

    return distanceFunction;
}

/**
 * Create a DTWOptions object
 * @class DTWOptions
 * @member {string} distanceMetric The distance metric to use: `'manhattan' | 'euclidean' | 'squaredEuclidean'`.
 * @member {function} distanceFunction The distance function to use. The function should accept two numeric arguments and return the numeric distance. e.g. function (a, b) { return a + b; }
 */

/**
 * Create a DTW object
 * @class DTW
 */
/**
 * Initializes a new instance of the `DTW`. If no options are provided the squared euclidean distance function is used.
 * @function DTW
 * @param {DTWOptions} [options] The options to initialize the dynamic time warping instance with.
 */
/**
 * Computes the optimal match between two provided sequences.
 * @method compute
 * @param {number[]} firstSequence The first sequence.
 * @param {number[]} secondSequence The second sequence.
 * @param {number} [window] The window parameter (for the locality constraint) to use.
 * @returns {number} The similarity between the provided temporal sequences.
 */
/**
 * Retrieves the optimal match between two provided sequences.
 * @method path
 * @returns {number[]} The array containing the optimal path points.
 */
var DTW = function (options) {
    var state = { distanceCostMatrix: null };
    if (typeof options === 'undefined') {
        state.distance = require('./distanceFunctions/squaredEuclidean').distance;
    } else {
        validateOptions(options);
        if (typeof options.distanceMetric === 'string') {
            state.distance = retrieveDistanceFunction(options.distanceMetric);
        } else if (typeof options.distanceFunction === 'function') {
            state.distance = options.distanceFunction;
        }
    }

    this.compute = function (firstSequence, secondSequence, window) {
        var cost = Number.POSITIVE_INFINITY;
        if (typeof window === 'undefined') {
            cost = computeOptimalPath(firstSequence, secondSequence, state);
        } else if (typeof window === 'number') {
            cost = computeOptimalPathWithWindow(firstSequence, secondSequence, window, state);
        } else {
            throw new TypeError('Invalid window parameter type: expected a number');
        }

        return cost;
    };

    this.path = function () {
        var path = null;
        if (state.distanceCostMatrix instanceof Array) {
            path = retrieveOptimalPath(state);
        }

        return path;
    };
};

function validateComputeParameters(s, t) {
    validate.sequence(s, 'firstSequence');
    validate.sequence(t, 'secondSequence');
}

function computeOptimalPath(s, t, state) {
    debug('> computeOptimalPath');
    validateComputeParameters(s, t);
    var start = new Date().getTime();
    state.m = s.length;
    state.n = t.length;
    var distanceCostMatrix = matrix.create(state.m, state.n, Number.POSITIVE_INFINITY);

    distanceCostMatrix[0][0] = state.distance(s[0], t[0]);

    for (var rowIndex = 1; rowIndex < state.m; rowIndex++) {
        var cost = state.distance(s[rowIndex], t[0]);
        distanceCostMatrix[rowIndex][0] = cost + distanceCostMatrix[rowIndex - 1][0];
    }

    for (var columnIndex = 1; columnIndex < state.n; columnIndex++) {
        var cost = state.distance(s[0], t[columnIndex]);
        distanceCostMatrix[0][columnIndex] = cost + distanceCostMatrix[0][columnIndex - 1];
    }

    for (var rowIndex = 1; rowIndex < state.m; rowIndex++) {
        for (var columnIndex = 1; columnIndex < state.n; columnIndex++) {
            var cost = state.distance(s[rowIndex], t[columnIndex]);
            distanceCostMatrix[rowIndex][columnIndex] =
                cost + Math.min(
                    distanceCostMatrix[rowIndex - 1][columnIndex],          // Insertion
                    distanceCostMatrix[rowIndex][columnIndex - 1],          // Deletion
                    distanceCostMatrix[rowIndex - 1][columnIndex - 1]);     // Match
        }
    }

    var end = new Date().getTime();
    var time = end - start;
    debug('< computeOptimalPath (' + time + ' ms)');
    state.distanceCostMatrix = distanceCostMatrix;
    state.similarity = distanceCostMatrix[state.m - 1][state.n - 1];
    return state.similarity;
}

function computeOptimalPathWithWindow(s, t, w, state) {
    debug('> computeOptimalPathWithWindow');
    validateComputeParameters(s, t);
    var start = new Date().getTime();
    state.m = s.length;
    state.n = t.length;
    var window = Math.max(w, Math.abs(s.length - t.length));
    var distanceCostMatrix = matrix.create(state.m + 1, state.n + 1, Number.POSITIVE_INFINITY);
    distanceCostMatrix[0][0] = 0;

    for (var rowIndex = 1; rowIndex <= state.m; rowIndex++) {
        for (var columnIndex = Math.max(1, rowIndex - window); columnIndex <= Math.min(state.n, rowIndex + window); columnIndex++) {
            var cost = state.distance(s[rowIndex - 1], t[columnIndex - 1]);
            distanceCostMatrix[rowIndex][columnIndex] =
                cost + Math.min(
                distanceCostMatrix[rowIndex - 1][columnIndex],          // Insertion
                distanceCostMatrix[rowIndex][columnIndex - 1],          // Deletion
                distanceCostMatrix[rowIndex - 1][columnIndex - 1]);     // Match
        }
    }

    var end = new Date().getTime();
    var time = end - start;
    debug('< computeOptimalPathWithWindow (' + time + ' ms)');
    distanceCostMatrix.shift();
    distanceCostMatrix = distanceCostMatrix.map(function (row) {
        return row.slice(1, row.length);
    });
    state.distanceCostMatrix = distanceCostMatrix;
    state.similarity = distanceCostMatrix[state.m - 1][state.n - 1];
    return state.similarity;
}

function retrieveOptimalPath(state) {
    debug('> retrieveOptimalPath');
    var start = new Date().getTime();

    var rowIndex = state.m - 1;
    var columnIndex = state.n - 1;
    var path = [[rowIndex, columnIndex]];
    var epsilon = 1e-14;
    while ((rowIndex > 0) || (columnIndex > 0)) {
        if ((rowIndex > 0) && (columnIndex > 0)) {
            var min = Math.min(
                state.distanceCostMatrix[rowIndex - 1][columnIndex],          // Insertion
                state.distanceCostMatrix[rowIndex][columnIndex - 1],          // Deletion
                state.distanceCostMatrix[rowIndex - 1][columnIndex - 1]);     // Match
            if (comparison.nearlyEqual(min, state.distanceCostMatrix[rowIndex - 1][columnIndex - 1], epsilon)) {
                rowIndex--;
                columnIndex--;
            } else if (comparison.nearlyEqual(min, state.distanceCostMatrix[rowIndex - 1][columnIndex], epsilon)) {
                rowIndex--;
            } else if (comparison.nearlyEqual(min, state.distanceCostMatrix[rowIndex][columnIndex - 1], epsilon)) {
                columnIndex--;
            }
        } else if ((rowIndex > 0) && (columnIndex === 0)) {
            rowIndex--;
        } else if ((rowIndex === 0) && (columnIndex > 0)) {
            columnIndex--;
        }

        path.push([rowIndex, columnIndex]);
    }

    var end = new Date().getTime();
    var time = end - start;
    debug('< retrieveOptimalPath (' + time + ' ms)');
    return path.reverse();
}

module.exports = DTW;

},{"./comparison":9,"./distanceFunctions/euclidean":11,"./distanceFunctions/manhattan":12,"./distanceFunctions/squaredEuclidean":13,"./matrix":15,"./validate":16,"debug":2}],15:[function(require,module,exports){
var createArray = function (length, value) {
    if (typeof length !== 'number') {
        throw new TypeError('Invalid length type');
    }

    if (typeof value === 'undefined') {
        throw new Error('Invalid value: expected a value to be provided');
    }

    var array = new Array(length);
    for (var index = 0; index < length; index++) {
        array[index] = value;
    }

    return array;
};

var createMatrix = function (m, n, value) {
    var matrix = [];
    for (var rowIndex = 0; rowIndex < m; rowIndex++) {
        matrix.push(createArray(n, value));
    }

    return matrix;
};

module.exports = {
    create: createMatrix
};

},{}],16:[function(require,module,exports){
function validateSequence(sequence, sequenceParameterName) {
    if (!(sequence instanceof Array)) {
        throw new TypeError('Invalid sequence \'' + sequenceParameterName + '\' type: expected an array');
    }

    if (sequence.length < 1) {
        throw new Error('Invalid number of sequence data points for \'' + sequenceParameterName + '\': expected at least one');
    }

    if (!(sequence instanceof Array) || typeof sequence[0][0] !== 'number') {
        throw new TypeError('Invalid data points types for sequence \'' + sequenceParameterName + '\': expected an array of number');
    }
}

module.exports = {
    sequence: validateSequence
};

},{}]},{},[8]);
