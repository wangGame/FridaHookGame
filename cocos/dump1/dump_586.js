function(t) {
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