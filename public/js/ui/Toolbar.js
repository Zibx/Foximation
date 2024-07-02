var Toolbar = function(cfg){
    Object.assign(this, cfg);
    this.dom = D.h('div', {cls: 'main-toolbar'});
}
Toolbar.prototype = {
  height: 64,
  init: function(cfg){
    Object.assign(this, cfg);
    D.appendChild(this.dom, [D.h('button',{cls: {
          'toolbar-button': 1,
          'toolbar-button-active': this.game.modeName.valEqual('info')
        }, onclick: ()=>{
          this.game.setMode('info');
        }}, 'Select'),
      D.h('button',{cls: {
          'toolbar-button': 1,
          'toolbar-button-active': this.game.modeName.valEqual('vector')
        }, onclick: ()=>{
          this.game.setMode('vector', {item: false});
        }}, 'Vector')])

  }
}