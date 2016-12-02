var distance = function (x, y) {
  var squaredEuclideanDistance = 0;
  for(var i=0;i<x.length;i++){
    var difference = x[i] - y[i];
    squaredEuclideanDistance += difference*difference;
  }
  return squaredEuclideanDistance;
};

module.exports = {
    distance: distance
};
