const ICON_SIZE=16;
var NumberInput = function(cfg){
  var field, dragger;
  var dragging = false;
  var xStart = 0
  var step = cfg.step || 1;
  var precision = cfg.precision || 1;
  var setValue = function(val){
    isNaN(val) && (val = 0);
    if('min' in cfg) {
      if(cfg.min.get){
        if( val < cfg.min.get() )
          val = cfg.min.get();
      }else {
        if( val < cfg.min )
          val = cfg.min;
      }
    }
    if('max' in cfg) {
      if(cfg.max.get){
        if( val > cfg.max.get() )
          val = cfg.max.get();
      }else {
        if( val > cfg.max )
          val = cfg.max;
      }
    }
    cfg.value.set(val);
  }
  var getValue = function(){
    var value = cfg.value.get();
    isNaN(value) && (value = 0);
    return value;
  };
  var round = function(val){
    if(step<0.01)
      return Math.round(val * 1000)/1000;

    if(step<0.1)
      return Math.round(val * 100)/100;

    if(step<=1)
      return Math.round(val * 10)/10;

    return val;
  };
  var dragstart = function(e){
    D.overlay.show();
    D.overlay.el.style.cursor = 'ew-resize';
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    xStart = e.clientX;
    var valueStart = getValue();
    var changeValue = function(e){
      e.stopPropagation();
      var distance = e.clientX - xStart;
      setValue(round(valueStart-0+Math.round(distance/precision)*(step||1)))

      e.preventDefault();
    }
    window.addEventListener('mousemove', changeValue, true);
    var mouseup = function(e){
      D.overlay.hide();
      dragging = false;
      changeValue(e);
      window.removeEventListener('mousemove', changeValue, true);
      window.removeEventListener('mouseup', mouseup);
    };
    window.addEventListener( 'mouseup', mouseup);
  };
  var dragger = dragger = D.div( {
    cls: 'numberInput--dragger',
    onmousedown: dragstart
  },
    cfg.icon?
      D.div({cls: 'numberInput--icon', style: `background-position: -${ICON_SIZE*cfg.icon[0]}px -${ICON_SIZE*cfg.icon[1]}px;`})
      :
      cfg.letter
  );


  this.dom = D.h('label', {
    cls: [ 'numberInput', cfg.cls, cfg.align ? 'numberInput__align-' + cfg.align : '' ],
    style: 'display:flex'
  },
    D.span({}, cfg.label),
    (!cfg.align || cfg.align === 'left' || cfg.align === 'top' ? dragger : void 0),
    field = D.h('input', {
      onwheel: function(e){
        setValue(round(getValue()+(e.deltaY<0?1:-1)*(step||1)))
        e.preventDefault();
        e.stopPropagation();
      },
      style: 'width:64px',
      cls: ['numberInput__input'],
      type: 'number',
      min: 0,
      value: cfg.value,
      oninput: e=>setValue(e.target.value-0)
    }),
    (cfg.align && (cfg.align === 'right' || cfg.align === 'bottom' )? dragger : void 0)
  );

  var _updateValue = function(){
    requestAnimationFrame(updateValue);
  }
  var updateValue = function(){
    field.value = round(cfg.value.get());
  }
  cfg.value.hook(_updateValue);
};
NumberInput.prototype = {

};