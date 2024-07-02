/**
* Created by zibx on 4/11/18.
*/
var pows = {};
var round = function (num, count) {
    var toDec = Math.pow(10, count);
    return Math.round(num*toDec)/toDec;
},
    round3 = function(num) {
        return Math.round(num*1000)/1000;
    };

window.Mode = {
  info: {
    scope: {},
    reactor: {},
    move: function(){},
    down: function(e, ctx, scope){

      var clickedOn = this.pointToObject(e.point)
      console.log(clickedOn);
    }
  }
};
var Game = function (cfg) {
    this.modeName = new Store.Value.String('');
    this.fps = 60;
    this.zoom = 1;
    this.pos = new Point(0,0);
    this.minWH = 16;

    Object.assign(this, cfg);
    this.init();

    this.initEvents();


    this.objects = [];
    cfg.parent = this;
//    this.addObject(new Containers.Object(cfg));


    //_self.floor[0].water = 10;//_self.floor.length-1

    this.setMode(this.mode || 'info');
    this.gameLoop = this.gameLoop.bind(this);
    this._gameLoop = this._gameLoop.bind(this);
    this.fullDraw = this.fullDraw.bind(this);
    this.gameLoop();
    this.physic();
    this.fullDraw();

};
Game.prototype = {
    cameraControl: true,
    manualLoop: false,
    frameRequested: false,
    _gameLoop: function(){
      this.frameRequested = false;
      var t = +new Date(),
        dt = (t-this.lastT)/1000;
      if(dt < 0.001)
        dt = 0.001;

      if(dt > 0.3)
        dt = 0.3;
      this.physic(dt);
      this.fullDraw();

      var frameFullTime = +new Date() - t;
      this.lastT = t;
      var waitTime = Math.max(1,1000/this.fps-frameFullTime);
      if(this.manualLoop !== true) {
        this.wouldUpdate = setTimeout( this.gameLoop, waitTime );

      }
    },
    gameLoop: function() {
      if(this.frameRequested)
        return;
      clearTimeout(this.wouldUpdate);

      this.frameRequested = true;
      requestAnimationFrame(this._gameLoop);
    },
    modes: Mode,
    objects: [],
    _logObject: function() {
        //console.log(JSON.stringify(g.objects[0].floor.map(function(f){return [Math.round(f.position.x*1000)/1000,Math.round(f.position.y*1000)/1000]})));
    },
    fromPx: function (obj) {
        var wh = Math.min(this.width, this.height);
        return new Point(
            round((obj.x - this.width/2)/wh*this.minWH/this.zoom+this.pos.x,3),
            round((obj.y - this.height/2)/wh*this.minWH/this.zoom+this.pos.y,3)
        );
    },
    objectCoordFromPx: function() {

    },
    pointToObject: function(coord) {
      return this.objects.filter(o=> o.collider(this.camera.pointToWorld.call(o, coord)));
        //return this.camera.posFromPx(coord, this.objects[0].view);
    },
    findNearestWP: function(point, radius, mayBeGhost, filter) {
       /* var wps = this.objects[0].wayPoints,
            wpToFloor = this.objects[0].wayPointToFloor, wp,
            nearest = false, nearestDistance = radius*2, distance;
        for(var i in wps){
            wp = wps[i];
            distance = wp.distance(point);
            if(distance<nearestDistance) {
                if (mayBeGhost || !(wpToFloor[i] instanceof GhostFloor)) {

                    nearest = {wp: {point: wp, index: i}, point: wp, floor: wpToFloor[i], distance: distance};
                    nearestDistance = distance;
                }
            }
        }
        if(nearest)
            nearest.match = true;
        if(nearest && filter && !filter.call(this, nearest.wp.index, nearest.wp.point, nearest))
            nearest.match = false;
        return nearest;*/
      return {}
    },
    findNearestEdge: function(point, radius, mayBeGhost, filter) {
        var wps = this.findNearestWP(point, radius, mayBeGhost);
        if(!wps)
            return false;
        var graph = this.objects[0].graph[wps.wp.index];
        var edge = false, edgeDistance = radius*2;
        for(var i = 0, _i = graph.length; i < _i; i++){
            var distance = this.objects[0].wayPoints[graph[i]]
                .addClone(this.objects[0].wayPoints[wps.wp.index])
                .div(2)
                .distance(point);
            if(!mayBeGhost && this.objects[0].wayPointToFloor[graph[i]] instanceof GhostFloor)
                continue
            if(distance<edgeDistance){
                edgeDistance = distance;
                edge = i;
            }
        }

        if(edge !== false){

            return {
                connection: this.objects[0].graphLength[wps.wp.index][edge],
                point1:this.objects[0].wayPoints[wps.wp.index],
                point2:this.objects[0].wayPoints[graph[edge]],
                wp1: wps.wp.index,
                wp2: graph[edge]
            }
        }
        return false;
    },
    getSibling: function(floor, wall) {
        return this.objects[0].getSibling(floor, wall);

    },
    isSafeToPlace: function(coord) {

        var safePlacing = this.objects[0].floor.map(function (item) {
            return {item:item, collided:item.circleCollision(coord, 1)};
        }).filter(function (item) {
            return item.collided && item.collided > 0.3;
        });
        return safePlacing.length === 0;
    },
    pointToNearFloors: function(coord) {
        var collided = this.objects[0].floor.map(function (item) {
            return {item:item, collided:item.circleCollision(coord, 1)};
        }).filter(function (item) {
            return item.collided;
        });
        collided.sort(function (a, b) {
            return b.collided - a.collided
        });
        return collided;
    },
    physic: function(dt) {

        this._physic(dt);
        this.objects.forEach(function(object) {
          if('physic' in object)
            object.physic(dt);
        });
    },
    moves: {
        w: [0, -10],
        a: [-10, 0],
        s: [0, 10],
        d: [10, 0]
    },
    _physic: function(dt) {
        if(this.cameraControl === false)
          return;

        var activeBtns = this.activeBtns,
            moves = this.moves;


        for(var key in activeBtns){
            if(key in moves){
                var coeff = Math.log(activeBtns[key]++)/3;
                //console.log(coeff)
                var move = moves[key];
                this.camera.position.x+=move[0]*coeff*dt;
                this.camera.position.y+=move[1]*coeff*dt;
                //_self.fullDraw();
            }
        }

    },
    //debugDrawPoint: FloorTile.prototype.debugDrawPoint,
    addObject: function(object) {

      this.objects.push(object);

    },
    addFloor: function(floor) {
        this.objects[0].addFloor(floor);
    },
    init: function () {
        var world = this.world = new World();
        var camera = this.camera = new Camera({
            background: '#17548b',
            width: this.width,
            height: this.height,
            scale: this.zoom,
            world: world,
            ctx: this.renderTo.getContext('2d')
        });

        window.Render = this.Render = new RenderTools(camera.ctx, this);
        /*this._ctx = this.renderTo.getContext('2d');
        this.ctx = new FakeCTX(this._ctx, this);
        window.ctx = this.ctx;
        */
    },

    clear: function () {
        this.ctx.clear('#17548b');
    },
    getWpInfo: function (wpid) {
        return this.objects[0].getWpInfo(wpid);
    },
    fullDraw: function () {

        this.camera.clear();

        this._beforeDraw && this._beforeDraw(this.camera.ctx)

        //this.camera.draw('back');
        this.camera.draw();

        //this.debugDraw();
        this._afterDraw && this._afterDraw(this.camera.ctx)
        /*var ctx = this.ctx;
        this.objects.forEach(function(object) {
            object.fullDraw(ctx);
        });*/
        /*var mode = this.mode;
        if(mode.reactor.step)
            mode.reactor.step.call(this, mode.scope);*/

    },
    debugDraw: function() {
        this.camera.debugDraw();
    },


    toPX: function (obj) {
        var wh = Math.min(this.width, this.height);

        return new Point(
            ((obj.x-this.pos.x)*this.zoom/this.minWH*wh)+this.width/2,
            ((obj.y-this.pos.y)*this.zoom/this.minWH*wh)+this.height/2
        );
    },
    toPXNumber: function (obj) {
        var wh = Math.min(this.width, this.height);

        return (obj * this.zoom / this.minWH * wh);
    },
    log: function (obj) {
        if(typeof obj === 'string'){
            this.debug.innerText = obj;
        }else{
            var txt = JSON.stringify(obj,null,2);
            this.debug.innerText = txt.substr(1, txt.length - 2);
        }
    },
    initEvents: function () {
        var _self = this,
            ctx = this.ctx;

        var getWorldPos = function(){return this.camera.pointToWorld(this.point) };

        var wrapPoint = new Point();
        var wrapped = {
          getWorldPos,
          event: void 0,
          point: wrapPoint
        };
        var eventWrapper = function(event) {
          wrapPoint.x = event.offsetX;
          wrapPoint.y = event.offsetY;
          wrapped.event = event;
          return wrapped;
            var point = new Point(event.offsetX, event.offsetY);
            return {point, getWorldPos, event}
        };
        this.eventWrapper = eventWrapper;
        this.renderTo.addEventListener('mousemove', function (e) {
            //_self.floor[0].rot+=1;
            var mode = _self.mode;
            mode.reactor.move.call(_self, eventWrapper(e), ctx, mode.scope);
        });
        this.renderTo.addEventListener('mouseup', function (e) {
            //_self.floor[0].rot+=1;
            var mode = _self.mode;
          mode.reactor.up && mode.reactor.up.call(_self, eventWrapper(e), ctx, mode.scope);
        });
        this.renderTo.addEventListener('mousedown', function (e) {
            var mode = _self.mode;
            mode.reactor.down.call(_self, eventWrapper(e), ctx, mode.scope);
        });

        var moves = this.moves;
        var zooms = {'=':1.1, '-':0.9};
        var activeBtns = this.activeBtns = {};

        window.addEventListener('keydown', function (e) {
           if(e.key in moves){
               if(!activeBtns[e.key])
                    activeBtns[e.key] = 1;
//               !updateTimeout && doUpdate();
           }
        });
        window.addEventListener('keyup', function (e) {
            if(e.key in moves){
                delete activeBtns[e.key];

            }
        });
        window.addEventListener('keypress', function (e) {

            if(e.key in zooms) {
                _self.camera.scale*= zooms[e.key];
                //_self.fullDraw();
            }
        });
        this.renderTo.addEventListener('wheel', function(e) {
            var point = eventWrapper(e).point,
                scale = _self.camera.scale,
                cameraPoint = _self.camera.pointToObject(point), //~x

                delta = _self.camera.position.subClone(cameraPoint);//~frame

            _self.camera.scale*= e.deltaY > 0 ? 0.9 : 1.1;
            var newCameraPoint = _self.camera.pointToObject(point, _self.camera.getTransform().m);

            _self.camera.position.x -= (newCameraPoint.x - cameraPoint.x)*2;
            _self.camera.position.y -= (newCameraPoint.y - cameraPoint.y)*2;

            _self.gameLoop();
            //_self.fullDraw();
        });

        D.mouse.dragBehavior(this.renderTo, {
          check: (e, context)=>{
            if(!(e.button === 1 || e.button === 4))
              return false;
            var point = eventWrapper(e).point;

            context.startPoint = point;
            context.startPosition = _self.camera.position.clone();
            context.d = _self.camera.pointToObject(new Point(this.width, this.height))
              .sub(_self.camera.pointToObject(new Point(0, 0)))
              .div(this.width, this.height)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          },
          cursor: 'move',
          move: Store.debounce(
            ((delta, context, e)=>{

              var point = eventWrapper(e).point;
              //console.log(point, context.startPoint,_self.camera.scale, context.d)
              _self.camera.position.x = context.startPosition.x -
                (delta.x)*context.d.x*2;

              _self.camera.position.y = context.startPosition.y -
                (delta.y)*context.d.y*2;

              //_self.camera.position.y -= (newCameraPoint.y - cameraPoint.y)*2;
              _self.gameLoop();

            }),
            5)
        });
    },
    updateSize: function(w, h) {
        this.camera.width = this.width = w;
        this.camera.height = this.height = h;
        this.height = h;
        //this.fullDraw();

    },

    setMode: function (mode, data) {
      this.modeName.set(mode);
        if (!this.modes[mode]) {
            return console.warn('Unknown mode', mode, data)
        }

        this.mode &&
            this.mode.reactor &&
                this.mode.reactor.leave &&
                    this.mode.reactor.leave.call(this, this.mode.scope);


        this.mode = {
            name: mode,
            data: data,
            reactor: this.modes[mode],
            scope: this.modes[mode].scope || (this.modes[mode].scope = new ModeScope())
        };
        Object.assign(this.modes[mode].scope, data)

        this.mode &&
            this.mode.reactor &&
                this.mode.reactor.init &&
                    this.mode.reactor.init.call(this, this.mode.scope);

        return this.mode;
    }

};