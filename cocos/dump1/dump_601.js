function e() {
return null !== r && r.apply(this, arguments) || this;
}
Object.defineProperty(e.prototype, "fixGameNum", {
get: function() {
return this.props.fixGameNum;
},
enumerable: !1,
configurable: !0
});
e.prototype.registerTraitEventsMethods = function() {
return [ {
className: "ClassBlocksProducer_BlocksProducerValidate_Proxy",
methodName: "onBoardSplashAnimationEnd"
} ];
};
e.prototype.onActive = function(r) {
if (hs.tp.isClassDefaultBoard_ProxyProduceDefaultBoard(r)) {
var e = hs.classGameInfo.gameNum;
if (!i.isInFirstEightGames(e)) return;
var t = e + 1;
if (!(a = i.getFirstEightGameConfig(t, this.fixGameNum))) return;
r.args[0] = a.boardData;
r.returnState = !0;
}
if (hs.tp.isClassDefaultBoard_ProxyProduceDefaultColor(r)) {
e = hs.classGameInfo.gameNum;
i.isInFirstEightGames(e) && (r.returnState = !0);
}
if (hs.tp.isClassDefaultBoard_ProxyProduceDefaultBoardTurnAround(r)) {
e = hs.classGameInfo.gameNum;
i.isInFirstEightGames(e) && (r.returnState = !0);
}
if (hs.tp.isClassBlocksProducer_ProxyGuideRequestBlocksProducer(r)) {
var o = hs.classGameInfo, s = (e = o.gameNum, o.roundNum);
if (this.fixGameNum && e < 1) return;
var a = i.getFirstEightGameConfig(e + 1, this.fixGameNum);
Cinst(hs.BlocksProducer).setState({
producerBlocks: a.producerBlocks,
colors: a.blocksColors
});
storage.setItem("classFaceBlocks", a.boardData);
storage.setItem("classProducerBlocks", a.producerBlocks);
hs.EventManager.dispatchModuleEvent(new hs.E_ClassBoard_Render(a.boardData));
r.replace = !0;
}
if (hs.tp.isClassBlocksProducer_BlocksProducerValidate_ProxyOnBoardSplashAnimationEnd(r)) {
var n = hs.classGameInfo;
e = n.gameNum, s = n.roundNum;
if (!i.isInFirstEightGames(e)) return;
if (0 !== s) return;
t = e + 1;
if (!(a = i.getFirstEightGameConfig(t, this.fixGameNum))) return;
storage.setItem("classProducerBlocks", a.producerBlocks);
hs.classColorProducerGameInfo.setColorList(a.blocksColors);
}
if (hs.tp.isClassBlocksProducer_BlocksProducerValidate_ProxySetRecordOperationColor(r)) {
var c = hs.classGameInfo;
e = c.gameNum, s = c.roundNum;
if (!i.isInFirstEightGames(e)) return;
if (0 === s) {
r.returnState = !0;
r.replace = !0;
}
}
};
return a([ classId("FirstEightGamesFixedBoardTrait") ], e);
}(Trait);
t.FirstEightGamesFixedBoardTrait = n;
cc._RF.pop();
}, {
"./FirstEightGamesConfig": "FirstEightGamesConfig"
} ]
}, {}, [ "FirstEightGamesConfig", "FirstEightGamesFixedBoardTrait" ]);