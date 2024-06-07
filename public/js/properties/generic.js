window.Property = (function(){
  var PropertyItem = function PropertyItem( name, type, cfg ){
    this.name = name;
    this.type = type;
    Object.assign(this, cfg);
  };
  PropertyItem.prototype = {
    get: function(prop){
      return this[prop.key]
    },
    set: function(val, prop){
      return this[prop.key] = val;
    },
    getter: (a)=>a,
    setter: (a)=>a,
    extend: function(cfg){
      var newOne = new PropertyItem(this.name, this.type, this);
      Object.assign(newOne, cfg);
      return newOne;
    }
  };

  var Property = {

  };
  Property.PropertyItem = PropertyItem;
  return Property;
})();

var CommonTweenProps = {
  rotation: new Property.PropertyItem('Rotation', Number, {
    get: function(){return this.rotation},
    set: function(val){this.rotation = val},
    //getter: (a)=>a/180*3.14159265,
    //setter: (a)=>a/3.14159265*180,
    keyFrameColor: '#9900ff',
    key: 'rotation',
    value: 0,
  }),
  skewX: new Property.PropertyItem('Skew X', Number, {
    get: function(){return this.skewX},
    set: function(val){this.skewX = val},
    key: 'skewX',
    value: 0,
  }),
  skewY: new Property.PropertyItem('Skew Y', Number, {
    get: function(){return this.skewY},
    set: function(val){this.skewY = val},
    key: 'skewY',
    value: 0
  }),
  _positionX: new Property.PropertyItem('X', Number, {
    get: function(){return this._position.x},
    set: function(val){this._position.x = val},
    keyFrameColor: '#FF8800',
    key: '_positionX',
    value: 0
  }),
  _positionY: new Property.PropertyItem('Y', Number, {
    get: function(){return this._position.y},
    set: function(val){this._position.y = val},
    keyFrameColor: '#FF8800',
    key: '_positionY',
    value: 0
  }),
  _scaleX: new Property.PropertyItem('Scale X', Number, {
    hidden: true,
    get: function(){return this._scaleX},
    set: function(val){this._scaleX = val;},
    keyFrameColor: '#FF8800',
    key: '_scaleX',
    value: 1
  }),
  _scaleY: new Property.PropertyItem('Scale Y', Number, {
    hidden: true,
    get: function(){return this._scaleY},
    set: function(val){this._scaleY = val;},
    keyFrameColor: '#FF8800',
    key: '_scaleY',
    value: 1
  }),
  width: new Property.PropertyItem('Width', Number, {
    get: function(){return this.width},
    set: function(val){this.width = val;},
    key: 'width',
    value: 1
  }),
  height: new Property.PropertyItem('Height', Number, {
    get: function(){return this.height},
    set: function(val){this.height = val;},
    key: 'height',
    value: 1
  }),
  fillStyle: new Property.PropertyItem('Color', Color, {
    get: function(){return this.fillStyle},
    set: function(val){this.fillStyle = val;},
    keyFrameColor: '#2fff00',
    key: 'fillStyle',
    value: 1
  })
};

Object.assign(Property, {
  position: [
    CommonTweenProps._positionX,
    CommonTweenProps._positionY,
    CommonTweenProps._scaleX,
    CommonTweenProps._scaleY,
    CommonTweenProps.width,
    CommonTweenProps.height,
    CommonTweenProps.rotation
  ],
  fill: [
    CommonTweenProps.fillStyle
  ],
  stroke: [
    {name: 'Color', type: Color, get: function(){return this.strokeColor}, set: function(val){this.strokeColor = val}},
  ]
});