setup = function(){
  loadScript('http://cdn.octoblu.com/js/meshblu/latest/meshblu.bundle.js',function(e){
    var para,uuid,token,suuid,server,port,debug;
    uuid=para["myuuid"];
    token=para["mutoken"];
    server=para["server"];
    port="80";
    suuid=para["suuid"];
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
