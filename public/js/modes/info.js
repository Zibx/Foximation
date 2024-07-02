Loopy.prototype.modes.info = {
  scope: {
    lastDown: 0,
    getCurrentClickLine: function(e, clickedOn){
      var currentTextLine, currentTextLineDY;
      clickedOn
        .filter(a=>a instanceof TextLine)
        .forEach(textLine => {
          var dy = Math.abs(textLine.pointToObject(e.point).y);
          if(!currentTextLine || dy<currentTextLineDY) {
            currentTextLine = textLine;
            currentTextLineDY = dy
          }
        });
      return currentTextLine;
    },
    selection: [],
    button: -1,
    list: [],
    items: [],
  },
  down: function(e, ctx, scope){
    var time = +new Date();

    var doubleClick = scope.lastDown > time-400
    scope.lastDown = time;

    scope.downPoint = e.point.clone();
    scope.button = e.event.button;
    scope.preventUp = false;
    console.log(scope.button)
    scope.items = scope.camera.getChildrenAtPoint(e.point, Item);
    var list = scope.camera.getChildrenAtPoint(e.point, Interact);
    scope.interactor = false;
    scope.selector = false;
    if(list.length){
      
      var result = [], res;
      for(var i = list.length; i--;){
        res = list[i].down(e, scope, ctx);

        if(res) {
          if(list[i].manual) {
            scope.preventUp = true;
            break;
          }
          scope.interactor = list[i];
          if(doubleClick)
            list[i].doubleClick && list[i].doubleClick(e,scope, ctx)
          break;
        }
      }
    }else{
      scope.selector = true;
      scope.selectionRect.show({width: 0, height: 0,start: scope.downPoint, selectType: Item});
    }
  },
  move: Store.debounce(function(e, ctx, scope){

    if(scope.button !== -1 && !scope.interactor && scope.items.length && !scope.preventUp){
      scope.main.selection.update( scope.items, e, true );

      scope.interactor = scope.editableGroup;
      scope.interactor.down(e, scope, ctx)
    }
    if(scope.interactor) {
      scope.interactor.move( e, scope, ctx );
    }else if(scope.selector){
      scope.selectionRect.update( e, scope, ctx );
    }else{


      var list = scope.game.camera.getChildrenAtPoint( e.point, Interact );
      scope.main.renderTo.style.cursor = 'auto';
      if( list.length ) {
        scope.main.renderTo.style.cursor = list[ list.length - 1 ].cursor;
      }

      var list = scope.game.camera.getChildrenAtPoint( e.point, Item );


      scope.main.selection.highlight( list.filter(item => item.pointToObject( e.point )) );
      //this.main.game.camera.visit( Item,

    }

    scope.game.gameLoop()
  },10),
  up: function(e, ctx, scope){
    if(scope.preventUp){
      this.interactor = false;
      return;
    }

    var notMoved = scope.downPoint.subClone(e.point).magnitude()===0;
    if(notMoved && scope.items.length && !(e.event.ctrlKey||e.event.shiftKey)){
      scope.interactor = false;
    }
    scope.button = -1;
    if(scope.interactor) {
      scope.interactor.up( e, scope, ctx );
    }
    if((!scope.selector && !scope.interactor) || notMoved){
      var list = scope.game.camera.getChildrenAtPoint( e.point, Item )
        .filter( item => item.collider( item.pointToObject( e.point ) ) );

      scope.main.selection.update( list, e, notMoved );

    }

    if(scope.selector){
      scope.selectionRect.hide();
      scope.selector = false;
    }

    if(scope.interactor) {
      scope.interactor = false;
    }

    scope.game.gameLoop()
    Loopy.prototype.modes.info.move.call(scope.game, e,ctx, scope)
  },

};