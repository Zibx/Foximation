
;(function(){
  Tween.FN = {
    degToRad: (a)=>a/180*3.14159265,
    bypass: a=>a
  };
  var pow = Math.pow,
    sin = Math.sin,
    cos = Math.cos,
    sqrt = Math.sqrt,
    PI = 3.14159265358979;

  Tween.animationFn = {
    sin: {
      easeIn: function(a){
        return 1 - cos((a * PI) / 2);
      },
      easeOut: function(a){
        return sin((a * PI) / 2);
      },
      easeInOut: function(a){
        return -(cos(PI * a) - 1) / 2;
      }
    },
    cubic: {
      easeIn: function(a){
        return a * a * a;
      },
      easeOut: function(a){
        return 1 - pow(1 - a, 3);
      }
    },
    linear: function(a){
      return a;
    }/*,
    user: {
      someShit: function(a){
        return sin(a*Math.PI*7)
      }
    }*/
  };
  Tween.randomEasing = function(from){
    from = from || Tween.animationFn;
    var vals = Object.values(from);
    var option = vals[Math.random()*vals.length|0];
    if(typeof option === 'function')
      return option;
    return Tween.randomEasing(option);
  };
  KeyFrame.prototype.easing = Tween.animationFn.sin.easeOut;

})();