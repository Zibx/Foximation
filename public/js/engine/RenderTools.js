/**
 * Created by zibx on 4/12/18.
 */
var RenderTools = function (ctx, donor) {
    this.ctx = ctx;
    this.donor = donor;
};
RenderTools.prototype = {
    line: function ( cfg, color, width) {
      var from = cfg.from, to = cfg.to;

        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.lineWidth = width || 5;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    },
    vector: function(cfg, color, width) {
        this.line(cfg, color, width);
        var vec = cfg.to.subClone(cfg.from);
        var cap1 = cfg.to.addClone(
            new Point(0,cfg.cap || 15).rotate(vec.angle()+Math.PI/3)
        );
        var cap2 = cfg.to.addClone(
            new Point(0,cfg.cap || 15).rotate(vec.angle()+Math.PI/3*2)
        );
        this.line({to: cfg.to, from: cap1}, color, width);
        this.line({to: cfg.to, from: cap2}, color, width);
    },
    dot: function(cfg, color) {
        this.ctx.strokeStyle = color || '#f00';
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        this.ctx.moveTo(cfg.x-0.1, cfg.y-0.1);
        this.ctx.lineTo(cfg.x+0.1, cfg.y+0.1);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(cfg.x-0.1, cfg.y+0.1);
        this.ctx.lineTo(cfg.x+0.1, cfg.y-0.1);
        this.ctx.stroke();
    },
    rect: function(cfg, color, width) {
        this.ctx.strokeStyle = color || '#f00';
        this.ctx.lineWidth = width || 1;
        this.ctx.strokeRect((cfg.x|0)+0.5, (cfg.y|0)+0.5, cfg.width|0, cfg.height|0);
    },
    circle: function(cfg, color, r) {
        this.ctx.strokeStyle = color || '#f00';
        this.ctx.beginPath();
        this.ctx.arc( cfg.x, cfg.y, r || 3, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    },
    arc: function(cfg, color, r) {
        this.ctx.strokeStyle = color || '#f00';

        this.ctx.beginPath();
        var a1 = cfg.from.subClone(cfg.center).angle();
        var a2 = cfg.to.subClone(cfg.center).angle();
        var clockwise = false;
        if(cfg.closest){
            if((a2-a1+Math.PI*20)%(Math.PI*2)>Math.PI)
                clockwise = true;
        }
        this.ctx.arc(
            cfg.center.x, cfg.center.y, r || 10,
            a1,
            a2,
            clockwise
        );
        this.ctx.stroke();
    }
};