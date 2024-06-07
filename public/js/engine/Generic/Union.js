window.Union = (function() {

  var Union = {
    intersect: function( a, b, key ){
      var hash = {},
        out = a.slice(),
        i, _i;
      for( i = 0, _i = a.length; i < _i; i++ ){
        hash[ a[ i ][key] ] = true;
      }
      for( i = 0, _i = b.length; i < _i; i++ ){
        if( !(b[ i ][key] in hash) )
          out.push( b[ i ] );
      }
      return out;
    },
    xor: function( a, b, key ){
      var hash = {},
        i, _i;
      for( i = 0, _i = a.length; i < _i; i++ ){
        hash[ a[ i ][key] ] = a[ i ];
      }
      for( i = 0, _i = b.length; i < _i; i++ ){
        if( !(b[ i ][key] in hash) ){
          hash[ b[ i ][key] ] = b[ i ];
        }else{
          delete hash[ b[ i ][key] ];
        }
      }
      return Object.values(hash);
    }

  }

  return Union;
})();