LetterWork.prototype.modes.letter = {
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
    }
  },

  move: Store.debounce(function(e, ctx, scope){
    var lw = scope.lw;
    g.gameLoop();
    if(scope.dragging){
      var p =  scope.selectionRect.pointToObject(e.point);

      var delta = p.subClone(scope.startPoint);

      lw.selectedChars.forEach((c, n)=>{
        lw.tween.updateKeyFrame(c, lw.tween.getCurrentFrame(), {
          _positionX: scope.positions[n].x + delta.x,
          _positionY: scope.positions[n].y + delta.y
        })

      });

      //scope.positions =
    }
    if(!scope.down)
      return;
    var clickedOn = this.pointToObject(e.point);
    var currentTextLine = scope.getCurrentClickLine(e, clickedOn);
    var currentLineNumber = lw.lines.indexOf(currentTextLine);
    if(currentLineNumber === -1)
      return;
    if(currentTextLine !== scope.startLine){
      if(currentLineNumber < scope.startLineNumber){
        scope.startLine.selection.to = 0;
        for(var i = scope.startLineNumber - 1; i>currentLineNumber-1; i--){
          lw.lines[i].selection.from = lw.lines[i].symbols.length - 1;
          lw.lines[i].selection.to = 0;
        }
        for(;i>-1;i--){
          lw.lines[i].selection.from = -1;
        }
        var to = -1;
        clickedOn
          .filter( a => a instanceof Glyph && a.parent === currentTextLine )
          .forEach( s => {
            to = s.parent.symbols.indexOf( s );
          } );
        if(to !== -1) {
          currentTextLine.selection.to = to;
        }else{
          if(currentTextLine.symbols[0].pointToObject(e.point).x<0){
            currentTextLine.selection.to = 0;
          }else{
            currentTextLine.selection.from = -1;
          }
        }
      }else{
        scope.startLine.selection.to = scope.startLine.symbols.length - 1;
        for(var i = scope.startLineNumber + 1; i<currentLineNumber; i++){
          lw.lines[i].selection.from = 0;
          lw.lines[i].selection.to = lw.lines[i].symbols.length - 1;
        }

        for(;i<lw.lines.length;i++){
          lw.lines[i].selection.from = -1;
        }
        var to = -1;
        clickedOn
          .filter( a => a instanceof Glyph && a.parent === currentTextLine )
          .forEach( s => {
            to = s.parent.children.indexOf( s );
          } );
        if(to !== -1) {
          currentTextLine.selection.from = 0;
          currentTextLine.selection.to = to;
        }else{
          if(currentTextLine.symbols[0].pointToObject(e.point).x<0){
            currentTextLine.selection.from = -1;
          }else{
            currentTextLine.selection.from = 0;
            currentTextLine.selection.to = currentTextLine.symbols.length - 1;

          }
        }
      }
    } else {
      for(var i = 0; i < lw.lines.length; i++) {
        if( i !== currentLineNumber ) {
          lw.lines[i].selection.from = -1;
        }
      }

      var to = -1;
      clickedOn
        .filter( a => a instanceof Glyph && a.parent === currentTextLine )
        .forEach( s => {
          to = s.parent.symbols.indexOf( s );
        } )

      if(to !== -1) {
        currentTextLine.selection.to = to;
      }else{
        if(currentTextLine.symbols[0].pointToObject(e.point).x<0){
          currentTextLine.selection.to = 0;
        }else{
          currentTextLine.selection.to = currentTextLine.symbols.length - 1;
        }
      }
    }
  },10),
  up: function(e, ctx, scope){
      var lw = scope.lw;
    g.gameLoop();
    if(scope.dragging) {
      scope.dragging = false;
      lw.tween.updateCanvas()
      return;
    }
    scope.down = false;
    lw.selectedLines = lw.lines.filter(l => l.selection.from > -1);
    lw.selectedChars = [].concat.apply([], lw.selectedLines
      .map(l =>
        l.selection.to > l.selection.from ?
          l.symbols.slice(l.selection.from,l.selection.to+1) :
          l.symbols.slice(l.selection.to,l.selection.from+1)
      ));
    lw.properties.updateSelection(lw.selectedChars, lw.selectedLines);
    lw.tween.updateSelection(lw.selectedChars, lw.selectedLines);
  },
  down: function(e, ctx, scope){
    var lw = scope.lw;

    g.gameLoop();
    var time = +new Date();


    scope.down = true;


    var clickedOn = this.pointToObject(e.point);
    var currentTextLine = scope.getCurrentClickLine(e, clickedOn);

    scope.startLine = currentTextLine;
    scope.startLineNumber = lw.lines.indexOf(currentTextLine);

    scope.dragging = false;


    var selection = clickedOn.filter(a=>a instanceof TextLineSelection);
    if(scope.lastDown > time-400){
      console.log('doubleClick');
      lw.lines.forEach(l=>l.selection.from = -1);

      clickedOn
        .filter(a=>a instanceof Glyph && a.parent === currentTextLine)
        .forEach(s=>{
          s.parent.selection.from = s.parent.children.indexOf(s);
          s.parent.selection.to = s.parent.children.indexOf(s);
        })

      // DOUBLE CLICK
      for(var i = currentTextLine.selection.from-1; i > -1; i--){
        if(currentTextLine.symbols[i].char.match(/[^\s\!\.\,\;\:\?\*\&\^\%\@]/) === null){
          break
        }
        currentTextLine.selection.from--;
      }
      for(var i = currentTextLine.selection.to+1, _i = currentTextLine.symbols.length; i < _i; i++){
        if(currentTextLine.symbols[i].char.match(/[^\s\!\.\,\;\:\?\*\&\^\%\@]/) === null){
          break
        }
        currentTextLine.selection.to++;
      }
      scope.down = false;

      time = 0;
    }else if(selection[0]){

      console.log('dragging')
      scope.positions = lw.selectedChars.map(c=>c._position.clone());
      scope.selectionRect = selection[0];
      scope.startPoint = scope.selectionRect.pointToObject(e.point);

      scope.dragging = true;
      scope.down = false;
      return;
    }else{
      lw.lines.forEach(l=>l.selection.from = -1);

      console.log('clicking');
      clickedOn
        .filter(a=>a instanceof Glyph && a.parent === currentTextLine)
        .forEach(s=>{
          s.parent.selection.from = s.parent.children.indexOf(s);
          s.parent.selection.to = s.parent.children.indexOf(s);
        })
    }
    console.log(clickedOn);
    scope.lastDown = time;


    //console.log(clickedOn.map(el=>this.camera.pointToWorld.call(el, e.point)));

  }
};