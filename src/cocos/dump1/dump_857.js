function(t, r) {
e.loadIcon(cc.find("nodeRoot/spIcon", t.node).getComponent(cc.Sprite), "icon_" + o[r].resName);
e.loadIcon(cc.find("nodeRoot/spName", t.node).getComponent(cc.Sprite), "txt_" + o[r].resName);
});
};
e.prototype.initTweenItem = function() {
this.gameListItemContainer.getComponent(cc.Layout).updateLayout();
this.gameListItemContainer.getComponent(cc.Layout).enabled = !1;
this.gameListItems.forEach(function(t) {
var e = t.node.addComponent(u.HomePageTweenPageItem);
e.realX = t.node.position.