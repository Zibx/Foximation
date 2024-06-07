var ImageTweenProps = {
  rotation: CommonTweenProps.rotation,
  skewX: CommonTweenProps.skewX,
  skewY: CommonTweenProps.skewY,
  _positionX: CommonTweenProps._positionX,
  _positionY: CommonTweenProps._positionY,
  _scaleX: CommonTweenProps._scaleX.extend({
    set: function(val){this._scaleX = val; this.width = this.imageWidth*this._scaleX}
  }),
  _scaleY: CommonTweenProps._scaleY.extend({
    set: function(val){this._scaleY = val; this.height = this.imageHeight*this._scaleY}
  })
};

class ImageObject extends Item {
  constructor( cfg ) {
    super( cfg );
    this.relativeInit();
    this._scaleX = 1;
    this._scaleY = 1;
    this.relative = true;
    this.loading = true;
    this.tween.addItem(this, ImageTweenProps);
    /*this.tween.updateItemData(this, {
      _scaleX: this.width/(this.path.width || 1),
      _scaleY: scale
    })*/
  }
  setImage(img){
    this.image = img;
    this.width = this.imageWidth = img.width;
    this.height = this.imageHeight = img.height;
    this.loading = false;
  }
  physic(dt, t){
    this.tween.applyFrameProperties(this);
  }
  draw(ctx){
    if(this.loading){
      ctx.beginPath()
      ctx.lineWidth = 0.4;
      ctx.arc(0,0,-this.width/3,0, 6.28)
      ctx.strokeStyle = GIZMO_COLOR;
      ctx.stroke();

    }else{
      ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    }

    if(this.highlight || this.selected){
      ctx.lineWidth = this.parent.pxRatio.x*(2)
      ctx.strokeStyle = GIZMO_COLOR_WHITE;
      ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
      ctx.lineWidth = this.parent.pxRatio.x*(1.5);
      ctx.strokeStyle = GIZMO_COLOR;
      ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
    }
  }
}
ImageObject.prototype.props = {
  _type: 'image',
  Position: Property.position,
  Fill: Property.fill,
  Stroke: Property.stroke
}
