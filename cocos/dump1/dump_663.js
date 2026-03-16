function() {
n.funcDelayExec(0, function() {
if (cc.isValid(n.bundleLoadingNode) && cc.isValid(n.maskNode) && cc.isValid(n.loadingNode)) {
n.bundleLoadingNode.node.active = !1;
n.maskNode.active = !1;
n.loadingNode.active = !1;
}
});
}, this);
}
} else if (this.state.loadingState === hs.GLMoreGameLoadingState.NoNet && cc.isValid(this.loadingNode) && cc.isValid(this.maskNode) && cc.isValid(this.netNode) && cc.isValid(this.bundleLoadingNode)) {
this.loadingNode.active = !0;
this.maskNode.active = !0;
this.netNode.node.active = !0;
this.bundleLoadingNode.node.active = !1;
this.netNode.playAnimation("check_net", 1);
this.netNode.once(dragonBones.EventObject.COMPLETE, function() {
n.funcDelayExec(0, function() {
if (cc.isValid(n.netNode) && cc.isValid(n.maskNode) && cc.isValid(n.loadingNode)) {
n.netNode.node.active = !1;
n.maskNode.active = !1;
n.loadingNode.active = !1;
}
});
}, this);
}
return [ 2 ];
});
});
};
t.prototype.funcDelayExec = function(e, t) {
t && (e <= 0 ? t() : setTimeoutSafe(function() {
t();
}, e));
};
a([ d(cc.Node) ], t.prototype, "loadingNode", void 0);
a([ d(cc.Node) ], t.prototype, "maskNode", void 0);
a([ d(dragonBones.ArmatureDisplay) ], t.prototype, "netNode", void 0);
a([ d(dragonBones.ArmatureDisplay) ], t.prototype, "bundleLoadingNode", void 0);
return a([ l ], t);
}(hs.Component);
n.NodeClassGameOverShowMiniGameIconLoadingCom = m;
cc._RF.pop();
}, {} ]
}, {}, [ "GameOverShowMiniGameIconTrait", "NodeClassGameOverShowMiniGameIconCom", "NodeClassGameOverShowMiniGameIconLoadingCom", "GameOverShowMiniGameIconConst", "IGameOverShowMiniGameIcon" ]);