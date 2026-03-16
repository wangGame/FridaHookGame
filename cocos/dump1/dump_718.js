function() {
this._dataSkinChangeAblePush || (this._dataSkinChangeAblePush = storage.getItem("SkinChangeAblePushTraitData", {
lastPushZeroTime: 0,
pushType: 0,
hasPushZeroTriggered: !1
}));
return this._dataSkinChangeAblePush;
},
enumerable: !1,
configurable: !0
});
t.prototype.saveDataSkinChangeAblePush = function() {
storage.setItem("SkinChangeAblePushTraitData", this.dataSkinChangeAblePush);
};
t.prototype.tryPush = function(e) {
void 0 === e && (e = !1);
var t = hs.getCurentDate().getTime() / 1e3, n = this._isFirstChangeSkin && !e ? 0 : 1, r = this.dataSkinChangeAblePush, i = r.lastPushZeroTime, s = r.pushType, o = r.hasPushZeroTriggered;
if (0 === n && o) ; else {
var a = this.getPushTimeMs(this.props.pushTime) + (e ? 864e5 : 0), h = new Date(a);
h.setHours(0, 0, 0, 0);
var u = Math.floor(h.getTime() / 1e3);
if (i > 0 && s == n) if (e) {
if (i >= u) return;
} else if (t < i + 259200) return;
e && this.dotCancelPush(this.dataSkinChangeAblePush.pushType);
var l = this.props.opewaynum[n], p = this.props.taskType[n];
this.dataSkinChangeAblePush.lastPushZeroTime = u;
this.dataSkinChangeAblePush.pushType = n;
0 === n && (this.dataSkinChangeAblePush.hasPushZeroTriggered = !0);
this.saveDataSkinChangeAblePush();
hs.NativeAppCenterInterface.noticeAppCommonSendPush({
opewaynum: l,
taskType: p,
sendTime: a
});
}
};
t.prototype.tryCancelPush = function() {
hs.NativeAppCenterInterface.noticeAppCommonRemovePush();
this.dotCancelPush(this.dataSkinChangeAblePush.pushType);
};
t.prototype.dotCancelPush = function(e) {
0 === e ? DS("usr_data_push_remove", {
new_skin_unlock_push_remove: 1
}) : DS("usr_data_push_remove", {
new_skin_update_push_delay: 1
});
};
t.prototype.getPushTimeMs = function(e) {
var t = h(e.split(":").map(Number), 3), n = t[0], r = t[1];
t[2];
(isNaN(n) || n > 24 || n < 0) && (n = 0);
(isNaN(r) || r > 60 || r < 0) && (r = 0);
var i = new Date();
i.setHours(n, r, 0, 0);
return Math.floor(i.getTime());
};
return s([ classId("SkinChangeAblePushTrait") ], t);
}(Trait);
n.SkinChangeAblePushTrait = u;
cc._RF.pop();
}, {} ]
}, {}, [ "SkinChangeAblePushTrait" ]);