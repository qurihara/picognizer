var Pico = require('./Pico');
var P = new Pico;

var cri = 20;
var offset = 0.01;
var latest_cost = 0;

function set_cri(val){
	document.getElementById("val").innerHTML = val;
	cri = val;
	log("cri: " + cri);
}
function set_cri_w_bar(val){
	document.getElementById("bar_cri").value = val;
	set_cri(val);
}

window.onload = function () {

	document.getElementById("bar_cri").onchange = function(){
		set_cri(this.value);
	};
	document.getElementById("set_button").onclick = function(){
		set_cri_w_bar((latest_cost - offset).toFixed(2));
	};
	document.getElementById("coin_button").onclick =	function(){
		new Audio('Coin.mp3').play();
	};
	document.getElementById("1up_button").onclick =	function(){
		new Audio('1up.mp3').play();
	};
	document.getElementById("field_button").onclick =	function(){
		new Audio('field.mp3').play();
	};

	// document.getElementById("load_coin_button").onclick = function(){
	// 	//local file
	// 	log("loading : Coin.mp3");
	// 	P.recognized('Coin.mp3', onrecog);
	// 	log("start recognition");
	// };
	document.getElementById("load_url_button").onclick = function(){
		////load external file
		var t = document.getElementById("text_url").value;
		log("loading :" + t);
		if (t !== null){
			P.recognized(t,onrecog);
			log("start recognition");
		}
	};
	// document.getElementById("stop_button").onclick = function(){
	// 	log("stop.");
	// 	P.stop();
	// };

	conn_init();
	P.init(); //パラメータ設定 (初期化)

	// init_recording();

	init_chart();
};

var chart;
function init_chart(){
	var lineChartData = [
		// First series
		{
			label: "Series 1",
			values: []// {time: 1370044800, y: 100}, {time: 1370044801, y: 1000}]
		},

		// The second series
		{
			label: "Series 2",
			values: []// {time: 1370044800, y: 78}, {time: 1370044801, y: 98}]
		}
	];
	chart = $('#lineChart').epoch({
		type: 'time.line',
		data: lineChartData,
		axes: ['bottom', 'left'],
		ticks: { time: 10, left: 5 },
		// windowSize: 1,
		//historySize: 1
	});
}

//
function onrecog(cost){
	var t = ((new Date()).getTime() / 1000)|0;
	var c = cost.toFixed(2);
	var cc = c;
	if (cc>100) cc = 100;
	log("coin cost: " + c);
	chart.push([
		{time: t, y: cc},
		{time: t, y: cri}
	]);
	if (c < cri){
		log("recognized.");
		send();
	}
	latest_cost = c;
}

function log(msg){
	console.log(msg);
	var log = document.getElementById("activity");
	if (log !== null){
		log.innerHTML = msg + "<br>" + log.innerHTML;
	}
}



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

//// for communication
function getUrlVars()
{
	var vars = [], max = 0, hash = "", array = "";
	var url = window.location.search;

	hash  = url.slice(1).split('&');
	max = hash.length;
	for (var i = 0; i < max; i++) {
		array = hash[i].split('=');
		vars.push(array[0]);
		vars[array[0]] = array[1];
	}
	return vars;
}

// var conn,para,uuid,token,suuid,server,port,debug;
function conn_init(){
	para = getUrlVars();
// 	uuid = para["myuuid"];
// 	token = para["mytoken"];
// 	// suuid = para["suuid"];
// 	server = para["server"];
// 	// port = para["port"];
// 	debug = para["debug"];
// 	if (uuid !== null && token !== null && server !== null){// && port !== null && suuid !== null
// //		conn = true;
// 		conn = meshblu.createConnection({
// 			"uuid": uuid,
// 			"token": token,
// 			"server": server,
// 			"port": port
// 		});
// 		conn.on('ready', function(data){
// 			console.log('UUID AUTHENTICATED!');
// 			console.log(data);
// 		});
// 	}

	var cr = Number(para["cri"]);
	if (isFinite(cr)){
		set_cri_w_bar(cr);
	}
	var src_url = para["src"];
	if (src_url !== null){
		document.getElementById("text_url").value = src_url;
	}

	var surl = para["surl"];
	if(surl !== null){
		getSubFromUrl(surl,function(){
			// log("script loaded.");
		});
	}
}

