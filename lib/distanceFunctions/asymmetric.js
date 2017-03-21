var distance = function(x,y){
      var squaredEuclideanDistance = 0;
      for(var i=0;i<x.length;i++){
        var x2 = Math.min(x[i],y[i]);
        var difference = x2 - y[i];
        squaredEuclideanDistance += difference*difference;
      }
      return Math.sqrt(squaredEuclideanDistance);
  };

module.exports = {
    distance: distance
};