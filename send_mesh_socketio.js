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
    uuid="239b55a2-53d7-4ab6-b4b4-04e8bc109266";
    token="f60f24c45cd37b6b37b53d533ff779f9cf05d550";
    server="210.129.18.160";
    port="80";
    suuid="239b55a2-53d7-4ab6-b4b4-04e8bc109266";
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
