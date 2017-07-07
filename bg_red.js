function setup(){
  console.log("initialized.");
}
function onfire(){
  console.log("recognized!!");
  //alert("recognized!");
  document.bgColor = 'red';
  setTimeout(function(){
    document.bgColor = 'white';
  },1000);
}
