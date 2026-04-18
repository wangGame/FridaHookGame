function(t) {
hs.tp.isClassGameOver_GameEnd_ProxyOnGameEnd(t) && this.onClassGameEnd(t);
hs.tp.isClassAlgorithmStrategy_Deal_ProxyPostPreprocessing(t) && this.onClassAlgorithmStrategyPostPreprocessing();
};
r.prototype.onClassGameEnd = function() {
var t = this;
if (hs.gameInfo.gameMode === hs.GameMode.Class) {
var r = hs.classGameInfo.gameNum;
if (r <= this.MAX_GAME_ID) {
var e = this.buildGameRecord(r);
if (e) {
var o = s(this.historyGameRecords), i = o.findIndex(function(t) {
return t && t.game_id === r;
});
i >= 0 ? o[i] = e : o.push(e);
this.historyGameRecords = o;
}
if (this.requestedGameIds.includes(r)) {
this.resetCurrentGameStats();
return;
}
var n = [];
n.push.apply(n, s(this.historyGameRecords));
if (0 === n.length) ; else {
var a = hs.traitServerRequestInfo.uid;
h.RandomAlgorithmStrategyDistributionWithRoundTraitHelper.sendRequestAndParse(this.url, this.reqType, a, n, function(e) {
e.length > 0 && (t.recConfigList = e);
t.requestedGameIds.includes(r) || (t.requestedGameIds = s(t.requestedGameIds, [ r ]));
});
}
this.resetCurrentGameStats();
}
}
};
r.prototype.buildGameRecord = function(t) {
var r, e, o = Math.floor(hs.gameInfo.enterGameTime / 1e3), i = this.firstHardTimeSec, n = this.firstHardRound, a = hs.classGameInfo.roundNum, s = null !== (e = null === (r = hs.classScoreInfo) || void 0 === r ? void 0 : r.score) && void 0 !== e ? e : 0, d = hs.algorithmName.algoActualId, u = -1;
"number" != typeof d || isNaN(d) || (u = h.RandomAlgorithmStrategyDistributionWithRoundTraitHelper.getDeadRecFromAlgoId(d));
return {
game_id: t,
time: o,
first_hard_time: i,
first_hard_round: n,
round_id: a,
dead_rec: u,
score: s
};
};
r.prototype.checkAlgorithmRecordFirstHard = function(t) {
if (!(this.firstHardRound >= 0 && this.firstHardTimeSec >= 0 || "number" != typeof t || isNaN(t) || hs.algorithmInfo.getOfferTypeCategory(t) !== hs.algorithmMainType.DIFFICULT)) {
var r = hs.classGameInfo.roundNum, e = Math.floor(hs.gameInfo.enterGameTime / 1e3);
this.firstHardRound = r;
this.firstHardTimeSec = e;
}
};
r.prototype.onClassAlgorithmStrategyPostPreprocessing = function() {
var t, r;
if (hs.gameInfo.gameMode === hs.GameMode.Class && this.recConfigList.length && !(hs.classGameInfo.gameNum > this.MAX_GAME_ID)) {
var e = Number(hs.classGameInfo.roundNum), o = hs.algorithmStrategyInfo.algorithmList;
if (Array.isArray(o) && o.length) {
for (var i = s(o), n = 0; n < i.length; n++) {
var a = i[n], u = h.RandomAlgorithmStrategyDistributionWithRoundTraitHelper.getDeadRecFromAlgoId(a);
this.checkAlgorithmRecordFirstHard(a);
if (!(u < 0)) try {
for (var l = (t = void 0, d(this.recConfigList)), c = l.next(); !c.done; c = l.next()) {
var m = c.value;
if (u === m.origin_rec && !(e < m.apply_round_start || e > m.apply_round_end)) {
var _ = m.rate;
if (Math.random() <= _) {
var f = h.RandomAlgorithmStrategyDistributionWithRoundTraitHelper.getAlgoIdFromRec(m.replace_rec);
if (f < 0) continue;
i[n] = f;
break;
}
}
}
} catch (r) {
t = {
error: r
};
} finally {
try {
c && !c.done && (r = l.return) && r.call(l);
} finally {
if (t) throw t.error;
}
}
}
hs.algorithmStrategyInfo.setAlgorithmList(i);
}
}
};
n([ storageProperty({
key: "RandomAlgorithmStrategyDistributionWithRoundTrait_RecConfigList"
}) ], r.prototype, "recConfigList", void 0);
n([ storageProperty({
key: "RandomAlgorithmStrategyDistributionWithRoundTrait_RequestedGameIds"
}) ], r.prototype, "requestedGameIds", void 0);
n([ storageProperty({
key: "RandomAlgorithmStrategyDistributionWithRoundTrait_FirstHardTimeSec"
}) ], r.prototype, "firstHardTimeSec", void 0);
n([ storageProperty({
key: "RandomAlgorithmStrategyDistributionWithRoundTrait_FirstHardRound"
}) ], r.prototype, "firstHardRound", void 0);
n([ storageProperty({
key: "RandomAlgorithmStrategyDistributionWithRoundTrait_History"
}) ], r.prototype, "historyGameRecords", void 0);
return n([ classId("RandomAlgorithmStrategyDistributionWithRoundTrait") ], r);
}(Trait);
e.RandomAlgorithmStrategyDistributionWithRoundTrait = u;
cc._RF.pop();
}, {
"./RandomAlgorithmStrategyDistributionWithRoundTraitHelper": "RandomAlgorithmStrategyDistributionWithRoundTraitHelper"
} ]
}, {}, [ "RandomAlgorithmStrategyDistributionWithRoundTrait", "RandomAlgorithmStrategyDistributionWithRoundTraitHelper" ]);