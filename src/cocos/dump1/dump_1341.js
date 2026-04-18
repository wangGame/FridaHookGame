function() {
var t, r = c.prototype.getState.call(this);
r.buff = (t = r.buff, String.fromCharCode.apply(null, new Uint8Array(t)));
return r;
};
c.ArrayBuffer.prototype.setState = function(t) {
t.buff = a(t.buff, !0);
return c.prototype.setState.call(this, t);
};
c.ArrayBuffer.prototype.destroy = c.prototype.destroy;
c.ArrayBuffer.prototype._finish = c.prototype._finish;
c.ArrayBuffer.hash = function(t, r) {
var e = s(h(new Uint8Array(t)));
return r ? y(e) : e;
};
return c;
});