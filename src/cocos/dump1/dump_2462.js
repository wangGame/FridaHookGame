function(t, e) {
("undefined" == typeof e || e > this.length) && (e = this.length);
e -= t.length;
var i = this.indexOf(t, e);
return -1 !== i && i === e;
});
String.prototype.trimLeft || (String.prototype.trimLeft = function() {
return this.replace(/^\s+/, "");
});
}), {} ],
336: [ (function() {
"use strict";
var t = Object.setPrototypeOf || {
__prot