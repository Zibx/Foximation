class World extends GameObject{
    constructor(cfg){
        if(!cfg) {
            cfg = {};
        }
        cfg.width = cfg.width || 0.5;
        cfg.height = cfg.height || 0.5;

        super(cfg);
        this.updateCounter = 0;
        this.manualClear = true;
    }
    update(){
        var currentTime = new Date()/1000,
            dt = this.lastUpdate ? currentTime - this.lastUpdate : 0;
        this._update(dt, this.updateCounter++);

        this.lastUpdate = currentTime;
    }
    _update(dt, counter){
        let i = 0, children = this.children, _i = children.length;
        for(;i<_i;i++){
            children[i]._update(dt, counter)
        }
    }
}