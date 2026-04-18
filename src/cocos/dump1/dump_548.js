function() {
return a(this, void 0, void 0, function() {
var t, e = this;
return s(this, function(o) {
switch (o.label) {
case 0:
if (cc.isValid(this.top)) return [ 2 ];
o.label = 1;

case 1:
o.trys.push([ 1, 3, , 4 ]);
return [ 4, hs.ResLoader.asyncLoadByBundle(this.traitName, "prefabs/butterflyEff", cc.Prefab) ];

case 2:
t = o.sent();
if (cc.isValid(this.top)) return [ 2 ];
this.top = cc.instantiate(t).getComponent(dragonBones.ArmatureDisplay);
this.bottom = cc.instantiate(t).getComponent(dragonBones.ArmatureDisplay);
this.top.on(dragonBones.EventObject.COMPLETE, function() {
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