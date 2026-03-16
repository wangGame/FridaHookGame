function(t, r, o, c) {
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