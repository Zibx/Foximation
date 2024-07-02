LoopyProps = function(cfg){
  Object.assign(this, cfg)
  this.selectedSymbols = [];
  this.selectedLines = [];
  this.charPropsEnabled = new Store.Value.Boolean(false);
  this.linePropsEnabled = new Store.Value.Boolean(false);

  var color = this.symbolsColor = new Store.Value.Number(0);
  color.hook((val)=>{
      this.selectedSymbols.forEach(symbol => symbol.color = '#'+rgbToHex(numberToRgb(val)));
      this.main.updateCanvas();
  });

  this.lineHeight = new Store.Value.Number(0);
  this.lineHeight.hook(val=>
    this.selectedLines.forEach(line => line.lineHeight = val)
  )

  var allColors = this.allColors = D.div({cls: 'color-input__colors'})

  this.dom = D.div({cls: 'letterwork-properties'},
    Store.IF({condition: Store.NOT(this.charPropsEnabled, this.linePropsEnabled)}, [
      D.div({cls: 'letterwork-properties__panel'},
        D.div({cls: 'letterwork-properties__panel--title'}, 'Global'),
        new ColorInput({leftLabel: 'Background', bind: this.lw.backgroundColor})
      )
    ]),
    Store.IF({condition: this.charPropsEnabled}, [
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
    ])
  )
}
var charProps = [

];
LoopyProps.prototype = {
  updateSelection: function(symbols, lines){
    this.selectedSymbols = [];
    if(symbols.length) {
      var colors = symbols.map(symbol => parseInt(symbol.color.substr(1),16)),
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
      this.selectedSymbols = symbols;
    }
    console.log(symbols)
    this.charPropsEnabled.set(symbols.length>0);

    this.selectedLines = [];
    if(lines.length){
      this.lineHeight.set(lines[0].lineHeight);
    }
    this.linePropsEnabled.set(lines.length>0);
    this.selectedLines = lines;
  }
}