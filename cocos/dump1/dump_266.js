function() {
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