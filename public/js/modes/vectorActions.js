;(function(){
  'use strict';
  var MovablePoint = function(){

  };

  var Movables = function(commands, path, scope){
    this.commands = commands || [];
    this.path = path;
    this.scope = scope;
    this.movables = [];
    this.points = [];
    this.edges = [];
    this.pointsHash = {};
    this._ghost = false;
    this.id = 1;
    this.lastPoint = false;
  };
  Movables.prototype = {
    add: function(point){
      point.id = this.id++;
      console.log('add point');
      if(this.lastPoint){
        if(this.lastEdge){
          this.lastEdge.pEnd
        }
        var edge = {
          id: this.id++,
          pStart: this.lastEdge ? this.lastEdge.pEnd : this._ghost.point,
          p1: this.lastEdge ? this.lastEdge.p2.mulClone(-1) : this._ghost.delta,
          pEnd: point
        };
        this.lastEdge = edge;
        this.edges.push(edge)
        console.log('add edge');

      }

      this.lastPoint = point;
      this.points.push(point);

      if(this.edges.length === 0){
        console.log('ghost is point');
        this._ghost = {
          type: 'point',
          delta: new Point(0,0),
          point: point
        };
      }else{
        console.log('ghost is edge');
        this._ghost = edge;
        edge.p2 = new Point();
      }
    },
    ghost: function(x, y){
      if(this.lastEdge){
        this._ghost.p2.x = -x;
        this._ghost.p2.y = -y;
      }else{
        this._ghost.delta.x = x;
        this._ghost.delta.y = y;
      }
    },
    ghostNextPoint: function(p){
      console.log(this._ghost.type)
      if(this._ghost.type === 'point'){

      }else{

/*        if(this._ghost.type !== 'edge'){
          var edge = {
            type: 'edge',
            id: this.id++,
            pStart: this.lastEdge.pStart,
            p1: this.lastEdge.p1,
            p2: new Point(),
            pEnd: p
          };
          this.edges.push(edge)
          this.lastEdge = edge;
          this._ghost = edge;
        }*/


      }
    },
    update: function(sx, sy, w, h, l, t){
      var commands = this.commands;
      var movables = this.movables = [];
      var r1 = 4;
      var r2 = 3;
      this.sx = sx;
      this.sy = sy;
      var tx = a => (a-l-w/2)*sx;
      var ty = a => (a-t-h/2)*sy;

      for (var i = 0, _i = commands.length; i < _i; i++) {
        var item = commands[i];
        if(item.type === 'M' || item.type === 'L'){
          movables.push({
            isMain: true,
            point: new Point(tx(item.x), ty(item.y)),
            radius: r1,
            command: item,
            l1: false, l2: false
          });
        }else if(item.type === 'Q'){
          /*          movables.push({

                      point: new Point(tx(item.x), ty(item.y)),
                      radius: r1,
                      command: item
                    });*/
        }else if(item.type === 'C'){
          var main = {
            isMain: true,
            point: new Point(tx(item.x), ty(item.y)),
            radius: r1,
            command: item,
            l1: false, l2: false
          }

          var l1 = {
            x: 1,
            isMain: false,
            point: new Point(tx(item.x1), ty(item.y1)),
            main: movables[movables.length-1].point,
            radius: r2,
            command: item
          };
          movables[movables.length-1].l2 = l1;

          var l2 = {
            x: 2,
            isMain: false,
            point: new Point(tx(item.x2), ty(item.y2)),
            main: main.point,
            radius: r2,
            command: item
          }
          main.l1 = l2;

          movables.push(l1,l2, main);
        }
      }
      this.movables.forEach(m=>{
        if(m.isMain){
          if(m.l1 && m.l2){

          }
        }
        //m.globalPoint = this.item.objectPointToWorld(m.point);
      });
    },
    getAtPoint: function(point){
      var pxRatio = this.scope.pxRatio;
      var nearest = false, near = Infinity;
      var movables = this.movables, distance;
      var p;
      for( var i = 0, _i = movables.length; i < _i; ++i ) {
        p = movables[ i ].point;
        distance = p.distance( point );
        if( distance < 6 * pxRatio ) {
          if( !nearest ) {
            nearest = movables[ i ];
            near = distance;
          } else if( near > distance ) {
            nearest = movables[ i ];
            near = distance;
          }
        }
      }
      return nearest;
    },
    query: function(p){
      var points = this.movables
    },
    draw: (function(){
      var MOVABLE_STROKE = GIZMO_COLOR,
        MOVABLE_FILL = '#FFFFFF';

      var MOVABLE_ACTIVE_STROKE = (new Color(GIZMO_COLOR)).lighter(0.2).toHTML(),
        MOVABLE_ACTIVE_FILL = GIZMO_COLOR;

      var CONNECTION_STROKE = (new Color(GIZMO_COLOR)).lighter(0.8).toHTML();
      return function(ctx, pxRatio){
        var scope = this.scope;
        this.scope.pxRatio = pxRatio;
        ctx.lineWidth = pxRatio;

        ctx.strokeStyle = CONNECTION_STROKE;



        this.movables.forEach((movable, i)=> {
          if(!movable.isMain){
            ctx.beginPath();
            ctx.moveTo(movable.point.x, movable.point.y);
            ctx.lineTo(movable.main.x, movable.main.y);
            ctx.stroke();
          }
          if(i === scope.activeMovable && scope.ghost){
            ctx.beginPath();
            ctx.moveTo(movable.point.x, movable.point.y);
            ctx.lineTo(scope.ghost.x, movable.point.y+scope.ghost.y);
            ctx.stroke();
          }
        });

        ctx.fillStyle = MOVABLE_STROKE;
        ctx.strokeStyle = MOVABLE_FILL;

        this.movables.forEach((movable, i)=>{
          ctx.strokeStyle = movable.active ? MOVABLE_ACTIVE_STROKE:MOVABLE_STROKE;
          ctx.fillStyle = movable.active ? MOVABLE_ACTIVE_FILL:MOVABLE_FILL;
          ctx.beginPath();
          ctx.arc(movable.point.x, movable.point.y, movable.radius*pxRatio, 0, 3.14159265468979*2);
          ctx.fill();
          ctx.stroke();
          if(i === scope.activeMovable){

          }
        });

        this.edges.forEach(edge => {
          ctx.beginPath();
          ctx.moveTo(edge.pStart.x, edge.pStart.y);
          ctx.bezierCurveTo(
            edge.p1.x+edge.pStart.x, edge.p1.y+ edge.pStart.y,
            edge.p2.x + edge.pEnd.x, edge.p2.y + edge.pEnd.y,
            edge.pEnd.x, edge.pEnd.y
          )
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(edge.pStart.x, edge.pStart.y);
          ctx.lineTo(edge.p1.x+edge.pStart.x, edge.p1.y+ edge.pStart.y);

          ctx.moveTo(edge.pEnd.x, edge.pEnd.y);
          ctx.lineTo(edge.p2.x + edge.pEnd.x, edge.p2.y + edge.pEnd.y);
          ctx.stroke();

        });
        if(this._ghost){
          if(this._ghost.type === 'point'){

            ctx.beginPath();
            ctx.moveTo(this._ghost.point.x, this._ghost.point.y);
            ctx.lineTo(this._ghost.point.x+this._ghost.delta.x, this._ghost.point.y+this._ghost.delta.y);
            ctx.stroke();

            ctx.strokeStyle = MOVABLE_ACTIVE_STROKE;
            ctx.fillStyle =  MOVABLE_ACTIVE_FILL;
            ctx.beginPath();
            ctx.arc(this._ghost.point.x+this._ghost.delta.x, this._ghost.point.y+this._ghost.delta.y, 5*pxRatio, 0, 3.14159265468979*2);
            ctx.fill();
            ctx.stroke();
          }
        }

        this.edges.forEach(edge => {
          ctx.strokeStyle = MOVABLE_ACTIVE_STROKE;
          ctx.fillStyle =  MOVABLE_ACTIVE_FILL;
          ctx.beginPath();
          var x = edge.pStart.x + edge.p1.x;
          var y = edge.pStart.y + edge.p1.y;
          ctx.arc(x, y, 3*pxRatio, 0, 3.14159265468979*2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          var x = edge.pEnd.x + edge.p2.x;
          var y = edge.pEnd.y + edge.p2.y;
          ctx.arc(x, y, 3*pxRatio, 0, 3.14159265468979*2);
          ctx.fill();
          ctx.stroke();
        });

        this.points.forEach(point =>{
          ctx.strokeStyle = MOVABLE_ACTIVE_STROKE;
          ctx.fillStyle =  MOVABLE_ACTIVE_FILL;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 7*pxRatio, 0, 3.14159265468979*2);
          ctx.fill();
          ctx.stroke();
        })



      };
    })()
  };
  Loopy.Movables = Movables;
})();