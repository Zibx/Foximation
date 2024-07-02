var PADDING_SIZE= 16;
var ElementsTreeItem = function(cfg){
  Object.assign( this, cfg );
  this.dom = D.div({
      cls: 'tree-item'
    },
    this.labelEl = D.div({
      cls: 'tree-item__label',
      onclick: (e)=>{
        this.controller.click(this.item, e);
      },
      onmouseenter: (e)=>{
        this.controller.updateHighlight(this.item, true);
      },
      onmouseleave: (e)=>{
        this.controller.updateHighlight(this.item, false);
      }
    }, this.item.toString())
  );
};
ElementsTreeItem.prototype = {
  updatePadding: function(val, prop){
    var pointer = this.item;
    var level = -1;
    while(pointer.parent){
      pointer = pointer.parent;
      level++;
    }
    this.labelEl.style.paddingLeft = level * PADDING_SIZE + 8 +'px';
  },
  select: function(){
    this.labelEl.classList.add('tree-item--selected');
  },
  deselect: function(){
    this.labelEl.classList.remove('tree-item--selected');
  },
  setHighlight: function(is){
    this.labelEl.classList[is?'add':'remove']('tree-item--highlight');
  }
};
var ElementsTree = function(cfg) {
  Object.assign( this, cfg );
  this.dom = D.div({cls: 'elements-tree'});

  var mapping = this.mapping = {};

  GameObject.prototype.afterAddChild = (parent, child, layer)=>{
    if(layer === 'ui')
      return;


    child._treeEl = child._treeEl || new ElementsTreeItem( { item: child, controller: this } );
    parent._treeEl = parent._treeEl || new ElementsTreeItem( { item: parent, controller: this } );
    mapping[child.id] = child._treeEl;
    mapping[parent.id] = parent._treeEl;

    child._treeEl.updatePadding();
    parent._treeEl.updatePadding();
    D.appendChild(parent._treeEl.dom, child._treeEl )

    console.log({parent, child, layer})
  }
};
ElementsTree.prototype.click = function(item, e){
  this.main.selection.update([item], e)
}
ElementsTree.prototype.setHighlight = function(item, is){
  this.mapping[item.id].setHighlight(is);
}
ElementsTree.prototype.updateSelection = function(items, e){
  this.lastSelection && this.lastSelection.forEach(item => this.mapping[item.id].deselect())
  this.lastSelection = items;
  this.lastSelection.forEach(item => this.mapping[item.id].select())
}
ElementsTree.prototype.updatePadding = function(){}
ElementsTree.prototype.updateHighlight = function(item, is){
  this.main.selection.highlight([item]);
}
ElementsTree.prototype.init = function(world){
  world._treeEl = this;
  world._treeLevel = 0;
}