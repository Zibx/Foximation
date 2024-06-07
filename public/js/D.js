
D.mouse.dragBehavior = function(el, cfg){
  var delta = window.Point ? new Point() : {};
  var context, startPosition;
  var style, lastE;
  var dragMove = Store.debounce(function(e){
    lastE = e;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    delta.x = e.clientX - startPosition.x;
    delta.y = e.clientY - startPosition.y;
    cfg.move && cfg.move(delta, cfg, e, style);
  }, 1);

  var dragDown = function(e, n){
    if(cfg.check)
      if(cfg.check(e, cfg, style) === false)
        return;

    lastE = e;

    D.overlay.show();
    style = D.overlay.el.style;
    style.cursor = cfg.cursor || 'auto';
    e.stopPropagation();
    e.preventDefault();

    startPosition = {x: e.clientX, y: e.clientY};

    var unMove = D.mouse.move(window, dragMove, true);
    var unUp = D.mouse.up(window, function(e){
      unMove.un();
      cfg.up && cfg.up(e, cfg, style);
      D.overlay.hide();
    });
    unMove.add(unUp);
    var keyFn = Store.debounce(function(e){
      e.clientX = lastE.clientX;
      e.clientY = lastE.clientY;

      dragMove(e);
    }, 10);
    window.addEventListener('keydown', keyFn, true);
    window.addEventListener('keyup', keyFn, true);

    unMove.add(new D.Unsubscribe(function() {
      window.removeEventListener('keydown', keyFn, true);
      window.removeEventListener('keyup', keyFn, true);
    }));

  };
  return el === false ? dragDown : D.mouse.down(el, dragDown, true);
}


D._protected = {on: 1, un: 1, fire: 1};
D.assign = function( obj ){
  var i, _i, j, _j, name,
    other = Array.prototype.slice.call(arguments, 1),
    protected = obj._protected || D._protected;

  for(j = 0, _j = other.length; j < _j; j++) {
    var cfg = other[j]
    for( i in cfg )
      if( cfg.hasOwnProperty( i ) ) {
        name = i.toLowerCase();
        if( name in protected )
          continue;

        if( name.substr( 0, 2 ) === 'on' ) {
          if(!obj.__un) {
            obj.__un = new D.Unsubscribe()
          }
          obj.__un.add(obj.on( name.substr( 2, 1 ).toLowerCase()+name.substr( 3 ), cfg[ i ]));
        } else {
          obj[ i ] = cfg[ i ];
        }
      }
  }
  return obj;
}


// Add unsubscribable to namespace
D.unsubscribable = function(name) {
  return function(el, fn, arg) {
    typeof fn !== 'function' && (fn = getCallableFunction(fn));
    el.addEventListener(name, fn, arg);
    return new D.Unsubscribe(function() {
      el.removeEventListener(name, fn, arg);
    });
  };
};
(function(){
  var loadList = [];
  var loading = false;
  var _load = function(){
    if(!loading){
      var item = loadList.shift();
      if(!item)
        return
      loading = true;

      !Array.isArray(item) && (item = [item]);
      var counter = item.length;
      var afterLoad = (e) => {
        console.log('loaded', e && e.target.src)
        counter--;
        if( counter === 0 ) {
          loading = false;
          _load();
        }
      };
      item.forEach(item => {
        console.log(item, typeof item)
        if(typeof item === 'function'){
            item();
            afterLoad();
        }else{
          D.h( 'script', {
            src: item, renderTo: document.head, onload: afterLoad
          } );
        }
        }
      );
    }
  };
  D.load = function(){
    var files = [].slice.call(arguments);
    if(loading){
      loadList = files.concat(loadList);

    }else{
      loadList = loadList.concat(files);
    }

    _load();
  };
})();


Store.Value.init = function(type, value){
  if(value){
    if(value instanceof Store.Value[type]) {
      return value
    }
  }
  return new Store.Value[type](value);
}

function mulberry32(a) {
  var imul = Math.imul, floor = Math.floor;
  var out = random = function() {
    var t = a += 0x6D2B79F5;
    t = imul(t ^ t >>> 15, t | 1);
    t ^= t + imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  out.getSeed = function() {
    return a;
  };
  out.setSeed = function(A) {
    if(typeof A === 'string'){
      a = 13;
      A.split('').reduce(function(accum, char){
        var t = a += 0x6D2B79F5 + accum + char.charCodeAt(0);
        t = imul(t ^ t >>> 15, t | 1);
        t ^= t + imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      }, 666);
    } else {
      a = A;
    }
  };
  out.setStringSeed = function(str) {
    str = str.replace(/[^0-9a-z]/g,'').substr(0,12);
    if(str.length === 0)str = '1';
    a = parseInt(str,36);
  };
  out.getStringSeed = function() {
    return a.toString(36);
  };
  out.rand = function(a, b){
    if(Array.isArray(a)){
      return a[out()*a.length|0];
    }
    var r = out();

    if(b === void 0)
      return floor(r*a);

    return floor(r*(b-a+1)+a);
  };

  Object.assign(out.rand, out);
  delete out.rand.rand;
  out.constructor = mulberry32;

  return out;
}
Math.random.hex = function(length = 1, veryRandom) {
  var out = '';
  for(var i = 0; i < length; i++){
    if(veryRandom){
      out += ( Math.random() * 16 | 0 ).toString( 16 );
    }else{
      out += ( Math.random.seeded() * 16 | 0 ).toString( 16 );
    }
  }
  return out;
};
Math.random.digit = function(length = 1) {
  var out = '';
  for(var i = 0; i < length; i++){
    out += ( Math.random.seeded() * 10 | 0 ).toString( 10 );
  }
  return out;
};
var zipFn = (a,b)=>{
  var out = {};
  a.split('').forEach((v,i)=>{out[v] = b[i]});
  return out;
}
var hashOfReplaces = zipFn(
  'ghijklmnopqrstuvwxyz',
  '94118196069c5feeabd3'
);

Math.random.uuid4 = function(seed = '', veryRandom) {
  seed = seed.replace(/[ghijklmnopqrstuvwxyz]/g, l=>hashOfReplaces[l]);
  if(seed.length>7)seed = seed.substr(0, 7);


  return [
    Math.random.hex(8-seed.length, veryRandom)+seed,
    Math.random.hex(4, veryRandom),
    '4'+Math.random.hex(3, veryRandom),
    Math.random.rand(['8', '9', 'a','b'])+Math.random.hex(3, veryRandom),
    Math.random.hex(12, veryRandom)
  ].join('-');
}
Math.random.rand = function(a, b) {
  if(Array.isArray(a) || (typeof a === 'object' && 'length' in a)){
    return a[Math.random.seeded()*a.length |0];
  }
  return (Math.random.seeded()*(b-a)+a)|0;
}
Math.random.seeded = mulberry32(Math.floor(Math.random()*4294967296));