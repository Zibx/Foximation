var VectorFillColor =     CommonTweenProps.fillStyle.extend({
  set: function(val){
    this.path.fill = val;
  },
  get: function(){
    return this.path.fill;
  }
});
var VectorTweenProps = {
  rotation: CommonTweenProps.rotation,
  skewX: CommonTweenProps.skewX,
  skewY: CommonTweenProps.skewY,
  _positionX: CommonTweenProps._positionX,
  _positionY: CommonTweenProps._positionY,
  _scaleX: CommonTweenProps._scaleX.extend({
    set: function(val){this._scaleX = val; this.width = this.path.width*this._scaleX}
  }),
  _scaleY: CommonTweenProps._scaleY.extend({
    set: function(val){this._scaleY = val; this.height = this.path.height*this._scaleY}
  }),
  fillStyle: VectorFillColor
};

class Vector extends Item {
  constructor( cfg ) {
    super( cfg );
    this.relativeInit();
    this.relative = true;

    this.updatePathBoundingBox(this.path);
    this._scaleX = this.width/(this.path.width || 1);
    this._scaleY = this._scaleX;//this.height/(this.path.height || 1);
    this.tween.addItem(this, VectorTweenProps);
    /*this.tween.updateItemData(this, {
      _scaleX: this.width/(this.path.width || 1),
      _scaleY: scale
    })*/
  }
  collider(p){
    return this.ctx.isPointInPath(this.getPath(), p.x, p.y);
  }
  getPath(){

    var key = this._scaleX+';'+this._scaleY;

    if(this.lastScaleKey !== key) {
      this.lastScaleKey = key;


      this._path = new Path2D(
        this.toPathData(
          this.path.commands,
          this._scaleX, this._scaleY,
          this.path.width || 1, this.path.height || 1,
          this.path.left, this.path.top
        )
      );
    }

    return this._path;
  }
  toPathData(list, sx, sy, w, h, l, t){
    var tx = a => (a-l-w/2)*sx;
    var ty = a => (a-t-h/2)*sy;
    var out = '', i, _i = list.length, item;
    for (i = 0; i < _i; i++) {
      item = list[i];
      if(item.type === 'M' || item.type === 'L'){
        out += item.type + tx(item.x) +' '+ ty(item.y);
      }else if(item.type === 'Q'){
        out += item.type +tx(item.x1) +' '+ ty(item.y1)+ ' '+ tx(item.x) +' '+ ty(item.y);
      }else if(item.type === 'C'){
        out += item.type +tx(item.x1) +' '+ ty(item.y1)+ ' '+tx(item.x2) +' '+ ty(item.y2)+ ' '+ tx(item.x) +' '+ ty(item.y);
      }else{
        out += item.type;
      }
    }
    return out;
  }
  physic(dt, t){
    this.tween.applyFrameProperties(this);
    /*if(this.hidden)
      return;

    this._scale.x = this._scaleX;
    this._scale.y = this._scaleY;
    this.width = this.path.width*this._scaleX;
    this.height = this.path.height*this._scaleY;*/



    /*this._scale.x = this._scaleX = this.width / this.path.width;
    this._scale.y = this._scaleY = this.height / this.path.height;*/
    //console.log(this._scale)
    /*var properties = this.tween.getProperties(this, this.tween.getCurrentFrame())
    Object.assign(this, properties);
    this._position.x = properties._positionX;
    this._position.y = properties._positionY;
    this.width = this.path.width*this._scaleX;
    this.height = this.path.height*this._scaleY;*/
    /*this._scale.x = properties._scaleX;
    this._scale.y = properties._scaleY;*/
  }
  get color(){
    return this.path.fill;
  }
  set color(val){
    return this.path.fill = val;
  }
  draw(ctx){
    if(this.path.fill){
      ctx.fillStyle = this.path.fill;
      ctx.fill(this.getPath());
    }

    if(this.path.stroke){
      ctx.lineWidth = this.parent.pxRatio.x*(this.path.strokeWidth||1)
      ctx.strokeStyle = this.path.stroke;
      ctx.stroke(this.getPath());
    }
    if(this.highlight || this.selected){
      ctx.lineWidth = this.parent.pxRatio.x*(2)
      ctx.strokeStyle = GIZMO_COLOR_WHITE;
      ctx.stroke(this.getPath());
      ctx.lineWidth = this.parent.pxRatio.x*(1.5);
      ctx.strokeStyle = GIZMO_COLOR;
      ctx.stroke(this.getPath());
    }
  }
}
Vector.prototype.ctx = D.h('canvas').getContext('2d');
Vector.prototype.props = {
  _type: 'vector',
  Position: Property.position,
  Fill: [VectorFillColor],
  Stroke: Property.stroke
}

