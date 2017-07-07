setup = function(){
  console.log("initialized.");
}
onfire = function(){
  console.log("recognized!!");
  //alert("recognized!");
  document.bgColor = 'red';
  setTimeout(function(){
    document.bgColor = 'white';
  },1000);
}
