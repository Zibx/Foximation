class Interact extends GameObject{

};

class Item extends GameObject{
  extractProps(){
    var props = {};
    for(var key in this.props){
      if(key === '_type')
        continue;

      var group = this.props[key];
      group.forEach(prop => {
        if(!prop.key)
          debugger;
        if(prop.noTween)
          return;
        props[prop.key] = prop;
      })
    }
    return props;
  }
  scalePathData(pathInfo, sx, sy){
    pathInfo.commands.forEach(c=>{
      if(c.type==='M' || c.type==='L'){
        c.x *= sx; c.y *= sy;
      }else if(c.type==='Q'){
        c.x *= sx; c.y *= sy;
        c.x1 *= sx; c.y1 *= sy;
      }else if(c.type==='C'){
        c.x *= sx; c.y *= sy;
        c.x1 *= sx; c.y1 *= sy;
        c.x2 *= sx; c.y2 *= sy;
      }
    })
    return pathInfo;
  }
};