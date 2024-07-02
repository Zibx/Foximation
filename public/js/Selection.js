;(function(){
 'use strict';

  var Selection = function(cfg){
    Object.assign(this, cfg);
    this.selection = [];
  };
  Selection.prototype = {
    update: function(list, e, last){
      this.main.camera.visit( Item, function( item ) {
        item.selected = false;
      } );

      if(last && list.length)
        list = [list[list.length-1]];

      if(e) {
        if(e.event) {
          e = e.event;
        }
        if( e.ctrlKey && e.shiftKey ) {
          list = Union.subtract( this.selection, list, 'id' );
        } else if( e.ctrlKey ) {
          list = Union.xor( list, this.selection, 'id' );
        }
      }

      list.forEach( item => item.selected = true )
      this.selection = list;

      this.main.editableGroup.show( list )
      this.main.selectedChars = list.filter(a=>a instanceof Item);
      this.main.tween.updateSelection(this.main.selectedChars, this.main.selectedLines);
      this.main.properties.updateSelection(this.main.selectedChars, this.main.selectedLines);
      this.main.elementsTree.updateSelection(this.main.selectedChars, this.main.selectedLines);
      this.main.updateCanvas();
    },
    highlight: function(list){
      var tree = this.main.elementsTree;
      this.lastHighlight && this.lastHighlight.forEach(function( item ) {
        tree.setHighlight(item, false);
        item.highlight = false;
      } );
      list.forEach( item => {
        tree.setHighlight(item, true);
        item.highlight = true;
      } );
      this.lastHighlight = list;
      this.main.updateCanvas();
    }
  };
  Loopy.Selection = Selection;

})();