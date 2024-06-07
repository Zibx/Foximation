Tween.prototype.initTweenItems = function(item){
  this.tweenItemsMap = new WeakMap();
  this.canvasHeight.hook(val => {
    this.tweenItems.style.height = val+'px'
    this.scrollableTween.style.height = val+'px'
  });
};
Tween.prototype.createTwinItem = function(item){
  var collapsed = new Store.Value.Boolean(true);
  this.__un.add(collapsed.hook(()=>this.updateCanvas(), true));
  var info = this.items[item.__tweenID];
  info.collapsed = collapsed;
  info.propertiesCount = Object.keys(info.properties).length;


  var props = [];//info.properties;
  for(var key in info.properties){
    props.push({
      name: info.properties[key].name || (key.substr(0,1).toUpperCase()+key.substr(1)),
      propertyID: Math.random().toString(36).substr(2),
      key
    })
  }
  props.sort((a,b)=>a.name>b.name? 1: a.name<b.name?-1: 0);
  info.props = props;
  //debugger

  var mouseEnter = function(){
    item.hover = true;
  };
  var mouseLeave = function(){
    item.hover = false;
  };

  var resetPropertyID = ()=>{
    this.hoveredItem.set(-1)
  };

  var tweenItem = D.div({
      cls: {'tween__item': 1, 'tween__item--collapsed': collapsed},
      onmouseenter: mouseEnter,
      onmouseleave: mouseLeave
    },
    D.div({
        cls: {'tween__item__title':1, 'tween__item__title--hover': this.hoveredItem.valEqual(item.__tweenID)},
        onmouseenter: ()=>this.hoveredItem.set(item.__tweenID),
        onmouseleave: resetPropertyID,
        onclick: ()=> collapsed.toggle()
      },
      'Char ', item.toString()
    ),
    props.map(prop => {
      return D.div({
          cls: {'tween__item__property': 1, 'tween__item__property--hover': this.hoveredItem.valEqual(prop.propertyID)},
          onmouseenter: ()=>this.hoveredItem.set(prop.propertyID),
          onmouseleave: resetPropertyID,
        },
        prop.name
      )
    })
  );
  var title, tweenProps = {};
  var placeholderItem = D.div({
      cls: {'tween__item': 1, 'tween__item--collapsed': collapsed},
      onmouseenter: mouseEnter,
      onmouseleave: mouseLeave
    },
    title = D.div({
        cls: {'tween__item__title':1, 'tween__item__title--placeholder': 1, 'tween__item__title--hover': this.hoveredItem.valEqual(item.__tweenID)},
        onmouseenter: ()=>this.hoveredItem.set(item.__tweenID),
        onmouseleave: resetPropertyID,
        onclick: ()=> collapsed.toggle()
      },
      ''
    ),
    props.map(prop => {
      return tweenProps[prop.key] = D.div({
        cls: {'tween__item__property': 1, 'tween__item__property--hover': this.hoveredItem.valEqual(prop.propertyID)},
        onmouseenter: ()=>this.hoveredItem.set(prop.propertyID),
        onmouseleave: resetPropertyID,
      }, '')
    })
  )
  return {tweenItem, placeholderItem, tween: {title, props: tweenProps}}
};