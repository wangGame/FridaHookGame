function(t) {
return this instanceof __await ? (this.v = t, this) : new __await(t);
};
window.__asyncGenerator = function(t, e, i) {
if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
var n, r = i.apply(t, e || []), s = [];
return n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
return this;
}, n;
function o(t) {
r[t] && (n