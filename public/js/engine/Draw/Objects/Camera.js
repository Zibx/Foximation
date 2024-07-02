class Camera extends GameObject{
    posFromPx(pos, view, child){
        var copyPos = pos.clone();
        var w = this.width, h = this.height;

        var toCamera = copyPos
            .div(w, h)
            .sub(0.5)
            .div(this.scale)
            .rotate(-this.rotation)
            .add(this.position.x/2,this.position.y/2)
            .mul(2)

        if(view){
            var list = [view], item = view;
            while(item = item.parent){
                list.push(item)
            }
            for(var i = list.length-2; i>-1;i--){
                item = list[i];
                w = item.width, h = item.height
                toCamera = toCamera
                    .div(w, h)
                    .div(item.scale)
                    .sub(item.position)
                    .rotate(item.rotation)
                    .add(item.origin.divClone(2))



            }

        }
        return toCamera;

    }
    constructor(cfg){
        super(cfg);
        this.background = this.background || '#fff';


        if(!this.ctx)
            throw new Error('Cameras CTX is unspecified');
        var ctx = this.ctx;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        this.clearDensity = 32;
        this.clearRects = [];
        this.clearList = [];
        this.rectsMap = new WeakMap();
    }
    getTransform(){
      var transform = new Transform();

      transform.m = this.transform.m.slice();
      //transform.scale(this.width/10,this.height/10);
      transform.translate(this.width/2,this.height/2);

      transform.scale( this.scale , this.scale );
      /*var aspect = this.width / this.height;
      if(aspect>0) {
        transform.scale( this.scale / aspect, this.scale );
      }else{
        transform.scale( this.scale , this.scale / aspect);
      }*/

      transform.rotate(this.rotation);
      transform.translate(-this.position.x/2,-this.position.y/2);
      return transform;
    }

    draw(layer){
        if(!this.world)
            throw new Error('Cameras World is unspecified');
        if(!this.ctx)
            throw new Error('Cameras CTX is unspecified');
/*      for(var y = 0; y<this.height;y+=this.clearDensity) {
        this.clearRects[y/this.clearDensity|0] = [];
        for( var x = 0; x < this.width; x += this.clearDensity ) {
          this.clearRects[y/this.clearDensity|0][x/this.clearDensity|0] = false;
        }
      }*/
      var transform = this.getTransform();



        this.ctx.setTransform.apply(this.ctx, transform.m);
        this.lastTransform = transform.m;

        if(!layer) {
          this.clearPointer = 0;
          this.clearCounter = 0;
        }
        this.world._draw(this.bypassCTX || this.ctx, transform, layer, this);
      this.clearCounter = this.clearPointer;
      this.clearList.length = this.clearCounter;
      this.clearRects.length = this.clearCounter;

        this.ctx.setTransform(1,0,0,1,0,0)
    }
    getChildrenAtRect(l, t, r, b, type){
      var i, _i;
      var list = [], rect;
      for(i = 0, _i = this.clearCounter; i < _i; i++){
        rect = this.clearRects[i];
        if(!type || (this.clearList[ i ] instanceof type)){
          if(rect[1].x >= l && rect[0].x <= r && rect[0].y <= b && rect[1].y >= t){
            if(('rectCollider' in this.clearList[ i ]) && !this.clearList[ i ].rectCollider(l,t,r,b)) {
              continue;
            }
            list.push( this.clearList[ i ] );
          }
        }
      }
      return list;
    }
    getChildrenAtPoint(p, type){
      var x = p.x, y = p.y, i, _i;
      var list = [], rect;
      for(i = 0, _i = this.clearCounter; i < _i; i++){
        rect = this.clearRects[i];
        if(!type || (this.clearList[ i ] instanceof type)){
         if(rect[0].x<=x && rect[1].x >= x &&
          rect[0].y<=y && rect[1].y >= y && this.clearList[ i ].collider(this.clearList[ i ].pointToObject(p))) {

            list.push( this.clearList[ i ] );
          }
        }
      }
      return list;
    }
    visit(type, fn){
      var i, _i, item;
      for(i = 0, _i = this.clearCounter; i < _i; i++){
        item = this.clearList[i];
        if(item instanceof type)
          fn(item);
      }
    }
    getRegion(obj){
      return this.rectsMap.get(obj);
    }
    debugDraw(){
        if(!this.world)
            throw new Error('Cameras World is unspecified');
        if(!this.ctx)
            throw new Error('Cameras CTX is unspecified');


        var transform = new Transform();

        transform.m = this.transform.m.slice();
        transform.scale(this.width,this.height);
        transform.translate(0.5,0.5);

        var aspect = this.width / this.height;
        if(aspect>0) {
          transform.scale( this.scale / aspect, this.scale );
        }else{
          transform.scale( this.scale , this.scale / aspect);
        }

        transform.rotate(this.rotation);
        transform.translate(-this.position.x/2,-this.position.y/2);

        this.ctx.setTransform.apply(this.ctx, transform.m);
        this.world.debugDraw(this.ctx, transform);
        this.ctx.setTransform(1,0,0,1,0,0)
    }

    clear(){
        this.ctx.setTransform(1,0,0,1,0,0)
        this.ctx.fillStyle = this.background;



/*        this.clearRects.forEach((row, y)=>{
          var from = false;
          for(var i = 0, _i = row.length; i <= _i; i++){
            if(row[i] === false || i === _i){
              if(from !== false){
                this.ctx.fillRect( from * this.clearDensity, y * this.clearDensity, this.clearDensity*(i-from+1), this.clearDensity )
              }
              from = false;
            }else{
              if(from === false)
                from = i;
            }
          }
        }
        )*/
        this.ctx.fillRect(0,0,this.width,this.height);
    }
    drawGrid(depth){
        let x, y;

        var count = Math.pow(2,depth+1) ;

        var delta = this.width/count;
        this.ctx.beginPath();

        for(x = 0; x <= this.width; x+=delta) {
          var offsetX = (-this.position.x*this.scale/2+x+this.width*10) % (this.width);
            this.ctx.moveTo(offsetX, 0);
            this.ctx.lineTo(offsetX, this.height);
        }
        var delta = this.height/count;
        for(y = 0; y <= this.height; y+=delta) {
          var offsetY = (-this.position.y*this.scale/2+y+this.height*10) % (this.height);
          
            this.ctx.moveTo(0, offsetY);
            this.ctx.lineTo(this.width, offsetY);
        }
        this.ctx.lineWidth = 3/count;
        this.ctx.strokeStyle = '#5e5c5c';
        this.ctx.stroke();
        this.ctx.closePath();
        if(depth>0)
            this.drawGrid(depth - 1);
    }
    pointToWorld(point){
      var matrix = this.lastTransform;

      var x = (matrix[3]*point.x-matrix[2]*point.y+matrix[2]*matrix[5]-matrix[4]*matrix[3])/(matrix[0]*matrix[3]-matrix[1]*matrix[2]),
          y = (point.y - matrix[1]*x - matrix[5])/matrix[3];
      var local = new Point(x, y);

      return local;
    }
}
Camera.prototype.addClearRegion = (function(){
  var min = Math.min, max = Math.max, Point = window.Point,
      p1 = new Point(), p2 = new Point(),
      p3 = new Point(), p4 = new Point(), p,

      minX, maxX, minY, maxY, clearRects, clearRect;

  return function(obj){
    clearRects = this.clearRects;
    p = this.clearPointer;
    this.clearList[p] = obj;

    obj._objectPointToWorld(-obj.width/2, -obj.height/2, p1);
    obj._objectPointToWorld(obj.width/2, -obj.height/2, p2);
    obj._objectPointToWorld(obj.width/2, obj.height/2, p3);
    obj._objectPointToWorld(-obj.width/2, obj.height/2, p4);

    minX = min(p1.x, p2.x, p3.x, p4.x);
    maxX = max(p1.x, p2.x, p3.x, p4.x);
    minY = min(p1.y, p2.y, p3.y, p4.y);
    maxY = max(p1.y, p2.y, p3.y, p4.y);


    clearRect = clearRects[p] || (clearRects[p] = [new Point(), new Point()]);
    clearRect[0].x = minX;
    clearRect[0].y = minY;
    clearRect[1].x = maxX;
    clearRect[1].y = maxY;

    this.rectsMap.set(obj, clearRect)
    obj.pxRatio.x =obj.width/ (clearRect[1].x -clearRect[0].x);
    obj.pxRatio.y =obj.height/ (clearRect[1].y -clearRect[0].y);
    this.clearPointer++;
    return;

    if(obj.manualClear)
      return;

    /*
          var p1 = obj.objectPointToWorld({x: -obj.width/2, y:-obj.height/2}),
              p2 = obj.objectPointToWorld({x: obj.width/2, y:-obj.height/2}),
              p3 = obj.objectPointToWorld({x: obj.width/2, y:obj.height/2}),
              p4 = obj.objectPointToWorld({x: -obj.width/2, y:obj.height/2});
          var minX = Math.min(p1.x, p2.x, p3.x, p4.x),
              maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
          var minY = Math.min(p1.y, p2.y, p3.y, p4.y),
            maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

          for(var y = Math.max(0, minY), _y = Math.min(maxY, this.height); y<_y;y+=this.clearDensity) {
            var row = this.clearRects[y/this.clearDensity|0];
            for( var x = Math.max(0, minX), _x = Math.min(maxX, this.width); x < _x; x += this.clearDensity ) {
              this.clearRects[y/this.clearDensity|0][x/this.clearDensity|0] = true;
            }
          }*/

  };
})();