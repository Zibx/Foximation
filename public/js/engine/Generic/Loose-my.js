var rectIntersection = function(a,b) {
  //x1 y1 x2 y2
  // left top right bottom
  return a[ 2 ] >= b[ 0 ] && a[ 0 ] <= b[ 2 ] && a[ 1 ] <= b[ 3 ] && a[ 3 ] >= b[ 1 ];
  //return a[ 0 ] < b[ 2 ] && a[ 2 ] > b[ 0 ] && a[ 1 ] > b[ 3 ] && a[ 3 ] < b[ 1 ];
}

var LooseQuadTree = function(parent, map, idx){
  this.idx = idx;
  this.parent = parent;
  this.items = [];
  this.rects = []; // [[l,t,r,b]]
  this.rect = [-Infinity,-Infinity, Infinity, Infinity] // l, t, r, b
  if(!parent)
  this.rect = [0,0, 600, 600] // l, t, r, b
  this.map = map || new Map();
}
LooseQuadTree.prototype = {
  division: 2,
  splitFactor: 60,

  add: function(obj, [l, t, r, b]){

    if(this.splitted){
      var idx = this.getSingleIndexByPos([l,t,r,b]);

      this.items[idx].add(obj, [l,t,r,b])
      this.expandRect(l,t,r,b);
    } else {
      var leaf = obj;
      this.rects.push([l,t,r,b]);
      this.expandRect(l,t,r,b);
      this.items.push( leaf );
      this.map.set(obj, this);
      if( this.items.length === this.splitFactor )
        this.split();

    }

  },
  split: function(){
    this.splitted = true;
    var items = [];
    for(var y = 0, _y = this.division; y<_y; y++){
      for(var x = 0; x<_y; x++){
        items.push(new LooseQuadTree(this, this.map, y*_y+x));
      }
    }
    this.items.forEach((item, n) => {
      var idx = this.getSingleIndexByPos(this.rects[n]);
      items[idx].add(item, this.rects[n])
    });
    this.items = items;
    this.rects = this.items.map(i=>i.rect);
  },
  getSingleIndexByPos: (function(){
    var tr, x, y, iy, ix, d;
    var clamp = function(v, a, b){
      return v<a?a : v>b? b: v;
    };
    return function(rect){
      d = this.division;
      tr = this.rect;
      x = (rect[0]+rect[2])/2;
      y = (rect[1]+rect[3])/2;
      var iy = (y-tr[1])/(tr[3]-tr[1])*d |0;
      var ix = (x-tr[0])/(tr[2]-tr[0])*d |0;

      return clamp(ix,0, d-1) + clamp(iy, 0, d-1)*d;
    }  
  })(),

  splitted: false,
  _query: function(check, out){
    for(var i = 0, _i = this.rects.length; i < _i; i++){
      if(rectIntersection(this.rects[i], check)){
        if(this.splitted){
          this.items[i]._query(check, out)
        }else{
          out.push(this.items[i])
        }
      }
    }
  },
  query: function(x,y,w,h){
    var out = []
    var r = x+w/2, b = y+h/2, check = [x-w/2,y-w/2,r,b];
    this._query(check, out);
    return out;
  },
  remove: function(obj){
    var whos = this.map.get(obj);
    var idx = whos.items.indexOf(obj);
    this.map.delete(obj);
    whos.items.splice(idx,1);
    whos.rects.splice(idx,1);
    if(whos.items.length === 0){
      whos.parent && whos.parent._optimize(whos.idx);
    }
    whos._compactRect();
  },
  expandRect: function(l,t,r,b){
    if(this.rect[0] === -Infinity){
      this.rect[0] = l;
      this.rect[1] = t;
      this.rect[2] = r;
      this.rect[3] = b;
    }else{
      this.rect[0] = Math.min(this.rect[0], l);
      this.rect[1] = Math.min(this.rect[1], t);
      this.rect[2] = Math.max(this.rect[2], r);
      this.rect[3] = Math.max(this.rect[3], b);
    }
    if(this.parent)
      this.parent.expandRect(l,t,r,b);
  },
  _compactRect: function(){
    return;
    for(var i = 0, _i = this.rects.length; i < _i; i++){
      var rect = this.rects[i];
      this.rect[0] = i === 0 ? rect[0] : Math.min(rect[0], this.rect[0]);
      this.rect[1] = i === 0 ? rect[1] : Math.min(rect[1], this.rect[1]);
      this.rect[2] = i === 0 ? rect[2] : Math.max(rect[2], this.rect[2]);
      this.rect[3] = i === 0 ? rect[3] : Math.max(rect[3], this.rect[3]);
    }
    if(this.parent){
      this.parent._compactRect();
      this.parent.expandRect.apply(this.parent, this.rect)
    }
  },
  _optimize: function(idx){
    return;
    var childrenCount = this.items
      .map(item => item.splitted ? Infinity : item.items.length)
      .reduce((a,b)=>a+b)

    if(childrenCount < this.splitFactor){
      this.splitted = false;
      var items = [];
      var rects = [];
      this.items.forEach(child=>{
        child.items.forEach((c, i)=>{
          items.push(c);
          rects.push(child.rects[i])
          this.map.set(c, this);
        });
      });
      this.items = items;
      this.rects = rects;
      this._compactRect();

    }
  },
  move: function(obj, x, y){
    var whos = this.map.get(obj);
    var idx = whos.items.indexOf(obj);
    var size = whos.rects[idx];
    var w = size[2] - size[0], h = size[3]-size[1];
    if(whos.getSingleIndexByPos([x,y, x+w, y+h]) !== whos.parent.getSingleIndexByPos(size)){
      // moved to other quadrant
      whos.remove(obj);
      this.add(obj, [x,y, x+w, y+h]);
    }else{
      size[0] = x;
      size[1] = y;
      size[2] = x+w;
      size[3] = y+h;
      whos.expandRect(x,y, x+w, y+h);
    }


  },
  draw: function(ctx){
    ctx.strokeRect(this.rect[0], this.rect[1],this.rect[2]-this.rect[0], this.rect[3]-this.rect[1])
    if(this.splitted){
      this.items.forEach(i=>i.draw(ctx))
    }else{
      ctx.strokeStyle = 'crimson'
      this.rects.forEach((rect)=>{
        ctx.strokeRect(rect[0], rect[1],rect[2]-rect[0], rect[3]-rect[1])
      });
    }

  }
};


LooseQuadTree.Leaf = function(x,y,hw,hh){
    this.rect = [x, y, hw, hh];
}