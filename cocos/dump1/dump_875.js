function(t) {
var e = n.storage.getItem("classGuideStep", 0);
if (l.tp.isLaunch_ProxyOnTraitConfigInitComplete(t)) {
this.applyGuideStepConfigs();
var o = this.getTargetStep();
if (o < 0 || e >= o) return;
n.storage.setItem("classGuideStep", o);
}
l.tp.isClassGuide_ProxyRenderGuideState(t);
};
e.prototype.applyGuideStepConfi