function() {
return this.touch ? this.touch.getLocationY() : 0;
};
s.MAX_TOUCHES = 5;
s.BEGAN = 0;
s.MOVED = 1;
s.ENDED = 2;
s.CANCELED = 3;
var o = function(t, e) {
cc.Event.call(this, cc.Event.ACCELERATION, e);
this.a