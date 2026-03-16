function() {
switch (this.colorType) {
case 0:
case 3:
case 4:
return 1;

case 2:
case 6:
return 3;
}
}.call(this);
this.hasAlphaChannel = 4 === (d = this.colorType) || 6 === d;
i = this.colors + (this.hasAlphaChannel ? 1 : 0);
this.pixelBitlength = this.bits * i;
this.colorSpace = function() {
switch (this.colors) {
case 1:
return "DeviceGray";

case 3:
return "DeviceRGB";
}
}.call(this);
Uint8Array != Array && (this.imgData = new Uint8Array(this.imgData));
return;

default:
this.pos += e;
}
this.pos += 4;
if (this.pos > this.data.length) throw new Error(n.getError(6017));
}
};
r.prototype = {
constructor: r,
read: function(t) {
var e, i;
i = [];
for (e = 0; 0 <= t ? e < t : e > t; 0 <= t ? ++e : --e) i.push(this.data[this.pos++]);
return i;
},
readUInt32: function() {
return this.data[this.pos++] << 24 | this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++];
},
readUInt16: function() {
return this.data[this.pos++] << 8 | this.data[this.pos++];
},
decodePixels: function(t) {
var e, r, s, o, a, c, l, h, u, _, f, d, p, m, y, v, g, C, A, x, b, S, T;
null == t && (t = this.imgData);
if (0 === t.length) return new Uint8Array(0);
t = new i.Inflate(t, {
index: 0,
verify: !1
}).decompress();
v = (d = this.pixelBitlength / 8) * this.width;
p = new Uint8Array(v * this.height);
c = t.length;
y = 0;
m = 0;
r = 0;
for (;m < c; ) {
switch (t[m++]) {
case 0:
for (o = A = 0; A < v; o = A += 1) p[r++] = t[m++];
break;

case 1:
for (o = x = 0; x < v; o = x += 1) {
e = t[m++];
a = o < d ? 0 : p[r - d];
p[r++] = (e + a) % 256;
}
break;

case 2:
for (o = b = 0; b < v; o = b += 1) {
e = t[m++];
s = (o - o % d) / d;
g = y && p[(y - 1) * v + s * d + o % d];
p[r++] = (g + e) % 256;
}
break;

case 3:
for (o = S = 0; S < v; o = S += 1) {
e = t[m++];
s = (o - o % d) / d;
a = o < d ? 0 : p[r - d];
g = y && p[(y - 1) * v + s * d + o % d];
p[r++] = (e + Math.floor((a + g) / 2)) % 256;
}