function() {
return this.touch ? this.touch.getDelta() : cc.v2();
};
r.getDeltaX = function() {
return this.touch ? this.touch.getDelta().x : 0;
};
r.getDeltaY = function() {
return this.touch ? this.touch.getDelta().y : 0;
};
r.getLocationX = function() {
return this.touch ? this.t