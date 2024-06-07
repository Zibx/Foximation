var KeyFrame = function(frame, props){
  this.keyID = Math.random().toString(36).substr(2);
  this.frame = frame;
  this.props = props || {};
  this.easing = Tween.randomEasing();
};
KeyFrame.prototype = {
  set: function(props){
    this.props = props;
  }
};
Tween.KeyFrame = KeyFrame;