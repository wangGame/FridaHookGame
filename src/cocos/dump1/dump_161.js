function(e) {
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