/**
 * Created by zibx on 4/12/18.
 */
var FakeCTX = function (ctx, donor) {
    this.ctx = ctx;
    this.donor = donor;
};
FakeCTX.prototype = {
    moveTo: function (x,y) {
        if(x instanceof Point){
            y = x.y;
            x = x.x;
        }
        var coord = this.donor.toPX({x: x, y: y});
        this.ctx.moveTo(coord.x, coord.y);
    },
    setTransform: function(){
      return this.ctx.setTransform.apply(this.ctx, arguments);
    },
    lineTo: function (x, y) {
        if(x instanceof Point){
            y = x.y;
            x = x.x;
        }
        var coord = this.donor.toPX({x: x,y: y});
        this.ctx.lineTo(coord.x, coord.y);
    },
    line: RenderTools.prototype.line,
    fillCircle: function(x, y, r, color, width){
      if(x instanceof Point){
        width = color;
        color = r;
        r = y;
        y = x.y;
        x = x.x;
      }
      this.ctx.beginPath();
      this.ctx.arc(x, y, r,0,2*Math.PI);

      this.ctx.lineWidth = width || 1;
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.closePath()
    },
    strokeCircle: function(x, y, r, color, width){
      if(x instanceof Point){
        width = color;
        color = r;
        r = y;
        y = x.y;
        x = x.x;
      }
      this.ctx.beginPath();
      this.ctx.arc(x, y, r,0,2*Math.PI);

      this.ctx.lineWidth = width || 1;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
      this.ctx.closePath()

    },
    circle: function (x, y, r) {
        if(x instanceof Point){
            r = y;
            y = x.y;
            x = x.x;
        }
        var coord = this.donor.toPX({x: x,y: y});
        this.ctx.arc(coord.x, coord.y, r,0,2*Math.PI);
    },
    beginPath: function () {
        this.ctx.beginPath();
    },
    closePath: function () {
        this.ctx.closePath();
    },
    stroke: function () {
        if(this._lastLineWidth !== this.lineWidth){
            this.ctx.lineWidth = this._lastLineWidth = this.lineWidth
        }
        if(this._lastStrokeStyle !== this.strokeStyle){
            this.ctx.strokeStyle = this._lastStrokeStyle = this.strokeStyle
        }
        this.ctx.stroke();
    },
    fill: function () {
        if(this._lastFillStyle !== this.fillStyle){
            this.ctx.fillStyle = this._lastFillStyle = this.fillStyle;
        }
        this.ctx.fill();
    },
    clear: function (color) {
        this._lastFillStyle = this.ctx.fillStyle = color;
        this.ctx.fillRect(0,0,this.donor.width, this.donor.height);
    },
    drawImage: function (img, pos, w,h, r,dx,dy) {
        dx = dx || 0;
        dy = dy || 0;
        var coord = this.donor.toPX(pos);
        var wPx = this.donor.toPXNumber(w);
        var hPx = this.donor.toPXNumber(h);
        this.ctx.translate(coord.x, coord.y);
        if(r){
            this.ctx.rotate( r/180*Math.PI );
        }
        this.ctx.drawImage(img, -wPx/2+dx*wPx, -hPx/2+dy*hPx, wPx,hPx);
        if(r){
            this.ctx.rotate( -r/180*Math.PI );
        }
        this.ctx.translate(-coord.x, -coord.y);
    }
};