setup = function(){
  console.log("initialized.");
  myEndpoint="210.129.18.160";
  myTriggerUuid = "239b55a2-53d7-4ab6-b4b4-04e8bc109266";
  myTriggerToken = "f60f24c45cd37b6b37b53d533ff779f9cf05d550";
  endPointURL = 'http://'+myEndpoint + '/data/'+myTriggerUuid;
}
onfire = function(){
  console.log("recognized!!");
  $.ajax ({
      url : endPointURL,
      type : 'post',
      data : { "hello" : "world"},
      timeout : 5000,
  	headers: {
  		'meshblu_auth_uuid':  myTriggerUuid,
  		'meshblu_auth_token': myTriggerToken
  	},
    success : function ( contents ) {
  		console.log('trigger success');
    },
    error : function ( request, errorMessage ) {
          console.log('trigger : Network error');
  		    console.log('trigger  : ' + errorMessage);
    }
  });
}

// console.log("recognized!!");
// //alert("recognized!");
// document.bgColor = 'red';
// setTimeout(function(){
//   document.bgColor = 'white';
// },500);
// var conn,para,uuid,token,suuid,server,port,debug;
// uuid="239b55a2-53d7-4ab6-b4b4-04e8bc109266";
// token="f60f24c45cd37b6b37b53d533ff779f9cf05d550";
// server="210.129.18.160";
// port="80";
// suuid="239b55a2-53d7-4ab6-b4b4-04e8bc109266";
// conn = meshblu.createConnection({
// 	"uuid": uuid,
// 	"token": token,
// 	"server": server,
// 	"port": port
// });
// conn.on('ready', function(data){
// 	console.log('UUID AUTHENTICATED!');
// 	console.log(data);
// 	conn.message({
// 		"devices": "*",
// 		//    "devices": "ex*",
// 		"payload": {
// 			"mesh":"2"
// 		}
// 	});
// 	console.log("sent.");
// });
