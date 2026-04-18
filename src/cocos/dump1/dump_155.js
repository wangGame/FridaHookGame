function() {
t.node && cc.isValid(t.node) && t.node.destroy();
}).start();
} else this.node.destroy();
};
i([ s(cc.Label) ], t.prototype, "scoreLabel", void 0);
i([ s(dragonBones.ArmatureDisplay) ], t.prototype, "spineAnim", void 0);
return i([ a ], t);
}(cc.Component);
o.default = l;
cc._RF.pop();
}, {} ],
ClassBreakScoreShowTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "032d1pMBWRGO5NthBHhagS/", "ClassBreakScoreShowTrait");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), i = this && this.__decorate || function(e, t, o, r) {
var n, i = arguments.length, c = i < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, t, o, r); else for (var a = e.length - 1; a >= 0; a--) (n = e[a]) && (c = (i < 3 ? n(c) : i > 3 ? n(t, o, c) : n(t, o)) || c);
return i > 3 && c && Object.defineProperty(t, o, c), c;
}, c = this && this.__read || function(e, t) {
var o = "function" == typeof Symbol && e[Symbol.iterator];
if (!o) return e;
var r, n, i = o.call(e), c = [];
try {
for (;(void 0 === t || t-- > 0) && !(r = i.next()).done; ) c.push(r.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
r && !r.done && (o = i.return) && o.call(i);
} finally {
if (n) throw n.error;
}
}
return c;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.ClassBreakScoreShowTrait = void 0;
var a = e("./components/ClassBreakScoreShowComp"), s = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onActive = function(e) {
if (hs.tp.isClassScoreTip_ProxyPlayHighScoreEffects(e) && !hs.classScoreInfo.highScoreEncourageEffectsSate && 0 != hs.classGameInfo.gameNum) {
hs.audioInfo.play(hs.AudioConfig.s_new_record);
hs.storage.setItem("classHighScoreEncourageEffectsSate", !0);
var t = c(e.args, 1)[0];
this.showBreakScoreTip(t);
e.replace = !0;
}
};
t.prototype.showBreakScoreTip = function(e) {
var t = hs.effectLayer;
t && cc.isValid(t) && hs.ResLoader.loadByBundle("ClassBreakScoreShowTrait", "prefabs/tips", cc.Prefab, function(o, r) {
if (o) ; else {
var n = cc.instantiate(r);
if (n && cc.isValid(n)) {
var i = n.getComponent(a.default);
if (i) {
t.addChild(n);
var c = hs.boardRendererInfo.boardWorldPos, s = t.convertToNodeSpaceAR(c);
n.setPosition(s);
n.zIndex = 999;
setTimeoutSafe(function() {
i.playAnimation(e);
}, 100);
} else n.destroy();
}
}
});
};
return i([ classId("ClassBreakScoreShowTrait") ], t);
}(Trait);
o.ClassBreakScoreShowTrait = s;
cc._RF.pop();
}, {
"./components/ClassBreakScoreShowComp": "ClassBreakScoreShowComp"
} ]
}, {}, [ "ClassBreakScoreShowTrait", "ClassBreakScoreShowComp" ]);