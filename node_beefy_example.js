// picognizer example for node.js with beefy

var Meyda = require("./lib/meyda.min");
var Pico = require('./picognizer');
var P = new Pico();
var option = {
  bufferSize:Math.pow(2, 10), //fft size (defalt:4096)
  windowFunc:"hamming", //
  mode:"direct",  //comparison
  feature:["powerSpectrum"],//["mfcc"],
  framesec:0.1,
  duration:1.0
};
console.log("picognizer option: " + JSON.stringify(option));
P.init(option);
P.oncost('https://rawgit.com/Fulox/FullScreenMario-JSON/master/Sounds/Sounds/mp3/Coin.mp3',function(cost){
  console.log(cost);
});
