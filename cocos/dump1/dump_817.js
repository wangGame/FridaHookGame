function() {
var t = new Date();
return new Date(t.setHours(0, 0, 0, 0)).getTime() + 864e5;
};
e.prototype.re