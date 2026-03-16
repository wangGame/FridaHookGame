function(t) {
return t && t.__esModule ? t : {
default: t
};
};
window.__classPrivateFieldGet = function(t, e) {
if (!e.has(t)) throw new TypeError("attempted to get private field on non-instance");
return e.get(t);
};
window.__classPrivateFieldSet = function(t, e, i) {
if (!e.has(t)) throw new TypeError("attempted to set private field on non-instance");
e.set(t, i);
return i;
};
}), {} ],
337: [ (function() {
"use strict";
var t = "undefined" == typeof window ? global : window;
function e(e, i) {
"undefined" == typeof t[e] && Object.defineProperty(t, e, {
get: function() {
var t;
"CC_WECHATGAMESUB" === e ? t = "cc.sys.platform === cc.sys.WECHAT_GAME_SUB" : "CC_WECHATGAME" === e ? t = "cc.sys.platform 