function Transform() {
    this.reset();
    this.savePointer = -1;
}

Transform.prototype.reset = function() {
    this.m = new Float32Array(6);
    this.m[0] = 1;
    this.m[3] = 1;

    this.saves = new Float32Array(6*30);
};
Transform.prototype.copyTo = function(to){
  to[0] = this.m[0];
  to[1] = this.m[1];
  to[2] = this.m[2];
  to[3] = this.m[3];
  to[4] = this.m[4];
  to[5] = this.m[5];
}
Transform.prototype.save = function(){
    this.savePointer++;
    var start = this.savePointer*6;
    this.saves[start] = this.m[0];
    this.saves[start+1] = this.m[1];
    this.saves[start+2] = this.m[2];
    this.saves[start+3] = this.m[3];
    this.saves[start+4] = this.m[4];
    this.saves[start+5] = this.m[5];

};
Transform.prototype.restore = function() {
    var start = this.savePointer * 6;
    this.m[0] = this.saves[start];
    this.m[1] = this.saves[start + 1];
    this.m[2] = this.saves[start + 2];
    this.m[3] = this.saves[start + 3];
    this.m[4] = this.saves[start + 4];
    this.m[5] = this.saves[start + 5];
    this.savePointer--;
};
Transform.prototype.multiply = function(matrix) {
    var m = this.m;
    var m11 = m[0] * matrix.m[0] + m[2] * matrix.m[1];
    var m12 = m[1] * matrix.m[0] + m[3] * matrix.m[1];

    var m21 = m[0] * matrix.m[2] + m[2] * matrix.m[3];
    var m22 = m[1] * matrix.m[2] + m[3] * matrix.m[3];

    var dx = m[0] * matrix.m[4] + m[2] * matrix.m[5] + m[4];
    var dy = m[1] * matrix.m[4] + m[3] * matrix.m[5] + m[5];

    m[0] = m11;
    m[1] = m12;
    m[2] = m21;
    m[3] = m22;
    m[4] = dx;
    m[5] = dy;
};

Transform.prototype.invert = function() {
    var m = this.m;
    var d = 1 / (m[0] * m[3] - m[1] * m[2]);
    var m0 = m[3] * d;
    var m1 = -m[1] * d;
    var m2 = -m[2] * d;
    var m3 = m[0] * d;
    var m4 = d * (m[2] * m[5] - m[3] * m[4]);
    var m5 = d * (m[1] * m[4] - m[0] * m[5]);
    m[0] = m0;
    m[1] = m1;
    m[2] = m2;
    m[3] = m3;
    m[4] = m4;
    m[5] = m5;
};

Transform.prototype.rotate = function(rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    var m11 = this.m[0] * c + this.m[2] * s;
    var m12 = this.m[1] * c + this.m[3] * s;
    var m21 = this.m[0] * -s + this.m[2] * c;
    var m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
};

Transform.prototype.translate = function(x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
};
// translate, rotate, scale
(function(){
  var sin = Math.sin, cos = Math.cos, tan = Math.tan;
  var m, c, s,m11, m12, m21, m22;
  Transform.prototype.trs = function(pos, rad, sx, sy, skewX, skewY) {
      m = this.m;
      m[4] += m[0] * pos.x + m[2] * pos.y;
      m[5] += m[1] * pos.x + m[3] * pos.y;

      c = cos(rad);
      s = sin(rad);
      m11 = m[0] * c + m[2] * s;
      m12 = m[1] * c + m[3] * s;
      m21 = m[0] * -s + m[2] * c;
      m22 = m[1] * -s + m[3] * c;
      m[0] = m11*sx;
      m[1] = m12*sx+tan(skewY)*m22*sy;
      m[2] = m21*sy+tan(skewX)*m11*sx;
      m[3] = m22*sy;
  };

  var sX, sY, sR, sSX, sSY;
  Transform.prototype._trs = function(
    pos, rad, sx, sy, skewX, skewY,
    _pos, _rad, _sx, _sy, _skewX, _skewY,
  ) {
    m = this.m;
    sX = pos.x+_pos.x;
    sY = pos.y+_pos.y;
    sR = rad + _rad;
    m[4] += m[0] * sX + m[2] * sY;
    m[5] += m[1] * sX + m[3] * sY;

    c = cos(sR);
    s = sin(sR);
    sSX = sx*_sx;
    sSY = sx*_sy;
    m11 = m[0] * c + m[2] * s;
    m12 = m[1] * c + m[3] * s;
    m21 = m[0] * -s + m[2] * c;
    m22 = m[1] * -s + m[3] * c;
    m[0] = m11*sSX;
    m[1] = m12*sSX+tan(skewY+_skewY)*m22*sSY;
    m[2] = m21*sSY+tan(skewX+skewX)*m11*sSX;
    m[3] = m22*sSY;
  };

})();
Transform.prototype.scale = function(sx, sy) {
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
};

Transform.prototype.transformPoint = function(px, py) {
    var x = px;
    var y = py;
    px = x * this.m[0] + y * this.m[2] + this.m[4];
    py = x * this.m[1] + y * this.m[3] + this.m[5];
    return [px, py];
};