window.Color = (function(){

  var type;
  var Color = function(val){
    this.set(val)
  };
  var num2Hex = function(val){
    val = Math.min(255, Math.max(0,val|0))
    return ('0'+val.toString(16)).substr(-2)
  }
  Color.prototype = {
    set: function(val){
      type = typeof val;
      if(type === 'string'){
        if(val[0] === '#') {
          val = val.substr( 1 );
        }
        if(val.length === 4){
          this.a = parseInt(val[3]+val[3], 16);
          val = val.substr(0, 3);
        }
        if(val.length === 3){
          this.r = parseInt(val[0]+val[0], 16);
          this.g = parseInt(val[1]+val[1], 16);
          this.b = parseInt(val[2]+val[2], 16);
        }
        if(val.length === 8){
          this.a = parseInt(val[6]+val[7], 16);
          val = val.substr(0, 6);
        }
        if(val.length === 6){
          this.r = parseInt(val[0]+val[1], 16);
          this.g = parseInt(val[2]+val[3], 16);
          this.b = parseInt(val[4]+val[5], 16);
        }
      }else if(type === 'number'){
        this.b = (val & 255);
        this.g = (val >>> 8 & 255);
        this.r =(val >>> 16 & 255);
        this.a = (val >>> 24 & 255);
      }
    },
    lerp: function(color, val){
      this.r = this.r+(color.r-this.r)*val;
      this.g = this.g+(color.g-this.g)*val;
      this.b = this.b+(color.b-this.b)*val;
      return this;
    },
    lighter: function(amount){
      this.r = Math.max(Math.min(this.r*(1+amount), 255),0);
      this.g = Math.max(Math.min(this.g*(1+amount), 255),0);
      this.b = Math.max(Math.min(this.b*(1+amount), 255),0);
      return this;
    },
    darker: function(val){
      return this.lighter(-val);
    },
    toNumber: function(){
      return this.r*256*256+this.g*256+this.b
    },
    toHTML: function(){
        return '#'+num2Hex(this.r) + num2Hex(this.g) + num2Hex(this.b)
    },
    r: 0, g: 0, b: 0, a: 255
  };

  return Color;
})();