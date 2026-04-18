function() {
s.NativeActivity.openActivityUrl(this.state.acturl);
DS("ui_marketing_activity_png_click");
};
t.prototype.onPage = function(e) {
if (!this.isTouchMove()) {
s.NativeActivity.openVideoUrl(this.state.videos[e]);
DS("ui_marketing_activity_png_click");
return !0;
}
};
t.prototype.onOpenUrl = function() {
s.NativeActivity.openActivityUrl(this.state.acturl);
DS("ui_marketing_activity_button_click", {
location: 1
});
};
a([ p(cc.Button) ], t.prototype, "btnOpen", void 0);
a([ p([ cc.Node ]) ], t.prototype, "pages", void 0);
a([ p(cc.Node) ], t.prototype, "pageOne", void 0);
a([ p(cc.Node) ], t.prototype, "scrollNode", void 0);
a([ p(cc.Node) ], t.prototype, "slide", void 0);
a([ p(cc.Node) ], t.prototype, "left", void 0);
a([ p(cc.Node) ], t.prototype, "right", void 0);
a([ l.throttle(300) ], t.prototype, "onOpenUrl", null);
return a([ classId("AddActivityCommonStart"), d, classMethodWatch() ], t);
}(i.default);
o.default = h;
cc._RF.pop();
}, {
"../../../base/components/Component": "Component",
"../../../base/decorators/DecoratorThrottle": "DecoratorThrottle",
"../../../base/loader/ResLoader": "ResLoader",
"../../native/NativeActivity": "NativeActivity",
"./AddActivityCommonUIScrollSelect": "AddActivityCommonUIScrollSelect"
} ],
AddActivityCommonUIScrollSelect: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "6481d6zpkJI0bA8SNlcn0IG", "AddActivityCommonUIScrollSelect");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), a = this && this.__decorate || function(e, t, o, r) {
var n, a = arguments.length, i = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, o, r); else for (var l = e.length - 1; l >= 0; l--) (n = e[l]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, o, i) : n(t, o)) || i);
return a > 3 && i && Object.defineProperty(t, o, i), i;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.EventType = void 0;
var i, l = e("../../../base/components/Component"), c = cc._deco{"#type":"track","#time":"2026-02-28 18:40:43.770","#distinct_id":"e7e5e7bf-6ec9-451b-b6e7-e6f66039672d","#event_name":"s_app_listener_catch","properties":{"#lib_version":"2.8.3","#carrier":"","#os":"Android","#device_id":"eb48ccd23c8bcf34","#screen_height":1920,"#bundle_id":"com.block.juggle","#device_model":"SM-C5000","#screen_width":1080,"#system_language":"zh","#install_time":"2026-02-28 14:16:01.056","#simulator":false,"#lib":"Android","#manufacturer":"samsung","#os_version":"8.0.0","#app_version":"9.2.5","#fps":59,"session_id":"598bcfd0-45ec-4a83-b62c-d6157f10f98c","s_app_version_code":"9250","s_app_type":"normal","s_rn_force_new":182,"app_start_count_by_current_version":5,"s_ad_api_version":164,"s_from_source":"icon","abtestResult_v2":{"id":[],"name":[],"new_id":[],"new_name":[],"base_id":[]},"s_ad_crwaynum":["CRYWA1_5209"],"s_ad_public_ad_from":"block:unNormal","s_ad_public_adwaynum_array":[],"s_ad_installtime_hour":5,"s_ad_public_adwaynum":99037,"s_ad_rn_api_version":"1.9.9","s_ad_rn_bundleversion":"1.0.76","s_ad_rn_bundle_tag":"inner","s_lowest_adwaynum":"","#network_type":"WIFI","#ram":"2.2\/3.5","#disk":"46.7\/54.2","#device_type":"Phone","s_msg":"{\"ad_from\":\"block:unNormal\",\"ad_info\":{\"ab_live\":\"1\",\"abtest\":\"each\",\"abtest_multi_local\":\"each\",\"ad_duration_limit\":\"60000:2:4,80000:2:4\",\"ad_platform\":\"1\",\"adwaynum\":\"99037\",\"aqwaynum\":\"0\",\"banner\":{\"ab_each\":\"ba6501jkc\",\"adunit\":\"96474c96f11c5172\",\"bannerInterval\":[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.5,3,3.5,4,4.5,5],\"banner_events\":\"s_ab_banner_revenue_3570\",\"keywords\":[]},\"banner_events\":\"s_ab_banner_revenue_3570\",\"business_corridor\":{\"21275fa33fd801a4\":{\"high\":{\"168_744h\":{\"floor1\":10},\"24_168h\":{\"floor1\":16},\"in_24h\":{\"floor1\":30},\"out_744h\":{\"floor1\":6}},\"low\":{\"168_744h\":{\"floor1\":8},\"24_168h\":{\"floor1\":12},\"in_24h\":{\"floor1\":16},\"out_744h\":{\"floor1\":6}},\"middle\":{\"168_744h\":{\"floor1\":8},\"24_168h\":{\"floor1\":14},\"in_24h\":{\"floor1\":18},\"out_744h\":{\"floor1\":6}}},\"52ac537f57274e8c\":{\"high\":{\"168_744h\":{\"floor1\":5},\"24_168h\":{\"floor1\":8},\"in_24h\":{\"floor1\":15},\"out_744h\":{\"floor1\":3}},\"low\":{\"168_744h\":{\"floor1\":4},\"24_168h\":{\"floor1\":6},\"in_24h\":{\"floor1\":8},\"out_744h\":{\"floor1\":3}},\"middle\":{\"168_744h\":{\"floor1\":4},\"24_168h\":{\"floor1\":7},\"in_24h\":{\"floor1\":9},\"out_744h\":{\"floor1\":3}}},\"b8b55bd2a6fb90ec\":{\"high\":{\"168_744h\":{\"floor1\":18},\"24_168h\":{\"floor1\":31.5},\"in_24h\":{\"floor1\":54},\"out_744h\":{\"floor1\":9}},\"low\":{\"168_744h\":{\"floor1\":13.5},\"24_168h\":{\"floor1\":22.5},\"in_24h\":{\"floor1\":22.5},\"out_744h\":{\"floor1\":9}},\"middle\":{\"168_744h\":{\"floor1\":13.5},\"24_168h\":{\"floor1\":22.5},\"in_24h\":{\"floor1\":31.5},\"out_744h\":{\"floor1\":9}}},\"f9e44088fe9dc1e1\":{\"high\":{\"168_744h\":{\"floor1\":6},\"24_168h\":{\"floor1\":10.5},\"in_24h\":{\"floor1\":18},\"out_744h\":{\"floor1\":3}},\"low\":{\"168_744h\":{\"floor1\":4.5},\"24_168h\":{\"floor1\":7.5},\"in_24h\":{\"floor1\":7.5},\"out_744h\":{\"floor1\":3}},\"middle\":{\"168_744h\":{\"floor1\":4.5},\"24_168h\":{\"floor1\":7.5},\"in_24h\":{\"floor1\":10.5},\"out_744h\":{\"floor1\":3}}}},\"business_corridor_default_adwaynum\":\"75002\",\"extra\":{\"data\":{\"corridor\":{\"21275fa33fd801a4\":{\"floor_factor\":3},\"52ac537f57274e8c\":{\"floor_factor\":1},\"b8b55bd2a6fb90ec\":{\"floor_factor\":3},\"f9e44088fe9dc1e1\":{\"floor_factor\":1}}},\"pangle\":{\"pangle_is_adunit\":\"981690058\",\"pangle_platform\":\"pangle\"}},\"fix_ad_unit_id\":\"1\",\"insert\":{\"ab_each\":\"fs75002\",\"adunit\":\"d950df9f54873c16,52ac537f57274e8c,21275fa33fd801a4\",\"keywords\":[]},\"is_first\":1,\"new_tag\":\"1\",\"reward\":{\"ab_each\":\"rv75002\",\"adunit\":\"b6710a0b9225d24f,f9e44088fe9dc1e1,b8b55bd2a6fb90ec\",\"keywords\":[]},\"s_ad_installtime_hour\":\"5\"},\"allow_new\":\"1\",\"decision_info\":{\"plan7\":{\"day\":14,\"game\":3,\"id\":\"ywmi_1_3_10_90_0920\",\"key\":\"CRYWA1_5209\",\"name\":\"compare\",\"plan\":\"0_-1_0_90\",\"type\":\"online\"}},\"game_send_data\":\"1\",\"hs_country_code\":\"CN\",\"hs_ip\":\"103.101.206.66\",\"ip_country\":\"CN\",\"isStatus\":\"0\",\"is_data_tester\":\"0\",\"is_data_tester_dynamic\":\"0\",\"is_eea\":\"0\",\"is_fail_eea\":\"0\",\"is_open_HSAnalyticsSDK\":\"1\",\"is_open_add_ad_load\":\"0\",\"is_open_business_serverab_by_adwaynum\":\"0\",\"is_open_correction_ad_time\":true,\"is_open_escape\":true,\"is_open_facebook\":\"1\",\"is_open_firebase_remoteconfig\":\"1\",\"is_open_glthread_priority\":\"0\",\"is_open_hs_abtest\":true,\"is_open_hs_push\":\"0\",\"is_open_new_report\":\"1\",\"is_open_new_selectiveinit\":\"1\",\"is_open_opt\":\"1\",\"is_open_pre_cpm_report\":\"1\",\"is_open_s2s\":\"1\",\"is_open_start_app_ad_voice_mute\":true,\"is_open_start_app_game_effect_close_ad_voice\":true,\"is_open_sub\":\"0\",\"is_open_subscribe\":\"1\",\"is_open_taichi\":\"1\",\"is_upload_device_info\":\"1\",\"jyid\":\"\",\"media\":{\"fb\":\"https:\\\/\\\/www.facebook.com\\\/61564167488999\\\/\",\"tiktok\":\"https:\\\/\\\/www.tiktok.com\\\/@blockblastofficial\",\"x\":\"https:\\\/\\\/x.com\\\/BlockBlastSquad\",\"youtube\":\"https:\\\/\\\/www.youtube.com\\\/@BlockBlastOfficial\"},\"msgdata\":[],\"opr\":\"k\",\"push_info\":[{\"enable\":true,\"key\":\"push_uninstall\",\"score\":\"1.0\"},{\"enable\":false,\"key\":\"push_question\",\"score\":\"0\"},{\"enable\":true,\"key\":\"push_short_recall\",\"score\":\"0\",\"units\":[{\"key\":\"cdqzh04\",\"score\":\"95\"},{\"key\":\"cdqzh03\",\"score\":\"5\"}]},{\"enable\":true,\"key\":\"push_win2\",\"score\":\"0\",\"units\":[{\"key\":\"ls014\",\"score\":\"95\"},{\"key\":\"ls013\",\"score\":\"5\"}]},{\"enable\":false,\"key\":\"push_active3\",\"score\":\"0\"},{\"enable\":true,\"key\":\"push_today_recall\",\"score\":\"0\",\"units\":[{\"key\":\"unfinished14\",\"score\":\"95\"},{\"key\":\"unfinished13\",\"score\":\"5\"}]}],\"rt_planId\":\"no\",\"rt_planInfo\":[],\"rt_rnew\":\"no\"}","s_stage":"data","s_catch_code":"2960","#zone_offset":8},"#uuid":"ffce9be8-d9fb-470d-8150-c36970b36ede"}#td#-215902512