function(t) {
this._buff = t.buff;
this._length = t.length;
this._hash = t.hash;
return this;
};
c.prototype.destroy = function() {
delete this._hash;
delete this._buff;
delete this._length;
};
c.prototype._finish = function(t, r) {
var n, f, i, h = r;
t[h >> 2] |= 128 << (h % 4 << 3);
if (h > 55) {
e(this._hash, t);
for (h = 0; h < 16; h += 1) t[h] = 0;
}
n = (n = 8 * this._length).toString(16).match(/(.*?)(.{0,8})$/);
f = parseInt(n[2], 16);
i = parseInt(n[1], 16) || 0;
t[14] = f;
t[15] = i;
e(this._hash, t);
};
c.hash = function(t, r) {
return c.hashBinary(u(t), r);
};
c.hashBinary = function(t, r) {
var e = s(i(t));
return r ? y(e) : e;
};
c.ArrayBuffer = function() {
this.reset();
};
c.ArrayBuffer.prototype.append = function(t) {
var r, n = p(this._buff.buffer, t, !0), i = n.length;
this._length += t.byteLength;
for (r = 64; r <= i; r += 64) e(this._hash, f(n.subarray(r - 64, r)));
this._buff = r - 64 < i ? new Uint8Array(n.buffer.slice(r - 64)) : new Uint8Array(0);
return this;
};
c.ArrayBuffer.prototype.end = function(t) {
var r, e, n = this._buff, f = n.length, i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
for (r = 0; r < f; r += 1) i[r >> 2] |= n[r] << (r % 4 << 3);
this._finish(i, f);
e = s(this._hash);
t && (e = y(e));
this.reset();
return e;
};
c.ArrayBuffer.prototype.reset = function() {
this._buff = new Uint8Array(0);
this._length = 0;
this._hash = [ 1732584193, -271733879, -1732584194, 271733878 ];
return this;
};
c.ArrayBuffer.prototype.getState = function() {
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