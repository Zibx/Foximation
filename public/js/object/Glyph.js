var GlyphFillStyle = CommonTweenProps.fillStyle.extend({
  set: function(val){
    this.fillStyle = val;
  },
  get: function(){
    return this.fillStyle;
  }
});
var GlyphStrokeStyle = CommonTweenProps.strokeStyle.extend({
  set: function(val){
    this.strokeStyle = val;
  },
  get: function(){
    return this.strokeStyle;
  }
});
var GlyphTweenProps = {
  rotation: CommonTweenProps.rotation,
  skewX: CommonTweenProps.skewX,
  skewY: CommonTweenProps.skewY,
  _positionX: CommonTweenProps._positionX,
  _positionY: CommonTweenProps._positionY,
  _scaleX: CommonTweenProps._scaleX.extend( {
    get: function() {
      return this._scaleX
    },
    set: function( val ) {
      this._scaleX = val;
      this.width = this.charWidth * this._scaleX
    }
  }),
  _scaleY: CommonTweenProps._scaleY.extend( {
    get: function(){return this._scaleY},
    set: function(val){this._scaleY = val; this.height = this._charHeight*this._scaleY},
    keyFrameColor: '#FF8800',
    key: '_scaleY',
    value: 1
  }),
  fillStyle: GlyphFillStyle,
  strokeStyle: GlyphStrokeStyle,
  opacity: CommonTweenProps.opacity
};
class Glyph extends Item {
  constructor( cfg ) {
    super( cfg );
    this.relativeInit();
    this.marginRight = this.marginRight || 0;

    this._paths = {};
    this.getPath();
    this.tween.addItem(this, GlyphTweenProps);
  }
  propsForClone(){
    var out = Item.prototype.propsForClone.call(this);
    out.font = this.font;
    out._char = this._char;
    out._marginRight = this._marginRight;
    out.charWidth = this.charWidth;
    out.charHeight = this.charHeight;
    out.descending = this.descending;
    out.fillStyle = this.fillStyle;
    out.strokeStyle = this.strokeStyle;

    out._scaleX = this._scaleX;
    out._scaleY = this._scaleY;
    return out;
  }
  set marginRight(val){
    this._marginRight = val;
    this.parent && this.parent.recalculateCharsPositions();
    return val;
  }
  get marginRight(){
    return this._marginRight;
  }
  set char(val){
    this._char = val;
    this.parent && this.parent.recalculateCharsPositions();
    return val;
  }
  get char(){
    return this._char;
  }
  toString(){ return 'Glyph: ' + this._char;}
  collider(p){
    return this.ctx.isPointInPath(this.getPath(), p.x, p.y);
  }

  getPath(){
    var key = this._scaleX+';'+this._scaleY;

    if(!(key in this._paths)) {
      this._paths = {};
      this._paths[key] = new Path2D(
        this.scalePathData(
          this.font.getPath( this.char, -this.charWidth / 2, 0.5 - this.descending, 1 ),
          this._scaleX, this._scaleY
        ).toPathData()
      );
    }

    return this._paths[key];
  }
  draw( ctx, childTransform ) {
    if(this.debugLetters || this.hover) {
      ctx.strokeStyle = '#8b5fbb';
      ctx.strokeRect( -this.charWidth / 2, -this.charHeight / 2 + ( 1 - this.charHeight ) / 2, this.charWidth, this.charHeight );
      ctx.beginPath();
      ctx.moveTo( -this.charWidth / 2, -this.charHeight / 2 + ( 1 - this.charHeight ) / 2 );
      ctx.lineTo( -this.charWidth / 2 + this.charWidth, -this.charHeight / 2 + ( 1 - this.charHeight ) / 2 + this.charHeight );
      ctx.stroke();
    }

    ctx.fillStyle = this.fillStyle;
    ctx.fill(this.getPath());

    ctx.lineWidth = 1;
    ctx.strokeStyle = this.strokeStyle;
    ctx.stroke(this.getPath());

    if(this.highlight || this.selected){
      ctx.lineWidth = this.pxRatio.minXY()*2;
      ctx.strokeStyle = GIZMO_COLOR_WHITE;
      ctx.stroke(this.getPath());
      ctx.lineWidth = this.pxRatio.minXY()*1.5;
      ctx.strokeStyle = GIZMO_COLOR;
      ctx.stroke(this.getPath());
    }
    /*ctx.
    debugger
    ctx.fillText( this.char, -this.charWidth / 2, 0.5-this.descending );*/

    if(this.debugLetters) {
      ctx.fillStyle = '#00fff0';
      ctx.strokeRect( -this.height / 40, -this.height / 40, this.height / 20, this.height / 20 );
      ctx.strokeStyle = '#4765b0';

      ctx.strokeRect( -this.width / 2, -this.height / 2, this.width, this.height );
    }
  }
  physic(dt, t){
    //var properties = this.tween.getProperties(this, this.tween.getCurrentFrame())
    var p0 = this.tween.applyFrameProperties(this);
    //this.width = this.charWidth*this._scaleX;
    /*this.tween.applyFrameProperties(this);
    this._scale.x = this._scaleX;
    this._scale.y = this._scaleY;
    this.width = this.charWidth*this._scaleX;
    this.height = this._charHeight*this._scaleY;*/
    /*    var properties = this.tween.getProperties(this, this.tween.getCurrentFrame())
        console.log(p0, properties)
        Object.assign(this, properties);
        this._position.x = properties._positionX;
        this._position.y = properties._positionY;
        this.width = this.charWidth*this._scaleX;
        this.height = this._charHeight*this._scaleY;*/
    /*this._scale.x = properties._scaleX;
    this._scale.y = properties._scaleY;*/
  }
  physic2( dt ) {
    //this[ this.animationType ] = Math.cos( +new Date() / 500 + this.n ) / (Math.sin(this.n)/2+2);
    /*      this[ this.animationType ] += Math.cos( +new Date() / 500 + this.n ) / 50;
          if(Math.random()<0.5)
            this.animationType = ['rotation', 'shearX', 'shearY'][Math.random()*3|0]*/
  }
}
Glyph.prototype.ctx = D.h('canvas').getContext('2d');
Glyph.prototype.props = {
  _type: 'glyph',
  Position: Property.position,
  Fill: [
    GlyphFillStyle
  ],
  Stroke: [
    GlyphStrokeStyle
  ],
  Symbol: [
    GlyphTweenProps.opacity,
    {name: 'Char', type: String,
      get: function(){return this.char},
      set: function(val){this.char = val; this._paths = {}}
    }
  ]
};