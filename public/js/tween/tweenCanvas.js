Tween.prototype.updateCanvas = function(){
  this._updateCanvas.set(+new Date());
};
Tween.prototype.resizeHeight = function(){
  this.updateTweenCanvasSize();
};
Tween.prototype.updateTweenCanvasSize = function(){
  var size = this.tweenTimeline.getBoundingClientRect();
  var width = size.width|0;
  var height = size.height|0;
  this.canvasWidth.set(width);
  this.canvasHeight.set(height-3);
};
Tween.prototype.initTweenCanvas = function(){
  this._updateCanvas = new Store.Value.Number(0);

  this.leftTweenFrame = Store.Value.init('Number', this.leftTweenFrame || -20);
  this.tweenScale = Store.Value.init('Number', this.tweenScale || 0.2);

  this.canvasWidth = new Store.Value.Number(0);
  this.canvasHeight = new Store.Value.Number(0);

  this.hoveredItem = new Store.Value.Any(-1);


  //this.tweenCtx = this.tweenCanvas.getContext('2d');
  document.addEventListener('visibilitychange',  ()=> {
    if (!document.hidden) {
      this.updateCanvas()
    }
  });
  this.__un.add(
    D.s.sub('width', (width)=>{
      this.updateTweenCanvasSize();
      this.updateCanvas()
    })
  );

  this.__un.add(
    D.s.sub([this.canvasWidth], (width)=>{
      this.tweenCanvasWidth = width;
      this.tweenCanvas.width = width;
      this.tweenCanvas.style.width = width + 'px';
    })
  );

  this.__un.add(
    D.s.sub([this.canvasHeight], (height)=>{
      this.tweenCanvasHeight = height;
      this.tweenCanvas.height = height;
      this.tweenCanvas.style.height = height + 'px';
    })
  );

  this.__un.add(
    D.s.sub([this.currentFrame, this.leftTweenFrame, this.tweenScale],
      (currentFrame, leftTweenFrame, tweenScale)=>{
        requestAnimationFrame(()=>{
          this.tweenCurrentFrameLine.style.left = Math.round((currentFrame-leftTweenFrame)/tweenScale) +'px'
        });
      })
  );

  this.__un.add(
    D.s.sub([this.startFrame, this.endFrame, this.leftTweenFrame, this.tweenScale],
      (startFrame, endFrame, leftTweenFrame, tweenScale)=>{
        this.tweenPlayZone.style.left = Math.round((startFrame-leftTweenFrame)/tweenScale) +'px'
        this.tweenPlayZone.style.width = Math.round(((endFrame-startFrame))/tweenScale) +'px'
      })
  );

  this.__un.add(
    D.s.sub([this.leftTweenFrame, this.tweenScale, this.canvasWidth, this.canvasHeight],
      (leftTweenFrame, tweenScale, width, height)=>{
        D.removeChildren(this.tweenTimelineFramesHeader);
        var els = [];
        var minScale = Math.round(tweenScale *40/5)*5;
        if(minScale === 0)
          minScale = 2;
        var i = (minScale-(leftTweenFrame%minScale)-minScale*2)/tweenScale;
        var step = minScale/tweenScale;
        for(var _i = width+minScale*4; i < _i; i+=step){
          var frame = Math.round(i*tweenScale + leftTweenFrame);
          els.push(D.div({
              cls: 'tween__timeline-frame',
              style: {left: i+'px'}
            }, frame,
            D.div({cls: 'tween__timeline-frame--down', style: {height: height+'px'}})));
        }
        D.appendChild(this.tweenTimelineFramesHeader, els)
      })
  );

  this.__un.add(
    D.unsubscribable('wheel')(this.tweenTimelineHolder, (e)=>{
      if(e.ctrlKey) {
        var scale = this.tweenScale.get();
        var leftFrame = this.leftTweenFrame.get();
        var x = e.clientX-this.tweenTimelineHolder.getBoundingClientRect().left;
        var frame = x*scale+leftFrame;

        var newScale = scale*(e.deltaY>0?1.1:0.9);
        newScale = Math.max(0.05, Math.min(newScale, 10));
        newScale = Math.round(newScale*100)/100;

        this.tweenScale.set(newScale)

        this.leftTweenFrame.set(frame-x*newScale);
        //debugger
        e.preventDefault();
        e.stopPropagation();
        console.log(newScale)
      }
    }, true)
  );

  this.__un.add(
    D.mouse.dragBehavior(this.tweenTimelineHolder, {
      check: (e, context)=>{
        if(!(e.button === 1 || e.button === 4))
          return false;
        context.start = this.leftTweenFrame.get();
        context.scale = this.tweenScale.get();
      },
      cursor: 'ew-resize',
      move: Store.debounce(
        ((delta, context)=> this.leftTweenFrame.set(context.start - delta.x*context.scale)),
        5)
    })
  );

  this.__un.add(
    D.mouse.dragBehavior(this.tweenCurrentFrameLine, {
      check: (e, context)=>{
        context.start = this.currentFrame.get();
        context.scale = this.tweenScale.get();
        context.startFrame = this.startFrame.get();
        context.endFrame = this.endFrame.get();
      },
      cursor: 'ew-resize',
      move: Store.debounce(
        ((delta, context)=>
            this.currentFrame.set(Math.round(
              Math.min(context.endFrame, Math.max(context.startFrame, context.start + delta.x*context.scale))
            ))
        ),
        5)
    })
  );

  this.__un.add(
    D.mouse.dragBehavior(this.tweenTimelineFramesHeader, {
      check: (e, context)=>{
        this.currentFrame.set(Math.round(e.layerX*this.tweenScale.get()+this.leftTweenFrame.get()));
        context.start = this.currentFrame.get();
        context.scale = this.tweenScale.get();
        context.startFrame = this.startFrame.get();
        context.endFrame = this.endFrame.get();
      },
      cursor: 'ew-resize',
      move: Store.debounce(
        ((delta, context)=>
            this.currentFrame.set(Math.round(
              Math.min(context.endFrame, Math.max(context.startFrame, context.start + delta.x*context.scale))
            ))
        ),
        5)
    })
  );
};