class Rectangle extends GameObject{
    constructor(cfg){
        super(cfg);
        this.lineWidth = this.lineWidth || 1;
    }
    draw(ctx,childTransform){

        ctx.lineWidth = this.lineWidth/100;

        if(this.background){
            ctx.fillStyle = this.background;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        if(this.color) {
            ctx.strokeStyle = this.color;
            ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        }

    }
}