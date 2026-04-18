function(t) {
o(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e._probability = .75;
return e;
}
e.prototype.onActive = function(t) {
if (hs.tp.isClassAlgorithmStrategy_Condition_ProxyOnAlgorithmStrategyCondition(t) && Math.random() <= this._probability) {
var e = this.getDifficultyTypes();
if (e.length > 0) {
var r = hs.OFFER_TYPE.DIFF_EASY_HELP;
hs.algorithmStrategyInfo.setAlgorithmList(hs.algorithmStrategyLogic.insertAlgorithms(hs.algorithmStrategyInfo.algorithmList, e, r));
}
}
};
e.prototype.getDifficultyTypes = function() {
return Object.keys(hs.OFFER_TYPE_DIFFICULTY).filter(function(t) {
if (hs.OFFER_TYPE[t] != hs.OFFER_TYPE.DIFF_EASY_HELP && -1 != hs.algorithmStrategyInfo.algorithmList.indexOf(hs.OFFER_TYPE[t])) return t;
}).map(function(t) {
return hs.OFFER_TYPE[t];
});
};
return n([ classId("DifficultSimplePuzzlesTrait") ], e);
}(Trait);
r.DifficultSimplePuzzlesTrait = f;
cc._RF.pop();
}, {} ]
}, {}, [ "DifficultSimplePuzzlesTrait" ]);