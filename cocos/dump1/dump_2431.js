function() {
return this._scrollY;
};
r.setLocation = function(t, e) {
this._x = t;
this._y = e;
};
r.getLocation = function() {
return cc.v2(this._x, this._y);
};
r.getLocationInView = function() {
return cc.v2(this._x, cc.view._designResolutionSize.height - this._y);
};
r._setPrevCu