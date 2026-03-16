function" == typeof Reflect.decorate) n = Reflect.decorate(t, e, o, r); else for (var s = t.length - 1; s >= 0; s--) (i = t[s]) && (n = (a < 3 ? i(n) : a > 3 ? i(e, o, n) : i(e, o)) || n);
return a > 3 && n && Object.defineProperty(e, o, n), n;
}, n = this && this.__awaiter || function(t, e, o, r) {
return new (o || (o = Promise))(function(i, a) {
function n(t) {
try {
c(r.next(t));
} catch (t) {
a(t);
}
}
function s(t) {
try {
c(r.throw(t));
} catch (t) {
a(t);
}
}
function c(t) {
t.done ? i(t.value) : (e = t.value, e instanceof o ? e : new o(function(t) {
t(e);
})).then(n, s);
var e;
}
c((r = r.apply(t, e || [])).next());
});
}, s = this && this.__generator || function(t, e) {
var o, r, i, a, n = {
label: 0,
sent: function() {
if (1 & i[0]) throw i[1];
return i[1];
},
trys: [],
ops: []
};
return a = {
next: s(0),
throw: s(1),
return: s(2)
}, "function" == typeof Symbol && (a[Symbol.iterator] = function() {
return this;
}), a;
function s(t) {
return function(e) {
return c([ t, e ]);
};
}
function c(a) {
if (o) throw new TypeError("Generator is already executing.");
for (;n; ) try {
if (o = 1, r && (i = 2 & a[0] ? r.return : a[0] ? r.throw || ((i = r.return) && i.call(r), 
0) : r.next) && !(i = i.call(r, a[1])).done) return i;
(r = 0, i) && (a = [ 2 & a[0], i.value ]);
switch (a[0]) {
case 0:
case 1:
i = a;
break;

case 4:
n.label++;
return {
value: a[1],
done: !1
};

case 5:
n.label++;
r = a[1];
a = [ 0 ];
continue;

case 7:
a = n.ops.pop();
n.trys.pop();
continue;

default:
if (!(i = n.trys, i = i.length > 0 && i[i.length - 1]) && (6 === a[0] || 2 === a[0])) {
n = 0;
continue;
}
if (3 === a[0] && (!i || a[1] > i[0] && a[1] < i[3])) {
n.label = a[1];
break;
}
if (6 === a[0] && n.label < i[1]) {
n.label = i[1];
i = a;
break;
}
if (i && n.label < i[2]) {
n.label = i[2];
n.ops.push(a);
break;
}
i[2] && n.ops.pop();
n.trys.pop();
continue;
}
a = e.call(t, n);
} catch (t) {
a = [ 6, t ];
r = 0;
} finally {
o = i = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.HomePageSectionGameListType12 = void 0;
var c = t("../../../../../../../../../../scripts/base/loader/ResLoader"), l = t("../../../../../../../../../../scripts/modules/homePage/components/sections/HomePageSectionGameListDefault"), p = t("../../../../../../../../../../scripts/modules/homePage/vo/HomePageMiniGameInfo"), u = cc._decorator, d = u.ccclass, f = u.property, h = function(t) {
i(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.scrollView = null;
e.leftBlueArrow = null;
e.leftWhiteArrow = null;
e.rightBlueArrow = null;
e.rightWhiteArrow = null;
e.leftMask = null;
e.rightMask = null;
return e;
}
e.prototype.onLoad = function() {
var e = this;
t.prototype.onLoad.call(this);
this.addScrollViewListener();
this.scheduleOnce(function() {
e.updateArrowsState();
}, .1);
};
e.prototype.createGameListItems = function() {
var e = this;
t.prototype.createGameListItems.call(this);
var o = this.gameListConfig;
this.gameListItems.forEach(function(t, r) {
o[r] && e.loadIcon(t.node, "icon", o[r].resName);
});
};
e.prototype.loadIcon = function(t, e, o) {
return n(this, void 0, void 0, function() {
var r;
return s(this, function(i) {
switch (i.label) {
case 0:
return [ 4, c.ResLoader.asyncLoadByBundle("Remote_homePage", "textures/type12/" + e + "_" + o, cc.SpriteFrame) ];

case 1:
r = i.sent();
cc.isValid(r) && cc.isValid(t) && (t.getComponent(cc.Sprite).spriteFrame = r);
return [ 2 ];
}
});
});
};
e.prototype.onEnable = function() {
this.scrollView.scrollToLeft(0, !1);
this.sortGameListItems();
this.updateArrowsState();
};
e.prototype.sortGameListItems = function() {
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