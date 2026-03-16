function() {
e.removeEffect();
}, this);
return [ 3, 4 ];

case 3:
o.sent();
return [ 3, 4 ];

case 4:
return [ 2 ];
}
});
});
};
e.prototype.removeEffect = function() {
cc.isValid(this.top) && this.top.node.removeFromParent();
cc.isValid(this.bottom) && this.bottom.node.removeFromParent();
};
e.prototype.showEffect = function() {
var t = Cinst(hs.Board);
if (cc.isValid(this.top) && cc.isValid(t)) {
this.top.node.parent != t.node && t.node.addChild(this.top.node);
this.bottom.node.parent != t.node && t.node.addChild(this.bottom.node);
this.bottom.node.setSiblingIndex(0);
this.top.node.setSiblingIndex(this.top.node.parent.childrenCount - 1);
this.top.playAnimation("in1", 1);
this.bottom.playAnimation("in2", 1);
}
};
e.prototype.showEffectOnBoarder = function() {
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