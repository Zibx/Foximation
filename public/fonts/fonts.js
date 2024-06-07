var Font = {
  loaded: {},
  get: async function(font){
    if(this.loaded[font.file])
      return this.loaded[font.file];

    return new Promise((resolve, reject)=>{
      opentype.load('/fonts/'+font.file, (err, font) => {
        if(err){
          return reject(err);
        }
        resolve(this.loaded[font.file] = font);
      });
    });
  },
  fontsList: [
    {file: 'ProtestGuerrilla-Regular.ttf'}
  ]
};

