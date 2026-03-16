function" == typeof Reflect.decorate) r = Reflect.decorate(e, t, n, o); else for (var s = e.length - 1; s >= 0; s--) (i = e[s]) && (r = (a < 3 ? i(r) : a > 3 ? i(t, n, r) : i(t, n)) || r);
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
n.GameOverShowMiniGameIconTrait = void 0;
var c = e("./components/NodeClassGameOverShowMiniGameIconCom"), l = e("./components/NodeClassGameOverShowMiniGameIconLoadingCom"), d = e("./const/GameOverShowMiniGameIconConst"), m = function(e) {
i(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t._prefab = null;
t._node = null;
t.isExiting = !1;
t.timeId = null;
t.miniGameTypes = [ d.GameOverShowMiniGameIconMiniGameType.Watermelon, d.GameOverShowMiniGameIconMiniGameType.Link, d.GameOverShowMiniGameIconMiniGameType.OneDraw, d.GameOverShowMiniGameIconMiniGameType.WaterSort ];
return t;
}
t.prototype.onCreate = function() {
this.preloadPrefab();
};
t.prototype.registerTraitEventsMethods = function() {
return [ {
className: "Skin_Proxy",
methodName: "traitConfigInitComplete"
}, {
className: "ClassGameOver_GameEnd_Proxy",
methodName: "onGameEnd"
}, {
className: "ClassGame_Replay_Proxy",
methodName: "onGameReplay"
}, {
className: "ClassWin",
methodName: "showBtn"
}, {
className: "ClassFail",
methodName: "showBtn"
}, {
className: "GameLobby_DataInfo",
methodName: "setMoreGameLoadingState"
}, {
className: "GameLobby_Proxy",
methodName: "setMoreGameLoadingState"
} ];
};
t.prototype.onActive = function(e) {
hs.tp.isSkin_ProxyTraitConfigInitComplete(e) && this.initCurSessionData();
(hs.tp.isClassGameOver_GameEnd_ProxyOnGameEnd(e) || hs.tp.isClassGame_Replay_ProxyOnGameReplay(e)) && this.onGameEnd();
if (hs.tp.isClassWinShowBtn(e) || hs.tp.isClassFailShowBtn(e)) {
var t = e.target.node;
this.onGameOverShowUI(t);
var n = this.getLocalData();
n.gameOverType = hs.tp.isClassWinShowBtn(e) ? "ClassWin" : "ClassFail";
this.saveLocalData(n);
}
hs.tp.isGameLobby_DataInfoExitGameLobby(e) && this.onExitMiniGame(e);
if (hs.tp.isGameLobby_DataInfoSetMoreGameLoadingState(e) || hs.tp.isGameLobby_ProxySetMoreGameLoadingState(e)) {
if (!this._node) return;
this._node.getComponent(l.NodeClassGameOverShowMiniGameIconLoadingCom).setState({
loadingState: e.args[0]
});
}
};
t.prototype.preloadPrefab = function() {
return r(this, void 0, void 0, function() {
var e;
return s(this, function(t) {
switch (t.label) {
case 0:
if (this._prefab) return [ 2 ];
e = this;
return [ 4, hs.ResLoader.asyncLoadByBundle(d.GameOverShowMiniGameIconBundleName, "prefabs/NodeClassGameOverShowMiniGameIcon", cc.Prefab) ];

case 1:
e._prefab = t.sent();
return [ 2 ];
}
});
});
};
t.prototype.getLocalData = function() {
return storage.getItem(d.GameOverShowMiniGameIconLocalDataKey, {
enterMiniTime: 0,
stayTime: 0,
sessionBoutCount: 0,
currentMiniGameType: "",
gameOverType: ""
});
};
t.prototype.saveLocalData = function(e) {
storage.setItem(d.GameOverShowMiniGameIconLocalDataKey, e);
};
t.prototype.initCurSessionData = function() {
var e = this.getLocalData();
e.sessionBoutCount = 0;
e.enterMiniTime = 0;
e.stayTime = 0;
this.saveLocalData(e);
};
t.prototype.onGameEnd = function() {
var e = this.getLocalData();
e.sessionBoutCount++;
this.saveLocalData(e);
};
t.prototype.onGameOverShowUI = function(e) {
var t = this, n = this.getLocalData();
if (n.sessionBoutCount > this.props.triggerMinBout) {
if (!this._prefab) return;
var o = this.decideMiniGameType(n);
n.currentMiniGameType = o;
n.enterMiniTime = 0;
n.stayTime = 0;
this._node || (this._node = cc.instantiate(this._prefab));
this._node.parent = e;
this._node.getComponent(c.NodeClassGameOverShowMiniGameIconCom).setState({
miniGameType: o,
enterCallback: function() {
return t.onEnterMiniGame();
}
});
this.saveLocalData(n);
}
};
t.prototype.decideMiniGameType = function(e) {
var t = e.stayTime, n = e.currentMiniGameType;
return t < 1e3 * this.props.firstSecondThreshold ? this.getRandomMiniGameExclude(n) : t >= 1e3 * this.props.twoSecondThreshold && n || this.getRandomMiniGame();
};
t.prototype.getRandomMiniGame = function() {
var e = Math.floor(Math.random() * this.miniGameTypes.length);
return this.miniGameTypes[e];
};
t.prototype.getRandomMiniGameExclude = function(e) {
var t = this.miniGameTypes.filter(function(t) {
return t !== e;
});
return 0 === t.length ? this.getRandomMiniGame() : t[Math.floor(Math.random() * t.length)];
};
t.prototype.onEnterMiniGame = function() {
var e = this.getLocalData();
e.enterMiniTime = Date.now();
this.saveLocalData(e);
};
t.prototype.onExitMiniGame = function(e) {
return r(this, void 0, void 0, function() {
var t, n, o, i, a, r, c = this;
return s(this, function(s) {
switch (s.label) {
case 0:
if (0 === (t = this.getLocalData()).enterMiniTime) return [ 2 ];
t.stayTime = Date.now() - t.enterMiniTime;
t.enterMiniTime = 0;
this.saveLocalData(t);
if (this.isExiting) return [ 2 ];
this.isExiting = !0;
if (this.timeId) {
clearTimeout(this.timeId);
this.timeId = null;
}
this.timeId = setTimeout(function() {
c.isExiting = !1;
c.timeId = null;
}, 300);
n = hs.gameLobby_DataInfo.getCurrentGameCfg(), o = n.flag, i = n.currentGameCfg;
if (!o) return [ 3, 3 ];
if (i) {
hs.UI.hideUI(i);
a = hs.PrefabConfig.GameLobbyMainView;
if (hs.UI.activeState(a.url)) {
(r = hs.UI.getActiveUI(a.url)) && r.destroyAllChildren();
hs.UI.hideUI(a);
hs.gameLobby_DataInfo.releaseCurrentGameResources(i);
}
}
cc.audioEngine.stopMusic();
return [ 4, hs.delayTimeFrame(10) ];

case 1:
s.sent();
return [ 4, this.openGameOverUI() ];

case 2:
s.sent();
return [ 3, 4 ];

case 3:
s.label = 4;

case 4:
this.isExiting = !1;
e.replace = !0;
return [ 2 ];
}
});
});
};
t.prototype.openGameOverUI = function() {
return r(this, void 0, Promise, function() {
var e, t, n = this;
return s(this, function(o) {
switch (o.label) {
case 0:
if (!(e = this.getLocalData()).gameOverType) return [ 2 ];
"ClassWin" === e.gameOverType ? t = {
name: "ClassWin",
url: "prefabs/win/ClassWin",
bundleName: "class",
page: !0
} : "ClassFail" === e.gameOverType && (t = {
name: "ClassFail",
url: "prefabs/fail/ClassFail",
bundleName: "class",
page: !0
});
return t ? hs.UI.activeState(t.url) ? [ 2 ] : [ 4, hs.UI.show(t, hs.uiLayer) ] : [ 2 ];

case 1:
o.sent().addChild(this._node);
this._node.getComponent(c.NodeClassGameOverShowMiniGameIconCom).setState({
miniGameType: e.currentMiniGameType,
enterCallback: function() {
return n.onEnterMiniGame();
}
});
return [ 2 ];
}
});
});
};
return a([ classId("GameOverShowMiniGameIconTrait"), classMethodWatch() ], t);
}(Trait);
n.GameOverShowMiniGameIconTrait = m;
cc._RF.pop();
}, {
"./components/NodeClassGameOverShowMiniGameIconCom": "NodeClassGameOverShowMiniGameIconCom",
"./components/NodeClassGameOverShowMiniGameIconLoadingCom": "NodeClassGameOverShowMiniGameIconLoadingCom",
"./const/GameOverShowMiniGameIconConst": "GameOverShowMiniGameIconConst"
} ],
IGameOverShowMiniGameIcon: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "22f77PR8WpBOpVyFUf3hIZg", "IGameOverShowMiniGameIcon");
Object.defineProperty(n, "__esModule", {
value: !0
});
cc._RF.pop();
}, {} ],
NodeClassGameOverShowMiniGameIconCom: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "7120dw27mxBfIXsVK1yWz7X", "NodeClassGameOverShowMiniGameIconCom");
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
};
Object.defineProperty(n, "__esModule", {
value: !0
});
n.NodeClassGameOverShowMiniGameIconCom = void 0;
var r = e("../const/GameOverShowMiniGameIconConst"), s = cc._decorator, c = s.ccclass, l = s.property, d = function(e) {
i(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.nodeFruit = null;
t.nodeLink = null;
t.nodeOneDraw = null;
t.nodeWaterSort = null;
return t;
}
t.prototype.render = function() {
this.hideAllBtns();
switch (this.state.miniGameType) {
case r.GameOverShowMiniGameIconMiniGameType.Watermelon:
this.showBtn(this.nodeFruit);
break;

case r.GameOverShowMiniGameIconMiniGameType.Link:
this.showBtn(this.nodeLink);
break;

case r.GameOverShowMiniGameIconMiniGameType.OneDraw:
this.showBtn(this.nodeOneDraw);
break;

case r.GameOverShowMiniGameIconMiniGameType.WaterSort:
this.showBtn(this.nodeWaterSort);
}
};
t.prototype.onDisable = function() {
var e = this;
cc.director.once(cc.Director.EVENT_AFTER_UPDATE, function() {
e.node && e.node.isValid && (e.node.parent = null);
});
};
t.prototype.showBtn = function(e) {
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