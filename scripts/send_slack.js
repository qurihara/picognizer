setup = function(){
  console.log("initialized.");
  msg = para["msg"];
  mytoken = para["token"];
  mychannel = "#" + para["channel"];
  myusername = para["username"];
}
onfire = function(){
  console.log("recognized!!");
  document.bgColor = 'red';
  setTimeout(function(){
    document.bgColor = 'white';
  },1000);
  var url = "https://slack.com/api/chat.postMessage";
  var data = {
    token: mytoken,
    channel: mychannel,
    username: myusername,
    text: msg
  };

  $.ajax({
    type: "GET",
    url: url,
    data: data
  });
}
