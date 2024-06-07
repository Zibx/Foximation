class Rotator extends Interact {
  constructor( props ) {
    super( props );
    this.setCursor();
  }
  setCursor(){
    var angle = ((45+this.n*90-this.group.rotation/3.141592*180)/6|0)*6+3;
    if(angle === this.lastAngle)
      return this.cursor;

    this.lastAngle = angle;

    var cod = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path xmlns="http://www.w3.org/2000/svg" d="M12.51 10.12L12.72 10.97L13.35 10.35L16.85 6.85L17.34 6.36L16.72 6.05L11.72 3.55L10.75 3.06L11.01 4.12L11.41 5.71C11.22 5.81 10.97 5.94 10.67 6.11C10.00 6.50 9.11 7.09 8.21 7.92C6.42 9.59 4.58 12.21 4.50 15.98C4.41 19.77 6.25 22.64 8.08 24.54C8.99 25.50 9.90 26.22 10.59 26.70C10.93 26.94 11.22 27.12 11.42 27.24L11.01 28.87L10.75 29.93L11.72 29.44L16.72 26.94L17.34 26.63L16.85 26.14L13.35 22.64L12.72 22.02L12.51 22.87L12.17 24.25C7.88 21.80 7.11 17.53 7.15 16.01C7.20 14.50 7.86 11.12 12.16 8.73L12.51 10.12Z" fill="#FBFCFD" stroke="#041522" stroke-linecap="round" style="rotate: ${
      angle
    }deg;transform-origin: center;"/>
</svg>`
    this.cursor = `url("data:image/svg+xml;base64,${btoa(cod)}") 16 16, pointer`
    return this.cursor;
  }
  draw(ctx){
    if(!this.isDown)
      return
/*    ctx.beginPath();
    var p1 = this.startPosition;
    var p2 = this.p2;
    ctx.lineWidth = this.pxRatio.x*2;
    ctx.moveTo(0, 0)
    ctx.lineTo(-p1.x, -p1.y)
    p2 = p2.clone().normalize().mul(p1.magnitude())
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke();*/
  }
  down(e, scope){
    var group = this.group;
    var tween = group.tween;
    var camera = group.camera;

    var list = group.list;
    this.isDown = true;
    var startPosition = camera.getRegion(this);
    startPosition = startPosition[0].middle(startPosition[1]);

    var startGroupPosition = camera.getRegion(group);
    startGroupPosition = startGroupPosition[0].middle(startGroupPosition[1]);

    var startRotation = this.group.rotation;
    //var startRotationAtPoint = this.startPosition.getAngle();

    var initialRotation = startPosition.subClone(startGroupPosition).getAngle();
    var pxRatio = group.world.pxRatio;
    var p = new Point(), rotation;
    D.mouse.dragBehavior(false,{
      cursor: this.cursor,
      move: Store.debounce((deltaPX,me,e, style)=>{
        //d.clear();

        p.x = startPosition.x+deltaPX.x-startGroupPosition.x;
        p.y = startPosition.y+deltaPX.y-startGroupPosition.y;

        rotation = -p.getAngle()+initialRotation+startRotation;
        // d.line(startPosition.subClone(startGroupPosition), new Point(), 'green', .1)
        // d.line(startPosition.addClone(p).normalize().mul(startPosition.magnitude()), new Point(), 'red', .1)
        if(e.shiftKey){
          var constraint = 15;
          rotation = Math.round(rotation *180/3.1415926535/constraint)*constraint/180*3.1415926535
        }
        this.group.rotation = rotation
        style.cursor = this.setCursor();
        list.forEach((item, n) => {
          tween.updateKeyFrame(item, tween.getCurrentFrame(), {
            rotation: this.group.rotation
          });
        });
        this.main.updateValues();
        //this.group.updatePosition()
        this.main.updateCanvas();
      }, 5),
      up: ()=>{
          this.isDown = false;
          group.updateCursors();
      }
    })(e.event);
    return true;
  }
}
Rotator.prototype.manual = true;
Rotator.prototype.isDown = false;