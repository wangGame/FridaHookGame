function() {
var t = this;
this.gameListItems = this.gameListItems.sort(function(e, o) {
var r = p.homePageMiniGameInfo.getOpenMiniGameInfo(e.state.config.bundle), i = p.homePageMiniGameInfo.getOpenMiniGameInfo(o.state.config.bundle);
return r.count === i.count ? r.time === i.time ? t.gameListConfig.indexOf(e.state.config) - t.gameListConfig.indexOf(o.state.config) : i.time - r.time : i.count - r.count;
});
this.gameListItems.forEach(function(t, e) {
t.node.setSiblingIndex(e);
});
this.gameListItemContainer.getComponent(cc.Layout).updateLayout();
};
e.prototype.addScrollViewListener = function() {
if (this.scrollView) {
this.scrollView.node.on("scrolling", this.onScrolling, this);
this.scrollView.node.on("scroll-ended", this.onScrollEnded, this);
}
};
e.prototype.onScrolling = function() {
this.updateArrowsState();
};
e.prototype.onScrollEnded = function() {
this.updateArrowsState();
};
e.prototype.updateArrowsState = function() {
if (this.scrollView) {
var t = this.scrollView.content;
if (t) {
var e = this.scrollView.node.width, o = t.width;
if (o <= e) {
this.showArrow(this.leftBlueArrow, !0);
this.showArrow(this.leftWhiteArrow, !1);
this.showArrow(this.rightBlueArrow, !0);
this.showArrow(this.rightWhiteArrow, !1);
this.showMask(this.leftMask, !1);
this.showMask(this.rightMask, !1);
} else {
var r = this.scrollView.getScrollOffset(), i = o - e, a = r.x, n = (Math.abs(r.x), 
a > 1 - i);
if (a < -1) {
this.showArrow(this.leftWhiteArrow, !0);
this.showArrow(this.leftBlueArrow, !1);
this.showMask(this.leftMask, !0);
} else {
this.showArrow(this.leftWhiteArrow, !1);
this.showArrow(this.leftBlueArrow, !0);
this.showMask(this.leftMask, !1);
}
if (n) {
this.showArrow(this.rightWhiteArrow, !0);
this.showArrow(this.rightBlueArrow, !1);
this.showMask(this.rightMask, !0);
} else {
this.showArrow(this.rightWhiteArrow, !1);
this.showArrow(this.rightBlueArrow, !0);
this.showMask(this.rightMask, !1);
}
}
}
}
};
e.prototype.showArrow = function(t, e) {
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