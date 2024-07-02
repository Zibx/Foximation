
var GIZMO_COLOR = '#06c4ef';
var GIZMO_COLOR_ACTIVE = '#ef5f06';
var GIZMO_FILL_COLOR = '#087dc5';
var GIZMO_COLOR_WHITE = '#FBFCFD';



class EditableGroup extends Interact {
  constructor(cfg){
    super(cfg);
    this.hidden = true;
    this.cursor = 'move';

    this.rotators = [
      new Rotator({group: this, n: 0}),
      new Rotator({group: this, n: 1}),
      new Rotator({group: this, n: 2}),
      new Rotator({group: this, n: 3})
    ];



    this.resizers = [
      new Resizer({group: this, n: 0}),
      new Resizer({group: this, n: 1}),
      new Resizer({group: this, n: 2}),
      new Resizer({group: this, n: 3})
    ];
    /*this.resizers[0].cursor = this.resizers[2].cursor = 'nw-resize';
    this.resizers[1].cursor = this.resizers[3].cursor = 'ne-resize';*/

    this.resizeRows = [
      new Resizer({group: this, n: 0, fix: 'x'}),
      new Resizer({group: this, n: 1, fix: 'y'}),
      new Resizer({group: this, n: 2, fix: 'x'}),
      new Resizer({group: this, n: 3, fix: 'y'})
    ];
    /*this.resizeRows[0].cursor = this.resizeRows[2].cursor = 'ns-resize';
    this.resizeRows[1].cursor = this.resizeRows[3].cursor = 'ew-resize';*/
    [].concat.apply([], [
      this.rotators, this.resizeRows, this.resizers
    ]).forEach(item=>{
      item.main = this.main;
      this.addChild(item, 'ui');
    });

  };
  draw(ctx){

    ctx.strokeStyle = GIZMO_COLOR;
    var pxMagnitude = this.world.pxRatio.x;
    ctx.lineWidth = pxMagnitude*1;
    ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

    this.resizers[0].position.x = -this.width/2;
    this.resizers[0].position.y = -this.height/2;
    this.resizers[1].position.x = this.width/2;
    this.resizers[1].position.y = -this.height/2;
    this.resizers[2].position.x = this.width/2;
    this.resizers[2].position.y = this.height/2;
    this.resizers[3].position.x = -this.width/2;
    this.resizers[3].position.y = this.height/2;

    this.resizeRows[0].height = this.resizeRows[2].height = pxMagnitude*16;
    this.resizeRows[0].width = this.resizeRows[2].width = this.width;
    this.resizeRows[1].height = this.resizeRows[3].height = this.height;
    this.resizeRows[1].width = this.resizeRows[3].width = pxMagnitude*16;

    this.resizeRows[0].position.y = -this.height/2;
    this.resizeRows[2].position.y = this.height/2;

    this.resizeRows[1].position.x = this.width/2;
    this.resizeRows[3].position.x = -this.width/2;

    this.resizers.forEach(r=>{
      r.width = r.height = pxMagnitude*16;
    });

    var offset = pxMagnitude*16/2;
    this.rotators[0].position.x = -this.width/2 - offset;
    this.rotators[0].position.y = -this.height/2 - offset;
    this.rotators[1].position.x = this.width/2 + offset;
    this.rotators[1].position.y = -this.height/2 - offset;
    this.rotators[2].position.x = this.width/2 + offset;
    this.rotators[2].position.y = this.height/2 + offset;
    this.rotators[3].position.x = -this.width/2 - offset;
    this.rotators[3].position.y = this.height/2 + offset;

    this.resizers.forEach(r=>{
      r.width = r.height = pxMagnitude*16;
    })
    this.rotators.forEach(r=>{
      r.width = r.height = pxMagnitude*32;
    })


  }
  physic(){
    if(this.shouldUpdate) {
      this.updatePosition();
      this.shouldUpdate = false;
    }
  }
  doubleClick(e, scope, ctx){
    if(this.list.length === 1)
      this.list[0].doubleClick && this.list[0].doubleClick(e, scope, ctx);
  }
  hide(){
    this.hidden = true;
  }
  show(list){
    this.list = list;


    if(!list || !list.length)
      return this.hidden = true;
    this.hidden = false;

    this.rotation = 0;
    var rect = this.camera.getRegion( list[ 0 ] );
    rect = [ rect[ 0 ].clone(), rect[ 1 ].clone() ];
    if(list.length === 1) {
      this.rotation = list[ 0 ].getWorldRotation();
      this.width = list[ 0 ].width;
      this.height = list[ 0 ].height;
      rect = [
        this.camera.pointToObject( rect[ 0 ] ),
        this.camera.pointToObject( rect[ 1 ] )
      ];
    }else {

      for( var i = 1, _i = list.length; i < _i; i++ ) {
        var itemRect = this.camera.getRegion( list[ i ] );
        rect[ 0 ].min( itemRect[ 0 ] );
        rect[ 1 ].max( itemRect[ 1 ] );
      }

      rect = [
        this.camera.pointToObject( rect[ 0 ] ),
        this.camera.pointToObject( rect[ 1 ] )
      ];

      this.width = rect[ 1 ].x - rect[ 0 ].x;
      this.height = rect[ 1 ].y - rect[ 0 ].y;
    }
    this.position = rect[0].middle(rect[1]);
    this.updateCursors();

  }
  updatePosition(){
    this.show(this.list);
  }
  down(e, scope){
    this.cloned = false;


    scope.initialRotation = this.list[ 0 ] && this.list[ 0 ].parent ? this.list[ 0 ].parent.getWorldRotation() : 0;

    scope.startPoint = scope.camera.pointToObject(e.point);
    this.startPositions = this.list.map(l=>l._position.clone());
    scope.startPosition = this.position.clone()
    return true;
  }
  move(e, scope){
    if(e.event.altKey && !this.cloned){
      this.cloned = true;
      this.clonedList = this.list.map((item, i) => {
        return CloneFactory(item, {_position: this.startPositions[i].clone()});
      });
      this.main.updateCanvas();
    }else if(!e.event.altKey && this.cloned){
      this.cloned = false;
      this.clonedList.forEach(clone=>{
        clone.remove();
      });
      this.clonedList.length = 0;
      this.main.updateCanvas();
    }
    var delta = scope.camera.pointToObject(e.point).subClone(scope.startPoint);
    this.position = scope.startPosition.addClone(delta)
    delta.rotate(scope.initialRotation)
    this.list.forEach((el, i)=>{
      scope.tween.updateKeyFrame(el, scope.tween.getCurrentFrame(), {
        _positionX: this.startPositions[i].x + delta.x,
        _positionY: this.startPositions[i].y + delta.y
      })
      //el.position = this.startPositions[i].addClone(delta)
    });
    this.main.updateValues();
  }
  up(){
    if(this.cloned){
      this.clonedList.forEach((clone, i)=>{
        this.game.addObject(clone.actualize({
          tween: this.tween,
          _position: this.startPositions[i].clone(),
          _scaleX: this._scaleX,
          _scaleY: this._scaleY
        }));
      });
      this.clonedList.length = 0;
      this.cloned = false;
    }
  }
  updateCursors(){
    this.rotators.forEach(r=>r.setCursor());
    this.resizers.forEach(r=>r.setCursor());
    this.resizeRows.forEach(r=>r.setCursor());
  }
};