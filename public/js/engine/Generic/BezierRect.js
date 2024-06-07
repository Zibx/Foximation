
var findBezierRect = (function(){
  function bezierAt(p0, p1, p2, p3, t) {
    return p0 * (1 - t) * (1 - t) * (1 - t) + 3 * p1 * t * (1 - t) * (1 - t) + 3 * p2 * t * t * (1 - t) + p3 * t * t * t;
  };
  var a,b,c, D, left, right, top, bottom, out = [0, 0, 0, 0];
  var val, root, sqrt = Math.sqrt, dSqrt;
  return function(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y){

    a = 3 * p4x - 9 * p3x + 9 * p2x - 3 * p1x;
    b = 6 * p1x - 12 * p2x + 6 * p3x;
    c = 3 * p2x - 3 * p1x;

    left = p1x;
    right = p1x;

    if(a === 0){
      root = -c/b;
      val = bezierAt( p1x, p2x, p3x, p4x, root );
      if( val < left ) left = val;
      if( val > right ) right = val;
    }else {
      D = b * b - 4 * a * c;

      if( p4x < left ) left = p4x;
      if( p4x > right ) right = p4x;
      if( D >= 0 ) {
        dSqrt = sqrt(D);
        root = ( -b + dSqrt ) / ( 2 * a );
        if( root > 0 && root < 1 ) {
          val = bezierAt( p1x, p2x, p3x, p4x, root );
          if( val < left ) left = val;
          if( val > right ) right = val;
        }

        root = ( -b - dSqrt ) / ( 2 * a );
        if( root > 0 && root < 1 ) {
          val = bezierAt( p1x, p2x, p3x, p4x, root );
          if( val < left ) left = val;
          if( val > right ) right = val;
        }
      }
    }

    a = 3 * p4y - 9 * p3y + 9 * p2y - 3 * p1y;
    b = 6 * p1y - 12 * p2y + 6 * p3y;
    c = 3 * p2y - 3 * p1y;

    top = p1y;
    bottom = p1y;

    if(a === 0){
      root = -c/b;
      val = bezierAt( p1y, p2y, p3y, p4y, root );
      if( val < top ) top = val;
      if( val > bottom ) bottom = val;
    }else{
      D = b * b - 4 * a * c;
      if( p4y < top ) top = p4y;
      if( p4y > bottom ) bottom = p4y;
      if( D >= 0 ) {
        dSqrt = sqrt(D);

        root = ( -b + dSqrt ) / ( 2 * a );
        if( root > 0 && root < 1 ) {
          val = bezierAt( p1y, p2y, p3y, p4y, root );
          if( val < top ) top = val;
          if( val > bottom ) bottom = val;
        }

        root = ( -b - dSqrt ) / ( 2 * a );
        if( root > 0 && root < 1 ) {
          val = bezierAt( p1y, p2y, p3y, p4y, root );
          if( val < top ) top = val;
          if( val > bottom ) bottom = val;
        }
      }
    }
    out[0] = left;
    out[1] = top;
    out[2] = right;
    out[3] = bottom;
    return out;
  }
})();