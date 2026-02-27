Loopy.prototype.modes.vector = {
  scope: {
    lastDown: 0,
    selection: [],
    button: -1,
    list: [],
    items: [],
    downPoint: new Point(-1000, 0),
    pressed: false,
    tool: 'move',
    relativePoint: new Point(-1000, 0),
    getRelativePoint: function(e){
      this.relativePoint.borrow(this.camera.pointToObject(this.game.eventWrapper(e).point))
      this.relativePoint.sub(this.initialPoint);
      return this.relativePoint;
    },
    getMoveHandler: function(scope, initial){
      var action = this.action[this.tool];

      if(!this._moveBehavior) {
        scope.initialPoint = scope.camera.pointToObject(scope.game.eventWrapper(initial.event).point).clone();

        this._moveBehavior = D.mouse.dragBehavior( false, {
          cursor: 'default',
          check: (e, context)=>{
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            return action.down.call(this, e, context, scope, action);
          },
          up: (e, context) => {
            return action.up.call(this, e, context, scope, action);
          },
          move: Store.debounce( ( deltaPX, me, e ) => {
            return action.move.call(this, e, deltaPX, scope, action);
          } )
        } )
      }
      return this._moveBehavior;
    },
    action: {
      peek: {
        down: function(e, context, scope){



          var initial = scope.initialPoint;
          var wrappedPoint = scope.game.eventWrapper(e).point;
          var p = scope.camera.pointToObject(wrappedPoint)

          var whatIsIt = scope.movables.getAtPoint(scope.getRelativePoint(e));
          if(whatIsIt){
            if(whatIsIt.type === 'point'){
              this.movables.close(whatIsIt);
            }
          }else{
            this.movables.add(new Point(p.x-initial.x, p.y-initial.y));
          }




/*          if(!(e.button === 1 || e.button === 4))
            return false;*/

          scope.movables.pressed = true;
          if(scope.item){
            var item = scope.item;
            var initial = scope.initialPoint;



            scope.path.push({
              type: 'L', x: p.x-initial.x, y: p.y-initial.y
            });
            //scope.item.updatePathBoundingBox(scope.item.path);
            scope.item.lastScaleKey = false;
            var path = scope.item.path;
            //scope.item.width = path.width;
            //scope.item.height = path.height;
/*            scope.tween.updateKeyFrame(scope.item, scope.tween.getCurrentFrame(), {
              _scaleX: 1,
              _scaleY: 1,
              _positionX: path.left+path.width/2,//(path.left-scope.initialPoint.x)/2,
              _positionY:path.top+path.height/2//(path.top-scope.initialPoint.y)/2,
            })*/
            // x = -left
            //scope.movables.update(1, 1, path.width, path.height, path.left, path.top);

            scope.activeMovable = 0;
          }else {
            scope.initialPoint = p.clone();
            var item = scope.item = new Vector( {
              scope: scope,
              position: new Point( p ),
              path: {
                commands: [
                  { type: 'M', x: 0, y: 0 }
                ],
                //fill: '#FFFFFF',
                stroke: '#9722f6'
              },
              width: 1,
              height: 1,
              tween: scope.tween
            } );
            item.editMode = true;
            scope.item.path.left = p.x;
            scope.item.path.width = 1;
            scope.item.path.height = 1;
            scope.item.path.top = p.y;
            scope.item.updatePathBoundingBox(scope.item.path);

            scope.path = scope.item.path.commands;


            scope.movables.update(1, 1, 1, 1, 0, 0);
            scope.activeMovable = scope.movables.movables.length-1;
            scope.game.addObject( scope.item )
            scope.game.world.addChild( scope.item )
          }
          scope.game.gameLoop()
        },
        move: function(e, delta,scope,b,c){
          var p = scope.camera.pointToObject(scope.game.eventWrapper(e).point)
          var initial = scope.initialPoint;
          scope.movables.ghost(delta.x, delta.y);




          scope.main.updateCanvas();
        },
        up: function(e, context, scope){
          scope.movables.pressed = false;
          if(scope.movables.closing){
            this.movables.export(scope.item);
            this.tool = 'move';
          }
        }
      },
      move: {
        down: function(){

        }
      },

    }
  },
  leave: function(scope){
    scope.item.editMode = false;
    scope.item = false;
    scope._moveBehavior = false;
  },
  init: function(scope){
    scope.editableGroup.hide();
    scope.main.renderTo.style.cursor = 'auto';
    if(scope.item) {
      scope.item.highlight = false;
      scope.item.editMode = true;
      scope.initialRotation = scope.item.parent.getWorldRotation();
      scope.tool = 'move';
      scope.movables = new Loopy.Movables(scope.commands, scope.path, scope);
      scope.movables.update(scope.item._scaleX, scope.item._scaleY, scope.path.width, scope.path.height, scope.path.left, scope.path.top);
    }else{
      scope.tool = 'peek';
      scope.initialRotation = 0;
      scope.movables = new Loopy.Movables(false, false, scope);
    }
    scope.game.gameLoop();
  },
  down: function(e, ctx, scope){
    var time = +new Date();
    scope.pressed = true;

    var doubleClick = scope.lastDown > time-400;
    scope.lastDown = time;

    doubleClick = doubleClick && scope.downPoint.distance(e.point)<3;
    scope.downPoint = e.point.clone();

    scope.button = e.event.button;
    scope.getMoveHandler(scope, e)(e.event);

    return;
    if(scope.tool === 'peek') {
      var p = scope.camera.pointToObject(e.point)
      // check if click on object
      if(scope.item){
        var item = scope.item;
        var initial = scope.initialPoint;



        scope.path.push({
          type: 'L', x: p.x-initial.x, y: p.y-initial.y
        });
        scope.item.updatePathBoundingBox(scope.item.path);
        scope.item.lastScaleKey = false;
        var path = scope.item.path;
        scope.item.width = path.width;
        scope.item.height = path.height;
        scope.tween.updateKeyFrame(scope.item, scope.tween.getCurrentFrame(), {
          _scaleX: 1,
          _scaleY: 1,
          _positionX: path.left+path.width/2,//(path.left-scope.initialPoint.x)/2,
          _positionY:path.top+path.height/2//(path.top-scope.initialPoint.y)/2,
        })
        // x = -left
        scope.movables.update(1, 1, path.width, path.height, path.left, path.top);
        scope.activeMovable = 0;
      }else {
        scope.initialPoint = p.clone();
        var item = scope.item = new Vector( {
          scope: scope,
          position: new Point( p ),
          path: {
            commands: [
              { type: 'M', x: 0, y: 0 }
            ],
            //fill: '#FFFFFF',
            stroke: '#9722f6'
          },
          width: 1,
          height: 1,
          tween: scope.tween
        } );
        item.editMode = true;
        scope.item.path.left = p.x;
        scope.item.path.width = 1;
        scope.item.path.height = 1;
        scope.item.path.top = p.y;
        scope.item.updatePathBoundingBox(scope.item.path);

        scope.path = scope.item.path.commands;


        scope.movables.update(1, 1, 1, 1, 0, 0);
        scope.activeMovable = scope.movables.movables.length-1;
        scope.game.addObject( scope.item )
        scope.game.world.addChild( scope.item )
      }
      scope.game.gameLoop()
      if(doubleClick){
        scope.item.editMode = false;
      }
    }

    if(scope.tool === 'move') {
      var localP = scope.item.pointToObject( e.point );
      var nearest = scope.movables.getAtPoint(localP);
    }


    if(nearest && scope.tool === 'move'){
      // TODO: REWRITE
      var l = scope.item.path.left,
          t = scope.item.path.top,
          w = scope.item.path.width,
          h = scope.item.path.height,
        sx = scope.item._scaleX,
        sy = scope.item._scaleY,

          W = scope.item.width;
      var tx = a => (a-l-w/2)*sx;
//
      var start = nearest.point.clone();
      var l1 = nearest.l1 && nearest.l1.point.clone();
      var l2 = nearest.l2 && nearest.l2.point.clone();
      var rotation = scope.item.getWorldRotation();
      var path = scope.item.path;
      var initialPosition =
        scope.item._position.clone().sub(
          new Point(
            (path.left+path.width/2)*scope.item._scaleX,
            (path.top+path.height/2)*scope.item._scaleY
          ).rotate(-rotation)
        );

      D.mouse.dragBehavior(false, {
        cursor: 'move',
        up: ()=>{
          scope.item.lastScaleKey = false;
          scope.item.updatePathBoundingBox(scope.item.path);
          var path = scope.item.path;
          scope.item.width = path.width;
          scope.item.height = path.height;
          var endPosition = new Point(
            (path.left+path.width/2)*scope.item._scaleX,
            (path.top+path.height/2)*scope.item._scaleY
          ).rotate(-rotation)
          scope.tween.updateKeyFrame(scope.item, scope.tween.getCurrentFrame(), {

            _positionX: endPosition.x+initialPosition.x,//(path.left-scope.initialPoint.x)/2,
            _positionY:endPosition.y+initialPosition.y//(path.top-scope.initialPoint.y)/2,
          });
          scope.movables.update(scope.item._scaleX, scope.item._scaleY, path.width, path.height, path.left, path.top);
        },
        move: Store.debounce((deltaPX,me,e)=>{

          deltaPX.rotate(rotation)
          nearest.point.x = start.x+deltaPX.x*scope.pxRatio;
          nearest.point.y = start.y+deltaPX.y*scope.pxRatio;

          var newX = (start.x+deltaPX.x*scope.pxRatio)/sx+l+w/2;
          var newY = (start.y+deltaPX.y*scope.pxRatio)/sy+t+h/2;

          if(nearest.command.type === 'L' || nearest.command.type === 'M' || (nearest.command.type === 'C' && nearest.isMain)){
            nearest.command.x = newX;
            nearest.command.y = newY;
            if(l1){
              nearest.l1.command.x2 = (l1.x+deltaPX.x*scope.pxRatio)/sx+l+w/2;
              nearest.l1.command.y2 = (l1.y+deltaPX.y*scope.pxRatio)/sy+t+h/2;
              nearest.l1.point.x = l1.x+deltaPX.x*scope.pxRatio;
              nearest.l1.point.y = l1.y+deltaPX.y*scope.pxRatio;
            }
            if(l2){
              nearest.l2.command.x1 = (l2.x+deltaPX.x*scope.pxRatio)/sx+l+w/2;
              nearest.l2.command.y1 = (l2.y+deltaPX.y*scope.pxRatio)/sy+t+h/2;
              nearest.l2.point.x = l2.x+deltaPX.x*scope.pxRatio;
              nearest.l2.point.y = l2.y+deltaPX.y*scope.pxRatio;
            }
          }else{

            if(nearest.x === 1){
              nearest.command.x1 = newX;
              nearest.command.y1 = newY;
            }else{
              nearest.command.x2 = newX;
              nearest.command.y2 = newY;
            }
          }
          scope.item.lastScaleKey = false;
          scope.game.gameLoop()
        })
      })(e.event);
      console.log(nearest)
    }else{
      if(doubleClick){
        scope.item.doubleClick(e, scope)
      }
    }
  },
  move: Store.debounce(function(e, ctx, scope){

    if(scope.movables && scope.initialPoint){
      var p = scope.getRelativePoint(e.event);
      /*var p = scope.camera.pointToObject(scope.game.eventWrapper(e).point)
      var initial = scope.initialPoint;*/

      //scope.movables.ghost(delta.x, delta.y);

      scope.movables.ghostNextPoint(scope.getRelativePoint(e.event))
    }
    if(scope.tool === 'move') {
      var localP = scope.item.pointToObject( e.point );

      scope.movables.movables.forEach( p => {
        p.active = p.point.distance( localP ) < 6 * scope.pxRatio
      } );
    }else if(scope.tool === 'peek'){
      var whatIsIt = scope.movables.getAtPoint(p);
      if(whatIsIt){
        scope.movables.highlight(whatIsIt);
      }
      console.log(whatIsIt);
      // HIGHLIGHT IT
      if(scope.pressed){
        var initial = scope.downPoint;
        var distance = initial.distance(e.point);
        if(distance>3){
          var m = scope.movables[scope.activeMovable]
          scope.ghost = e.point.subClone(initial);
        }
      }else{



      }
    }
    scope.game.gameLoop()
  },10),
  up: function(e, ctx, scope){
    scope.pressed = false;
  },

};