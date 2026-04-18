function(t) {
e.onAdCallback(t);
});
i.onNativeReponse("adxAdCallback", function(t) {
e.onAdxAdCallback(t);
});
i.onNativeReponse("callBackAdWayNum", function(t) {
e.onCallBackAdWayNum(t);
});
};
t.prototype.onCallBackAdWayNum = function(e) {
c.adxModelReplaceAdCtrl.setPromotionState(e.result, e.cur_adwaynum);
};
t.prototype.onAdxAdCallback = function() {};
t.prototype.onGetDecisionInfo = function() {};
t.prototype.onGetFirstAdEcpm = function(e) {
l.adxModelNativeInfo._firstInterEcpm = e.ecpm;
};
t.prototype.onAdCallback = function() {};
return t;
}(a.Proxy);
o.AdxModel_Native_Proxy = s;
cc._RF.pop();
}, {
"../../../falcon/Proxy": "Proxy",
"../../native/NativeReceivedNative": "NativeReceivedNative",
"../vo/AdxModelNativeInfo": "AdxModelNativeInfo",
"../vo/AdxModelReplaceAdCtrl": "AdxModelReplaceAdCtrl"
} ],
AesGcmCompat: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "e1fe7zjZchB2ZVc39tats4c", "AesGcmCompat");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.AesGcmCompat = void 0;
var r = function() {
function e() {}
e.utf8Encode = function(e) {
if ("undefined" != typeof TextEncoder) return new TextEncoder().encode(e);
for (var t = [], o = 0; o < e.length; o++{"#type":"track","#time":"2026-02-28 18:40:43.824","#distinct_id":"e7e5e7bf-6ec9-451b-b6e7-e6f66039672d","#event_name":"s_channel_result","properties":{"#lib_version":"2.8.3","#carrier":"","#os":"Android","#device_id":"eb48ccd23c8bcf34","#screen_height":1920,"#bundle_id":"com.block.juggle","#device_model":"SM-C5000","#screen_width":1080,"#system_language":"zh","#install_time":"2026-02-28 14:16:01.056","#simulator":false,"#lib":"Android","#manufacturer":"samsung","#os_version":"8.0.0","#app_version":"9.2.5","#fps":59,"session_id":"598bcfd0-45ec-4a83-b62c-d6157f10f98c","s_app_version_code":"9250","s_app_type":"normal","s_rn_force_new":182,"app_start_count_by_current_version":5,"s_ad_api_version":164,"s_from_source":"icon","abtestResult_v2":{"id":[],"name":[],"new_id":[],"new_name":[],"base_id":[]},"s_ad_crwaynum":["CRYWA1_5209"],"s_ad_public_ad_from":"block:unNormal","s_ad_public_adwaynum_array":[],"s_ad_installtime_hour":5,"s_ad_public_adwaynum":99037,"s_ad_rn_api_version":"1.9.9","s_ad_rn_bundleversion":"1.0.76","s_ad_rn_bundle_tag":"inner","s_lowest_adwaynum":"","#network_type":"WIFI","#ram":"2.2\/3.5","#disk":"46.7\/54.2","#device_type":"Phone","scene_type":"appLaunch","scene_msg":"桌面图标","scene_ext":"","#zone_offset":8},"#uuid":"9888335d-fbcc-4879-83c0-9f458bce5c1f"}#td#-13733957