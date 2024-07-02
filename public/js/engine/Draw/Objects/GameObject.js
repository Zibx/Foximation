let id = 0;
let debugID = 0;
const Highlight = {
    color: '#f70'
};
const GameObject = function(cfg) {
    this.transform = new Transform();
    this.lastTransform = new Float32Array(6);
    this.width = 1;
    this.height = 1;
    this.scale = new Point(1,1);
    this.skewX = 0;
    this.skewY = 0;
    this.opacity = 1;
    this.relative = false;
    this.pxRatio = new Point(1,1);
    this.clip = false;
    this._overlay = {};
    Object.assign(this, cfg);

    if(!this.position)
        this.position = new Point(0,0);

    if(!this.origin)
        this.origin = new Point(0,0);

    this.tmpOrigin = new Point(0,0);

    if(!this.rotation)
        this.rotation = 0;

    this.children = [];
    this.layerChildren = {};
    this.id = id++;
    if(this.overlay)
        this.overlay.log = this.overlay.log || GameObject.prototype.overlay.log;
};
GameObject.prototype = {
  getWorldRotation: function(){
    return this.rotation + (this.parent ?this.parent.getWorldRotation() :0);
  },
    propsForClone: function(){
        var out = {
          width: this.width,
          height: this.height,
          scale: this.scale.clone(),
          skewX: this.skewX,
          skewY: this.skewY,
          opacity: this.opacity,
          position: this.position.clone(),
          origin: this.origin.clone(),
          tmpOrigin: this.tmpOrigin.clone(),
          rotation: this.rotation,
        };
      if(this.relative) {
        Object.assign( out, {
          _position: this._position.clone(),
          _scale: this._scale.clone(),
          _skewX: this._skewX,
          _skewY: this._skewY,
          _rotation: this._rotation
        } );
      }
      return out;
    },
    collider: function(p){
        return p.x >= -this.width/2 && p.x <= this.width /2 &&  p.y >= -this.height/2 && p.y <= this.height /2;
    },
    addChild: function(child, layer){
      child.parent = this;
      child.layer = layer;
      if(layer){
          (this.layerChildren[layer] || (this.layerChildren[layer] = [])).push(child);
      }else {
          this.children.push(child);
      }
      this.afterAddChild && this.afterAddChild(this, child, layer)
    },
    removeChild: function(child, layer) {
        var children;
        if(layer) {
            children = this.layerChildren[layer];
        }else{
            children = this.children;
        }
        var idx = children.indexOf(child);
        if(idx>-1) {
            children.splice(idx, 1);
        }
    },
    replaceChild: function(what, withWhat, layer){
      what.parent.children.splice(what.parent.children.indexOf(what),1, withWhat);
      withWhat.parent = what.parent;
      what.afterAddChild && what.afterAddChild(this, withWhat, layer)
    },
    hidden: false,
    relativeInit: function(){
      this.relative = true;
      this._scaleX = this._scaleX || 1;
      this._scaleY = this._scaleY || 1;
      this._position = this._position || new Point(0,0);
      this._width = this._width || 0;
      this._height = this._height || 0;
      this._scale = this._scale || new Point(1,1);
      this._skewX =  this._skewX ||0;
      this._skewY = this._skewY || 0;
      this._rotation = this._rotation || 0;
    },
    _draw: function(ctx, transform, layer, camera){
        if(this.hidden)
            return;
        var i = 0, children = this.children, _i, alpha;

        transform.save();
        if(this.relative) {
          transform._trs(
            this.position, -this.rotation,
            this.scale.x, this.scale.y,
            this.skewX, this.skewY,

            this._position, -this._rotation,
            this._scale.x, this._scale.y,
            this._skewX, this._skewY
          );
        }else{
          transform.trs(
            this.position, -this.rotation,
            this.scale.x, this.scale.y,
            this.skewX, this.skewY
          );
        }

        /*transform.translate(this.position.x,this.position.y);
        transform.rotate(-this.rotation);
        transform.scale(this.width, this.height);*/

        // TODO optimize

        var tmpOrigin = this.tmpOrigin;
        tmpOrigin.x = this.origin.x/2;
        tmpOrigin.y = this.origin.y/2;

        transform.translate(-tmpOrigin.x, -tmpOrigin.y);
        transform.copyTo(this.lastTransform);
        ctx.setTransform.apply(ctx, transform.m);


        if(this.opacity<1){
          alpha = ctx.globalAlpha;
          ctx.globalAlpha *= this.opacity;
        }

        if(this.layer === layer) {
          if(this.highlight) {
            Rectangle.prototype.draw.call(Object.assign({
              width: this.width,
              height: this.height,
              origin: this.origin
            }, Highlight), ctx, transform)
          }
          camera && camera.addClearRegion(this)

          this.draw(ctx, transform, void 0, camera);
        }




        if(this.clip){
          ctx.save();
          ctx.beginPath();
          ctx.rect(-this.width/2, -this.height/2, this.width, this.height)
          ctx.clip();
        }



        if(layer){
            children = this.layerChildren[layer];
            if(children){
                for (i = 0, _i = children.length; i < _i; i++) {
                    children[i]._draw(ctx, transform, layer, camera)
                }
            }
            children = this.children;
            for (i = 0, _i = children.length; i < _i; i++) {
                children[i]._draw(ctx, transform, layer, camera)
            }
        }else {
            for (i = 0, _i = children.length; i < _i; i++) {
                children[i]._draw(ctx, transform, layer, camera)
            }
        }



        if(this.clip){
          ctx.restore();
        }

        if(this.opacity<1){
          ctx.globalAlpha = alpha;
        }


        transform.translate(tmpOrigin.x,tmpOrigin.y);



        transform.restore();
        /*transform.scale(1/this.width, 1/this.height);
        transform.rotate(this.rotation);
        transform.translate(-this.position.x,-this.position.y);*/

    },
    _translate: function(){

    },
    _untranslate: function(){

    },
    draw: function(ctx) {},
    update: function(dt){},
    _update: function(dt, counter){
        let i = 0, children = this.children, _i = children.length;
        this.update(dt, counter);
        for(;i<_i;i++){
            children[i]._update(dt, counter)
        }
    },
    debug: function(type, cfg) {
        debugID++;
        cfg._debugID = debugID;
        (this._overlay[type] || (this._overlay[type] = [])).push(cfg);
        return new Deattacher(this, type, debugID);
    },
    debugDraw: function(ctx, transform) {
        if(this.hidden)
            return;
        let i = 0, children = this.children, _i;

        transform.save();
        transform.trs(this.position, -this.rotation, this.scale.x, this.scale.y);

        let origin = new Point(this.origin.x/2, this.origin.y/2);

        transform.translate(-origin.x, -origin.y);
        ctx.setTransform.apply(ctx, transform.m);

        for(var type in this._overlay) {
            var items = this._overlay[type];
            for (i = 0, _i = items.length;i<_i;i++){
                this.overlay[type].call(this, items[i], ctx);
            }
        }
        for(i=0, _i = children.length;i<_i;i++){
            children[i].debugDraw(ctx, transform)
        }

        transform.translate(origin.x,origin.y);
        transform.restore();

    },
    deattach: function(type, id) {
        if(arguments.length === 1){
            delete this._overlay[type];
        }else {
            delete this._overlay[type][id];
            if (this._overlay[type].length === 0)
                delete this._overlay[type];
        }
    },
    _objectPointToWorld: (function(){
      var matrix, d, m0, m1, m2, m3, m4, m5, x;
      return function(X, Y, p){
        matrix = this.lastTransform;
        d = 1 / (matrix[0] * matrix[3] - matrix[1] * matrix[2]);
        m0 = matrix[3] * d;
        m1 = -matrix[1] * d;
        m2 = -matrix[2] * d;
        m3 = matrix[0] * d;
        m4 = d * (matrix[2] * matrix[5] - matrix[3] * matrix[4]);
        m5 = d * (matrix[1] * matrix[4] - matrix[0] * matrix[5]);

        p.x = x = (m3*X-m2*Y+m2*m5-m4*m3) / (m0*m3-m1*m2);
        p.y = (Y - m1*x - m5)/m3

        return p;
      };
    })(),
    objectPointToWorld: (function(){
      var matrix, d, m0, m1, m2, m3, m4, m5, x, Point = window.Point;
      return function(point){
        matrix = this.lastTransform;
        d = 1 / (matrix[0] * matrix[3] - matrix[1] * matrix[2]);
        m0 = matrix[3] * d;
        m1 = -matrix[1] * d;
        m2 = -matrix[2] * d;
        m3 = matrix[0] * d;
        m4 = d * (matrix[2] * matrix[5] - matrix[3] * matrix[4]);
        m5 = d * (matrix[1] * matrix[4] - matrix[0] * matrix[5]);

        x = (m3*point.x-m2*point.y+m2*m5-m4*m3) / (m0*m3-m1*m2);

        return new Point(x, (point.y - m1*x - m5)/m3);
      };
    })(),
    pointToObject: function(point, matrix){
      matrix = matrix || this.lastTransform;

      var x = (matrix[3]*point.x-matrix[2]*point.y+matrix[2]*matrix[5]-matrix[4]*matrix[3])/(matrix[0]*matrix[3]-matrix[1]*matrix[2]),
        y = (point.y - matrix[1]*x - matrix[5])/matrix[3];
      var local = new Point(x, y);

      return local;
    }
};
GameObject.prototype.gizmo = GameObject.prototype.debug;
GameObject.prototype.overlay = {
    log: function(cfg, ctx) {

        ctx.fillText(cfg.text, cfg.position.x,cfg.position.y)
    }
};