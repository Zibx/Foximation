var Tween = function(cfg = {}){
  this.__un = new D.Unsubscribe()
  D.assign( this, cfg );

  this.items = {};


  this.play = Store.Value.init('Boolean', this.play || false);

  this.startFrame = Store.Value.init('Number', this.startFrame || 1);
  this.endFrame = Store.Value.init('Number', this.endFrame || 1);
  this.currentFrame = Store.Value.init('Number', this.currentFrame || 1);
  this.debug = Store.Value.init('Boolean', this.debug || false);

  if(this.noView)
    return this;

  this.initDOM(cfg);
};


var ITEM_HEIGHT = 16;
Tween.prototype = {
  updateSelection: function(chars){
    this.selection = chars.filter(char=>'__tweenID' in char);
      D.removeChildren(this.tweenItems);
      D.appendChild(this.tweenItems, this.selection.map(c=>{
        if(!this.tweenItemsMap.has(c))
          this.tweenItemsMap.set(c, this.createTwinItem(c));

        return this.tweenItemsMap.get(c).tweenItem;
      }));

    D.removeChildren(this.scrollableTween);
    D.appendChild(this.scrollableTween, this.selection.map(c=>{
      return this.tweenItemsMap.get(c).placeholderItem;
    }));

    this.updateCanvas();//.set(+new Date());
  },
  lerpFunctions: {
    Number: function(a,b,c){
        return a+(b-a)*c;
    },
    Point: function(a,b,c){
        return b.subClone(a).mul(c).add(a);
    },
    Color: (function(){
      var c1 = new Color();
      var c2 = new Color();
        return function(a,b,c){
          c1.set(a);
          c2.set(b);

          return c1.lerp(c2, c).toHTML();
        }
    })()
  },
  tweenID: 1,
  addItem: function(item, properties){
    item.__tweenID = this.tweenID;
    var values = {};
    this.items[this.tweenID] = {item, properties, framesInfo: {}, frameInfo: {}, values: values};
    for(var key in properties){
      var property = properties[key];
      values[key] = property.getter(property.get.call(item));
    }
    this.tweenID++;
  },
  getProperties: function(item, frame){
    var info = this.items[item.__tweenID];
    var current = this.findCurrentAnimation(info, frame);
    if(current === false)
      return false;
    return this.transform(current, info.properties);
  },
  applyFrameProperties: (function(){
    var info, props, properties, key, prop;
    return function(item){
      info = this.items[item.__tweenID];
      props = info.properties;
      properties = this.findCurrentAnimation(info, this.getCurrentFrame());
      if(properties === false)
        return false;
      for(key in properties){
        prop = props[key];
        prop.set.call(item, prop.setter(properties[key]))
      }
    }
  })(),
  getCurrentFrame: function(){
    return Math.round(this.currentFrame.get());
  },
  nextFrame: function(add){
    if(!this.play.get())
      return;

    var frame = this.currentFrame.get(),
        from = this.startFrame.get(),
        to = this.endFrame.get();
    frame += add || 1;
    if(frame > to)
      frame = from;

    this.currentFrame.set(frame);
  },
  transform: function(data, properties){
      var out = {};
      for(var key in properties){
        var keyInfo = properties[key];
        if('result' in keyInfo){
          out[key] = keyInfo.result(data[key]);
        }else{
          out[key] = data[key];
        }
      }
      return out;
  },
  findCurrentAnimation: (function(){
    // This code would be called each frame for each object
    // To prevent garbage creation\collection — lets have static memory allocation
    var framesInfo, frameInfo, properties, key, property, currentFrameInfo,
      i, _i, exact, lower, higher, from, to, lerpFunctions, values;

    return function(info, frame){
      framesInfo = info.framesInfo;
      frameInfo = info.frameInfo;
      properties = info.properties;
      values = info.values;
      lerpFunctions = this.lerpFunctions;

      for(key in properties){
        property = properties[key];
        currentFrameInfo = framesInfo[key];

        if(!currentFrameInfo || currentFrameInfo.length === 0){
          frameInfo[key] = values[key];//property.value;
          continue
        }

        if(currentFrameInfo.length === 1){
          frameInfo[key] = currentFrameInfo[0].props[key];
          continue
        }
        higher = exact = -1;
        lower = -2;
        for( i = 0, _i = currentFrameInfo.length; i < _i; i++ ) {
          var framesInfoElement = currentFrameInfo[ i ];
          if(framesInfoElement.frame === frame){
            exact = i;
            lower = i - 1;
            higher = i + 1;
            break;
          }else if(framesInfoElement.frame>frame){
            lower = i - 1;
            higher = i;
            break;
          }
        }
        if(exact !== -1){
          frameInfo[key] = currentFrameInfo[exact].props[key];
          continue;
        }else{
          if(lower === -1){
            // BEFORE FIRST KEY FRAME
            frameInfo[key] = currentFrameInfo[higher].props[key];
            continue;
          }else if(higher === -1) {
            // AFTER LAST KEY FRAME
            frameInfo[ key ] = currentFrameInfo[ _i - 1 ].props[ key ];
            continue;
          }
        }

        from = currentFrameInfo[lower]; to = currentFrameInfo[higher];
        frameInfo[key] = lerpFunctions[property.type.name](
          from.props[key],
          to.props[key],
          to.easing((frame - from.frame)/(to.frame - from.frame)),
        );

      }
      return frameInfo;
    }
  })(),

  createOrSetFrameInfo: function(item, frame, properties, createOnly){
    var framesInfo = this.items[item.__tweenID].framesInfo;
    var keyFrame;
    for(var key in properties){
      var propertyFrames = framesInfo[key];
      if(!propertyFrames)
        propertyFrames = framesInfo[key] = [];

      var setted = false;
      if(createOnly !== true) {
        for( var i = 0; i < propertyFrames.length; i++ ) {
          var frameInfo = propertyFrames[ i ];
          if( frameInfo.frame === frame ) {
            frameInfo.props[ key ] = properties[ key ];
            setted = true;
            break;
          }
        }
      }
      if(!setted){
        keyFrame = keyFrame || new KeyFrame(frame, properties);
        propertyFrames.push(keyFrame)
        propertyFrames.sort((a,b)=>a.frame-b.frame);
      }
    }
    return keyFrame;
  },
  addKeyFrame: function(item, frame, properties){
    var info = this.createOrSetFrameInfo(item, frame, properties, true);
  },
  updateKeyFrame: function(item, frame, properties){
    if(!item.__tweenID)
      return;

    var info = this.createOrSetFrameInfo(item, frame, properties);
  },
  updateItemData: function(item, properties){
    if(!item.__tweenID)
      return console.error('item ', item, 'is not tweened. Try to set', properties);
    var itemInfo = this.items[item.__tweenID];
    for(var key in properties){
      itemInfo.values[key] = properties[key]
    }
  },
  showProperties: function(dom, frame){
    this.properties.updateSelection([{
      dom, frame, props: {Animation: [{name: 'Easing', type: 'EasingCurve'}]}
    }])
  }

};

