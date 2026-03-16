function(e) {
if (m.tp.isClassAlgorithmStrategy_Deal_ProxyTriggerSpecialTrait(e)) {
var t = f.classGameInfo.roundNum, o = this.startRound, r = this.endRound, i = this.algo;
if (t >= o && t <= r) {
d.algorithmStrategyInfo.setAlgorithmSourceLevel1(u.ClassAlgorithmSourceType.AlgoTrait);
1 == i ? d.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE_BLANK.TIAN_KONG_XIAO_CHU ]) : 2 == i ? d.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE_BLANK.TRAVEL_TIAN_KONG_XIAO_CHU ]) : 3 == i ? d.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE_BLANK.ALGO_FILL_MORE_AREA ]) : 4 == i ? d.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE.ALGO_QUICK, c.OFFER_TYPE.ALGO_QUICK, c.OFFER_TYPE.ALGO_QUICK ]) : 5 == i ? d.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE_BLANK.ALGO_MIX_TKXC ]) : 6 == i && d.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE_BLANK.TIAN_KONG_XIAO_CHU ]);
this.replaceAlgoId && d.algorithmStrategyInfo.setAlgorithmList(n(this.replaceAlgoId));
this.targetReturnFalse() ? e.returnState = !1 : e.returnState = !0;
}
}
};
t.prototype.targetReturnFalse = function() {
return 6 == this.props.Algo;
};
return a([ classId("EveryGamePreRoundForceToAlgoTrait"), classMethodWatch() ], t);
}(l.Trait);
o.EveryGamePreRoundForceToAlgoTrait = y;
cc._RF.pop();
}, {
"../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../scripts/modules/algorithm/type/AlgorithmType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/type/AlgorithmStrategyType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo": void 0,
"../../../../../../scripts/modules/traitConfig/vo/TraitConfigSafePropsInfo": void 0,
"../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0,
"../../game/vo/ClassGameInfo": "ClassGameInfo"
} ],
EveryGamePreRoundForceToFillTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "2401dgO/tVEbKl/XwJn7LYa", "EveryGamePreRoundForceToFillTrait");
var r, i = this && this.__extends || (r = function(e, t) {
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
var i, a = arguments.length, s = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, o, r); else for (var n = e.length - 1; n >= 0; n--) (i = e[n]) && (s = (a < 3 ? i(s) : a > 3 ? i(t, o, s) : i(t, o)) || s);
return a > 3 && s && Object.defineProperty(t, o, s), s;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.EveryGamePreRoundForceToFillTrait = void 0;
var s = e("../../../../../../scripts/base/trait/Trait"), n = e("../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo"), l = e("../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate"), c = e("../../../../../../scripts/modules/algorithm/type/AlgorithmType"), u = e("../../game/vo/ClassGameInfo"), d = e("../../../../../../scripts/modules/algorithmStrategy/type/AlgorithmStrategyType"), p = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onActive = function(e) {
if (l.tp.isClassAlgorithmStrategy_Deal_ProxyTriggerSpecialTrait(e) && u.classGameInfo.roundNum <= this.props.round) {
n.algorithmStrategyInfo.setAlgorithmSourceLevel1(d.ClassAlgorithmSourceType.AlgoTrait);
n.algorithmStrategyInfo.setAlgorithmList([ c.OFFER_TYPE_BLANK.TIAN_KONG_XIAO_CHU ]);
e.returnState = !0;
}
};
return a([ classId("EveryGamePreRoundForceToFillTrait") ], t);
}(s.Trait);
o.EveryGamePreRoundForceToFillTrait = p;
cc._RF.pop();
}, {
"../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../scripts/modules/algorithm/type/AlgorithmType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/type/AlgorithmStrategyType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo": void 0,
"../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0,
"../../game/vo/ClassGameInfo": "ClassGameInfo"
} ],
ExceedAimScoreTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "88152LWD8VLLKF4HvZC4F8W", "ExceedAimScoreTrait");
var r, i = this && this.__extends || (r = function(e, t) {
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
var i, a = arguments.length, s = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, o, r); else for (var n = e.length - 1; n >= 0; n--) (i = e[n]) && (s = (a < 3 ? i(s) : a > 3 ? i(t, o, s) : i(t, o)) || s);
return a > 3 && s && Object.defineProperty(t, o, s), s;gmsg://mobileads.google.com/result?result=%7B%22params%22%3A%22ABPQqLGhDK_1UMwikP663YiHStKbasGhbttH4CCgwM__8tI6wO_y0k7CqKgkOEbZRYBLsrHTHwl-vyy2ld57TcgO25p6TBL36T_2Y3Q6YtKjj3i4iH1MJme11ks7KIJq1ehZuUbhPvRkXHa1S92Ry42meZEY6qdDgVSB3FUG913KKlsVTQCMIAc5HyDN_5sfcLu6fMoHbOsufrVBRI5aIqRoqSSMFJBltwiEpFhNznGw2YznoxUnjh7OL8oo-JfqyQRJBEcLRcEqEuN7NsWbQLEI7iAE7XQCWQhJdF9Ce3835KOuezXGm72F3PL8dHYvyohjsYWd7WV6RtxItOjaAYS_zuML3_tVbImQ4TjXKSFp1DvvMTZ2JyscocVeU6qTSbBV2Wb1-pxWB6Gphssunb8xYiXzsGOT1I7WTC1SKIJAV4X238-9GnsdlNzg_HCgexYPyqu5YruMrOh8k_bwQ1kKXxvyDxpCCYIJq3IRIFCkNmLmR2SkYLbEAxxd_xTJBKasS7VVkHGdCYjFEt6wf5b5D7U7otQv-cjy_wrHXIvkfuhUvtCwPx55_2gs27g_Z44DbazTakjB5JbX5TlPZ4qYBtzKHYJERE3JQpY7hQkhkJufMjHedlMhuBNrHXmt-28Xduzc9BUtKBbOxJSjy3DsMbwnsUv-SkC3Zka47nHx_8ZnNn6DlQrniPZHyc9l0zmpmKXHXgKT_o4hMViJ0j20q-2oAcMzu-jF6n2022OVkAfn4_d6obFG6rbKrlD0Qng57mhc8-oZd175a5qTp_w-pufgiW6yTIXI1TiALSRZi7PalRH94jxb5n_G4LMNHvqmppFHSmWHbmTtEVrznXYUJtQkM59QNlIAmfx-_Sglauk2JwHgTmHiUD2af_FJY9ieVLeF8dUM8XEfzsiEelvU1mHM6LABI9Xx5hYvsz-PsDWw41laEVo5grPLveiZQI2nceNYfEL4pKt3yLnk6rgeaxC-vtNZoD8ygRhQqqUb2_bjJBzO7bMgMy2T3afbO-xsCZAqhIlP2_0suWFQS7l_Gf8uu9ijDHWjMFJAzgm6Okx8Md8Ri8NA4CbRZwOXK2gN0UccdumGn_2FQstTiz73_9tbx7aminWqxCeJcvFuOyJBOOXQsdogEgvMbbaFyXd1Ipbjpbg_mccd5W8JiNnNEHGZOcLvJMjJ22IzMbOM-OeAsivnXnE39osQzTBAlFuXK4tsJKuTsAQKRbnxWv57tCV5fGFnkDW2jQseyi6OkXwiBIIZ9ZdDAWPQdExYHvPPls1pMtR46CCkVTdlSvU-E-HrKaW9mS8u3jvsiv-gHEpmNwyOLI_ce0DDiUC0uxuvSQ6kUw-bz6qsRT5iEGTi9PwVea0vqtaDKH2BeaBCu8doLicxdYnXcfw-fpZ0TdlUMwTK82jeqLkuC7Cj6lPgHQpCc0AXiiFZEfJ0E3a0orv_hrPTAAR3R3rlqZH5ErmJacaC996ima66h67IKucDACgHB6eDQCbRcvvkPoMQtBfYanHBRZ2UcEekDQlThHdIuz8lgw1qUVXULeOilaUrd_L2zaS51RsJEFM5G1onEzEUOU9rZWL83OAVE_ZEoGYc5tSeS1iAVx-4hcYdAX61hRlm63-JEUkAGK9PmOXJiQT7dlnx7iSwkVB9TTX_3aiDKXYo4wjJuoGOjhWM5EQhKOHP_CckKYmrqVHGmgUDocp7EXzNXbEam17B9kt9rFNaYtrUFoFeZuRdSD9GO7uB9R87Glcp05O3w0cWp-BUHZZ2elr_WGjRbUvn_bFzHeem-s0WIvR6rcG6HEtyuoySiI-GeToKifYH3Ab6ufQieMGWAmQJ-BAXHgLaT7O7oIbx_PcNIFck2CtO2DSYIZdPIKVbSzJgKrRd7EJNUzll6GaMLjGACs8v7XMuFAuQgzAvfA7M0df6WXtShOmy_e53dEf8N1K2iJHarhXiZrWlFXhW_yShxewUBZVK0A0Zeeo39WRdztoBW8Szy5-8ziW1rP3lEppjOdNMbvQnVkXsSRD-aa26f7T8EjK66Y53i8rOHcEHkqi5flTBtHhTWe7kbYtI-d2TeYNRwYUZbUl0NH0hoOYRvGYSokxX7LyyDB86ysin0zEh6rQRTHr9c_4su-g8zv1EaEDLm7JZq6Pq6-gRcQfDdd6zsDaRXlJuhlSvoZbjLumGCIgBAPoI-5NOGvOPjDfkPmYM4kH5fNbKuRhM5e4cWMsFrxC8C1CGDoI0NSUvl_Rhjsw1s9tOqhp4qZDTOKwU-M2t-vCQaiA7ksXZb_oKhr4lDXErMytCDoWcled-VODjVUZe2JHC_h6KSvnyavJs7QRJcOt1FJ9ZvqkNtB7AWdNRqaI3tRYGvDggL7BuR3YnyTU3aQb_E11OnUuTs_tFx8nsSSqpEf-jM89eJNN70YQDCSl-4xpaStargDBF6EJANiyQJkiIBU5Uuu1kIv5fgGqiCSal7z6yeGifaT9TH8MqPgOz4vh-WbIv9e0aL0BHLAU1d2TjGjVAPshp3zdBna63IO1R-cPloqVbxU0p20a_Xv0gW7qlX8Ebsyu5KuIsqksgq7Hs-RYWzgXqrK5uJBUrkl8BDJfGX4M9jSbugYeJUbH9OIhQqDRQSwfkqsXXqMY4pnYNKonwaWUgd4StQwCRzxKGTomAe_GPGENxcYHZ7GrcSjZkkuvhUkdOP_Llnc7uxJOdhfTzwbBRljK4FThrmHCU2I-OkNGVP8zqkMpErXq4zBoCapVxvURTBHfIxBO8rUVwagEc7mCVPI7QK_sFCntBwwXqJJuLsnll1MLL0033Pv8elLJVwBVUF430vAcuZdUDl-18xexhX3m7woG9N1I4hyc0ncSRROCxBGrcopViRllCttW_T9NMgBYgzXV_eAV582QLjcxYZb3RWIgBOz1wAwQtRS3RfXKhEWV5CTKoXx3i5xqGltPOKAt7X3afVuz-HdI4qSKWCmqO317j11uTMugOqdi2JO-P99S2uImlxOFm4-aY0mNuYxIRthXkZmLr3LRxJ4GJeIJNtF7zC9UVe1pGkEtleHLl2PSejQGKUHG9lq6eOloq9ChXJw9vdunN49LeKZUSGwYAkwtT6ToNSfXTjsCgywufn0HTyj2wWDHsuzb-IODjHnfKFFgcTkuke0ICeEbVpNSsn-3nyZxP6Xywlw88z1uac3ApiMMtdz4XW0WYhiSNkAilVU-iDj_TAEHWGRKUtJVFX0tYUSdGniwB7fwlkdGNj5mfl5xyBcjTGi2qnbp3phA9F-weUffj9Hdv9-d_8ARACcVQmRnp85BCAfbuLM0aKWfwqi0etUX9bVPJUMGWyV-H4XeQM8aB9YHQjI5_v-EMg3J6fVq23T_DHASRQeBZErRh6mUbqGJfhKviZPEFNH6BTvTGMngnhY0tjHzmkae4qgUMj9hEmtvK8t-MO2UUlcec-tCpaUx4ZsiAkA8G7mDzdXek-o-OXRDo5b09j_9YIwX1GHHRST3UqTLymva9kVpyThROq7XCCH9H4ElfoHb6iQPL_mkw1VZCmCo0-kVcJzprtdYtKMl-KjZjmEON4v17ur1Oiz7yOe3aNklDOxmUrzCJ41r_R17gGV8FaNXDePMeQlygbL8xwS9SBENYvdTyOMk-Ee4_5HsCHyCeBlTfoOpN32TAsTdgDpg9mVaXDGlEV1UrZC_xb-_2_hzjJVycDZAuE6_P5pgohxwtvlhEH6iTlCmtEvKZOVtnGQ29UVy-e-3IdM3QbfC51sSdxkU5ON0LFMKPIQU8mbSsw9CfDleY73dni3Jz-mTsnWjl1xzWM6jMeDSa__Rr2qQBJlkLJt06RMviUP18xTr0kYdquwmGllwszkRPZkNc5DFIeGKwCr_4nl5AUTHJipM1aKl34peAUXINfQGMzuhLEVv5joWnNGhSWHnLvtNjor440WRqEaZU4dOgqbpNVD3z5zQqoHLpuh2s1_FHffJO3i99DaIFyv8adK8jPeds2Bjod9ARTnp0ZdPeAW0Q9V4hVzBzG3l5UBnBbgQt4sD6Wr4czOPDVCyPpPA-Vvm9DkioWuVtUsHE9Fre4LwJ6GzwyVJTw-SYtFcywGxivGIEJ80rgBXJimOd6of5YL5Oh2gVVki_Ozdy6AusbYnLmHVxdLRDRZTU6ckOB1tycGD8IPh6nLjiRaPleyvHtQRPOxnQ_SnGtF6EhRBV13JFDhHEnC2s0YhAkNzF41oFXgn0cp4WDcw9MvE16MtFvpMMu4_NqxjGzbrKAmB5ASFEXfY6b7xP72ciFg..%22%2C%22signal_dictionary%22%3A%7B%22an%22%3A%229250.android.com.block.juggle%22%2C%22bisch%22%3A%22true%22%2C%22blev%22%3A%220.95%22%2C%22canm%22%3A%22false%22%2C%22eid%22%3A%22318500618%2C318486317%2C318491267%2C95375966%2C95380541%2C95383100%2C318503827%2C318514154%2C318515546%2C318525131%2C44766145%2C44785828%2C318502621%22%2C%22gl%22%3A%22CN%22%2C%22gsb%22%3A%22wi%22%2C%22hl%22%3A%22zh-CN%22%2C%22js%22%3A%22afma-sdk-a-v254715000.254715000.0%22%2C%22jsv%22%3A%22sdk_20190107_RC02-production-sdk_20260218_RC00%22%2C%22ms%22%3A%22CoACDpYOdC5PeU-xjYH2E1KJOZlDVTScNYWQ67hophovlSOqb2OGjjYBxo0O1Dq7d8eT9bfRU6tYkD1piE4APAYvFIPaNga98bldw5ym5QpS6CnI2ccCrUgiwu_v7Ff9jcMfYwGhiBYGouCNB4VCBIdC1QuSohxZ-daFCMH0nyw2eu-pSgXdqoSRprQxtoSSWzsRzTP0YOR2cQAm0__8SxXGhjdhehsbscvEkUN-o0JY9blVFjbMsKDNom2fTOjL_9y6a5JYC0u7CNl1GS4SABq9fYhkfZ_tjbQT6QyFa8-ellktFWsFBti8scNYWH9o8OL2MvRCoykx9PJKTh2PeclXvAqAAtRdBcaA875OBjflvAs-fjL-Em4CE2sTYY6Xlw9i0rBB0cgev4Q0QN0R5LootjCJjVACDuywoHDIfjOM8CM-t5AuBcWV6s1lLPwcm_U9hW-tT0S-01LdAhNS6Zft7WenOJwKlqs1LS9-gOO3zuaT3VfX-yNbadyw2-r1SlTfPRIvsTeLAa1-joz4Hh8TpRRC_qBz_SdpVNf2IVcEsyxWWjUNV1x67nxNNLVenEYMAYroJ7oGR2YVMsjN1_yjAURUzFXB17S2CjLOEkeq4tjNJItUsE9jEIFGh80bkWWIpG4HTxdNVoFvlF1rhy4wXw7o0dM4qRDtWD1LXwKq-OisGWESENiYDO0YDGqILQm2IMZmzmY%22%2C%22msid%22%3A%22com.block.juggle%22%2C%22net%22%3A%22wi%22%2C%22preqs%22%3A%2226%22%2C%22rdps%22%3A%2247800%22%2C%22seq_num%22%3A%2227%22%2C%22submodel%22%3A%22SM-C5000%22%2C%22u_audio%22%3A%221%22%2C%22u_h%22%3A%22732%22%2C%22u_sd%22%3A%222.625%22%2C%22u_so%22%3A%22p%22%2C%22u_tz%22%3A%22480%22%2C%22u_w%22%3A%22412%22%7D%2C%22start_time%22%3A1772275449152%2C%22end_time%22%3A1772275449241%7D&request_id=22cc33e9-dc7c-46e8-b09f-8e1ba5ce29a0&id=22cc33e9-dc7c-46e8-b09f-8e1ba5ce29a0&google.afma.Notify_dt=1772275449242