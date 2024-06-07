window.TextInput = D.declare('view.cmp.field.TextInput', (cfg)=> {

  var input = D.h('input', {cls:"text--input", type:"text", "aria-label":"Change value"});
  if(cfg.bind){
    cfg.bind.hook(val => {
      input.value = val || '';
    });
  };

  var change = Store.debounce(function(e){
    var val = input.value;
    cfg.bind.set(val)
  },5);

  'input,change,click,mouseup'.split(',')
    .map(a=>a.trim())
    .forEach(evt => input.addEventListener(evt, change));

  return D.h('label', {cls: "text-input", title: "Change text"},
    (cfg.label ?
      D.h('span', {cls: "text-input--title"}, cfg.label)
      : null),
    input

  );
});

window.ColorInput = D.declare('view.cmp.field.ColorInput', (cfg)=> {

  var input = D.h('input', {cls:"color--input", type:"color", "aria-label":"Change color"});
  if(cfg.bind){
    cfg.bind.hook(color => {
      var val = '#'+ [(( color & 0xff0000 ) >> 16 ),
        ( color & 0x00ff00 )>>8,
        ( ( color & 0x0000ff )  )].map(a=>('0'+a.toString(16)).substr(-2)).join('');
      input.value = val

    });
  };

  var change = Store.debounce(function(e){
    var val = parseInt(input.value.substr(1),16)
    cfg.bind.set(val)
  },5);

  'input, change,click, mouseup'.split(',')
    .map(a=>a.trim())
    .forEach(evt => input.addEventListener(evt, change));

  return D.h('label', {cls: "color-input", title: "Change color"},
    (cfg.leftLabel ?
      D.h('span', {cls: "color-input--title__left"}, cfg.leftLabel)
      : null),
    input,
    (cfg.label ?
      D.h('span', {cls: "color-input--title"}, cfg.label)
      : null)
  );

});
