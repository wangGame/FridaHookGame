function() {
if (this._timer) {
clearTimeout(this._timer);
this._timer = 0;
}
};
t.prototype.showEffect = function(e) {
if (this._encourageEffectPrefab) {
var t = Cinst(hs.ClassGame);
if (t && cc.isValid(t.node) && t.node.active) {
var r = storage.getItem("classEncourageEffectByScoreList", []);
r.push(e.score);
storage.setItem("classEncourageEffectByScoreList", r);
this.showEncourageEffect(e);
}
}
};
t.prototype.checkScore = function() {
for (var e = storage.getItem("classScore", 0), t = storage.getItem("classEncourageEffectByScoreList", []), r = null, o = function(o) {
var n = c.SCORE_PERCENTAGE[o];
if (e >= n.score) {
-1 === t.findIndex(function(e) {
return e === n.score;
}) && (r = n);
return "break";
}
}, c = this, n = this.SCORE_PERCENTAGE.length - 1; n >= 0 && "break" !== o(n); n--) ;
return r;
};
t.prototype.showEncourageEffect = function(e) {
if (this._encourageEffectPrefab) {
if (!this._encourageEffectNode) {
this._encourageEffectNode = cc.instantiate(this._encourageEffectPrefab);
hs.uiLayer.addChild(this._encourageEffectNode);
this._encourageEffectNode.setPosition(0, 0);
}
this._encourageEffectNode.active = !0;
this._encourageEffectNode.getComponent(a.default).setState({
score: e
});
}
};
t.prototype.preLoadPrefab = function() {
var e = this;
hs.ResLoader.loadByBundle("IsOpenClassEncourageEffectByScoreTrait", "prefabs/highScoreEncourageEffect", cc.Prefab, function(t, r) {
t || (e._encourageEffectPrefab = r);
});
};
return n([ classId("IsOpenClassEncourageEffectByScoreTrait") ], t);
}(Trait);
r.IsOpenClassEncourageEffectByScoreTrait = i;
cc._RF.pop();
}, {
"./ScoreTipHignScoreEncourageEffectInfo": "ScoreTipHignScoreEncourageEffectInfo"
} ],
ScoreTipHignScoreEncourageEffectInfo: [ function(e, t, r) {
"use strict";
cc._RF.push(t, "6a6f581AuZBGIilP8ZrQCwD", "ScoreTipHignScoreEncourageEffectInfo");
var o, c = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
})(e, t);
}, function(e, t) {
o(e, t);
function r() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (r.prototype = t.prototype, new r());
}), n = this && this.__decorate || function(e, t, r, o) {
var c, n = arguments.length, a = n < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, r) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, r, o); else for (var i = e.length - 1; i >= 0; i--) (c = e[i]) && (a = (n < 3 ? c(a) : n > 3 ? c(t, r, a) : c(t, r)) || a);
return n > 3 && a && Object.defineProperty(t, r, a), a;
};
Object.defineProperty(r, "__esModule", {
value: !0
});
var a = cc._decorator, i = a.ccclass, s = a.property, f = function(e) {
c(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.percentageLabel = null;
t.skeletonAni = null;
t._time = {
percentage: 0
};
return t;
}
t.prototype.render = function() {
var e = this;
this.percentageLabel.node.active = !1;
this.percentageLabel.string = "0";
this.percentageLabel.node.opacity = 255;
this.percentageLabel.node.stopAllActions();
cc.Tween.stopAllByTarget(this._time);
this._time = {
percentage: 0
};
cc.tween(this._time).delay(.65).call(function() {
e.percentageLabel && cc.isValid(e.percentageLabel.node) && (e.percentageLabel.node.active = !0);
}).to(.3, {
percentage: this.state.score.percentage
}, {
progress: function(t, r, o, c) {
o >= e.state.score.percentage - 1 && (o = e.state.score.percentage);
e.percentageLabel && cc.isValid(e.percentageLabel.node) && (e.percentageLabel.string = "" + Math.floor(o));
return t + (r - t) * c;
}
}).call(function() {
e.percentageLabel && cc.isValid(e.percentageLabel.node) && (e.percentageLabel.string = "" + e.state.score.percentage);
}).delay(.7).call(function() {
e.percentageLabel && cc.tween(e.percentageLabel.node).to(.25, {
opacity: 0
}).call(function() {
e.percentageLabel && cc.isValid(e.percentageLabel.node) && (e.percentageLabel.node.active = !1);
}).start();
}).start();
this.skeletonAni.setAnimation(0, "newAnimation2_xx", !1);
this.skeletonAni.setCompleteListener(function() {
e.node && cc.isValid(e.node) && (e.node.active = !1);
});
};
n([ s(cc.Label) ], t.prototype, "percentageLabel", void 0);
n([ s(sp.Skeleton) ], t.prototype, "skeletonAni", void 0);
return n([ i ], t);
}(hs.Component);
r.default = f;
cc._RF.pop();
}, {} ]
}, {}, [ "IsOpenClassEncourageEffectByScoreTrait", "ScoreTipHignScoreEncourageEffectInfo" ]);