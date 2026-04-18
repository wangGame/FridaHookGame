function(t, e) {
t || i && (i.getComponent(cc.Sprite).spriteFrame = e);
});
cc.tween(i).to(.2, {
opacity: 255
}, {
easing: "backOut"
}).to(2, {
opacity: 0
}, {
easing: "backIn"
}).call(function