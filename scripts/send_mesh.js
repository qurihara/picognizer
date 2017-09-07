setup = function(){
  console.log("initialized.");
  myEndpoint=para["server"];
  myTriggerUuid = para["myuuid"];
  myTriggerToken = para["mytoken"];
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