Vector.pathFromString = function(cfg){
  var list = [];
  var out = {
    commands: list
  };
  cfg.fill && (out.fill = cfg.fill);
  cfg.width && (out.width = cfg.width);
  cfg.height && (out.height = cfg.height);
  cfg.stroke && (out.stroke = cfg.stroke);
  cfg.strokeLinecap && (out.strokeLinecap = cfg.strokeLinecap);
  var d = cfg.d.trim()+' ', i = 0, _i = d.length;

  var currentItem = false, idx = 1, isX, currentType, val = '';
  for(;i<_i; i++){
    var c = d[i];
    if( c === ' ' || c === 'M' || c === 'L' || c === 'Z' || c === 'C' || c === 'Q'){
      if(currentItem) {
        currentItem[ ( isX ? 'x' : 'y' ) + (
          currentType === 'C' ? ( idx === 3 ? '' : idx ) :
            currentType === 'Q' ? ( idx === 2 ? '' : idx ) :
              ''
        ) ] = val-0;
        val = '';
        isX = !isX;
        isX && idx++;
      }
      if(c !== ' ') {
        currentItem = { type: currentType = c };
        list.push( currentItem );
        isX = true;
        idx = 1;
      }
    }else{
      val += c;
    }
  }
  return out;
};
Vector.bezierRect = findBezierRect;
Vector.prototype.updatePathBoundingBox = (function(){
  var bezierRect = findBezierRect,
    commands, command, type, lastType, t, l, r, b, i, _i,
    x,y, Mx, My, x1,y1, x2,y2, x3,y3, x4,y4, rect;
  return function(path){
    t = Infinity;
    l = Infinity;
    r = -Infinity;
    b = -Infinity;

    commands = path.commands;
    for(i = 0, _i = commands.length; i < _i; i++){
      command = commands[i];
      type = command.type;
      if(type === 'M'){
        Mx = x = command.x;
        My = y = command.y;
      }else if(type === 'L'){
        if(lastType === 'M'){
          if(x<l)l=x;
          if(x>r)r=x;
          if(y<t)t=y;
          if(y>b)b=y;
        }
        x = command.x;
        if(x<l)l=x;
        if(x>r)r=x;
        y = command.y;
        if(y<t)t=y;
        if(y>b)b=y;
      }else if(type === 'Z'){
        if(Mx<l)l=Mx;
        if(Mx>r)r=Mx;
        if(My<t)t=My;
        if(My>b)b=My;
      }else if(type === 'C'){
        rect = bezierRect(x, y, command.x, command.y, command.x1, command.y1,
          x = command.x2, y = command.y2)
        x1 = rect[0]; y1 = rect[1];
        if(x1<l)l=x1;
        if(x1>r)r=x1;
        if(y1<t)t=y1;
        if(y1>b)b=y1;

        x1 = rect[2]; y1 = rect[3];
        if(x1<l)l=x1;
        if(x1>r)r=x1;
        if(y1<t)t=y1;
        if(y1>b)b=y1;


      }
      lastType = type;
    }

    path.left = l;
    path.top = t;
    path.width = r-l;
    path.height = b-t;
  };
})();