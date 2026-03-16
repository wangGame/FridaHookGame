function(e, t, n, r) {
return new (n || (n = Promise))(function(i, s) {
function o(e) {
try {
h(r.next(e));
} catch (e) {
s(e);
}
}
function a(e) {
try {
h(r.throw(e));
} catch (e) {
s(e);
}
}
function h(e) {
e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n(function(e) {
e(t);
})).then(o, a);
var t;
}
h((r = r.apply(e, t || [])).next());
});
}, a = this && this.__generator || function(e, t) {
var n, r, i, s, o = {
label: 0,
sent: function() {
if (1 & i[0]) throw i[1];
return i[1];
},
trys: [],
ops: []
};
return s = {
next: a(0),
throw: a(1),
return: a(2)
}, "function" == typeof Symbol && (s[Symbol.iterator] = function() {
return this;
}), s;
function a(e) {
return function(t) {
return h([ e, t ]);
};
}
function h(s) {
if (n) throw new TypeError("Generator is already executing.");
for (;o; ) try {
if (n = 1, r && (i = 2 & s[0] ? r.return : s[0] ? r.throw || ((i = r.return) && i.call(r), 
0) : r.next) && !(i = i.call(r, s[1])).done) return i;
(r = 0, i) && (s = [ 2 & s[0], i.value ]);
switch (s[0]) {
case 0:
case 1:
i = s;
break;

case 4:
o.label++;
return {
value: s[1],
done: !1
};

case 5:
o.label++;
r = s[1];
s = [ 0 ];
continue;

case 7:
s = o.ops.pop();
o.trys.pop();
continue;

default:
if (!(i = o.trys, i = i.length > 0 && i[i.length - 1]) && (6 === s[0] || 2 === s[0])) {
o = 0;
continue;
}
if (3 === s[0] && (!i || s[1] > i[0] && s[1] < i[3])) {
o.label = s[1];
break;
}
if (6 === s[0] && o.label < i[1]) {
o.label = i[1];
i = s;
break;
}
if (i && o.label < i[2]) {
o.label = i[2];
o.ops.push(s);
break;
}
i[2] && o.ops.pop();
o.trys.pop();
continue;
}
s = t.call(e, o);
} catch (e) {
s = [ 6, e ];
r = 0;
} finally {
n = i = 0;
}
if (5 & s[0]) throw s[1];
return {
value: s[0] ? s[1] : void 0,
done: !0
};
}
}, h = this && this.__read || function(e, t) {
var n = "function" == typeof Symbol && e[Symbol.iterator];
if (!n) return e;
var r, i, s = n.call(e), o = [];
try {
for (;(void 0 === t || t-- > 0) && !(r = s.next()).done; ) o.push(r.value);
} catch (e) {
i = {
error: e
};
} finally {
try {
r && !r.done && (n = s.return) && n.call(s);
} finally {
if (i) throw i.error;
}
}
return o;
};
Object.defineProperty(n, "__esModule", {
value: !0
});
n.SkinChangeAblePushTrait = void 0;
var u = function(e) {
i(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t._dataSkinChangeAblePush = null;
t._isFirstChangeSkin = !0;
t._isLoadSkinCfgComplete = !1;
t._isEnterFromPush = !1;
t._hasCheckEnterFromPush = !1;
t._isPushValid = !0;
return t;
}
t.prototype.registerTraitEventsMethods = function() {
return [ {
className: "Skin_Proxy",
methodName: "loadSkinCfgComplete"
}, {
className: "ClassGame_Proxy",
methodName: "onGameStart"
}, {
className: "IsOpenChangeSkinTrait",
methodName: "changeSkinBlockCompelet"
} ];
};
t.prototype.onCreate = function() {
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