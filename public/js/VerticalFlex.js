
var dividerSize = 10;
var VerticalFlex = function(cfg = {resizable: true}, ...children){
  Observable.call(this)
  var flex = this;
  D.assign(this, cfg);

  var activeDrag = -1;
  var startPosition,  initialSizes, sizes, fullHeight, initialEls = children;
  var style;
  var updateChildrenSizes = function(fixHeights){
    if(!fixHeights) {
      fullHeight = flex.dom.getBoundingClientRect().height;
      flex.dom.style.height = fullHeight+'px';
      initialSizes = initialEls.map(el => (el.dom || el).getBoundingClientRect().height);
      sizes = initialSizes.slice();
    }
    initialEls.forEach((el, n) =>{
      style = (el.dom || el).style;
      style.maxHeight = style.minHeight = style.height = (sizes[n]/fullHeight*100).toFixed(3)+'%';
    });
  }

  var dragMove = Store.debounce(function(e){
    e.preventDefault();
    e.stopPropagation();

    var y = e.clientY;
    var dy = y-startPosition;
    sizes[activeDrag]=initialSizes[activeDrag]+dy;
    sizes[activeDrag+1]=initialSizes[activeDrag+1]-dy;
    updateChildrenSizes(true);
    flex.fire('drag', sizes);
  }, 1);
  var dragDown = function(e, n){
    D.overlay.show();
    D.overlay.el.style.cursor = 'ns-resize';
    activeDrag = n;
    e.stopPropagation();
    e.preventDefault();
    //console.log(e.target, e.currentTarget);
    updateChildrenSizes()
    startPosition = e.clientY;

    var unMove = D.mouse.move(window, dragMove, true);
    var unUp = D.mouse.up(window, function(){
      unMove.un();
      var hs = 0;
      initialEls.map(el => hs+=(el.dom || el).getBoundingClientRect().height)
      console.log(hs, fullHeight)
      flex.fire('change', initialEls.map(el => (el.dom || el).getBoundingClientRect().height));
      D.overlay.hide();
    });
    unMove.add(unUp);

  };
  this.dom = D.div({cls: 'VFlex-cmp'},
    D.join(children, (n)=>D.div({cls: 'VFlex-cmp__resizer', onmousedown: (e)=>dragDown(e,n)})))

  if(!cfg.noInit)
    setTimeout(()=>{
      updateChildrenSizes()
      updateChildrenSizes(true);
      flex.fire('change', initialEls.map(el => (el.dom || el).getBoundingClientRect().height));
    }, 10);
}
VerticalFlex.prototype = new Observable();
VerticalFlex.prototype.set
