function() {
var e, o, r, i, a, n;
return s(this, function(s) {
switch (s.label) {
case 0:
if (h.tp.isEncourage_ProxyOnTouchEnd(t)) {
e = t.args[0];
this.clearScreen = e.state.clearScreen;
}
if (!h.tp.isEncourage_ProxyOnEncourageEffectsPlay(t)) return [ 3, 8 ];
if ((e = t.args[0]).state.type !== d.EncourageType.NEW_HIGH_SCORE) return [ 3, 8 ];
t.args[1] = !1;
return this.clearScreen ? [ 4, this.delay(1.5) ] : [ 3, 2 ];

case 1:
s.sent();
s.label = 2;

case 2:
o = e.state.highScore;
return [ 3, 5 ];

case 3:
(void 0).newBestScoreEffectPrefab = s.sent();
s.label = 4;

case 4:
this.newBestScoreEffect = cc.instantiate(this.newBestScoreEffectPrefab);
f.effectLayer.addChild(this.newBestScoreEffect);
return cc.isValid(this.newBestScoreEffect) ? [ 3, 7 ] : [ 2 ];

case 5:
r = this;
return [ 4, p.UI.show(m.TraitsPrefabConfig.NewBestScoreEffect, f.gameEffectLayer) ];

case 6:
r.newBestScoreEffect = s.sent();
s.label = 7;

case 7:
i = Cinst(u.default);
if (!cc.isValid(i) || !cc.isValid(i.node)) return [ 2 ];
a = i.node.parent.convertToWorldSpaceAR(i.node.getPosition());
n = c.gameUiLayer.convertToNodeSpaceAR(a);
this.newBestScoreEffect.setPosition(n);
this.newBestScoreEffect.getComponent(y.default).setState({
highScore: o
});
s.label = 8;

case 8:
h.tp.isEncourage_ProxyOnGameReplay(t) && p.UI.hideUI(m.TraitsPrefabConfig.NewBestScoreEffect);
h.tp.isEncourage_ProxyOnGameOverGameEnd(t) && p.UI.hideUI(m.TraitsPrefabConfig.NewBestScoreEffect);
return [ 2 ];
}
});
});
};
e.prototype.delay = function(t) {
return new Promise(function(e) {
cc.tween(f.gameEffectLayer).delay(t).call(function() {
e();
}).start();
});
};
return a([ classId("New_best_scoreTrait") ], e);
}(l.Trait);
o.New_best_scoreTrait = g;
cc._RF.pop();
}, {
"../../../../../../../scripts/base/layer/GameLayer": void 0,
"../../../../../../../scripts/base/loader/ResLoader": void 0,
"../../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../../scripts/base/ui/UI": void 0,
"../../../../../../../scripts/modules/board/components/Board": void 0,
"../../../../../../../scripts/modules/encourage/type/EncourageType": void 0,
"../../../../../../../scripts/modules/layer/vo/LayerInfo": void 0,
"../../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0,
"../../prefab/TraitsPrefabConfig": "TraitsPrefabConfig",
"../components/NewBestScoreEffect": "NewBestScoreEffect"
} ],
New_clear_effectTrait: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "9d55ezQiQhFpL35vfZJnOWF", "New_clear_effectTrait");
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
o.New_clear_effectTrait = o.BgMaterialList = o.BoardEffectUrlList = o.BgDragonBonesUrl = o.FrameDragonBonesUrl = void 0;
var c = t("../../../../../../../scripts/base/animation/DragonbonesAnim"), l = t("../../../../../../../scripts/base/layer/GameLayer"), p = t("../../../../../../../scripts/base/loader/ResLoader"), u = t("../../../../../../../scripts/base/shake/Shake"), d = t("../../../../../../../scripts/base/trait/Trait"), f = t("../../../../../../../scripts/base/ui/UI"), h = t("../../../../../../../scripts/modules/board/components/Board"), m = t("../../../../../../../scripts/modules/dragonBones/DragonBonesConfig"), y = t("../../../../../../../scripts/modules/game/type/GameType"), g = t("../../../../../../../scripts/modules/game/vo/GameInfo"), _ = t("../../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate"), v = t("../../prefab/TraitsPrefabConfig");
o.FrameDragonBonesUrl = "dragonbones/boardEffect/trait/new_clear_effect/gameplay_moreEliminate_tilemapFrame_ske";
o.BgDragonBonesUrl = "dragonbones/boardEffect/trait/new_clear_effect/gameplay_moreEliminate_bgPar_ske";
o.BoardEffectUrlList = [ "textures/board/new_clear_effect/tilemap_blue", "textures/board/new_clear_effect/tilemap_cyan", "textures/board/new_clear_effect/tilemap_blue", "textures/board/new_clear_effect/tilemap_blue", "textures/board/new_clear_effect/tilemap_purple" ];
o.BgMaterialList = [ "materials/new_clear_effect/cyan_effect", "materials/new_clear_effect/cyan_effect", "materials/new_clear_effect/blue_3_effect", "materials/new_clear_effect/blue_4_effect", "materials/new_clear_effect/purple_effect" ];
var T = function(t) {
i(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e._isShaking = !1;
return e;
}
e.prototype.data = function() {
return {
eliminateCount: 0,
isGuideEnd: !1
};
};
e.prototype.onActive = function(t) {
if (_.tp.isBoardEffect_ProxyOnTouchEnd(t)) {
var e = t.args[0].state.eliminateCount;
this.state.eliminateCount = e;
this.playAnimation();
}
};
e.prototype.getEliminateEffectLevel = function() {
var t = this.state.eliminateCount;
return t <= 2 ? 1 : Math.min(t - 1, 5);
};
e.prototype.playAnimation = function() {
return n(this, void 0, Promise, function() {
var t = this;
return s(this, function() {
g.gameInfo.gameMode, y.GameMode.Class;
if (this.state.eliminateCount <= 0) return [ 2 ];
setTimeoutSafe(function() {
t.playFrameEffect();
t.playBgAnimation();
t.playScreenShake();
t.playBoardEffect();
}, 100);
return [ 2 ];
});
});
};
e.prototype.playScreenShake = function() {
var t, e = this.getEliminateEffectLevel();
if (!(e < 2)) {
var o = null !== (t = [ 0, 0, 4, 4, 6, 8 ][e]) && void 0 !== t ? t : 8;
u.shake.startWithAmplitude(.33, o, .066);
}
};