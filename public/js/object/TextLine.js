class TextLineSelection extends GameObject {
  constructor( cfg ) {
    super( cfg );
  }
  draw(ctx){
    if(this.parent.selection.from !== -1){
      ctx.fillStyle = '#9DC1C2';
      ctx.fillRect(
        -this.width/2,
        -this.height/2,
        this.width,
        this.height
      );
    }
  }
  physic(){
    var parent = this.parent;
    if(parent.selection.from !== -1){
      var from = Math.min(parent.selection.from, parent.selection.to),
        to = Math.max(parent.selection.from, parent.selection.to),
        fromGlyph = parent.symbols[from],
        toGlyph = parent.symbols[to];

      var topLeft = new Point(
        fromGlyph.position.x-Math.abs(fromGlyph.scale.x*fromGlyph.width/2),
        fromGlyph.position.y-Math.abs(fromGlyph.scale.y*fromGlyph.height/2)
      );
      var bottomRight = new Point(
        toGlyph.position.x+Math.abs(toGlyph.scale.x*toGlyph.width/2),
        toGlyph.position.y+Math.abs(toGlyph.scale.y*toGlyph.height/2)
      );
      this.position = topLeft.lerp(bottomRight, 0.5)
      this.width = bottomRight.x-topLeft.x;
      this.height = bottomRight.y-topLeft.y;
    }else{
      this.width = 0;
    }

  }
}
class TextLine extends GameObject {
  collider(p){
    return p.y >= -this.height/2 && p.y <= this.height /2;

  }
  constructor( cfg ) {
    super( cfg );
    this.manualClear = true;
    this.recalculateCharsPositions = Store.debounce(this.recalculateCharsPositions, 1);
    this.lineHeight = this.lineHeight || 1.4;
    this.initLetters();
    this.selection = {from: 1, to: this.symbols.length-2}
    this.selection = {from: -1, to: -1}
    this.selectionEl = new TextLineSelection({p: this});
    this.addChild(this.selectionEl, 'back');

    this.relativeInit();
  }
  get lineHeight() {
    return this._lineHeight;
  }
  set lineHeight(val){
    this._lineHeight = val;
    this.lw.recalculateLinesPositions();
    return val;
  }

  get align() {
    return this._align;
  }
  set align(val){
    this._align = val;
    this.recalculateCharsPositions();
    return val;
  }
  get char() {
    return this._char;
  }
  set char(val){
    this._char = val;
    this.recalculateCharsPositions();
    return val;
  }

  initLetters(){
    var ctx = this.ctx,
      size = 0;
    var font = ctx.font = this.font;
    var text = Array.from( this.text );
    this.symbols = [];
    var tween = this.lw.tween;

    var scale = 1 / font.unitsPerEm * 1;
    for( var i = 0; i < text.length; i++ ) {
      var char = text[ i ];
      var measurements = ctx.measureText( char );
      var charWidth = this.font.getAdvanceWidth(char,1);
      //debugger
      //var charWidth = measurements.width;
      var symbol =  new Glyph( {
        font: this.font,
        tween: tween,
        debugLetters: this.debugLetters,
        scale: new Point(1, 1),
        charWidth: charWidth,
        _charHeight: font.ascender*scale,
        charHeight: (font.ascender-font.descender)*scale,
        descending: -font.descender*scale,
        width: charWidth,
//          width: 1,//i==4?4:2,
        height: font.ascender*scale,
        color: this.color,
        position: new Point( size + charWidth /2, 0 ),
        char: char,
        n: i,
        animationType: [ 'rotation', 'skewX', 'skewY' ][ ( i+i*i ) % 3 ],
/*        physic: function(dt, t){
          var properties = tween.getProperties(this, tween.getCurrentFrame())
          Object.assign(this, properties);
        },*/
      } );

      if(Math.random()<0.1){
        tween.addKeyFrame(symbol, 10, {
          _positionX: 0,
        });
        tween.addKeyFrame(symbol, 70, {
          _positionX: -1,
        });
        tween.addKeyFrame(symbol, 140, {
          _positionX: -0,
        });

        tween.addKeyFrame(symbol, 10, {
          _positionY: 0,
        });
        tween.addKeyFrame(symbol, 70, {
          _positionY: -3,
        });
        tween.addKeyFrame(symbol, 140, {
          _positionY: -0,
        });

      }

      tween.addKeyFrame(symbol, 1, {
        rotation: 0,
        skewX: 0,
        skewY: 0
      });

      tween.addKeyFrame(symbol, 120, {
        rotation: 0,
        skewX: 0,
        skewY: 0
      });

      var effect = 0.5

      if(Math.random()<0.05)
        tween.addKeyFrame(symbol, 120, {
          rotation: 360
        });

      var horizontal = Math.random()<0.5;

      if(horizontal)
        tween.addKeyFrame(symbol, (Math.random()*60+10)|0, {
          rotation: 0,
          skewX: (Math.random()*2-1)*effect
        });
      else
        for(var k = 3; k >-1; k--)
        tween.addKeyFrame(symbol, (Math.random()*110+5)|0, {
          skewY: (Math.random()*2-1)*effect
        });
      //tween.addKeyFrame(symbol, 40, {rotation: 360});
/*      tween.addKeyFrame(symbol, 60, {
        //rotation: 270,
        skewX: Math.random()
      });*/

      //tween.addKeyFrame(symbol, 80, {rotation: 300});
      //tween.addKeyFrame(symbol, 100, {rotation: 360});
      // console.log( text[ i ], ctx.measureText( char ) );
      this.symbols.push(symbol);

      this.addChild( symbol );
      g.addObject( symbol );
      size += symbol.charWidth*symbol.scale.x;
    }
    this.contentWidth = size;

    if(this.align === 'left'){
      this.symbols.forEach(s=>s.position.x -= this.width/2)
    }else if(this.align === 'right'){
      this.symbols.forEach(s=>s.position.x -= size-this.width/2)
    }else if(this.align === 'center'){
      this.symbols.forEach(s=>s.position.x -= size/2)
    }
  }
  draw(ctx){
    ctx.font = this.font;

    this.lw.recalculateLinesPositions.now();
    this.recalculateCharsPositions.now();
    if(this.borderColor) {
      ctx.strokeStyle = this.borderColor;
      ctx.strokeRect( -this.width / 2, -this.height / 2, this.width, this.height );
    }
  }

  physic( dt ) {
    //this[ this.animationType ] = Math.sin( +new Date() / 500 + this.n ) / 5;

  }
}
TextLine.prototype.props = {
  Line: [
    {name: 'Line height', type: Number}
  ]
}
TextLine.prototype.recalculateCharsPositions = function(){
  if(!this.symbols)
    return;
  console.log(this.align, this.lw.lines.indexOf(this))
  var size = 0;
  var letterSpacing = this.letterSpacing;
  for( var i = 0, _i = this.symbols.length; i < _i; i++ ) {
    var symbol = this.symbols[ i ];
    symbol.position.x = size + Math.abs(symbol.charWidth*symbol.scale.x/2);
    size += Math.abs(symbol.charWidth*symbol.scale.x) +(i<_i-1 ? symbol.marginRight : 0);
  }

  if(this.align === 'left'){
    this.symbols.forEach(s=>s.position.x -= this.width/2)
  }else if(this.align === 'right'){
    this.symbols.forEach(s=>s.position.x -= size-this.width/2)
  }else if(this.align === 'center'){
    this.symbols.forEach(s=>s.position.x -= size/2)
  }
}