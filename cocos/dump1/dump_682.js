function c(a) {
if (r) throw new TypeError("Generator is already executing.");
for (;o; ) try {
if (r = 1, n && (i = 2 & a[0] ? n.return : a[0] ? n.throw || ((i = n.return) && i.call(n), 
0) : n.next) && !(i = i.call(n, a[1])).done) return i;
(n = 0, i) && (a = [ 2 & a[0], i.value ]);
switch (a[0]) {
case 0:
case 1:
i = a;
break;

case 4:
o.label++;
return {
value: a[1],
done: !1
};

case 5:
o.label++;
n = a[1];
a = [ 0 ];
continue;

case 7:
a = o.ops.pop();
o.trys.pop();
continue;

default:
if (!(i = o.trys, i = i.length > 0 && i[i.length - 1]) && (6 === a[0] || 2 === a[0])) {
o = 0;
continue;
}
if (3 === a[0] && (!i || a[1] > i[0] && a[1] < i[3])) {
o.label = a[1];
break;
}
if (6 === a[0] && o.label < i[1]) {
o.label = i[1];
i = a;
break;
}
if (i && o.label < i[2]) {
o.label = i[2];
o.ops.push(a);
break;
}
i[2] && o.ops.pop();
o.trys.pop();
continue;
}
a = t.call(e, o);
} catch (e) {
a = [ 6, e ];
n = 0;
} finally {
r = i = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(r, "__esModule", {
value: !0
});
r.HighWeightBoardAroundBlinkTrait = void 0;
var c = function(e) {
i(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.curEffect = null;
t.curEffectSkinId = null;
t.isNewGame = !1;
return t;
}
t.prototype.registerTraitEventsMethods = function() {
return [ {
className: "ClassGame_Proxy",
methodName: "onClassGameStart"
}, {
className: "ClassRevive_Proxy",
methodName: "onRevive_Success"
}, {
className: "ClassGame_Proxy",
methodName: "onGameBackHome"
}, {
className: "ClassBoardEffect_Proxy",
methodName: "onTouchEnd"
} ];
};
t.prototype.onActive = function(e) {
if (hs.tp.isClassGame_ProxyOnClassGameStart(e)) if (this.isNewGame) this.judgeWeight(); else if (this.curEffect) this.curEffect.active = !0; else {
var t = storage.getItem("HighWeightBoardAroundBlinkData", {
isShowLight: !1,
animName: null
}), r = t.isShowLight, n = t.animName;
r && this.playEffect(null != n ? n : null);
}
if (hs.tp.isClassBoardEffect_ProxyOnTouchEnd(e)) {
var i = !0;
hs.classBlocksProducerInfo.producerBlocks.forEach(function(e) {
-1 !== e && (i = !1);
});
i && this.judgeWeight();
}
hs.tp.isClassRevive_ProxyOnRevive_Success(e) && this.judgeWeight();
hs.tp.isClassGame_ProxyOnGameStart(e) && (this.isNewGame = e.args[0].data.newGame);
hs.tp.isClassGame_ProxyOnGameBackHome(e) && this.curEffect && (this.curEffect.active = !1);
};
t.prototype.isWeightThreshold = function(e) {
return e > this.props.weightThreshold;
};
t.prototype.judgeWeight = function() {
return o(this, void 0, void 0, function() {
var e, t;
return s(this, function(r) {
switch (r.label) {
case 0:
e = hs.binarySupport.getWeightValue(hs.boardInfo.faceBlocks);
if (!this.isWeightThreshold(e)) return [ 3, 4 ];
if (this.curEffectSkinId !== hs.skinInfo.currentSkinId && this.curEffect) {
this.curEffect.destroy();
this.curEffect = null;
}
return this.curEffect ? [ 3, 2 ] : [ 4, this.playEffect() ];

case 1:
t = r.sent();
storage.setItem("HighWeightBoardAroundBlinkData", {
isShowLight: !0,
animName: t
});
return [ 3, 3 ];

case 2:
this.curEffect.active = !0;
r.label = 3;

case 3:
return [ 3, 5 ];

case 4:
if (this.curEffect) {
this.curEffect.destroy();
this.curEffect = null;
}
storage.setItem("HighWeightBoardAroundBlinkData", {
isShowLight: !1,
animName: null
});
r.label = 5;

case 5:
return [ 2 ];
}
});
});
};
t.prototype.playEffect = function(e) {
return o(this, void 0, void 0, function() {
var t, r;
return s(this, function(n) {
switch (n.label) {
case 0:
n.trys.push([ 0, 2, , 3 ]);
return [ 4, CinstAsync(hs.Board) ];

case 1:
t = n.sent().node;
if (this.curEffect) {
this.curEffect.destroy();
this.curEffect = null;
}
r = hs.skinInfo.currentSkinId;
if (!e) {
e = "randomcyan";
switch (r) {
case "1012":
e = "skin_012";
break;

case "1021":
e = "skin_021";
break;

case "1025":
e = "skin_025";
break;

case "1038":
e = "skin_038";
break;

default:
e = [ "randomcyan", "randomgreen", "randomyellow" ][hs.randomIntInclusive(0, 2)];
}
}
this.curEffectSkinId = r;
this.curEffect = hs.dragonbonesAnim.play(t, {
armatureName: "armatureName",
animationName: e,
playTimes: 0
}, {
bundleName: "HighWeightBoardAroundBlinkTrait",
dragonAssetUrl: "dragonbones/gameplay_bg_skinlight_ske",
dragonAtlasAssetUrl: "dragonbones/gameplay_bg_skinlight_tex"
});
this.curEffect.y = -125;
return [ 2, e ];

case 2:
n.sent();
return [ 3, 3 ];

case 3:
return [ 2 ];
}
});
});
};
return a([ classId("HighWeightBoardAroundBlinkTrait"), classMethodWatch() ], t);
}(Trait);
r.HighWeightBoardAroundBlinkTrait = c;
cc._RF.pop();
}, {} ]
}, {}, [ "HighWeightBoardAroundBlinkTrait" ]);