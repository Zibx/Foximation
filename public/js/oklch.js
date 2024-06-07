var multiplyMatrices = (A, B) => {
  return [
    A[0]*B[0] + A[1]*B[1] + A[2]*B[2],
    A[3]*B[0] + A[4]*B[1] + A[5]*B[2],
    A[6]*B[0] + A[7]*B[1] + A[8]*B[2]
  ];
}

var oklch2oklab = ([l, c, h]) => [
  l,
  isNaN(h) ? 0 : c * Math.cos(h * Math.PI / 180),
  isNaN(h) ? 0 : c * Math.sin(h * Math.PI / 180)
]
var oklab2oklch = ([l, a, b]) => [
  l,
  Math.sqrt(a ** 2 + b ** 2),
  Math.abs(a) < 0.0002 && Math.abs(b) < 0.0002 ? NaN : (((Math.atan2(b, a) * 180) / Math.PI % 360) + 360) % 360
];

var rgb2srgbLinear = rgb => rgb.map(c =>
  Math.abs(c) <= 0.04045 ?
    c / 12.92 :
    (c < 0 ? -1 : 1) * (((Math.abs(c) + 0.055) / 1.055) ** 2.4)
)
var srgbLinear2rgb = rgb => rgb.map(c =>
  Math.abs(c) > 0.0031308 ?
    (c < 0 ? -1 : 1) * (1.055 * (Math.abs(c) ** (1 / 2.4)) - 0.055) :
    12.92 * c
)

var oklab2xyz = lab => {
  var LMSg = multiplyMatrices([
    1,  0.3963377773761749,  0.2158037573099136,
    1, -0.1055613458156586, -0.0638541728258133,
    1, -0.0894841775298119, -1.2914855480194092,
  ], lab)
  var LMS = LMSg.map(val => val ** 3)
  return multiplyMatrices([
    1.2268798758459243, -0.5578149944602171,  0.2813910456659647,
    -0.0405757452148008,  1.1122868032803170, -0.0717110580655164,
    -0.0763729366746601, -0.4214933324022432,  1.5869240198367816
  ], LMS)
}
var xyz2oklab = xyz => {
  var LMS = multiplyMatrices([
    0.8190224379967030, 0.3619062600528904, -0.1288737815209879,
    0.0329836539323885, 0.9292868615863434,  0.0361446663506424,
    0.0481771893596242, 0.2642395317527308,  0.6335478284694309
  ], xyz);
  var LMSg = LMS.map(val => Math.cbrt(val));
  return multiplyMatrices([
    0.2104542683093140,  0.7936177747023054, -0.0040720430116193,
    1.9779985324311684, -2.4285922420485799,  0.4505937096174110,
    0.0259040424655478,  0.7827717124575296, -0.8086757549230774
  ], LMSg);
}
var xyz2rgbLinear = xyz => {
  return multiplyMatrices([
    3.2409699419045226,  -1.537383177570094,   -0.4986107602930034,
    -0.9692436362808796,   1.8759675015077202,   0.04155505740717559,
    0.05563007969699366, -0.20397695888897652,  1.0569715142428786
  ], xyz)
}
var rgbLinear2xyz = rgb => {
  return multiplyMatrices([
    0.41239079926595934, 0.357584339383878,   0.1804807884018343,
    0.21263900587151027, 0.715168678767756,   0.07219231536073371,
    0.01933081871559182, 0.11919477979462598, 0.9505321522496607
  ], rgb)
}

var oklch2rgb = lch =>
  srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(oklch2oklab(lch))))
var rgb2oklch = rgb =>
  oklab2oklch(xyz2oklab(rgbLinear2xyz(rgb2srgbLinear(rgb))))

var sameAsRGB = function(r, g, b, l, c, h){

  var color = sameAsRgbHex(r,g,b,l,c,h);
  return parseInt(color,16)
}
var sameAsRgbHex = function(r, g, b, l, c, h){
  var lch = rgb2oklch([r/256, g/256, b/256])
  l = l || 0;
  c = c || 0;
  h = h || 0;

  lch[0]+=l;
  lch[1]+=c;
  lch[2]+=h;
  lch[2] %= 360;

  var color = oklch2rgb(lch).map(a=>a*256|0)
    .map(a=>Math.min(255,Math.max(a,0)))
    .map(a=>('0'+a.toString(16)).substr(-2))
    .join('')
  return color;
}
var numberToRgb = function(color){
    return [(( color & 0xff0000 ) >> 16 ),
      ( color & 0x00ff00 )>>8,
      ( ( color & 0x0000ff )  )];
}
var rgbToNumber = function(rgb){
  return (rgb[0] << 16 ) + (rgb[1] << 8 ) + rgb[2];
}
var num2Hex = function(val){
  val = Math.min(255, Math.max(0,val|0))
  return ('0'+val.toString(16)).substr(-2)
}
var rgbToHex = function(rgb){
  return num2Hex(rgb[0] ) + num2Hex(rgb[1] ) + num2Hex(rgb[2]);
}
var numberToHex = function(val){
  return rgbToHex(numberToRgb(val));
}
if(typeof module !== 'undefined'){
  module.exports = {
    rgbToNumber, numberToRgb, oklch2rgb, rgb2oklch
  };
}