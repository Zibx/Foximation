var VideoTweenProps = {
  rotation: CommonTweenProps.rotation,
  skewX: CommonTweenProps.skewX,
  skewY: CommonTweenProps.skewY,
  _positionX: CommonTweenProps._positionX,
  _positionY: CommonTweenProps._positionY,
  _scaleX: CommonTweenProps._scaleX.extend({
    set: function(val){this._scaleX = val; this.width = Math.abs(this.videoWidth*this._scaleX);this._scale.x = this._scaleX<0?-1:1}
  }),
  _scaleY: CommonTweenProps._scaleY.extend({
    set: function(val){this._scaleY = val; this.height = Math.abs(this.videoHeight*this._scaleY);this._scale.y = this._scaleY<0?-1:1}
  })
};

class VideoObject extends Item {
  constructor( cfg ) {
    super( cfg );
    this.relativeInit();
    this.loading = true;
    /*this.tween.updateItemData(this, {
      _scaleX: this.width/(this.path.width || 1),
      _scaleY: scale
    })*/
  }
  setVideo(img){
    this.video = img;
    debugger
    this.width = this.videoWidth = img.videoWidth;
    this.height = this.videoHeight = img.videoHeight;
    this.loading = false;
    this._scaleX = 1;
    this._scaleY = 1;
    this.tween.addItem(this, VideoTweenProps);

  }
  physic(dt, t){
    if(!this.loading) {
      this.tween.applyFrameProperties( this );
      this.video.currentTime = this.tween.getCurrentFrame()/60;
    }
  }
  draw(ctx){
    if(this.loading){
      ctx.beginPath()
      ctx.lineWidth = 0.4;
      ctx.arc(0,0,this.width/3,0, 6.28)
      ctx.strokeStyle = GIZMO_COLOR;
      ctx.stroke();

    }else{
      var w= Math.abs(this.width), h = Math.abs(this.height);

      ctx.drawImage(this.video, -w/2, -h/2, w, h);
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
  toString(){
    return 'Video';
  }
}
VideoObject.prototype.props = {
  _type: 'video',
  Position: Property.position,
  Fill: Property.fill,
  Stroke: Property.stroke
}
