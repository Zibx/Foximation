var sqrt = Math.sqrt;
var abs = Math.abs || function(n){return n>0 ? n: -n}
var Point = function( x, y ){
    if(arguments.length === 0){
        x = 0;
        y = 0;
    }
    if(x instanceof Point || x.hasOwnProperty('x')) {
        y = x.y;
        x = x.x;
    }
    this.x = x;
    this.y = y;
};

Point.prototype = {
    add: null, addClone: null,
    sub: null, subClone: null,
    mul: null, mulClone: null,
    div: null, divClone: null,
    mod: null, modClone: null,

    passable: true,
    borrow: function(from) {
        this.x = from.x;
        this.y = from.y;
        return this;
    },
    join: function(symbol) {
        return this.x+symbol+this.y;
    },
    set: function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    },
    minXY: function(){
      return this.x<this.y?this.x:this.y;
    },
    min: function(x,y){
      if(x instanceof Point){
        this.x > x.x && (this.x = x.x);
        this.y > x.y && (this.y = x.y);
        return this;
      }
      this.x > x && (this.x = x);
      this.y > y && (this.y = y);
      return this;
    },
    max: function(x,y){
      if(x instanceof Point){
        this.x < x.x && (this.x = x.x);
        this.y < x.y && (this.y = x.y);
        return this;
      }
      this.x < x && (this.x = x);
      this.y < y && (this.y = y);
      return this;
    },
    middle: function(point) {
        return new Point((this.x+point.x)/2, (this.y+point.y)/2)
    },
    clone: function(){
        return new Point( this.x, this.y );
    },
    distance: function( obj ){
        var tmp;
        return sqrt( (tmp = this.x - obj.x) * tmp + (tmp = this.y - obj.y) * tmp );
    },
    distancePow2: function( obj ){

        var tmp;

        return (tmp = this.x - obj.x) * tmp + (tmp = this.y - obj.y) * tmp;
    },
    manhattan: function( obj ){
        return abs(this.x - obj.x) + abs(this.y - obj.y);
    },
    magnitude: (function(){
      var sqrt = Math.sqrt;
      return function() {
        return sqrt(this.x*this.x+this.y*this.y);
      };
    })(),
    rotateClone: function(angleRAD) {
      var angle = Math.atan2(this.y, this.x) + angleRAD;
      var length = this.magnitude();
      return new Point(Math.cos(angle)*length,Math.sin(angle)*length)
    },
    rotate: function(angleRAD) {
        var angle = Math.atan2(this.y, this.x) + angleRAD;
        var length = this.magnitude();
        this.x = Math.cos(angle)*length;
        this.y = Math.sin(angle)*length;
        return this;
    },
    getAngle: function(p) {
        if(p)
            return Math.atan2(p.y - this.y, p.x - this.x);
        else
            return Math.atan2(this.y, this.x);
    },
    toString: function(fixed) {
        fixed === void 0 && (fixed = 3);
        return 'x:'+this.x.toFixed(fixed)+' y:'+this.y.toFixed(fixed);
    },
    normalize: function() {
        return this.div(this.magnitude())
    },
    projectionClone: function(to) {
        var angle = this.getAngle()-to.getAngle();
        return to.clone().normalize().mul(this.magnitude()*Math.cos(angle));
    },
    projection: (function(){
      var angle, length, cos = Math.cos, length2;
      return function(to) {
        angle = this.getAngle()-to.getAngle();
        length2 = to.magnitude();
        length = this.magnitude()*cos(angle);
        this.x = to.x; this.y = to.y;
        this.x = to.x/length2*length;
        this.y = to.y/length2*length;
        return this;
      }
    })(),
    lerp: function(to, amount) {
        return new Point(this.x+(to.x-this.x)*amount,this.y+(to.y-this.y)*amount)
    },
    clamp: function(n) {
        return new Point((n/2%1)+(this.x|0), (n/2%1)+(this.y|0));
    },
    absoluteAdd: function(val){
        var newMagnitude = this.magnitude()+val;
        return this.normalize().mul(newMagnitude);
    },
    count: function(axis){
      if(axis.x === 0) {
        return this.y / axis.y;
      }else{
        return this.x / axis.x;
      }
    }
};
(function(){
  var out = new Point();
  Point.prototype.lerp = function(to, amount) {
    out.x = this.x + (to.x -this.x) * amount;
    out.y = this.y + (to.y - this.y) * amount;
    return out;
  };
  Point.prototype.lerpClone = function(to, amount) {
    return this.lerp(to, amount).clone();
  };
})();
Point.prototype.getter = Point.prototype.clone;
[
    {
        name: 'add',
        sign: '+'
    },
    {
        name: 'sub',
        sign: '-'
    },
    {
        name: 'mul',
        sign: '*'
    },
    {
        name: 'div',
        sign: '/'
    },
    {
        name: 'mod',
        sign: '%'
    }
].forEach(function( el ){
    var sign = el.sign;
    Point.prototype[ el.name ] = Function( 'objOrX, y', [
        'if( y === void 0 ){',
        '    if( typeof objOrX === \'number\' ){',
        '        this.x '+ sign +'= objOrX;',
        '        this.y '+ sign +'= objOrX;',
        '    }else{',
        '        this.x '+ sign +'= objOrX.x;',
        '        this.y '+ sign +'= objOrX.y;',
        '    }',
        '}else{',
        '    this.x '+ sign +'= objOrX;',
        '    this.y '+ sign +'= y;',
        '}',
        'return this;'
    ].join('\n') );
Point.prototype[ el.name +'Clone'] = Function( 'objOrX, y',
    'return this.clone().'+el.name+'(objOrX, y);'
)
});
/*
PointFrom, PointTo
PointFrom, w, h
Rect
x, y, w, h
 */


var Rect = function(x,y,width, height) {
    if(x instanceof Point) {
        if(y instanceof Point) {
            height = y.y - x.x;
            width = y.x - x.y;
        }else if(typeof y === 'number'){
            height = width;
            width = y;
        }
        y = x.y;
        x = x.x;

    }else if(x instanceof Rect || typeof x === 'object'){
        width = x.width;
        height = x.height;
        y = x.y;
        x = x.x;
    }
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};
Rect.prototype = {
    test: function(obj) {
        var x = obj.x,
            y = obj.y,
            w = obj.width || 0,
            h = obj.height || 0;

        return !(this.x > x + w ||
            this.x + this.width < x ||
            this.y > y + h ||
            this.y + this.height < y);
    },
    clone: function() {
        return new Rect(this);
    },
    mul: function(num) {
        this.width*=num;
        this.height*=num;
        return this;
    },
    move: function(x,y) {
        this.x+=x;
        this.y+=y;
        return this;
    }
};
var Collision = function(point, o1, o2) {
  this.point = point;
  this.o1 = o1;
  this.o2 = o2;
};
Collision.prototype = {};

if(typeof module !== 'undefined'){
  module.exports = {
    Point: Point, Collision: Collision, Rect: Rect
  };
}