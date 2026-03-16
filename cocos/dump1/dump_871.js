function() {
var t, e = this.getEliminateEffectLevel();
if (!(e < 2)) {
var o = null !== (t = [ 0, 0, 4, 4, 6, 8 ][e]) && void 0 !== t ? t : 8;
u.shake.startWithAmplitude(.33, o, .066);
}
};