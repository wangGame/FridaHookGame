function() {
var t = this.state.eliminateCount;
return t <= 2 ? 1 : Math.min(t - 1, 5);
};
e.prototype.playAnimation = function() {
return n(this, void 0, Promise, function() {
var t = this;
return s(this, function() {
g.gameInfo.gameMode, y.GameMode.Class;
if (this.state.eliminateCount <= 0) return [ 2 ];
setTimeoutSafe(function() {
t.playFrameEffect();
t.playBgAnimation();
t.playScreenShake();
t.playBoardEffect();
}, 100);
return [ 2 ];
});
});
};
e.prototype.playScreenShake = function() {
var t, e = this.getEliminateEffectLevel();
if (!(e < 2)) {
var o = null !== (t = [ 0, 0, 4, 4, 6, 8 ][e]) && void 0 !== t ? t : 8;
u.shake.startWithAmplitude(.33, o, .066);
}
};