var drawSize = function(ctx){



  var text = (this.width.toFixed(1)-0)+ 'x' +(this.height.toFixed(1)-0);
  var measure = ctx.measureText(text);

  ctx.fillStyle = '#9398ad';
  ctx.fillRect(
    -measure.width/2-4, this.height/2+2,
    measure.width+8, 16
  )
  ctx.fillStyle = '#272a31';
  ctx.fillText(text,
    -measure.width/2, this.height/2+14
  )
}
class Frame extends Item {
  constructor( cfg ) {
    super( cfg );
    this.relativeInit();
    this.clip = true;
    this._scaleY = this.height;
    this._scaleX = this.width;
    this.tween.addItem(this, this.extractProps());

  }

  toString(){ return 'Frame';}

  draw( ctx, childTransform ) {
    ctx.strokeStyle = '#272a31';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
    if(this.fillStyle) {
      ctx.fillStyle = this.fillStyle;
      ctx.fillRect( -this.width / 2, -this.height / 2, this.width, this.height );
    }
    drawSize.call(this, ctx);


  }
  physic(dt, t) {
    this.tween.applyFrameProperties( this );
  }
}
Frame.prototype.props = {
  _type: 'frame',
  Position: [
    CommonTweenProps._positionX,
    CommonTweenProps._positionY,
    CommonTweenProps._scaleX.extend({
      set: function(val){this._scaleX = val; this.width = this._scaleX}
    }),
    CommonTweenProps._scaleY.extend({
      set: function(val){this._scaleY = val; this.height = this._scaleY}
    }),
    CommonTweenProps.width.extend({
      noTween: true,
      set: function(val){
          this._scaleX = val;
      },
      get: function(){
        return this._scaleX;
      }
    }),
    CommonTweenProps.height.extend({noTween: true}),
    CommonTweenProps.rotation,
    CommonTweenProps.opacity
  ],
  Fill: [CommonTweenProps.fillStyle.extend({
    set: function(val){
      this.fillStyle = val;
    },
    get: function(){
      return this.fillStyle;
    }
  })]
}