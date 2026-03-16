function(t, e) {
var o, n, r, i, a = {
label: 0,
sent: function() {
if (1 & r[0]) throw r[1];
return r[1];
},
trys: [],
ops: []
};
return i = {
next: s(0),
throw: s(1),
return: s(2)
}, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
return this;
}), i;
function s(t) {
return function(e) {
return c([ t, e ]);
};
}
function c(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;a; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
a.label++;
return {
value: i[1],
done: !1
};

case 5:
a.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = a.ops.pop();
a.trys.pop();
continue;

default:
if (!(r = a.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
a = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
a.label = i[1];
break;
}
if (6 === i[0] && a.label < r[1]) {
a.label = r[1];
r = i;
break;
}
if (r && a.label < r[2]) {
a.label = r[2];
a.ops.push(i);
break;
}
r[2] && a.ops.pop();
a.trys.pop();
continue;
}
i = e.call(t, a);
} catch (t) {
i = [ 6, t ];
n = 0;
} finally {
o = r = 0;
}
if (5 & i[0]) throw i[1];
return {
value: i[0] ? i[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.ComboButterflyBorderEffectTrait = void 0;
var c = function(t) {
r(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.top = null;
e.bottom = null;
return e;
}
e.prototype.onActive = function(t) {
var e;
if (hs.tp.isClassCombo_ProxyOnGameStart(t)) {
this.loadPrefab();
this.removeEffect();
}
if (hs.tp.isClassCombo_ProxyOnTouchEnd(t)) {
var o = t.args[0].state, n = o.eliminateCount, r = o.continuousEliminateTimes;
if (n > 0 && r >= 5) {
t.disable([ "QBlockComboTrait" ]);
(null === (e = this.props) || void 0 === e ? void 0 : e.upBoard) ? this.showEffectOnBoarder() : this.showEffect();
}
}
};
e.prototype.loadPrefab = function() {
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