function(e) {
e.active = !0;
e.opacity = 0;
cc.tween(e).delay(.3).to(.2, {
opacity: 255
}).start();
};
t.prototype.hideAllBtns = function() {
this.nodeFruit.active = !1;
this.nodeLink.active = !1;
this.nodeOneDraw.active = !1;
this.nodeWaterSort.active = !1;
};
t.prototype.onClick = function() {
var e, t, n = this.state.miniGameType, o = this.getBundleNameByMiniGameType(n);
if (o) {
null === (t = (e = this.state).enterCallback) || void 0 === t || t.call(e);
var i = hs.homePageMiniGameInfo.dcMiniGameIconType[o];
i && DC("ui_theme_icon_click", {
icon_type: i
});
hs.EventManager.dispatchModuleEvent(new hs.E_GameLobby_OpenMiniGame({
bundleName: o
}));
}
};
t.prototype.getBundleNameByMiniGameType = function(e) {
switch (e) {
case r.GameOverShowMiniGameIconMiniGameType.Watermelon:
return "gl_fruit";

case r.GameOverShowMiniGameIconMiniGameType.Link:
return "gl_onet";

case r.GameOverShowMiniGameIconMiniGameType.OneDraw:
return "gl_oneline";

case r.GameOverShowMiniGameIconMiniGameType.WaterSort:
return "gl_watersort";

default:
return null;
}
};
a([ l(cc.Node) ], t.prototype, "nodeFruit", void 0);
a([ l(cc.Node) ], t.prototype, "nodeLink", void 0);
a([ l(cc.Node) ], t.prototype, "nodeOneDraw", void 0);
a([ l(cc.Node) ], t.prototype, "nodeWaterSort", void 0);
a([ hs.throttle(1500) ], t.prototype, "onClick", null);
return a([ c ], t);
}(hs.Component);
n.NodeClassGameOverShowMiniGameIconCom = d;
cc._RF.pop();
}, {
"../const/GameOverShowMiniGameIconConst": "GameOverShowMiniGameIconConst"
} ],
NodeClassGameOverShowMiniGameIconLoadingCom: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "c4aa9rxab5BxrO9NCRspdxp", "NodeClassGameOverShowMiniGameIconLoadingCom");
var o, i = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
})(e, t);
}, function(e, t) {
o(e, t);
function n() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype, new n());
}), a = this && this.__decorate || function(e, t, n, o) {
var i, a = arguments.length, r = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, n) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(e, t, n, o); else for (var s = e.length - 1; s >= 0; s--) (i = e[s]) && (r = (a < 3 ? i(r) : a > 3 ? i(t, n, r) : i(t, n)) || r);
return a > 3 && r && Object.defineProperty(t, n, r), r;
}, r = this && this.__awaiter || function(e, t, n, o) {
return new (n || (n = Promise))(function(i, a) {
function r(e) {
try {
c(o.next(e));
} catch (e) {
a(e);
}
}
function s(e) {
try {
c(o.throw(e));
} catch (e) {
a(e);
}
}
function c(e) {
e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n(function(e) {
e(t);
})).then(r, s);
var t;
}
c((o = o.apply(e, t || [])).next());
});
}, s = this && this.__generator || function(e, t) {
var n, o, i, a, r = {
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
function s(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(a) {
if (n) throw new TypeError("Generator is already executing.");
for (;r; ) try {
if (n = 1, o && (i = 2 & a[0] ? o.return : a[0] ? o.throw || ((i = o.return) && i.call(o), 
0) : o.next) && !(i = i.call(o, a[1])).done) return i;
(o = 0, i) && (a = [ 2 & a[0], i.value ]);
switch (a[0]) {
case 0:
case 1:
i = a;
break;

case 4:
r.label++;
return {
value: a[1],
done: !1
};

case 5:
r.label++;
o = a[1];
a = [ 0 ];
continue;

case 7:
a = r.ops.pop();
r.trys.pop();
continue;

default:
if (!(i = r.trys, i = i.length > 0 && i[i.length - 1]) && (6 === a[0] || 2 === a[0])) {
r = 0;
continue;
}
if (3 === a[0] && (!i || a[1] > i[0] && a[1] < i[3])) {
r.label = a[1];
break;
}
if (6 === a[0] && r.label < i[1]) {
r.label = i[1];
i = a;
break;
}
if (i && r.label < i[2]) {
r.label = i[2];
r.ops.push(a);
break;
}
i[2] && r.ops.pop();
r.trys.pop();
continue;
}
a = t.call(e, r);
} catch (e) {
a = [ 6, e ];
o = 0;
} finally {
n = i = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(n, "__esModule", {
value: !0
});
n.NodeClassGameOverShowMiniGameIconLoadingCom = void 0;
var c = cc._decorator, l = c.ccclass, d = c.property, m = function(e) {
i(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.loadingNode = null;
t.maskNode = null;
t.netNode = null;
t.bundleLoadingNode = null;
return t;
}
t.prototype.render = function() {
return r(this, void 0, void 0, function() {
var e, t, n = this;
return s(this, function() {
if (this.state.loadingState === hs.GLMoreGameLoadingState.Loading) {
this.loadingNode && (this.loadingNode.active = !0);
e = TRAIT("DelayMiniGameLoadingShowTrait");
t = 200;
(null == e ? void 0 : e.active) && (t = e.props.delayTime || 500);
setTimeoutSafe(function() {
if (n.state.loadingState === hs.GLMoreGameLoadingState.Loading) {
cc.isValid(n.maskNode) && (n.maskNode.active = !0);
if (cc.isValid(n.bundleLoadingNode)) {
n.bundleLoadingNode.node.active = !0;
n.bundleLoadingNode.playAnimation("loading_ani", 0);
}
}
}, t);
} else if (this.state.loadingState === hs.GLMoreGameLoadingState.Success) {
cc.isValid(this.loadingNode) && (this.loadingNode.active = !1);
cc.isValid(this.maskNode) && (this.maskNode.active = !1);
cc.isValid(this.bundleLoadingNode) && (this.bundleLoadingNode.node.active = !1);
cc.isValid(this.netNode) && (this.netNode.node.active = !1);
} else if (this.state.loadingState === hs.GLMoreGameLoadingState.Failed) {
cc.isValid(this.loadingNode) && (this.loadingNode.active = !0);
cc.isValid(this.maskNode) && (this.maskNode.active = !0);
if (cc.isValid(this.bundleLoadingNode)) {
this.bundleLoadingNode.node.active = !0;
this.bundleLoadingNode.playAnimation("loading_ani_Failed", 1);
this.bundleLoadingNode.once(dragonBones.EventObject.COMPLETE, function() {
n.funcDelayExec(0, function() {
if (cc.isValid(n.bundleLoadingNode) && cc.isValid(n.maskNode) && cc.isValid(n.loadingNode)) {
n.bundleLoadingNode.node.active = !1;
n.maskNode.active = !1;
n.loadingNode.active = !1;
}
});
}, this);
}
} else if (this.state.loadingState === hs.GLMoreGameLoadingState.NoNet && cc.isValid(this.loadingNode) && cc.isValid(this.maskNode) && cc.isValid(this.netNode) && cc.isValid(this.bundleLoadingNode)) {
this.loadingNode.active = !0;
this.maskNode.active = !0;
this.netNode.node.active = !0;
this.bundleLoadingNode.node.active = !1;
this.netNode.playAnimation("check_net", 1);
this.netNode.once(dragonBones.EventObject.COMPLETE, function() {
n.funcDelayExec(0, function() {
if (cc.isValid(n.netNode) && cc.isValid(n.maskNode) && cc.isValid(n.loadingNode)) {
n.netNode.node.active = !1;
n.maskNode.active = !1;
n.loadingNode.active = !1;
}
});
}, this);
}
return [ 2 ];
});
});
};
t.prototype.funcDelayExec = function(e, t) {
t && (e <= 0 ? t() : setTimeoutSafe(function() {
t();
}, e));
};
a([ d(cc.Node) ], t.prototype, "loadingNode", void 0);
a([ d(cc.Node) ], t.prototype, "maskNode", void 0);
a([ d(dragonBones.ArmatureDisplay) ], t.prototype, "netNode", void 0);
a([ d(dragonBones.ArmatureDisplay) ], t.prototype, "bundleLoadingNode", void 0);
return a([ l ], t);
}(hs.Component);
n.NodeClassGameOverShowMiniGameIconLoadingCom = m;
cc._RF.pop();
}, {} ]
}, {}, [ "GameOverShowMiniGameIconTrait", "NodeClassGameOverShowMiniGameIconCom", "NodeClassGameOverShowMiniGameIconLoadingCom", "GameOverShowMiniGameIconConst", "IGameOverShowMiniGameIcon" ]);