
var dividerSize = 10;
var HorizontalFlex = function(cfg = {resizable: true}, ...children){
  Observable.call(this)
  var flex = this;
  D.assign(this, cfg);

  var activeDrag = -1;
  var startPosition,  initialSizes, sizes, fullWidth, initialEls = children;

  var updateChildrenSizes = function(fixWidths){
    if(!fixWidths) {
      fullWidth = flex.dom.getBoundingClientRect().width;
      initialSizes = initialEls.map(el => (el.dom || el).getBoundingClientRect().width);
      sizes = initialSizes.slice();
    }

    initialEls.forEach((el, n) => (el.dom || el).style.minWidth = (el.dom || el).style.width = (sizes[n]/fullWidth*100).toFixed(3)+'%');
  }

  var dragMove = Store.debounce(function(e){
    e.preventDefault();
    e.stopPropagation();

    var x = e.clientX;
    var dx = x-startPosition;
    sizes[activeDrag]=initialSizes[activeDrag]+dx;
    sizes[activeDrag+1]=initialSizes[activeDrag+1]-dx;
    updateChildrenSizes(true);
    flex.fire('drag', sizes);
  }, 1);
  var dragDown = function(e, n){
    D.overlay.show();
    D.overlay.el.style.cursor = 'ew-resize';
    activeDrag = n;
    e.stopPropagation();
    e.preventDefault();
    //console.log(e.target, e.currentTarget);
    updateChildrenSizes()
    startPosition = e.clientX;

    var unMove = D.mouse.move(window, dragMove, true);
    var unUp = D.mouse.up(window, function(){
      unMove.un();
      flex.fire('change', initialEls.map(el => (el.dom || el).getBoundingClientRect().width));
      D.overlay.hide();
    });
    unMove.add(unUp);

  };
  this.dom = D.div({cls: 'HFlex-cmp'},
    D.join(children, (n)=>D.div({cls: 'HFlex-cmp__resizer', onmousedown: (e)=>dragDown(e,n)})))

  if(!cfg.noInit)
    setTimeout(()=>{
      updateChildrenSizes()
      updateChildrenSizes(true);
      flex.fire('change', initialEls.map(el => (el.dom || el).getBoundingClientRect().width));

    }, 20);
}
HorizontalFlex.prototype = new Observable();
HorizontalFlex.prototype.set
