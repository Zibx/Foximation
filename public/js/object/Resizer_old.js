class Resizer extends Interact {
  draw(ctx){
    ctx.fillStyle='#FBFCFD';
    ctx.strokeStyle=GIZMO_COLOR;
    var real = 16, draw = 5, scale =draw/real/2;
    ctx.fillRect(-this.width*scale, -this.height*scale, this.width*scale*2, this.height*scale*2);
    ctx.strokeRect(-this.width*scale, -this.height*scale, this.width*scale*2, this.height*scale*2);

  }
  down(e){
    var tween = this.group.tween;
    var camera = this.group.camera;
    var start = this.position.clone();
    var groupStart = this.group.position.clone();
    var opposite = (this.n + 2 ) % 4;
    var oppositePosition = this.group.resizers[opposite].position.clone();
    var groupRegion = camera.getRegion(this.group);
    var groupDelta = groupRegion[1].subClone(groupRegion[0]);

    // originCalculations should be here
    var groupMiddle = groupRegion[1].middle(groupRegion[0]);
    var items = this.group.list.map(item => {
      var itemRegion = camera.getRegion(item);

      // originCalculations should be here
      var origin = itemRegion[1].middle(itemRegion[0]);
      return {item, pos: item.position.clone(),
        width: item.width,
        _position: item._position.clone(), scale: item.scale.clone(), _scale: item._scale.clone(),
        relativePos: origin.subClone(groupRegion[0]).div(groupDelta)
      }
    });
    var startW = this.group.width;
    var startH = this.group.height;
    D.mouse.dragBehavior(false,{
      cursor: this.cursor,
      move: (deltaPX,me,e)=>{
        var newPos = start.addClone(new Point(deltaPX).mul(this.group.pxRatio));
        var delta = oppositePosition.subClone(newPos);
        if(this.n === 1 || this.n === 2)
          delta.x *= -1;
        if(this.n === 2 || this.n === 3)
          delta.y *= -1;

        this.group.width = delta.x;
        this.group.height = delta.y;
        var scaleX = delta.x/startW;
        var scaleY = delta.y/startH;
        items.forEach(item => {
          var newItemPos = item._position.addClone(new Point(deltaPX).mul(this.group.pxRatio).mul(item.relativePos));
          tween.updateKeyFrame(item.item, tween.getCurrentFrame(), {
            _scaleX: item._scale.x+scaleX-1,
            _scaleY: item._scale.y+scaleY-1,
            _positionX: newItemPos.x,
            _positionY: newItemPos.y
          })
        })
        this.group.position = oppositePosition.middle(newPos).add(groupStart)

        this.group.game.gameLoop()
      }
    })(e.event);

    return true;
  }
}
Resizer.prototype.manual = true;