var Observable = function() {
    this._listeners = {};
};
Observable.prototype = {
    on: function(k, v) {
        (this._listeners[k] || (this._listeners[k] = [])).push(v);
        var _self = this;
        return function ReleaseObservable() {
            _self.un(k, v);
        };
    },
    un: function(k, v) {
        var list = this._listeners[k];
        if(list){
            var id = list.indexOf(v);
            if(id > -1){
                list.splice(id, 1);
            }
        }
    },
    fire: function(k) {
        var listeners = this._listeners[k];
        if(listeners === void 0)
            return;

        for( var i = 0, _i = listeners.length; i < _i; i++ ){
            const listener = listeners[ i ];
            listener.apply(this, [].slice.call(arguments, 1));
        }
    }
};
