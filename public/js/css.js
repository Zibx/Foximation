;(function(){
  var styleSheet;
  var getStyleSheet = function(){
    if(styleSheet)
      return styleSheet;

    styleSheet = D.h('style', {props: {type: 'text/css'}});
    document.head.appendChild(styleSheet);
    styleSheet = styleSheet.sheet;
    return styleSheet;
  }

  D.CSS = function(selector, style){
    if(!(this instanceof D.CSS))
      return new D.CSS(selector, style);

    this.sheet = getStyleSheet();
    var cssRuleCode = document.all ? 'rules' : 'cssRules';
    var pos = this.sheet[cssRuleCode].length;
    this.sheet.insertRule(selector + '{}', pos)
    this.rule = this.sheet[cssRuleCode][pos];
    if(style){
      Object.assign(this.rule.style, style);
    }
  };

  D.CSS.prototype = {
    update: function(style){
      requestAnimationFrame(()=>{
        Object.assign(this.rule.style, style);
      });
      return this;
    }
  };

})();