function(t) {
p.tp.isBoardEffect_Launch_ProxyOnGameInitComplete(t) && l.preloadTraitInfo.add({
traitClassName: "$14605_f_ClearBoardEffectOptimizeTrait",
url: c.AudioConfig.all_clean_new.url,
type: cc.AudioClip,
bundleName: c.AudioConfig.all_clean_new.bundleName
});
p.tp.isFeatclearscreenbombTraitPlayCleanAudio(t) && n.audioInfo.play(c.AudioConfig.all_clean_new);
p.tp.isFeatclearscreenbombTraitGetChangeSpeed(t) && (t.args[0] = t.args[0] / 1.25);
if (p.tp.isFeatclearscreenbombTraitIsChangeParentNode(t)) {
t.returnValue = !0;
t.returnState = !0;
}
};
return a([ classId("$14605_f_ClearBoardEffectOptimizeTrait") ], e);
}(s.Trait);
o.$14605_f_ClearBoardEffectOptimizeTrait = u;
cc._RF.pop();
}, {
"../../../../../../../scripts/base/audio/AudioIn