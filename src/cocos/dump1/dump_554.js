function() {
var t = Cinst(hs.ClassGame);
if (cc.isValid(t) && cc.isValid(this.bottom) && cc.isValid(this.top)) {
if (this.bottom.node.parent != t.boardContainer) {
t.boardContainer.addChild(this.bottom.node);
this.bottom.node.zIndex = 501;
}
if (this.top.node.parent != t.boardContainer) {
t.boardContainer.addChild(this.top.node);
this.top.node.zIndex = 502;
}
this.bottom.node.setPosition(0, 128);
this.top.node.setPosition(0, 128);
this.top.playAnimation("in1", 1);
this.bottom.playAnimation("in2", 1);
}
};
return i([ classId("ComboButterflyBorderEffectTrait") ], e);
}(Trait);
o.ComboButterflyBorderEffectTrait = c;
cc._RF.pop();
}, {} ]
}, {}, [ "ComboButterflyBorderEffectTrait" ]);