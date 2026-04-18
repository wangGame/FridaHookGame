function(t) {
return r(e[i][1][t] || t);
}, l, l.exports, t, e, o, a);
}
return o[i].exports;
}
for (var n = "function" == typeof __require && __require, i = 0; i < a.length; i++) r(a[i]);
return r;
}({
FatalPuzzleDeathCompensationTrait: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "29298z6iLVLIKVLyVvdK2BR", "FatalPuzzleDeathCompensationTrait");
var a, r = this && this.__extends || (a = function(t, e) {
return (a = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
a(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), n = this && this.__decorate || function(t, e, o, a) {
var r, n = arguments.length, i = n < 3 ? e : null === a ? a = Object.getOwnPropertyDescriptor(e, o) : a;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(t, e, o, a); else for (var s = t.length - 1; s >= 0; s--) (r = t[s]) && (i = (n < 3 ? r(i) : n > 3 ? r(e, o, i) : r(e, o)) || i);
return n > 3 && i && Object.defineProperty(e, o, i), i;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.FatalPuzzleDeathCompensationTrait = void 0;
var i = function(t) {
r(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.curComboNum = 0;
return e;
}
e.prototype.onActive = function(t) {
var e;
hs.tp.isClassGameOver_GameEnd_ProxyOnGameEnd(t) && hs.classAlgorithmName.algoActualId === hs.OFFER_TYPE.ZHI_SI_TI && storage.setItem("FatalPuzzleDeathCompensationData", hs.classDataStatisticsInfo.dataStatisticsInfo.comboTouchNum);
if (hs.tp.isBlocksProducerTouchTraitEnableInitData(t) && hs.gameInfo.gameMode === hs.GameMode.Class) {
var o = storage.getItem("FatalPuzzleDeathCompensationData", 0);
if (o > 0) {
storage.setItem("FatalPuzzleDeathCompensationData", 0);
t.args[0] = 1 + o + (null !== (e = t.args[0]) && void 0 !== e ? e : 0);
this.curComboNum = t.args[0];
var a = TRAIT("IsOpenComboContinuousTrait");
if (a && a.active) {
a.setState({
continousNum: this.curComboNum
});
storage.setItem("classComboContinuous", this.curComboNum);
}
}
}
if (hs.tp.isClassTopInfo_ProxyOpenUI(t)) {
var r = t.args[0].info;
if (this.curComboNum > 0) {
r.continuousEliminateTimes = this.curComboNum + 1;
r.comboAnimState = hs.TopInfoType.ShowCombo;
this.curComboNum = 0;
}
}
};
return n([ classId("FatalPuzzleDeathCompensationTrait") ], e);
}(Trait);
o.FatalPuzzleDeathCompensationTrait = i;
cc._RF.pop();
}, {} ]
}, {}, [ "FatalPuzzleDeathCompensationTrait" ]);