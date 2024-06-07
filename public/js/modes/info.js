LetterWork.prototype.modes.info = {
  scope: {
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
    select: function(list, last){
      this.camera.visit( Item, function( item ) {
        item.selected = false;
      } );
      if(last && list.length)
        list = [list[list.length-1]];

      list.forEach( item => item.selected = true )
      this.selection = list;
      this.editableGroup.show( list )
      this.main.selectedChars = list.filter(a=>a instanceof Item);
      this.tween.updateSelection(this.main.selectedChars, this.main.selectedLines);
      this.main.properties.updateSelection(this.main.selectedChars, this.main.selectedLines);
    }
  },
  down: function(e, ctx, scope){
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
          break;
        }
      }
    }else{
      scope.selector = true;
      scope.selectionRect.show({width: 0, height: 0,start: scope.downPoint, selectType: Item, select: scope.select.bind(scope)});
    }
  },
  move: Store.debounce(function(e, ctx, scope){

    if(scope.button !== -1 && !scope.interactor && scope.items.length && !scope.preventUp){
      scope.select(scope.items, true);
      scope.interactor = scope.editableGroup;
      scope.interactor.down(e, scope, ctx)
    }
    if(scope.interactor) {
      scope.interactor.move( e, scope, ctx );
    }else if(scope.selector){
      scope.selectionRect.update( e, scope, ctx );
    }else{


      var list = scope.lw.game.camera.getChildrenAtPoint( e.point, Interact );
      scope.lw.renderTo.style.cursor = 'auto';
      if( list.length ) {
        scope.lw.renderTo.style.cursor = list[ list.length - 1 ].cursor;
      }

      var list = scope.lw.game.camera.getChildrenAtPoint( e.point, Item );
      scope.lw.game.camera.visit( Item, function( item ) {
        item.highlight = false;
      } );
      list.forEach( item => {
        item.highlight = item.collider( item.pointToObject( e.point ) )
      } );
    }
    /*scope.lw.lines.forEach(line=>
    line.children.forEach(char=> {
      var point = char.pointToObject(e.point)

      var is = scope.lw.game.camera.ctx.isPointInPath(char.getPath(), point.x, point.y);
      char.highlight = is;
    }))*/
    scope.lw.game.gameLoop()
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
      var list = scope.lw.game.camera.getChildrenAtPoint( e.point, Item )
        .filter( item => item.collider( item.pointToObject( e.point ) ) );


      if( e.event.ctrlKey && e.event.shiftKey ) {
        list = Union.subtract( scope.selection, list, 'id' );
      } else if( e.event.ctrlKey ) {
        list = Union.xor( list, scope.selection, 'id' );
      }
      scope.select(list);

      /*if(list.length){
      }*/
    }

    if(scope.selector){
      scope.selectionRect.hide();
      scope.selector = false;
    }

    if(scope.interactor) {
      scope.interactor = false;
    }

    scope.lw.game.gameLoop()
    LetterWork.prototype.modes.info.move.call(scope.lw.game, e,ctx, scope)
  },

};