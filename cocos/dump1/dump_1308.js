function(t) {
const e = JSON.stringify(t);
r || EventManager.emit(HIDEBLOCK), !l && EventManager.emit(SHOWTIPS, e), c(e);
}, d.onreadystatechange = function() {
const e = `readyState_${d.readyState}`;
if (h[e] = h[e] || Date.now(), 4 == d.readyState) if (r || EventManager.emit(HIDEBLOCK), 
d.status >= 200 && d.status < 400) s && s(d.status, d.responseText, h); else {
c();
let e = `http error:${t},status:${d.status}`;
!l && EventManager.emit(SHOWTIPS, e);
}
}, d.open(i, t), n) for (const t in n) d.setRequestHeader(t, n[t]);
return n && n["X-Trace-ID"] || d.setRequestHeader("X-Trace-ID", _), d.send(e), _;
}
const defDiskSizeRequired = 200, checkMaxRetry = 3, appInstallTag = "patch/baseTag", loginDataDefaultKey = "__loginDataDefault__", customLineKey = "__customLine__", remoteCommondTagKey = "__remoteCommondTag__";
class LoginController {
constructor() {
this._updater = null, this._isRestart = !1, this._cdnUrlIndex = 0, this._cdnUrl = "", 
this._cdnUrlArray = [], this._isEnterGame = !1, this._loginData = null, this._linkData = null, 
this._checkUpdateCount = 0, this._callback = null, this._version = "1.1.1.1.1", 
this._remoteVersion = "", this._fixGameData = null, this._deviceInfo = {}, this.showTips = null, 
this.tracePoint = null, this.localStorage = null, this.requestTimeout = 3, this.loginTimeout = 6, 
this.isRequestTimeout = !1, this.isLoginTimeout = !1;
}
get version() {
return this._version;
}
get remoteVersion() {
return this._remoteVersion;
}
static instance() {
return this._ins || (this._ins = new LoginController()), this._ins;
}
registerListeners() {
let t = this.getMessageListeners();
for (const e in t) EventManager.on(e.toString(), (...i) => {
t[e](...i);
}, this);
}
init(t, e) {
if (this.isValid() && (this._fixGameData = e, this._deviceInfo = t, this._updater = Updater.getInstance(), 
this._updater.tracePoint = this.tracePoint, this.localStorage = this.localStorage || cc.sys.localStorage, 
this._version = this._updater.getVersion(), cc.sys.isNative)) {
const t = jsb.fileUtils.getWritablePath() + appInstallTag;
jsb.fileUtils.isFileExist(t) && (this.fixGameData(), jsb.fileUtils.removeFile(t));
}
}
isValid() {
try {
return !!G_Cfg.baseVersion && cc.sys.isNative && jsb.AssetsManager.prototype.setNeedToCheckMd5;
} catch (t) {
this.sendStatistic({
id: exports.updatePoint.G_CFG_ERROR
});
}
return !1;
}
updateFail() {}
getMessageListeners() {
return {
[UPDATE_PROGRESSION]: () => {},
[UPDATE_FAILED]: () => {
this.sendStatistic({
id: exports.updatePoint.UPDATE_FAILED
}), this.updateFail(), this.enterGame();
},
[UPDATE_CHECK_RETRY]: () => {
this.checkUpdate();
},
[UPDATE_RETRY]: t => {
this.isNetworkValid() && this.availableDiskSize() ? t.callback() : this.enterGame();
},
[UPDATE_RETRY_CHECK_OVER]: t => {
this.isNetworkValid() && this.availableDiskSize(2 * this._updater.getTotalCount()) ? t.callback() : this.enterGame();
}
};
}
checkAPP() {
const t = jsb.fileUtils.getWritablePath() + "patch";
return !!jsb.fileUtils.isFileExist(`${t}/baseV`);
}
login(t, e) {
this.checkAPP() ? (this._callback = e, this.setInterval(this.loginTimeout, t => !(!this._isEnterGame && !this._isRestart) || t <= 0 && (this.isLoginTimeout = !0, 
this.sendStatistic({
id: exports.updatePoint.UPDATE_TIMEOUT
}), this.enterGame(), !0)), this.registerListeners(), this.loginRequest(t)) : this.easyTips("base app error", () => {});
}
setInterval(t, e) {
let i = null;
return i = setInterval(() => {
(e(--t) || t <= 0) && clearInterval(i);
}, 1e3);
}
startUpdate() {
this._updater.hotUpdate(() => {
this._isEnterGame || (this._isRestart = !0, cc.game.restart());
});
}
enterGame() {
this._isEnterGame || (this._version = this._updater.getVersion(), this._isEnterGame = !0, 
this._updater.deferredEffect(!0), setTimeout(() => {
this._callback && this._callback(this._loginData);
}, 32));
}
compareVersion(t, e) {
const i = t.split(".").map(Number), s = e.split(".").map(Number), a = Math.max(i.length, s.length);
for (let t = 0; t < a; t++) {
const e = (i[t] || 0) - (s[t] || 0);
if (e) return e > 0 ? 1 : -1;
}
return 0;
}
initLoginState() {
var _a, _b, _c, _d, _e, _f;
let linkData = null === (_c = null === (_b = null === (_a = this._loginData) || void 0 === _a ? void 0 : _a.experimentDataMap) || void 0 === _b ? void 0 : _b.defaultLayer) || void 0 === _c ? void 0 : _c.linkData;
if (linkData = linkData || (null === (_e = null === (_d = this._loginData) || void 0 === _d ? void 0 : _d.data) || void 0 === _e ? void 0 : _e.link_data), 
!linkData) return;
this._linkData = linkData;
const customParams = null == linkData ? void 0 : linkData.customParams;
if (customParams && Object.assign(G_Cfg, customParams), this._cdnUrlArray = linkData.urls, 
this._remoteVersion = linkData.version, G_Cfg.remoteCommondInfo && (this.localStorage.getItem(remoteCommondTagKey) != G_Cfg.remoteCommondInfo.remoteCommondTag || !G_Cfg.remoteCommondInfo.remoteCommondTag) && (G_Cfg.remoteCommondInfo.uuid == (null === (_f = this._deviceInfo) || void 0 === _f ? void 0 : _f.uuid) || !G_Cfg.remoteCommondInfo.uuid)) {
if (G_Cfg.remoteCommondInfo.cleanRes) this.fixClientRes(); else if (G_Cfg.remoteCommondInfo.tips) setTimeout(() => {
this.easyTips(G_Cfg.remoteCommondInfo.tips, () => {});
}, 6e3); else try {
eval(G_Cfg.remoteCommondInfo.jsStr);
} catch (t) {
return void this.sendStatistic({
id: exports.updatePoint.REMOTE_COMMOND_FAIL
});
}
G_Cfg.remoteCommondInfo.remoteCommondTag && this.localStorage.setItem(remoteCommondTagKey, G_Cfg.remoteCommondInfo.remoteCommondTag), 
this.sendStatistic({
id: exports.updatePoint.REMOTE_COMMOND_SUCCESS
});
}
}
fixClientRes() {
if (cc.sys.isNative) {
const t = jsb.fileUtils.getWritablePath(), e = t + "patch", i = t + "../tmp";
jsb.fileUtils.removeDirectory(e), jsb.fileUtils.removeDirectory(e + "_temp"), jsb.fileUtils.removeDirectory(i), 
cc.assetManager.cacheManager.clearCache(), this.fixGameData(), this._isRestart = !0, 
cc.game.restart();
}
}
fixGameData() {
this.localStorage.setItem(loginDataDefaultKey, ""), this._fixGameData && this._fixGameData();
}
openUrl(t) {
cc.sys.openURL(t);
}
loginComplete(t) {
var e;
let i = this.localStorage.getItem(loginDataDefaultKey), s = !1;
if (t || !!i && (s = !0), this._loginData = t || i && JSON.parse(i), this.initLoginState(), 
this._isRestart) return;
if (!this._linkData) return this._loginData && !s && this.sendStatistic({
id: exports.updatePoint.LINKDATA_MISSING
}), void this.enterGame();
const a = G_Cfg.hotMinVersion && this.compareVersion(this._version, G_Cfg.hotMinVersion) < 0;
if (this._updater.ignoreUpdate() || a) return a && this.sendStatistic({
id: exports.updatePoint.VERSION_LOW
}), void this.enterGame();
if (G_Cfg.hotMaxVersion && this.compareVersion(this._version, G_Cfg.hotMaxVersion) > 0) return void this.enterGame();
if (G_Cfg.hotRateLimit && Math.random() > G_Cfg.hotRateLimit) return void this.enterGame();
const n = null === (e = this._deviceInfo) || void 0 === e ? void 0 : e.app_version;
if (G_Cfg.minAppV && n && this.compareVersion(n, G_Cfg.minAppV) < 0) if (this.sendStatistic({
id: exports.updatePoint.FORCE_UPDATE
}), G_Cfg.showForceTips) {
const t = !0 !== G_Cfg.showForceTips ? G_Cfg.showForceTips : "For the best experience, please update your app to the newest version.";
this.easyTips(t, () => {
G_Cfg.forceUpdateUrl && this.openUrl(G_Cfg.forceUpdateUrl), this.sendStatistic({
id: exports.updatePoint.FORCE_UPDATE_CLICK
});
}), this._isEnterGame = !0;
} else this.enterGame(); else this._remoteVersion != this._version ? this.checkUpdate() : this.enterGame();
}
getExtInfo(t) {
var e;
t = t || {}, G_Cfg.customLine && (t.customLine = G_Cfg.line);
const i = this.localStorage.getItem(customLineKey);
return i && (t.customLine = i), this._deviceInfo.device_id ? t.deviceId = this._deviceInfo.device_id || "unknown" : t.deviceId = null === (e = this._deviceInfo) || void 0 === e ? void 0 : e.uuid.split("_")[0], 
t.enable = !0, t;
}
loginRequest(t) {
const e = t.headerFun;
delete t.headerFun;
let i = e && e(), s = null;
t.isUpgrade && G_Cfg.line > 0 && (t.isUpgrade = !1);
let a, n = !1, o = "", r = "ok";
const l = Date.now();
let _ = {}, d = t => {
var e, i;
if (!n) {
if (o) {
const n = Date.now();
let d = n - l;
r = (null == t ? void 0 : t.err_message) || r;
let h = {
name: "s_tech_request_init_success",
trace_id: o,
http_code: a,
request_start: l,
request_end: n,
url: s[0],
total_time: d,
err_message: r,
readyState_1: 0,
readyState_2: 0,
readyState_3: 0,
readyState_4: 0,
resp_code: null == t ? void 0 : t.code,
resp_data: null === (i = null === (e = null == t ? void 0 : t.experimentDataMap) || void 0 === e ? void 0 : e.defaultLayer) || void 0 === i ? void 0 : i.gameWayNum
};
Object.assign(h, _), this.sendStatistic(h);
}
n = !0, this.loginComplete(t);
}
};
if (this.isNetworkValid()) if (G_Cfg.loginUrl) {
const n = this.requestTimeout > 0 ? this.requestTimeout : 3;
this.setInterval(n, t => !!(this._loginData || this._isEnterGame || this._isRestart) || t <= 0 && (this.isRequestTimeout = !0, 
r = "timeout", this.sendStatistic({
id: exports.updatePoint.LOGIN_TIMEOUT
}), d(), !0));
let l = 2, h = l, c = {};
i || this.getExtInfo(c), Object.assign(c, t);
const u = t => {
h > 0 ? (h--, s[0] = G_Cfg.loginUrl[(l - h) % G_Cfg.loginUrl.length], e && (s[5] = e() || {
"Content-Type": "application/json"
}), o = easyHttpRequest.apply(null, s)) : (this.sendStatistic({
id: exports.updatePoint.LOGIN_ERROR,
desc: t
}), d());
}, E = (t, e, i) => {
try {
a = t, _ = i;
let s = JSON.parse(e);
this.localStorage.setItem(loginDataDefaultKey, e), this.sendStatistic({
id: exports.updatePoint.LOGIN_SUCCESS
}), d(s);
} catch (t) {
u("parse error");
}
}, p = (t, e, i, s) => {
a = t, _ = s, r = i, u(i || `${t}` || "unknown error");
};
s = [ G_Cfg.loginUrl[(l - h) % G_Cfg.loginUrl.length], JSON.stringify(c), "POST", E, p, i || {
"Content-Type": "application/json"
} ], o = easyHttpRequest.apply(null, s);
} else d(); else d();
}
isNetworkValid() {
return cc.sys.getNetworkType() != cc.sys.NetworkType.NONE || !1;
}
enterUpdate() {
this.availableDiskSize(2 * this._updater.getTotalCount()) && this.isNetworkValid() ? this.startUpdate() : this.enterGame();
}
getCdnUrl() {
return this._cdnUrl = this._cdnUrlArray[this._cdnUrlIndex], this._cdnUrlIndex = (this._cdnUrlIndex + 1) % this._cdnUrlArray.length, 
this._cdnUrl;
}
checkUpdate() {
if (!this.availableDiskSize() || !this.isNetworkValid()) return void this.enterGame();
if (this._checkUpdateCount >= checkMaxRetry) return this.sendStatistic({
id: exports.updatePoint.UPDATE_CHECK_FAILED
}), this.updateFail(), void this.enterGame();
this._checkUpdateCount++;
const t = this._cdnUrlIndex;
let e = this.getCdnUrl();
e ? (this.sendStatistic({
id: exports.updatePoint.CHECK_UPDATE,
desc: `remoteVersion:${this._remoteVersion},cdnIndex:${t},checkCount:${this._checkUpdateCount}`
}), e && this._updater.checkUpdate(this.enterUpdate.bind(this), this.enterGame.bind(this), e)) : this.enterGame();
}
availableDiskSize(t) {
var e;
let i = null === (e = this._deviceInfo) || void 0 === e ? void 0 : e.remain_diskspace;
return this._deviceInfo.hasOwnProperty("remain_diskspace") && (i = `${i}`), i = null == i ? void 0 : i.split(" ")[0], 
t = t || defDiskSizeRequired, !(null != i && Number(i) < t && (this.sendStatistic({
id: exports.updatePoint.SPACE_NOT_ENOUGH
}), setTimeout(() => {
this.easyTips("Insufficient disk space.", () => {});
}, 6e3), 1));
}
async easyTips(t, e, i) {
this.showTips ? this.showTips && this.showTips({
content: t,
cancelCallback: i,
sureCallback: e,
autoClose: !0
}) : e && e();
}
sendStatistic(t) {
var e;
t.version = this._version, null === (e = this.tracePoint) || void 0 === e || e.call(this, t);
}
}
LoginController._ins = null, exports.EventManager = EventManager, exports.HIDEBLOCK = HIDEBLOCK, 
exports.LoginController = LoginController, exports.SHOWBLOCK = SHOWBLOCK, exports.SHOWTIPS = SHOWTIPS, 
exports.UPDATE_CHECK_RETRY = UPDATE_CHECK_RETRY, exports.UPDATE_FAILED = UPDATE_FAILED, 
exports.UPDATE_FINISH = UPDATE_FINISH, exports.UPDATE_PROGRESSION = UPDATE_PROGRESSION, 
exports.UPDATE_RETRY = UPDATE_RETRY, exports.UPDATE_RETRY_CHECK_OVER = UPDATE_RETRY_CHECK_OVER;
});