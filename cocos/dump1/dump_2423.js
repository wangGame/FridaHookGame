function(i) {
i = this._computeEaseTime(i);
var n, r, s = this._points;
if (1 === i) {
n = s.length - 1;
r = 1;
} else {
var o = this._deltaT;
r = (i - o * (n =