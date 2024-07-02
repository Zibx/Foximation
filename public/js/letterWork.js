var Loopy = function(cfg) {
  Object.assign( this, cfg );
  this.selection = new Loopy.Selection({main: this});

  this.lineHeight = this.lineHeight || 1.2;
  var el = this.canvas = D.h('canvas', {
    style: {
      width: '100%',
      height: this.height+'px',
    },
    cls: 'letterwork-canvas',
    width: this.width,
    height: this.height,
    renderTo: this.renderTo
  });
  this.backgroundColor = new Store.Value.Number((new Color(cfg.backgroundColor)).toNumber());


  this.lines = [];

  this.properties = new PropertiesPane({lw: this, main: this});
  var elementsTree = this.elementsTree = new ElementsTree({main: this});


  this.tween = new Tween({
    startFrame: 1, endFrame: 120,
    properties: this.properties
  });

  this.tween.debug.hook(val=>
    this.lines.forEach(line=>{
      line.debugLetters = val
      line.symbols.forEach(s=>s.debugLetters = val)
    }));

  var toolbar = this.toolbar = new Toolbar({main: this, tween: this.tween});


  this.layout = D.h('div', {
      cls: 'letterwork-layout',
      renderTo: this.renderTo
    },

    new VerticalFlex({
        onchange: (sizes)=>{
          this.canvas.height = sizes[1];
          this.canvas.style.height = sizes[1]+'px';
          g.height = sizes[1];
          g.camera.height = sizes[1];
          g.fullDraw();
        },
        ondrag: Store.debounce((sizes)=>{
          requestAnimationFrame(()=>{
            this.canvas.height = sizes[1];
            this.canvas.style.height = sizes[1]+'px';

            g.height = sizes[0];
            g.camera.height = sizes[1];
            g.fullDraw();
            this.tween.resizeHeight(sizes[1]);
          })
        }, 10)
      },
      this.toolbar,
      new HorizontalFlex({
          onchange: (sizes)=>{
              this.canvas.width = sizes[1];
              g.width = sizes[1];
              g.camera.width = sizes[1];
              g.fullDraw();
          },
          ondrag: Store.debounce((sizes)=>{
            requestAnimationFrame(()=>{
              this.canvas.width = sizes[1];
              g.width = sizes[1];
              g.camera.width = sizes[1];
              g.fullDraw();
            })
          }, 10)
        },
        this.elementsTree,
        this.canvas,
        this.properties
      ),
      this.tween
    )
  );

  this.selectedLines = [];
  this.selectedChars = [];


  var g = window.g = this.game = new Game( {
    manualLoop: true,
    cameraControl: false,
    renderTo: el,
    width: this.width, height: this.height,
    zoom: 1,
    crisp: true,
    fps: this.fps || 60,
    modes: this.modes,
    _beforeDraw: function(){
      this.camera.drawGrid(4);
    },
    _afterDraw: function(ctx){
      if(editableGroup) {
        editableGroup.physic();
        this.camera.draw( 'ui' );
      }

/*      ctx.strokeStyle = '#008800';
      ctx.lineWidth = 2;
      this.camera.clearRects.forEach((r,n)=>{
        if(n>40)
        ctx.strokeRect(r[0].x,r[0].y,r[1].x-r[0].x, r[1].y-r[0].y)
      });*/
      //this.editableGroup && this.editableGroup.draw(ctx)
//      this
    }
  } );
  this.camera = this.game.camera;
  elementsTree.init(this.game.world);
  toolbar.init({game: this.game})

  var editableGroup = this.editableGroup = new EditableGroup({
    width: 1, height:1, camera: g.camera, main: this
  })
  var selectionRect = this.selectionRect = new SelectionRect({
    width: 1, height:1, camera: g.camera, selection: this.selection
  })

  Object.values(this.modes).forEach(mode => {
    mode.scope.lw = this;
    mode.scope.main = this;
    mode.scope.game = this.game;
    mode.scope.camera = this.game.camera;
    mode.scope.tween = this.tween;
    mode.scope.editableGroup = this.editableGroup;
    mode.scope.selectionRect = this.selectionRect;
  });

  [editableGroup, selectionRect, elementsTree].forEach(item => {
    item.game = this.game;
    item.tween = this.tween;
    item.camera = this.game.camera;
    item.world = this.game.camera.world;
    item.main = this;
  });



  var lastPlay = false;
  g.manualLoop = true;

  D.s.sub([this.tween.currentFrame], (play, frame)=> {
    this.updateEditableGroup();//updatePosition()
  });
  D.s.sub([this.tween.play, this.tween.currentFrame], (play, frame)=> {
    if(play) {

      if(lastPlay !== play) {
        lastPlay = play;
        g.manualLoop = false;
        g.gameLoop();
      }
    }else{
      g.manualLoop = true;
      lastPlay = false;
      g.gameLoop();
    }
  });
  document.addEventListener('visibilitychange',  ()=> {
    if (!document.hidden && !this.tween.play.get()) {
      g.gameLoop()
    }
  });
  //this.tween.currentFrame.hook(()=>g.gameLoop());


  class Grid extends GameObject {
    constructor( cfg ) {
      super( cfg );
    }

    draw( ctx, childTransform ) {
      ctx.lineWidth = 0.01;
      ctx.strokeStyle = '#CCCCCC';
      for( var x = -10; x < 10; x++ ) {
        ctx.beginPath();
        ctx.moveTo( x, -10 );
        ctx.lineTo( x, 10 );
        ctx.stroke();
      }
      for( var y = -10; y < 10; y++ ) {
        ctx.beginPath();
        ctx.moveTo( -10, y );
        ctx.lineTo( 10, y );
        ctx.stroke();
      }
    }
  }

  if(this.showGrid) {
    var grid = new Grid( {
      width: 1,
      height: 1
    } );
    g.world.addChild( grid, 'back' );
  }

  class TextBlock extends GameObject {
    constructor( cfg ) {
      super( cfg );
      this.relativeInit();

    }

    draw( ctx, childTransform ) {

    }
  }


  var block = this.block = new TextBlock({
    manualClear: true,
    tween: this.tween,
    width: this.textWidth,
    height: 5,
    draw: function(ctx){
      ctx.lineWidth = this.width/300;
      ctx.strokeStyle = '#b36dea';
      ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height)
    },
    physic: function(dt, t){
/*      var properties = this.tween.getProperties(this, this.tween.getCurrentFrame())

      Object.assign(this, properties);*/
      this.tween.nextFrame();
    },
  });

  //this.tween.addItem(block, GlyphTweenProps);//{rotation: {type: 'Number', result: Tween.FN.degToRad,value: block.rotation}})

  g.world.addChild( block );
  g.addObject( block );

  (async ()=>{
    var font = await Font.get(Font.fontsList[0]);

    var text = this.text;
    var textLines = this.text.split('\n');
    textLines.forEach((text, n)=>{
      var line = new TextLine({
        lw: this,
        text: text,
        font: font,
        fontSize: 32,
        //font: 'bold 1px Arial',
        ctx: g.Render.ctx,
        highlight: this.debugLines,
        width: this.textWidth,
        color: this.color,
        align: 'left',
        lineHeight: this.lineHeight,
        position: new Point(0, -block.height/2+(n)*this.lineHeight),
        debugLetters: this.debugLetters
      });
      block.addChild( line );
      g.addObject(line)
      g.addObject(line.selectionEl)
      this.lines.push(line);
    });

    /*this.getLine(0).align = 'center';
    this.getLine(2).align = 'right';
    this.getLine(4).align = 'right';*/
    this.lines.forEach(line => line.symbols.forEach(s =>
      this.tween.updateItemData(s, {
        fillStyle: '#'+sameAsRgbHex(200,0,0,0,0,Math.random()*360)
      })
    ));

    var v = new Vector({
      _position: new Point(100,100),
      path: {stroke: 'crimson', fill: '#00b000',
        width: 1,
        height: 1,
        commands: [
          {type: 'M', x: -0.5, y: -0.5},
          {type: 'L', x: 0.5, y: 0.4},
          {type: 'L', x: -0.5, y: 0.4},
          {type: 'Z'}
        ]},
      width: 32,
      height: 32,
      tween: this.tween
    })
    g.addObject(v)
    g.world.addChild(v)


    var v = new Vector({
      _position: new Point(0,200),
      path: Vector.pathFromString({
        width: 32,
        height: 32,
        d: "M8.5 13L8.5 12L7.7 12.6L3.7 15.6L3.16 16L3.7 16.4L7.7 19.4L8.5 20L8.5 19L8.5 17.5L23.5 17.5L23.5 19L23.5 20L24.3 19.4L28.3 16.4L28.83 16L28.3 15.6L24.3 12.6L23.5 12L23.5 13L23.5 14.5L8.5 14.5L8.5 13Z",
        fill: "#FBFCFD",
        stroke: "#041522",
        strokeLinecap: "round"
      }),
      width: 64,
      height: 64,
      tween: this.tween
    })
    g.addObject(v)
    g.world.addChild(v)


    var v = new Vector({
      _position: new Point(0,40),
      path: Vector.pathFromString({
        width: 28,
        height: 16,
        d: "M4.55 3.00L3.98 2.06L3.64 3.10L1.42 9.97L1.31 10.31L1.60 10.52L5.60 13.52L6.21 13.98L6.38 13.24L6.80 11.49C6.85 11.26 7.06 11.10 7.30 11.11L8.92 11.17C8.69 12.34 8.49 13.56 8.41 14.65C8.32 15.80 8.35 16.90 8.66 17.70C8.83 18.12 9.07 18.49 9.45 18.73C9.83 18.98 10.28 19.06 10.79 19.00C11.77 18.88 13.02 18.22 14.63 16.96C16.14 15.78 18.01 14.03 20.33 11.57L21.40 11.61L21.40 13.12L21.40 13.77L22.02 13.61L21.90 13.12C22.02 13.61 22.02 13.61 22.02 13.61L22.02 13.61L22.03 13.61L22.03 13.61L22.04 13.60L22.08 13.59C22.11 13.59 22.15 13.57 22.21 13.56C22.33 13.52 22.49 13.47 22.68 13.40C23.07 13.27 23.60 13.07 24.12 12.80C24.65 12.54 25.20 12.20 25.62 11.77C26.05 11.35 26.40 10.80 26.40 10.12C26.40 9.45 26.05 8.90 25.62 8.48C25.20 8.05 24.65 7.71 24.12 7.45C23.60 7.18 23.07 6.98 22.68 6.85C22.49 6.78 22.33 6.73 22.21 6.69C22.15 6.68 22.11 6.66 22.08 6.66L22.04 6.64L22.03 6.64L22.03 6.64L22.02 6.64L22.02 6.64C22.02 6.64 22.02 6.64 21.90 7.12L21.40 7.12C21.40 8.28 20.94 9.45 20.14 10.30C20.07 10.39 19.99 10.47 19.91 10.55L10.13 10.21C10.20 9.90 10.26 9.59 10.33 9.30C10.43 8.79 10.54 8.31 10.62 7.87C10.72 7.40 10.79 6.98 10.84 6.63C10.88 6.31 10.90 5.97 10.84 5.72C10.81 5.60 10.73 5.37 10.49 5.25C10.23 5.11 9.98 5.21 9.86 5.28C9.72 5.35 9.60 5.46 9.49 5.58C9.37 5.70 9.24 5.85 9.10 6.03C8.35 7.00 6.95 6.96 6.39 6.04L4.55 3.00Z",
        fill: "#FBFCFD",
        stroke: "#041522",
        strokeLinecap: "round"
      }),
      width: 128,
      height: 128,
      tween: this.tween
    })
    g.addObject(v)
    var frame = new Frame({
      tween: this.tween,
      _position: new Point(0,-250),
      width: 420,
      height: 420,
      fillStyle: '#AABBCC'
    });
    g.world.addChild(frame)
    g.addObject(frame)

    frame.addChild(v)


    setTimeout(()=>g.gameLoop(), 1)

  })();
  var uiStorage = new GameObject({name: 'UI'});
  uiStorage.addChild(this.editableGroup, 'ui');
  uiStorage.addChild(this.selectionRect, 'ui');
  g.world.addChild( uiStorage, 'ui' );
  //g.addObject(   this.editableGroup );


  //g.camera.scale = 0.18;
  this.backgroundColor.hook(val=>
    g.camera.background = '#'+numberToHex(val)
  )
  window.addEventListener('keyup', (e)=>{
    if(e.code === 'Space')
      this.tween.play.toggle();
  });
  document.body.addEventListener("wheel", e=>{
    if(e.ctrlKey) {
      e.preventDefault();//prevent zoom
      e.stopImmediatePropagation();
      e.stopPropagation();
    }

  }, {passive: false});



  document.ondrop = (event) =>{
    console.log("File(s) dropped");

    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();
    var items = event.dataTransfer.items;

    for(var i = 0, _i = items.length; i < _i; i++){
      var item = items[i];

      console.log(item);
      if(item.type === 'video/mp4'){
        var obj = new VideoObject( { tween: this.tween } );

        var x = event.target.result;
        var img = D.h( 'video', {
          autoplay: false,
          controls: false,
          src: URL.createObjectURL(event.dataTransfer.files[i]),
          onloadeddata: () => {
            obj.setVideo( img );
            this.updateCanvas();
          } } );
        img.load();
        g.addObject(obj)
        g.world.addChild(obj)
      }else {
        var obj = new ImageObject({tween: this.tween});
        g.addObject(obj)
        g.world.addChild(obj)
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = function(event){
          var x = event.target.result;
          var img = D.h('img', {src: x, onload: ()=> obj.setImage(img)});


          //event.target.result data
          //console.log(event.target.result)
        }; // data url!
        reader.readAsDataURL(blob);
      }
    }
  };
  document.ondragover = function(e){
      e.preventDefault();
  }
  document.onpaste = (event)=>{
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
     // will give you the mime types
    for(var i = 0, _i = items.length; i < _i; i++){
      var item = items[i];

      console.log(item);
      if (item.kind === 'file') {


        var x = event.target.result;

        if(item.type === 'video/mp4'){
          var obj = new VideoObject( { tween: this.tween } );

          var x = event.target.result;
          var img = D.h( 'video', {
            autoplay: false,
            controls: false,
            src: URL.createObjectURL(item),
            onloadeddata: () => obj.setVideo( img ) } );
          img.load();
        }else {
          var blob = item.getAsFile();
          var reader = new FileReader();
          var obj = new ImageObject( { tween: this.tween } );
          g.addObject( obj )
          g.world.addChild( obj )

          reader.onload = function( event ) {

            var img = D.h( 'img', { src: x, onload: () => obj.setImage( img ) } );
          };
          reader.readAsDataURL(blob);
        }
        g.addObject( obj )
        g.world.addChild( obj )

      }
    }
  }
}
Loopy.prototype = {
  updateEditableGroup: function(){
    this.editableGroup.shouldUpdate = true
  },
  updateValues: function(){
    this.properties.updateValues();
  },
  updateCanvas: function(){
    this.game && this.game.gameLoop();
  },
  modes: {},
  toJSON: function(){
    JSON.stringify(
      lv.block.children.map(line=>({
        k:[line.position.x.toFixed(3)-0, line.position.y.toFixed(3)-0], r: line.rotation, sx: line.scale.x.toFixed(3)-0, sy: line.scale.y.toFixed(3)-0, w: line.width, h: line.height, align: line.align, lineHeight: line.lineHeight, text: line.text,
        children: line.children.map(c=>{
          var anim = lv.tween.items[c.__tweenID];
          var anima = [];
          Object.keys(anim.framesInfo).forEach(k=>{
            anima.push({k: k, f: anim.framesInfo[k].map(frame=>({f: frame.frame, v: frame.props[k].toFixed(3)-0, e: frame.easing.name }))})
          })
          return ({k:[c.position.x.toFixed(3)-0,c.position.y.toFixed(3)-0], w: c.width, h: c.height, sx: c.scale.x.toFixed(3)-0, sy: c.scale.y.toFixed(3)-0, r: c.rotation, char: c.char, a: anima})
        })
      })))
  },
  getLine: function(n){
      return this.lines[n];
  },
  recalculateLinesPositions: Store.debounce(function(){
    var pos, topPos = 0, bottomPos;
    this.lines.forEach((line, n)=>{
      var bottomPos = topPos + line.lineHeight
      line.position.y = (topPos+bottomPos)/2 - this.block.height/2
      topPos = bottomPos
     /* if(n === 0){
        pos = this.block.position.y - this.block.height/2-line.lineHeight/2
      }else{
      }
      pos += line.lineHeight/2
      line.position.y = pos + line.lineHeight/2;
      if(n===0) {
        pos += line.lineHeight / 2
      }else{
        pos += line.lineHeight / 2
      }*/

    });
  }, 1)
}