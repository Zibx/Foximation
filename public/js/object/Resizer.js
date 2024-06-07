class Resizer extends Interact {
  constructor( props ) {
    super( props );
    this.setCursor();
  }
  draw(ctx){

scale = 1
    //ctx.strokeRect(-this.width*scale, -this.height*scale, this.width*scale*2, this.height*scale*2);

    if(this.fix)
      return;

    ctx.fillStyle='#FBFCFD';
    ctx.strokeStyle=GIZMO_COLOR;
    var real = 16, draw = 5, scale =draw/real/2;
    ctx.fillRect(-this.width*scale, -this.height*scale, this.width*scale*2, this.height*scale*2);
    ctx.strokeRect(-this.width*scale, -this.height*scale, this.width*scale*2, this.height*scale*2);

  }
  setCursor(){
    var angle = (((this.fix?90:45)+this.n*90-this.group.rotation/3.141592*180)/4|0)*4+2;
    if(angle === this.lastAngle)
      return this.cursor;

    var cod = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path xmlns="http://www.w3.org/2000/svg" d="M8.5 13L8.5 12L7.7 12.6L3.7 15.6L3.16 16L3.7 16.4L7.7 19.4L8.5 20L8.5 19L8.5 17.5L23.5 17.5L23.5 19L23.5 20L24.3 19.4L28.3 16.4L28.83 16L28.3 15.6L24.3 12.6L23.5 12L23.5 13L23.5 14.5L8.5 14.5L8.5 13Z" fill="#FBFCFD" stroke="#041522" stroke-linecap="round" style="rotate: ${
      angle
    }deg;transform-origin: center;"/>
</svg>`
    this.cursor = `url("data:image/svg+xml;base64,${btoa(cod)}") 16 16, pointer`
    return this.cursor;
  }
  down(e){
    var targets = {
      x1: [ 0, 3 ],
      y1: [ 0, 1 ],
      x2: [ 1, 2 ],
      y2: [ 2, 3 ]
    };
    var moving = {};
    for(var target in targets){
      if(targets[target].indexOf(this.n)>-1)
        moving[target] = targets[target];
    }

    var group = this.group,
        resizers = group.resizers;

    var tween = group.tween;
    var camera = group.camera;

    var gx = group.position.x,
      gy = group.position.y;
    var rect = [
      resizers[0].position.x+gx, resizers[0].position.y+gy,
      resizers[2].position.x+gx, resizers[2].position.y+gy
    ];
    var rectW = rect[2]-rect[0];
    var rectH = rect[3]-rect[1];



    var innerRect = rect.slice(), x1,x2, y1,y2;
    var list = group.list;
    var initialScales = group.list.map(a=>new Point(a._scaleX, a._scaleY));

    var groupRegion = camera.getRegion(group);
    var initialPositions = group.list.map((item,n)=>{
      var itemRegion = camera.getRegion(item);
      return {
        absolute: item._position.clone(),
        start: item.objectPointToWorld(new Point(0, 0)),
        relative: itemRegion[0].middle(itemRegion[1]).sub(groupRegion[0]).div(groupRegion[1].subClone(groupRegion[0]))
      }
    });
    var inverseX = false, inverseY = false;
    var sx, sy;
    var relativePX = new Point();
    var newPosition = new Point();
    var initialRotation = -group.rotation;
    var xAxis = new Point(1,0).rotate(initialRotation);
    var yAxis = new Point(0,1).rotate(initialRotation);
    var projectorX = new Point();
    var projectorY = new Point();
    var startPosition = resizers[this.n].position.addClone(group.position);
    var relativePXToWorld = new Point();

    var pxRatio = group.world.pxRatio.clone()

    var moveX, moveY;

    D.mouse.dragBehavior(false,{
      cursor: this.cursor,
      move: Store.debounce((deltaPX,me,e)=>{

        // d.clear();
        inverseY = inverseX = false;
        innerRect[0] = rect[0]; innerRect[1] = rect[1]; innerRect[2] = rect[2]; innerRect[3] = rect[3];

        projectorX.x = projectorY.x = deltaPX.x*pxRatio.x;
        projectorX.y = projectorY.y = deltaPX.y*pxRatio.y;

        projectorX.projection(xAxis);
        projectorY.projection(yAxis);



        /*d.line(new Point(), xAxis, 'green');
        d.line(new Point(), yAxis, 'red');*/

        /*d.line(new Point(), projectorX, 'green',50);
        d.line(new Point(), projectorY, 'red',50);*/

        relativePX.x = projectorX.count(xAxis);//deltaPX.x*group.pxRatio.x;
        relativePX.y = projectorY.count(yAxis);//deltaPX.y*group.pxRatio.y;
        // d.line(new Point(), relativePX, 'blue', 100);
        //console.log(projectorX.div(xAxis))
        //relativePX = relativePX.rotate(-initialRotation);

        //relativePxLength = relativePX.magnitude();

        newPosition.x = startPosition.x + relativePX.x;
        newPosition.y = startPosition.y + relativePX.y;
        // d.line(group.position, newPosition, 'cyan',20);

        if(
          moving.x1 && newPosition.x>rect[2] ||
          moving.x2 && newPosition.x<rect[0]
        ){
          inverseX = true;
          innerRect[moving.x1?0:2] = innerRect[moving.x1?2:0];
          innerRect[moveX = moving.x1?2:0] = newPosition.x;
        }else{
          innerRect[moveX = moving.x1?0:2] = newPosition.x;
        }

        if(
          moving.y1 && newPosition.y>rect[3] ||
          moving.y2 && newPosition.y<rect[1]
        ){
          innerRect[moving.y1?1:3] = innerRect[moving.y1?3:1];
          innerRect[moveY = moving.y1?3:1] = newPosition.y;
          inverseY = true;
        }else{
          innerRect[moveY = moving.y1?1:3] = newPosition.y;
        }
        if(this.fix){
          if(this.fix === 'x') {
            innerRect[ 0 ] = rect[ 0 ];
            innerRect[ 2 ] = rect[ 2 ];
            inverseX = false;
            relativePX.x = 0;
          }else{
            innerRect[ 1 ] = rect[ 1 ];
            innerRect[ 3 ] = rect[ 3 ];
            inverseY = false;
            relativePX.y = 0;

          }
        }

        /*d.line(new Point(), relativePX.rotateClone(initialRotation), 'orange',200);
        d.line(new Point(), projectorX, 'green',100);
        d.line(new Point(), projectorY, 'red',100);*/

        group.width = innerRect[2] - innerRect[0];
        group.height = innerRect[3] - innerRect[1];

        relativePXToWorld.x = relativePX.x;
        relativePXToWorld.y = relativePX.y;
        relativePXToWorld.rotate(initialRotation)
        //p1.rotate(initialRotation)
        group.position.x = (rect[2] + rect[0])/2+relativePXToWorld.x/2;
        group.position.y = (rect[3] + rect[1])/2+relativePXToWorld.y/2;

        var innerW = innerRect[2]-innerRect[0];
        var innerH = innerRect[3]-innerRect[1];

        var scaleX = innerW/rectW;
        var scaleY = innerH/rectH;


/*        console.log(rect, inverseX, inverseY)
        console.log(group.width, group.height)
        this.group.game.gameLoop()

        return;*/

        list.forEach((item, n) => {
          sx = initialScales[n].x*scaleX *(inverseX ? -1:1);
          sy = initialScales[n].y*scaleY *(inverseY ? -1:1);
          //var newItemPos = item._position.addClone(new Point(deltaP).mul(this.group.pxRatio).mul(item.relativePos));
          if(item.__tweenID) {
            tween.updateKeyFrame( item, tween.getCurrentFrame(), {

              _scaleX: sx,
              _scaleY: sy,
              _positionX: initialPositions[n].absolute.x+relativePXToWorld.x* initialPositions[n].relative.x,
              _positionY: initialPositions[n].absolute.y+relativePXToWorld.y* initialPositions[n].relative.y
              /*_positionX: initialPositions[n].absolute.x+relativePX.x* initialPositions[n].relative.x,
              _positionY: initialPositions[n].absolute.y-relativePX.y* initialPositions[n].relative.y*/
              /*_scaleY: 1-scaleY-1,
              _positionX: newItemPos.x,
              _positionY: newItemPos.y*/
            } );

            this.main.updateValues();
            this.main.updateCanvas();

          }else{
            var newX = initialPositions[ n ].absolute.x + relativePXToWorld.x * initialPositions[ n ].relative.x;
            var newY = initialPositions[ n ].absolute.y + relativePXToWorld.y * initialPositions[ n ].relative.y;
            item._position.x = newX;
            item._position.y = newY;
            item._scaleX = item._scale.x = sx;
            item._scaleY = item._scale.y = sy;
          }
        })

        this.group.game.gameLoop()
      }, 5)
    })(e.event);

    return true;
  }
}
Resizer.prototype.manual = true;