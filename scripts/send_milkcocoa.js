setup = function(){
  loadScript('https://cdn.mlkcca.com/v0.6.0/milkcocoa.js',function(e){
    server = para["server"];
    datastore= para["store"];
    milkcocoa = new MilkCocoa(server);
    ds = milkcocoa.dataStore(datastore);
    //for message arrival from another milkcocoa instance:
    ds.on('send', function(sended) {
      console.log('[message recieved] title: '+sended.value.title+', content: '+sended.value.content);
    });
  });
}
onfire = function(){
  console.log("recognized!!");
  document.bgColor = 'yellow';
  setTimeout(function(){
    document.bgColor = 'white';
  },1000);
}
