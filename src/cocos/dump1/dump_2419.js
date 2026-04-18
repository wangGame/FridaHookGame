function() {
var t = this.atomWorld;
return function(e, n) {
if (e > n) return e;
var o = 16807 * (Math.abs(t.randomSeed) % 2147483646 || 1) % 2147483647;
return t.randomSeed = o, e + (o - 1) / 2147483646 * (n - e);
};
}, r([ Ie("G_FAtom_MathRandom") ], e);
}(dr), Yi = function(t) {
function e() {
return null !== t && t.apply(this, arguments) || this;
}
return n(e, t), e.prototype.defineFunction = function() {
var t = this;
return function(e, n) {
return Math.floor(t.random(e, n + 1));
};
}, r([