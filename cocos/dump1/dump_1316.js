function i(t) {
var r, f, i, h, o, s, u = t.length, a = [ 1732584193, -271733879, -1732584194, 271733878 ];
for (r = 64; r <= u; r += 64) e(a, n(t.substring(r - 64, r)));
f = (t = t.substring(r - 64)).length;
i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
for (r = 0; r < f; r += 1) i[r >> 2] |= t.charCodeAt(r) << (r % 4 << 3);
i[r >> 2] |= 128 << (r % 4 << 3);
if (r > 55) {
e(a, i);
for (r = 0; r < 16; r += 1) i[r] = 0;
}
h = (h = 8 * u).toString(16).match(/(.*?)(.{0,8})$/);
o = parseInt(h[2], 16);
s = parseInt(h[1], 16) || 0;
i[14] = o;
i[15] = s;
e(a, i);
return a;
}
function h(t) {
var r, n, i, h, o, s, u = t.length, a = [ 1732584193, -271733879, -1732584194, 271733878 ];
for (r = 64; r <= u; r += 64) e(a, f(t.subarray(r - 64, r)));
n = (t = r - 64 < u ? t.subarray(r - 64) : new Uint8Array(0)).length;
i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
for (r = 0; r < n; r += 1) i[r >> 2] |= t[r] << (r % 4 << 3);
i[r >> 2] |= 128 << (r % 4 << 3);
if (r > 55) {
e(a, i);
for (r = 0; r < 16; r += 1) i[r] = 0;
}
h = (h = 8 * u).toString(16).match(/(.*?)(.{0,8})$/);
o = parseInt(h[2], 16);
s = parseInt(h[1], 16) || 0;
i[14] = o;
i[15] = s;
e(a, i);
return a;
}
function o(t) {
var e, n = "";
for (e = 0; e < 4; e += 1) n += r[t >> 8 * e + 4 & 15] + r[t >> 8 * e & 15];
return n;
}
function s(t) {
var r;
for (r = 0; r < t.length; r += 1) t[r] = o(t[r]);
return t.join("");
}
s(i("hello"));
"undefined" == typeof ArrayBuffer || ArrayBuffer.prototype.slice || function() {
function r(t, r) {
return (t = 0 | t || 0) < 0 ? Math.max(t + r, 0) : Math.min(t, r);
}
ArrayBuffer.prototype.slice = function(e, n) {
var f, i, h, o, s = this.byteLength, u = r(e, s), a = s;
n !== t && (a = r(n, s));
if (u > a) return new ArrayBuffer(0);
f = a - u;
i = new ArrayBuffer(f);
h = new Uint8Array(i);
o = new Uint8Array(this, u, f);
h.set(o);
return i;
};
}();
function u(t) {
/[\u0080-\uFFFF]/.test(t) && (t = unescape(encodeURIComponent(t)));
return t;
}
function a(t, r) {
var e, n = t.length, f = new ArrayBuffer(n), i = new Uint8Array(f);
for (e = 0; e < n; e += 1) i[e] = t.charCodeAt(e);
return r ? i : f;
}
function p(t, r, e) {
var n = new Uint8Array(t.byteLength + r.byteLength);
n.set(new Uint8Array(t));
n.set(new Uint8Array(r), t.byteLength);
return e ? n : n.buffer;
}
function y(t) {
var r, e = [], n = t.length;
for (r = 0; r < n - 1; r += 2) e.push(parseInt(t.substr(r, 2), 16));
return String.fromCharCode.apply(String, e);
}
function c() {
this.reset();
}
c.prototype.append = function(t) {
this.appendBinary(u(t));
return this;
};
c.prototype.appendBinary = function(t) {
this._buff += t;
this._length += t.length;
var r, f = this._buff.length;
for (r = 64; r <= f; r += 64) e(this._hash, n(this._buff.substring(r - 64, r)));
this._buff = this._buff.substring(r - 64);
return this;
};
c.prototype.end = function(t) {
var r, e, n = this._buff, f = n.length, i = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
for (r = 0; r < f; r += 1) i[r >> 2] |= n.charCodeAt(r) << (r % 4 << 3);
this._finish(i, f);
e = s(this._hash);
t && (e = y(e));
this.reset();
return e;
};
c.prototype.reset = function() {
this._buff = "";
this._length = 0;
this._hash = [ 1732584193, -271733879, -1732584194, 271733878 ];
return this;
};
c.prototype.getState = function() {
return {
buff: this._buff,
length: this._length,
hash: this._hash.slice()
};
};
c.prototype.setState = function(t) {
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