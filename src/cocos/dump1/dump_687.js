function() {
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