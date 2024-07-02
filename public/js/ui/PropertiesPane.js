PropertiesPane = function( cfg ) {
  Object.assign( this, cfg )
  this.selectedSymbols = [];
  this.selectedLines = [];
  this.charPropsEnabled = new Store.Value.Boolean( false );
  this.linePropsEnabled = new Store.Value.Boolean( false );

  var color = this.symbolsColor = new Store.Value.Number( 0 );
  color.hook( ( val ) => {
    this.selectedSymbols.forEach( symbol => symbol.color = '#' + rgbToHex( numberToRgb( val ) ) );
    this.main.updateCanvas();
  } );

  this.lineHeight = new Store.Value.Number( 0 );
  this.lineHeight.hook( val =>
    this.selectedLines.forEach( line => line.lineHeight = val )
  )

  var allColors = this.allColors = D.div( { cls: 'color-input__colors' } )

  this.dom = D.div( { cls: 'letterwork-properties' },
    Store.IF( { condition: Store.NOT( this.charPropsEnabled, this.linePropsEnabled ) }, [
      D.div( { cls: 'letterwork-properties__panel' },
        D.div( { cls: 'letterwork-properties__panel--title' }, 'Global' ),
        new ColorInput( { leftLabel: 'Background', bind: this.lw.backgroundColor } )
      )
    ] ),
    /*    Store.IF({condition: this.charPropsEnabled}, [
          D.div({cls: 'letterwork-properties__panel'},
            D.div({cls: 'letterwork-properties__panel--title'}, 'Symbol'),
            new ColorInput({leftLabel: 'Color', bind: color, label: allColors})
          )
        ]),
        Store.IF({condition: this.linePropsEnabled}, [
          D.div({cls: 'letterwork-properties__panel'},
            D.div({cls: 'letterwork-properties__panel--title'}, 'Line'),
            new NumberInput({
              cls: 'number-input--long',
              value: this.lineHeight,
              letter: 'Line height',
              min: 0,
              step: 0.05,
              precision: 12
            }),
          )
        ]),*/
  );
  this.items = [];
  this.panelsCache = {};
  this.propsCache = {};
  this.propsByID = {};
}
var charProps = [];
var PropertyFactory = function( prop, properties ) {
  var editor = {
    tween: properties.main.tween,
    init: function() {

      this.currentValue.hook( this.set.bind( this ), true )
    },
    set: function( val ) {
      if( this.freeze )
        return;
      var set = this.prop.set;
      val = this.setter( val );

      this.properties.items.forEach( item => {
        var obj = {
          [ prop.key ]: val
        };
        this.tween.updateKeyFrame( item, this.tween.getCurrentFrame(), obj );
        //set.call(item, val);
      } );
      this.properties.main.updateCanvas();
      this.properties.main.updateEditableGroup();
    },
    type: prop.type,
    prop: prop,
    properties,
    updateValue: function() {
      this.freeze = true;
      this.currentValue.set( this.getter( prop.get.call( this.properties.items[ 0 ] ) ) );
      this.freeze = false;
    },
    getter: a => a,
    setter: a => a
  };
  var step = 0.05;
  if( prop.ui ) {
    if( prop.ui.step ) {
      step = prop.ui.step;
    }
    if( prop.ui.getter ) {
      editor.getter = prop.ui.getter;
    }
    if( prop.ui.setter ) {
      editor.setter = prop.ui.setter;
    }
  }
  if( prop.type === Number ) {
    editor.currentValue = new Store.Value.Number();
    editor.dom = new NumberInput( {
      cls: 'number-input--long',
      value: editor.currentValue,
      letter: prop.name,
      step: step,
      precision: (prop.ui && prop.ui.precision) || 12
    } );


  } else {
    var color = new Color()

    editor.currentValue = new Store.Value.Number();
    editor.dom = new ColorInput( { leftLabel: prop.name, bind: editor.currentValue } );
    editor.getter = function( val ) {
      color.set( val );
      return color.toNumber();
    };
    editor.setter = function( val ) {
      color.set( val );
      return color.toHTML();
    };
  }
  editor.init();
  return editor;
}
PropertiesPane.prototype = {
  updateValues: function() {
    this.updateSelection( this.items )
  },
  updateSelection: function( items ) {
    this.items = items;

    var resultPanelProps = {};
    var resultPanelPropsLookup = {};
    var resultTypes = {};

    for( var i = 0, _i = items.length; i < _i; i++ ) {
      var item = items[ i ];
      var props = item.props;
      if( !( props._type in resultTypes ) ) {
        resultTypes[ props._type ] = [];
        for( var key in props ) {
          if( key[ 0 ] !== '_' ) {
            var group = props[ key ];

            var propData = resultPanelProps[ key ] || ( resultPanelProps[ key ] = [] );
            var propLookup = resultPanelPropsLookup[ key ] || ( resultPanelPropsLookup[ key ] = {} );
            for( var j = 0, _j = group.length; j < _j; j++ ) {
              var prop = group[ j ];
              if( !( prop.name in propLookup ) ) {
                propData.push( propLookup[ prop.name ] = prop );
                prop.__propID = prop.__propID || Math.random().toString( 36 ).substr( 2 );
                prop.editor = prop.editor || PropertyFactory( prop, this );
                this.propsByID[ prop.__propID ] = prop;
              }
            }
          }
        }
      }
      resultTypes[ props._type ].push( item );
    }

    D.removeChildren( this.dom );
    if( items.length ) {
      for( var key in resultPanelProps ) {
        if( !( key in this.panelsCache ) ) {
          var children = D.div( { cls: 'letterwork-properties__panel-props' } );
          this.panelsCache[ key ] = {
            el: D.div( { cls: 'letterwork-properties__panel' },
              D.div( { cls: 'letterwork-properties__panel--title' }, key ),
              children
            ), children
          };
        } else {
          D.removeChildren( this.panelsCache[ key ].children );
        }
        D.appendChild( this.panelsCache[ key ].children, resultPanelProps[ key ].map( prop => {
          if( prop.hidden )
            return;
          prop.editor.updateValue();// [items[0]] )

          return D.div( { cls: 'letterwork-property' }, prop.editor );
        } ) );
        D.appendChild( this.dom, this.panelsCache[ key ].el );
      }

    }


    this.selectedSymbols = [];

    /*    if(items.length) {
          var colors = items.map(symbol => parseInt(symbol.color.substr(1),16)),
            allColors = Object.keys(colors.reduce((s, c)=>{s[c] = 1; return s}, {}));

          D.removeChildren(this.allColors);
          if(allColors.length>1){
            D.appendChild(this.allColors, allColors.map(c=>{
              return D.div({
                onclick: (e)=>{
                  this.symbolsColor.set(c);
                  D.removeChildren(this.allColors);
                  e.preventDefault();
                  e.stopPropagation();
                },
                cls: 'color-input__color',
                style: {background: '#'+rgbToHex(numberToRgb(c))}
              })
            }))
          }
          this.symbolsColor.set(colors[0]);
          this.selectedSymbols = items;
        }*/
    //console.log(items, resultPanelProps)
    this.charPropsEnabled.set( items.length > 0 );
    /*
        this.selectedLines = [];
        if(lines.length){
          this.lineHeight.set(lines[0].lineHeight);
        }
        this.linePropsEnabled.set(lines.length>0);
        this.selectedLines = lines;*/
  }
}