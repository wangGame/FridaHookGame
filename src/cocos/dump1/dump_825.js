function(t) {
t || (this.tryTimes = this.tryTimes + 1);
this.nextRoundCanChangeSkin = t && this.tryTimes >= this.props.chapterTryTime;
this.nextRoundCanChangeSkin && this.preloadSkin();
t && (this.tryTimes = 0);
};
e.prototype.preloadSkin = function() {
if (!this.skinId) {
var t = y.skinRandomInfo.getRan