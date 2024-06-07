;(function(){
  var keyFramesHash = {};


  var KeyFrameDOM = function(tween){
    this.dom = D.div({
      cls: 'tween-key',
      /*onmouseenter: ()=> tween.hoveredItem.set(this.hoverID),
      onmouseleave: ()=> tween.hoveredItem.set(-1),*/
    }, this.tiny = D.div({cls: 'tween-key__tiny'}));
    this.easing = D.div({
      cls: 'tween-easing',
      onclick: ()=> {
        this.frame.easing = Tween.randomEasing();
        this.updateEasing(this.frame.easing);
        this.easing.classList.add('tween-easing--selected');
        tween.showProperties(this, this.key);
      }
    }, this.svg = D.svg({width: 24, height: 16, cls: 'tween-easing-icon'}));

    D.mouse.dragBehavior(this.dom, {
      check: (e, context)=>{
        context.leftTweenFrame = tween.leftTweenFrame.get();
        context.scale = tween.tweenScale.get();
        context.frame = this.frame;
        context.startFrame = this.frame.frame;
        context.other = keyFramesHash[this.key];
        context.isActive = this.dom.classList.contains('_active');
        if(!context.isActive) {
          this.dom.classList.add( '_active' );
        }
      },
      cursor: 'ew-resize',
      move: Store.debounce(
        (delta, context)=>{
          context.frame.frame = Math.round(context.startFrame + delta.x * context.scale);
          var val = (context.frame.frame-context.leftTweenFrame)/context.scale-8 +'px';
          context.other.forEach(kfd => kfd.dom.style.left = val);
        },5
      ),
      up: (e, context)=>{
        this.frames.sort((a,b)=>a.frame-b.frame);
        tween.updateCanvas();
        if(!context.isActive){
          this.dom.classList.remove( '_active' );
        }
      }
    });
  }
  KeyFrameDOM.prototype = {
    updateEasing: function(easing){
      if(easing !== this.lastEasing){
        this.lastEasing = easing;
        if(!this.easingPath) {
          this.easingPath = D.path({style: "fill:none;stroke:#00d9ff;stroke-width:2px"});
          this.svg.appendChild(this.easingPath)
        }

        var h = 14, w = 24;
        var path = [];
        for(var i = 1; i < w; i++){
          path.push('L'+i+' '+ (h-this.lastEasing(i/w)*h+1).toFixed(3));
        }
        this.easingPath.setAttribute('d', 'M0 '+h+' '+path.join(' '))
      }
    },
    set: function(cfg){
      if(this.left !== cfg.x || this.top !== cfg.y || this.color !== cfg.color){
        Object.assign(this.dom.style, {
          left: cfg.x+'px',
          //top: cfg.y+'px',
        });
        this.tiny.style.backgroundColor = cfg.color
        this.left = cfg.x;
        this.top = cfg.y;
        this.color = cfg.color;
        this.prevFrame && this.setEasing(this.prevFrame);
        this.nextFrame && (this.nextFrame.setEasing(this));
      }


      this.hoverID = cfg.hoverID;
      if(this.frame !== cfg.frame) {
        this.frame = cfg.frame;
      }
      this.updateEasing(cfg.frame.easing);
      this.frames = cfg.frames;
      this.key = cfg.key;
      if(this.renderTo !== cfg.renderTo) {
        this.renderTo = cfg.renderTo;
        this.renderTo.appendChild(this.dom);
      }
      this.collapsed = cfg.collapsed;
      (keyFramesHash[cfg.key] || (keyFramesHash[cfg.key] = [])).push(this);
    },
    setEasing: function(prevFrame){
      this.prevFrame = prevFrame;
      this.prevFrame.nextFrame = this;

      var width = this.left - prevFrame.left-6;

      if(this.collapsed || width<24){
        this.easing.parentNode && this.easing.parentNode.removeChild(this.easing);
        return
      }

      this.easing.renderTo = this.renderTo;
      this.renderTo.appendChild( this.easing );
      this.easing.style.left = prevFrame.left+10+'px';
      this.easing.style.width = width +'px';
    }
  }

  var KeyFramesPool = function(cfg){
      Object.assign(this, cfg);
      this.items = [];
  };
  KeyFramesPool.prototype = {
    count: 0,
    items: [],
    cursor: 0,
    lastCursor: 0,
    get: function(){
      this.cursor++;
      if(this.count < this.cursor) {
        this.count++;
        this.items.push(new KeyFrameDOM(this.tween))
      }
      return this.items[this.cursor - 1];
    },
    start: function(){
      this.lastCursor = this.cursor;
      keyFramesHash = {};
      this.cursor = 0;
    },
    finish: function(dom){
      for(var i = this.lastCursor, _i = this.cursor; i < _i; i++){
        this.items[i].renderTo.appendChild(this.items[i].dom)
        //dom.appendChild(this.items[i].dom)
      }
      _i = i;
      i = this.cursor;
      for(i; i < _i; i++){
        var parent = this.items[i].dom.parentNode;
        parent && parent.removeChild(this.items[i].dom);
        parent = this.items[i].easing.parentNode;
        parent && parent.removeChild(this.items[i].easing)
      }
    }
  };

  var ITEM_HEIGHT = 16;
  Tween.prototype.initTweenInterconnection = function(){
    this.selection = [];
    this.scrollPosition = new Store.Value.Number(this.tweenItems.scrollTop);
    var i, _i, j, _j, item, info, keyFrameData = [], top, itemHeight, drawStart;
    var backStrike, currentFrame, k, _k;

    var keyFramesPool = this.keyFramesPool = new KeyFramesPool({tween: this})

    var tuneCurrentFrames = ()=>{
      currentFrame = this.currentFrame.get();
      for(i = 0, _i = keyFrameData.length; i<_i; i++){
        info = keyFrameData[i].info;
        /*        if(info.collapsed.get())
                  continue;*/

        backStrike = keyFrameData[i].backStrike;
        for(j in backStrike){
          var cached = backStrike[j];
          _k = cached.length;

          if(_k === 1){
            cached[ 0 ].active = true;
            continue;
          }

          for(k = 0, _k = cached.length; k < _k;k++){
            cached[ k ].active = false;
            cached[ k ].activeEasing = false;
          }

          if(currentFrame < cached[0].frameInfo.frame){
            cached[ 0 ].active = true;
          }else{
            if(currentFrame >= cached[_k - 1].frameInfo.frame){
              cached[ _k - 1 ].active = true;
            }else{
              for(k = 1, _k = cached.length; k < _k;k++){
                if(cached[k-1].frameInfo.frame<=currentFrame && cached[k].frameInfo.frame>currentFrame){
                  cached[k-1].active = true;
                  cached[k].active = true;
                  cached[k].activeEasing = true;
                  //cached[k].key.easingFrom = cached[k-1];
                  break;
                }
              }
            }
          }
          for(k = 0, _k = cached.length; k < _k;k++){
            if(cached[k].active !== cached[k].lastActive) {
              cached[k].lastActive = cached[k].active;
              if( cached[ k ].active ) {
                cached[ k ].key.dom.classList.add( '_active' );
              } else {
                cached[ k ].key.dom.classList.remove( '_active' );
              }

            }
            if(cached[k].activeEasing !== cached[k].lastActiveEasing) {
              cached[k].lastActiveEasing = cached[k].activeEasing;
              if( cached[ k ].activeEasing ) {
                cached[ k ].key.easing.classList.add( '_active' );
              } else {
                cached[ k ].key.easing.classList.remove( '_active' );
              }
            }

          }
        }
      }
    }
    var _updateKeyFrames = ()=>{
      requestAnimationFrame(tuneCurrentFrames)
    }
    var updateKeyFrames = ()=>{
      keyFramesPool.start();
      for(i = 0, _i = keyFrameData.length; i<_i; i++) {
        keyFrameData[ i ].backStrike = {};
        this.updateDomItems( keyFrameData[ i ], keyFramesPool );
      }
      keyFramesPool.finish(this.tweenCanvas);
      tuneCurrentFrames();
    };

    this.__un.add(D.s.sub([
        this.scrollPosition, this.canvasWidth, this.canvasHeight, this.leftTweenFrame, this.tweenScale,
        this._updateCanvas
      ],
      (scrollPosition, canvasWidth, canvasHeight, leftTweenFrame, scale)=>{
        var start = 0;
        //this.tweenCtx.clearRect(0,0, canvasWidth, canvasHeight);
        keyFrameData = [];
        top = 0;
        var drawStart = false;
        for( i = 0; i < this.selection.length; i++ ) {
          item = this.selection[ i ];
          info = this.items[item.__tweenID];
          itemHeight = info.collapsed.get() ? ITEM_HEIGHT : ITEM_HEIGHT*(1+info.propertiesCount)
          if(scrollPosition-itemHeight<=top && scrollPosition+canvasHeight+ITEM_HEIGHT>=top){
            drawStart = true;
            keyFrameData.push({
              tween: this.tweenItemsMap.get(item).tween,
              item, info,
              itemHeight, top:top-scrollPosition,
              leftTweenFrame, scale,
              backStrike: {},
              _top: top
            });
            //this.updateCanvasItems(item, info, itemHeight, top-scrollPosition, leftTweenFrame, scale);
          }else if(drawStart === true){
            break;
          }
          top += itemHeight;
        }
        requestAnimationFrame(updateKeyFrames);
        //console.log(drawList.map(a=>a.toString()));
      }));
    this.__un.add(D.s.sub([this.currentFrame], _updateKeyFrames));

    this.tweenItems.addEventListener('scroll', (e)=>{
      this.scrollPosition.set(this.scrollableTween.scrollTop = this.tweenItems.scrollTop);
    });
    this.scrollableTween.addEventListener('scroll', (e)=>{
      this.scrollPosition.set(this.tweenItems.scrollTop = this.scrollableTween.scrollTop);
    });
  };

  var i, _i, j, _j,
    collapsed, offset, key, prop, propertyID, frames, row, frameInfo;

  Tween.prototype.updateDomItems = function({tween, _top, item, info, itemHeight, top, leftTweenFrame, scale, backStrike}, keyFramesPool){
    collapsed = info.collapsed.get();
    offset = top;
    row = 0;
    for( i = 0, _i = info.props.length; i < _i; i++ ) {
      key = info.props[ i ].key;
      prop = info.properties[key];
      propertyID = info.props[i].propertyID;
      offset += ITEM_HEIGHT;
      frames = info.framesInfo[key];
      if(!frames)
        continue;
      for(j = 0, _j = frames.length; j < _j; j++) {
        frameInfo = frames[ j ];

        var y = offset, x = ( frameInfo.frame - leftTweenFrame ) / scale;
        var frame = keyFramesPool.get();
        ( backStrike[ row ] || ( backStrike[ row ] = [] ) ).push( { key: frame, frameInfo } );

        if( collapsed ) {
          frame.set( {
            x: x - 8, y: top - 8 + ITEM_HEIGHT / 2, width: 5, height: 5, color: prop.keyFrameColor || '#00d9ff',
            hoverID: item.__tweenID,
            frame: frameInfo,
            key: frameInfo.keyID,
            frames: frames,
            renderTo: tween.title,
            collapsed
          } );
        } else {
          frame.set( {
            x: x - 8, y: y - 8 + ITEM_HEIGHT / 2, width: 5, height: 5, color: prop.keyFrameColor || '#00d9ff',
            hoverID: propertyID,
            frame: frameInfo,
            key: frameInfo.keyID,
            frames: frames,
            renderTo: tween.props[key],
            collapsed
          } );

        }
      }
      row++;
    }
    for(j in backStrike) {
      frames = backStrike[j];
      if(!frames.length || frames[0].collapsed)
        continue;

      // TODO if `looped` — first adds last easing
      for( i = 1, _i = frames.length; i < _i; i++ ) {
        frames[i].key.setEasing(frames[i-1].key);
      }
    }

  },

  window.KeyFrameDOM = KeyFrameDOM;
  window.KeyFramesPool = KeyFramesPool;

})();