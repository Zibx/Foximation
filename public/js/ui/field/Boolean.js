

window.BooleanInput = D.declare('view.cmp.field.BooleanInput', (cfg)=> {

  var input = D.h('input', {cls:"switch__input js-switch-action", type:"checkbox", "aria-label":"Enable the trigger"});
  if(cfg.bind){
    cfg.bind.hook(val => input.checked = val);
  };

  var change = Store.debounce(function(e){
    cfg.bind.set(input.checked)
  },5);

  'input, change,click, mouseup'.split(',')
    .map(a=>a.trim())
    .forEach(evt => input.addEventListener(evt, change));

  return D.h('label', {cls: "switch", title: "Enable the trigger"},
    cfg.false,
    (cfg.leftLabel ?
      D.h('span', {cls: "switch__switch--title switch__switch--left-title"}, cfg.leftLabel)
      : null),
    input,
    D.h('span', {cls: "switch__switch"}),
    (cfg.label ?
      D.h('span', {cls: "switch__switch--title"}, cfg.label)
      : null)

  );

});
