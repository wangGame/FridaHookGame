function(t, e) {
t && (t.active = e);
};
e.prototype.showMask = function(t, e) {
t && (t.active = e);
};
e.prototype.onDestroy = function() {
var e, o;
if (this.scrollView) {
null === (e = this.scrollView.node) || void 0 === e || e.off("scrolling", this.onScrolling, this);
null === (o = this.scrollView.node) || void 0 === o || o.off("scroll-ended", this.onScrollEnded, this);
}
t.prototype.onDestroy.call(this);
};
a([ f(cc.ScrollView) ], e.prototype, "scrollView", void 0);
a([ f(cc.Node) ], e.prototype, "leftBlueArrow", void 0);
a([ f(cc.Node) ], e.prototype, "leftWhiteArrow", void 0);
a([ f(cc.Node) ], e.prototype, "rightBlueArrow", void 0);
a([ f(cc.Node) ], e.prototype, "rightWhiteArrow", void 0);
a([ f(cc.Node) ], e.prototype, "leftMask", void 0);
a([ f(cc.Node) ], e.prototype, "rightMask", void 0);
return a([ d ], e);
}(l.HomePageSectionGameListDefault);
o.HomePageSectionGameListType12 = h;
cc._RF.pop();
}, {
"../../../../../../../../../../scripts/base/loader/ResLoader": void 0,
"../../../../../../../../../../scripts/modules/homePage/components/sections/HomePageSectionGameListDefault": void 0,
"../../../../../../../../../../scripts/modules/homePage/vo/HomePageMiniGameInfo": void 0
} ],
HomePageSectionGameListType13: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "8ea4a9dN6pG/Yr9Q7u47k4p", "HomePageSectionGameListType13");
var r, i = this && this.__extends || (r = function(t, e) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
r(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), a = this && this.__decorate || function(t, e, o, r) {
var i, a = arguments.length, n = a < 3 ? e : null === r ? r = Object.getOwnPropertyDescriptor(e, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) n = Reflect.decorate(t, e, o, r); else for (var s = t.length - 1; s >= 0; s--) (i = t[s]) && (n = (a < 3 ? i(n) : a > 3 ? i(e, o, n) : i(e, o)) || n);
return a > 3 && n 