setup = function(){
  // executed only once when the web page is loaded.
  console.log("initialized.");
}
onfire = function(){
  // executed for each detection.
  console.log("recognized!!");
  //alert("recognized!");
  document.bgColor = 'red';
  setTimeout(function(){
    document.bgColor = 'white';
  },1000);
}
