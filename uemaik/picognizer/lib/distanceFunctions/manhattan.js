var distance = function (x, y) {
    var manhattanDistance = 0;
    for(var i=0;i<x.length;i++){
      var difference = x[i] - y[i];
      manhattanDistance += Math.abs(difference);
    }
    return manhattanDistance;
};

module.exports = {
    distance: distance
};
