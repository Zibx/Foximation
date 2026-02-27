var Bezier = function(A,B,C,D){
  this.A = A;
  this.B = B;
  this.C = C;
  this.D = D;
};
Bezier.prototype = {
  length: (function() {
    var T = [
      -0.0640568928626056260850430826247450385909,
      0.0640568928626056260850430826247450385909,
      -0.1911188674736163091586398207570696318404,
      0.1911188674736163091586398207570696318404,
      -0.3150426796961633743867932913198102407864,
      0.3150426796961633743867932913198102407864,
      -0.4337935076260451384870842319133497124524,
      0.4337935076260451384870842319133497124524,
      -0.5454214713888395356583756172183723700107,
      0.5454214713888395356583756172183723700107,
      -0.6480936519369755692524957869107476266696,
      0.6480936519369755692524957869107476266696,
      -0.7401241915785543642438281030999784255232,
      0.7401241915785543642438281030999784255232,
      -0.8200019859739029219539498726697452080761,
      0.8200019859739029219539498726697452080761,
      -0.8864155270044010342131543419821967550873,
      0.8864155270044010342131543419821967550873,
      -0.9382745520027327585236490017087214496548,
      0.9382745520027327585236490017087214496548,
      -0.9747285559713094981983919930081690617411,
      0.9747285559713094981983919930081690617411,
      -0.9951872199970213601799974097007368118745,
      0.9951872199970213601799974097007368118745,
    ];
    var C = [
      0.1279381953467521569740561652246953718517,
      0.1279381953467521569740561652246953718517,
      0.1258374563468282961213753825111836887264,
      0.1258374563468282961213753825111836887264,
      0.121670472927803391204463153476262425607,
      0.121670472927803391204463153476262425607,
      0.1155056680537256013533444839067835598622,
      0.1155056680537256013533444839067835598622,
      0.1074442701159656347825773424466062227946,
      0.1074442701159656347825773424466062227946,
      0.0976186521041138882698806644642471544279,
      0.0976186521041138882698806644642471544279,
      0.086190161531953275917185202983742667185,
      0.086190161531953275917185202983742667185,
      0.0733464814110803057340336152531165181193,
      0.0733464814110803057340336152531165181193,
      0.0592985849154367807463677585001085845412,
      0.0592985849154367807463677585001085845412,
      0.0442774388174198061686027482113382288593,
      0.0442774388174198061686027482113382288593,
      0.0285313886289336631813078159518782864491,
      0.0285313886289336631813078159518782864491,
      0.0123412297999871995468056670700372915759,
      0.0123412297999871995468056670700372915759,
    ];
    var SEGMENTS = 24;
    var z = 0.5, sum;
    var t, i;
    return function() {
      z = 0.5;
      this._derivativePrepare(this.A, this.B, this.C, this.D);
      sum = 0;
      for( i = 0; i < SEGMENTS; i++ ) {
        t = z*T[i]+z;
        sum += C[i]*this._derivativeCompute(t);
      }
      return z*sum;
    }
  })(),
  calculate: (function(){
    var p = new Point(), rest,rest2, a,b,c,d, t2;
    return function(t){

      if(t <= 0) {
        p.x = this.A.x;
        p.y = this.A.y;
        return p;
      }

      if(t >= 1) {
        p.x = this.D.x;
        p.y = this.D.y;
        return p;
      }

      rest = 1-t;
      rest2 = rest*rest;
      t2 = t*t;
      a=rest2*rest;
      b=rest2*t*3;
      c=rest*t2*3;
      d=t*t2;
      p.x = a*this.A.x + b*this.B.x+c*this.C.x + d*this.D.x;
      p.y = a*this.A.y + b*this.B.y+c*this.C.y + d*this.D.y;

      return p;
    };
  })(),
  moveToPoint: function(t, point){
    if(t <= 0){
      this.A.x = point.x;
      this.A.y = point.y;
      return;
    }
    if(t >= 1){
      this.D.x = point.x;
      this.D.y = point.y;
      return;
    }
    var coeff = 0.7;
    var B = this.B, C = this.C;

    var e2 = this.calculate( t );


    var dx = point.x - e2.x;
    var dy = point.y - e2.y;

    B.x += dx*(1/(t))*coeff;
    C.x +=  dx*(1/(1-t))*coeff;

    B.y +=  dy*(1/(t))*coeff;
    C.y +=  dy*(1/(1-t))*coeff;

/*    if(isNaN(B.x) || isNaN(C.x) || isNaN(B.y) || isNaN(C.y))
      debugger*/

// console.clear()
    var log = []
    for(var i = 0; i < 10; i++) {
      //coeff *= 1.11;
      var e2 = this.calculate( t );

      var dx2 = point.x - e2.x;
      var dy2 = point.y - e2.y;

      B.x += dx2 * ( 1 / ( t ) ) * coeff;
      C.x += dx2 * ( 1 / ( t ) ) * coeff;
      B.y += dy2 * ( 1 / ( t ) ) * coeff;
      C.y += dy2 * ( 1 / ( t ) ) * coeff;
      /*if(isNaN(B.x) || isNaN(C.x) || isNaN(B.y) || isNaN(C.y))
        debugger*/
      log.push(`${i} delta: ${this.calculate( t ).distance(point).toFixed(5)}`);
      
    }
  },
  updateLUT: (function(){
    var POINTS = 100*2,
        POINTS2 = POINTS*2;
    var lut = new Array(POINTS2);
    var lutStr = '', str, t, p, pointer;

    for(var i = 0; i < POINTS2; i++)
      lut[i] = 0;

    return function(){
      str = this.A.toString()+' '+this.B.toString()+' '+this.C.toString()+' '+this.D.toString();
      if(lutStr === str)
        return lut;

      lutStr = str;
      pointer = 0;
      for(i = 0; i<POINTS; i++){
        t = i / (POINTS - 1);

        p = this.calculate(t);
        lut[pointer++] = p.x;
        lut[pointer++] = p.y;
        p.t = t;
      }
      return lut;
    }
  })(),
  closest: function(p){
    var LUT = this.updateLUT(),
      l = LUT.length - 1;
    var dx = p.x-LUT[0];
    var dy = p.y-LUT[1],
        distance = dx*dx+dy*dy;

    var closest = 0, closestDistance = dx*dx+dy*dy;
    for(var i = 2,_i = LUT.length; i < _i; i+=2){
      dx = p.x-LUT[i];
      dy = p.y-LUT[i+1],
      distance = dx*dx+dy*dy;
      if(distance<closestDistance){
        closest = i/2;
        closestDistance = distance;
      }
    }

      var t1 = (closest - 1) / (_i/2),
      t2 = (closest + 1) / (_i/2),
      step = 0.1 / (_i/2);

    // step 2: fine check
    var mdist = closestDistance,
      t = t1,
      ft = t,
      p2;

    mdist += 1;
    for (var d; t < t2 + step; t += step) {
      p2 = this.calculate(t);
      dx = p.x-p2.x;
      dy = p.y-p2.y,
      distance = dx*dx+dy*dy;

      if (distance < mdist) {
        mdist = distance;
        ft = t;
      }
    }

    ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
    p = this.calculate(ft);

    p.t = ft;
    p.d = Math.sqrt(mdist);
    return p;
  },
  clone: function(){
      return new Bezier(this.A.clone(), this.B.clone(), this.C.clone(), this.D.clone());
  },
  draw: function(ctx, armature){
    var A = this.A, B = this.B, C = this.C, D = this.D;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.bezierCurveTo(B.x, B.y, C.x, C.y, D.x, D.y)
    ctx.stroke();

    if(armature){
      var circle = function(p){
        var current = p.distance(mouse)<7;
        ctx.strokeStyle = current ? '#b00fc0' : '#751010';
        ctx.lineWidth = current ? 3 : 1;
        ctx.beginPath();
        ctx.arc(p.x,p.y,4,0, 6.28);
        ctx.closePath()
        ctx.stroke();
      };
      var line = function(A, B){
        ctx.beginPath();
        ctx.moveTo(A.x,A.y);
        ctx.lineTo(B.x,B.y)
        ctx.stroke();
      };
      line(A,B);
      line(C,D);
      [this.A,this.B,this.C,this.D].forEach(circle);
      'A,B,C,D'.split(',').forEach((n)=>
        ctx.fillText(n, this[n].x, this[n].y-10)
      );

    }
  },
  split: (function(){
    var A, B, C, D,
      AB = new Point(),
      BC= new Point(),
      CD= new Point(),
      AB_BC= new Point(),
      BC_CD= new Point(),
      M = new Point();
    return function(t){
      A = this.A, B = this.B, C = this.C, D = this.D;
      AB.borrow(A.lerp(B, t));
      BC.borrow(B.lerp(C, t));
      CD.borrow(C.lerp(D, t));
      AB_BC.borrow(AB.lerp(BC, t));
      BC_CD.borrow(BC.lerp(CD, t));
      M.borrow(AB_BC.lerp(BC_CD, t));
      return [
        new Bezier(A, AB, AB_BC, M).clone(),
        new Bezier(M, BC_CD, CD, D).clone()
      ];
    }
  })(),
  split2: function(t1, t2){
    var tmp;
    if(t2<t1){
      tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    var splits1 = this.split(t1);
    var splits2 = splits1[1].split(t2);
    return [splits1[0], splits2[0], splits2[1]]
  },
  getExtremePoints: function(){

    var A = this.A, B = this.B, C = this.C, D = this.D;
    var derivative = this._derivativePrepare(A,B,C,D);
    A = new Point(derivative[0], derivative[1]);
    B = new Point(derivative[2], derivative[3]);
    C = new Point(derivative[4], derivative[5]);
    var a = 3*(A.y*B.x-A.x*B.y),
        b = 3*(A.y*C.x-A.x*C.y),
        c = B.y*C.x-B.x*C.y;
    if(a === 0){
      console.log('a=0');
      return [];

    }else{
      var d = b*b-4*a*c;
      var dSqrt = Math.sqrt(d);
      if(dSqrt<0){
        console.log('D<0');
        return [];
      }else {
        var x1 = (-b + dSqrt) / ( 2 * a );
        var x2 = (-b - dSqrt) / ( 2 * a );
        console.log({x1,x2})
        var out = [this.calculate(x1).clone(),this.calculate(x2).clone()]
        console.log(out[0],out[1])
        return out
      }
    }
  },
  normal: (function(){
    var out = new Point();
    return function(t){
      this.calculate(t-0.001);
      out.borrow(this.calculate(t-0.001));
      out.sub(this.calculate(t+0.001));
      out.rotate(-Math.PI / 2);
      out.normalize();
      return out;
      this.calculate(t);
      this._derivativePrepare(this.A, this.B, this.C, this.D);
      var derivative = this._derivativeCompute(t, true);
      var q = Math.sqrt(derivative.x * derivative.x + derivative.y + derivative.y);
      out.x = -derivative.y/q;
      out.y = derivative.x/q;
      out.normalize()
      return out;
    };
  })()
};

(function(){
  var dx, dy;
  var dPoints = [0,0,0,0,0,0];
  var derivativePrepare = function(A,B,C,D){
    dPoints = [
      3*(B.x-A.x), 3*(B.y - A.y),
      3*(C.x-B.x), 3*(C.y-B.y),
      3*(D.x - C.x), 3*(D.y - C.y)
    ];
    return dPoints;
  };
  var t2, mt, mt2,mt3, sqrt = Math.sqrt, derivative = new Point();
  var compute = function(t, deltas){
    if (t === 0) {
      derivative.x = dPoints[0];
      derivative.y = dPoints[1];
      return derivative;
    }
    t2 = t*t;
    mt = 1-t;
    mt2 = mt*mt;
    mt3 = mt*t*2;
    dx = dPoints[0]*mt2 + dPoints[2]*mt3 + dPoints[4]*t2;
    dy = dPoints[1]*mt2 + dPoints[3]*mt3 + dPoints[5]*t2;
    if(deltas){
      derivative.x = dx;
      derivative.y = dy;
      return derivative;
    }
    return sqrt(dx*dx+dy*dy)
  };

    Bezier.prototype._derivativePrepare = derivativePrepare;
    Bezier.prototype._derivativeCompute = compute;
})();