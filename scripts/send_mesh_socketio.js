setup = function(){
  function loadScript(filename,cb){
    var script = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = filename;
    script.onload = cb;
    var firstScript = document.getElementsByTagName( 'script' )[ 0 ];
    firstScript.parentNode.insertBefore( script, firstScript );
  }
  loadScript('http://cdn.octoblu.com/js/meshblu/latest/meshblu.bundle.js',function(e){
    var para,uuid,token,suuid,server,port,debug;
    uuid="xxx";
    token="yyy";
    server="zzz.zzz.zzz.zzz";
    port="80";
    suuid="aaaaa";
    conn = meshblu.createConnection({
    	"uuid": uuid,
    	"token": token,
    	"server": server,
    	"port": port
    });
    conn.on('ready', function(data){
    	console.log('UUID AUTHENTICATED!');
    	console.log(data);
    });
  });
}
onfire = function(){
  console.log("recognized!!");
  conn.message({
    "devices": "*",
    //    "devices": "ex*",
    "payload": {
      "mesh":"2"
    }
  });
  console.log("sent.");

  document.bgColor = 'yellow';
  setTimeout(function(){
    document.bgColor = 'white';
  },500);
}
