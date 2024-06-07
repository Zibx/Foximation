class SelectionRect extends Interact {
  constructor(cfg){
    super(cfg);
    this.hidden = true;
    this.cursor = 'move';

  };
  draw(ctx){
    ctx.strokeStyle = GIZMO_COLOR;
    ctx.fillStyle = GIZMO_FILL_COLOR+'33';
    ctx.lineWidth = this.parent.pxRatio.x*0.3;
    ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

  }
  show(cfg){
    this.hidden = false;
    Object.assign(this, cfg);
    this.startAbsolutePosition = this.start;
    this.position = this.parent.pointToObject(this.start);
    this.startPosition = this.position.clone();
    this.main.updateCanvas();
  }
  hide(cfg){
    this.hidden = true;
    this.main.updateCanvas();
  }
  update(e){
    var p = this.parent.pointToObject(e.point),
      startP = this.startPosition;
    var l, t, r, b;
    r = l = p.x;
    b = t = p.y;
    if(startP.x < l) l = startP.x;
    if(startP.x > r) r = startP.x;
    if(startP.y < t) t = startP.y;
    if(startP.y > b) b = startP.y;
    this.width = r-l;
    this.height = b-t;
    this.position.x = (l + r)/2;
    this.position.y = (t + b)/2;

    p = this.startAbsolutePosition;
    r = l = p.x;
    b = t = p.y;
    startP = e.point;
    if(startP.x < l) l = startP.x;
    if(startP.x > r) r = startP.x;
    if(startP.y < t) t = startP.y;
    if(startP.y > b) b = startP.y;

    var collided = this.camera.getChildrenAtRect(l, t, r, b, this.selectType)
    this.select(collided);
  }
  down(e, scope){}
  move(e, scope){}
  up(){}
};