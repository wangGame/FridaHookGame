function() {
"use strict";
var t = "undefined" == typeof window ? global : window;
function e(e, i) {
"undefined" == typeof t[e] && Object.defineProperty(t, e, {
get: function() {
var t;
"CC_WECHATGAMESUB" === e ? t = "cc.sys.platform === cc.sys.WECHAT_GAME_SUB" : "CC_WECHATGAME" === e ? t = "cc.sys.platform 