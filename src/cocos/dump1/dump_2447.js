function() {
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