function send(){
	if (script !== ""){
		eval(script);
		log("script executed.");
	}
}

// function send(){
// 	if (conn != null){
// 		conn.message({
// 			"devices": "*",
// 			//    "devices": "ex*",
// 			"payload": {
// 				"mesh":"2"
// 			}
// 		});
// 		log("sent.");
// 	}
// }

// function send(){
// 	if (conn === true){
// 		$.ajax({
// 					type: 'POST',
// 					url: 'http://' + server + '/data/' + uuid,
// 					data: {"devices": uuid,
// 					"payload": { "mesh":"2"}
// 				},
// 					headers: {
// 						'meshblu_auth_uuid': uuid,
// 						'meshblu_auth_token': token,
// 					},
// 				});
// 		log("sent.");
// 	}
// }

// // for recording
// var audio_context;
// var recorder;
// function startUserMedia(stream)
// {
// 	var input = audio_context.createMediaStreamSource(stream);
// 	log('Media stream created.');
//
// 	recorder = new Recorder(input);
// 	log('Recorder initialised.');
// }
//
// function createDownloadLink()
// {
// 	recorder && recorder.exportWAV(function(blob) {
// 		var url = URL.createObjectURL(blob);
// 		var li = document.createElement('li');
// 		var au = document.createElement('audio');
// 		var hf = document.createElement('a');
//
// 		au.controls = true;
// 		au.src = url;
// 		hf.href = url;
// 		hf.download = new Date().toISOString() + '.wav';
// 		hf.innerHTML = hf.download;
// 		li.appendChild(au);
// 		li.appendChild(hf);
// 		recordingslist.appendChild(li);
// 		document.getElementById("text_url").value = url;
//
// 	});
// }
// function init_recording(){
// 	// for recording
// 	try
// 	{
// 		window.AudioContext = window.AudioContext || window.webkitAudioContext;
// 		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
// 		window.URL = window.URL || window.webkitURL;
//
// 		audio_context = new AudioContext;
// 		log('Audio context set up.');
// 		log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
// 	}
// 	catch (e)
// 	{
// 		alert('No web audio support in this browser!');
// 	}
//
// 	navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
// 		log('No live audio input: ' + e);
// 	});
//
// 	var b = document.getElementById("start_rec")
// 	b.onclick = function(){
// 		recorder && recorder.record();
// 		b.disabled = true;
// 		b.nextElementSibling.disabled = false;
// 		log('Recording...');
// 	};
// 	var b2 = document.getElementById("stop_rec")
// 	b2.onclick = function(){
// 		recorder && recorder.stop();
// 		b2.disabled = true;
// 		b2.previousElementSibling.disabled = false;
// 		log('Stopped recording.');
//
// 		createDownloadLink();
// 		recorder.clear();
// 	};
// }

//
function getSubFromUrl(sUrl, callback){
  var a=new XMLHttpRequest();
  a.onreadystatechange=function()
  {
    if(a.readyState==4&&a.status==200)
    {
      parseSrt(a.responseText);
      callback(false);
    }else{
      callback(true);
    }
  }
  a.open("GET",sUrl);
  a.send(null);
}
function getSubFromUrl(sUrl, callback){
  var a=new XMLHttpRequest();
  a.onreadystatechange=function()
  {
    if(a.readyState==4&&a.status==200)
    {
      parseSrt(a.responseText);
      callback(false);
    }else{
      callback(true);
    }
  }
  a.open("GET",sUrl);
  a.send(null);
}

// for script
var script = "";
function getSubFromUrl(sUrl, callback){
  var a=new XMLHttpRequest();
  a.onreadystatechange=function()
  {
    if(a.readyState==4&&a.status==200)
    {
//      parseSrt(a.responseText);
			script = a.responseText;
			log("script loaded:\n" + script);
      callback(false);
    }else{
      callback(true);
    }
  }
  a.open("GET",sUrl);
  a.send(null);
}

function loadScript(filename,cb){
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = filename;
	script.onload = cb;
	var firstScript = document.getElementsByTagName( 'script' )[ 0 ];
	firstScript.parentNode.insertBefore( script, firstScript );
}
