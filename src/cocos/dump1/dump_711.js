function() {
return o(this, void 0, Promise, function() {
return a(this, function() {
this._isPushValid = this.isPushValid();
return [ 2 ];
});
});
};
t.prototype.onActive = function(e) {
if (hs.tp.isLaunchChangeLaunchScene(e)) {
if (!this._isPushValid) return;
if (this.isEnterFromPush) {
e.args[0] = "class";
e.returnState = !0;
}
}
if (hs.tp.isSkin_ProxyLoadSkinCfgComplete(e)) {
this._isLoadSkinCfgComplete = !0;
this._isFirstChangeSkin = hs.skinInfo.currentSkinId === hs.skinInfo.originSkinId;
this.tryPush();
}
hs.tp.isClassGame_ProxyOnGameStart(e);
if (hs.tp.isIsOpenChangeSkinTraitChangeSkinBlockCompelet(e)) {
if (!this._isLoadSkinCfgComplete) {
this._isLoadSkinCfgComplete = !0;
this._isFirstChangeSkin = hs.skinInfo.currentSkinId === hs.skinInfo.originSkinId;
}
this.tryPush(!0);
}
};
t.prototype.isPushValid = function() {
return hs.NativeSudokuIPAUtils.checkAppFuncSupport(hs.E_APP_FUNC_VERSION.NOTICE_PUSH_VERSION);
};
Object.defineProperty(t.prototype, "isEnterFromPush", {
get: function() {
var e, t;
if (this._hasCheckEnterFromPush) return this._isEnterFromPush;
var n = !1, r = hs.NativeAppCenterInterface.noticeAppGetOpenAppOpeway(), i = this.props.opewaynum;
(null === (e = null == r ? void 0 : r.click) || void 0 === e ? void 0 : e.length) > 0 ? i.includes(r.click) && (n = !0) : (null === (t = null == r ? void 0 : r.show) || void 0 === t ? void 0 : t.length) > 0 && r.show.some(function(e) {
return i.includes(e.opewaynum);
}) && (n = !0);
this._isEnterFromPush = n;
this._hasCheckEnterFromPush = !0;
return this._isEnterFromPush;
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(t.prototype, "dataSkinChangeAblePush", {
get: function() {
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