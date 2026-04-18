function(t) {
cc.ActionInterval.prototype.startWithTarget.call(this, t);
this._deltaT = 1 / (this._points.length - 1);
this._