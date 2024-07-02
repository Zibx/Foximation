var cloneRemove = function(){
  this.parent.children.splice(this.parent.children.indexOf(this),1);
};
var cloneActualize = function(cfg){
  var props = this.__clonedFrom.propsForClone();
  Object.assign(props, cfg);
  var real = new this.__clonedFrom.constructor(props);
  Object.assign(real, props);
  this.parent.replaceChild(this, real);
  return real;
};
var CloneFactory = function(item, cfg){
  var Clone = function(){
    this.relative = true;
    this.__clonedFrom = item;
  };
  Clone.prototype = item;
  var clone = new Clone(item);
  for(var key in item) {
    if( item[ key ] instanceof Point ) {
      clone[ key ] = item[ key ].clone();
    } else if( typeof item[ key ] === 'number' || typeof item[ key ] === 'string' ) {
      clone[ key ] = item[ key ];
    }
  }
  clone.__tweenID = -1;
  clone.physic = ()=>{};
  Object.assign(clone, cfg);
  clone.remove = cloneRemove;
  clone.actualize = cloneActualize;
  //item.parent.appendChild(item);
  item.parent.children.splice(item.parent.children.indexOf(item),0, clone);

  return clone;
};
