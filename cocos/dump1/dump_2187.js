function() {
p.EventManager.dispatchModuleEvent(new h.E_HomePage_Show());
};
t.prototype.hideBanner = function() {
cc.sys.isNative && m.NativeAd.hideBanner();
};
t.prototype.onEnable = function() {
var e = this;
if (cc.sys.isNative) {
this.hideBanner();
this._hideBannerScheduler = function() {
return e.hideBanner();
};
this.schedule(this._hideBannerScheduler, 1);
}
};
t.prototype.onDisable = function() {
if (this._hideBannerScheduler) {
this.unschedule(this._hideBannerScheduler);
this._hideBannerScheduler = null;
}
};
a([ k(cc.Node) ], t.prototype, "topContainer", void 0);
a([ k(cc.Node) ], t.prototype, "lbTitle", void 0);
a([ k(cc.Node) ], t.prototype, "lbStatisticesTitle", void 0);
a([ k(cc.Node) ], t.prototype, "lbAwardsTitle", void 0);
a([ k(cc.Node) ], t.prototype, "spAwardsBg", void 0);
a([ k(cc.Node) ], t.prototype, "ndAllContainer", void 0);
a([ k(cc.Node) ], t.prototype, "ndStatisticsContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndStatisticsBgContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndStatisticsLabelContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndAwardsContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndAwardsIconContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndAwardsLabelContent", void 0);
a([ u.adapterFringe("topContainer", "ndAllContainer", "lbTitle", "spAwardsBg", "lbStatisticesTitle", "lbAwardsTitle") ], t.prototype, "onLoad", null);
a([ f.throttle(300) ], t.prototype, "onClickBack", null);
return a([ classId("Achievement_Main"), P, classMethodWatch() ], t);
}(s.default);
o.default = I;
cc._RF.pop();
}, {
"../../../base/cache/CacheRender": "CacheRender",
"../../../base/components/Component": "Component",
"../../../base/decorators/DecoratorAdapter": "DecoratorAdapter",
"../../../base/decorators/DecoratorThrottle": "DecoratorThrottle",
"../../../base/timer/Timer": "Timer",
"../../../falcon/EventManager": "EventManager",
"../../homePage/events/E_HomePage_Show": "E_HomePage_Show",
"../../native/NativeAd": "NativeAd",
"../../prefab/PrefabConfig": "PrefabConfig",
"../vo/AchievementInfo": "AchievementInfo",
"./Achievement_Awards_Item": "Achievement_Awards_Item",
"./Achievement_Awards_Item_Icon": "Achievement_Awards_Item_Icon",
"./Achievement_Statistics_Item": "Achievement_Statistics_Item",
"./Achievement_Statistics_Item_Bg": "Achievement_Statistics_Item_Bg"
} ],
Achievement_Module: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "dae66dcMmhIPo+mcTilQ8Bw", "Achievement_Module");
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
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.Achievement_Module = void 0;
var a = e("../../falcon/Module"), i = e("./proxys/Achievement_Proxy"), l = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerProxys = function() {
return [ i.Achievement_Proxy ];
};
return t;
}(a.Module);
o.Achievement_Module = l;
cc._RF.pop();
}, {
"../../falcon/Module": "Module",
"./proxys/Achievement_Proxy": "Achievement_Proxy"
} ],
Achievement_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "876b3ZEey9Aop0hDfJNf2bu", "Achievement_Proxy");
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
}, i = this && this.__awaiter || function(e, t, o, r) {
return new (o || (o = Promise))(function(n, a) {
function i(e) {
try {
c(r.next(e));
} catch (e) {
a(e);
}
}
function l(e) {
try {
c(r.throw(e));
} catch (e) {
a(e);
}
}
function c(e) {
e.done ? n(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(i, l);
var t;
}
c((r = r.apply(e, t || [])).next());
});
}, l = this && this.__generator || function(e, t) {
var o, r, n, a, i = {
label: 0,
sent: function() {
if (1 & n[0]) throw n[1];
return n[1];
},
trys: [],
ops: []
};
return a = {
next: l(0),
throw: l(1),
return: l(2)
}, "function" == typeof Symbol && (a[Symbol.iterator] = function() {
return this;
}), a;
function l(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(a) {
if (o) throw new TypeError("Generator is already executing.");
for (;i; ) try {
if (o = 1, r && (n = 2 & a[0] ? r.return : a[0] ? r.throw || ((n = r.return) && n.call(r), 
0) : r.next) && !(n = n.call(r, a[1])).done) return n;
(r = 0, n) && (a = [ 2 & a[0], n.value ]);
switch (a[0]) {
case 0:
case 1:
n = a;
break;

case 4:
i.label++;
return {
value: a[1],
done: !1
};

case 5:
i.label++;
r = a[1];
a = [ 0 ];
continue;

case 7:
a = i.ops.pop();
i.trys.pop();
continue;

default:
if (!(n = i.trys, n = n.length > 0 && n[n.length - 1]) && (6 === a[0] || 2 === a[0])) {
i = 0;
continue;
}
if (3 === a[0] && (!n || a[1] > n[0] && a[1] < n[3])) {
i.label = a[1];
break;
}
if (6 === a[0] && i.label < n[1]) {
i.label = n[1];
n = a;
break;
}
if (n && i.label < n[2]) {
i.label = n[2];
i.ops.push(a);
break;
}
n[2] && i.ops.pop();
i.trys.pop();
continue;
}
a = t.call(e, i);
} catch (e) {
a = [ 6, e ];
r = 0;
} finally {
o = n = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.Achievement_Proxy = void 0;
var c = e("../../../base/timer/Timer"), s = e("../../../base/ui/UI"), u = e("../../../falcon/Proxy"), f = e("../../blocksProducer/events/E_BlocksProducer_TouchEnd"), d = e("../../game/events/E_Game_Replay"), p = e("../../gameOver/events/E_GameOver_GameEnd"), h = e("../../launch/events/E_Launch_Start"), m = e("../../layer/vo/LayerInfo"), _ = e("../../prefab/PrefabConfig"), y = e("../components/Achievement_Detail"), g = e("../components/Achievement_Main"), v = e("../events/E_Achievement_AwardClick"), b = e("../events/E_Achievement_Chapter_Pass"), C = e("../events/E_Achievement_Entrance"), S = e("../vo/AchievementInfo"), P = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerEvents = function() {
return [ C.E_Achievement_Entrance, v.E_Achievement_AwardClick, f.E_BlocksProducer_TouchEnd, d.E_Game_Replay, b.E_Achievement_Chapter_Pass, h.E_Launch_Start, p.E_GameOver_GameEnd ];
};
t.prototype.receivedEvents = function(e) {
return i(this, void 0, Promise, function() {
return l(this, function(t) {
switch (t.label) {
case 0:
switch (e.getClass()) {
case C.E_Achievement_Entrance:
return [ 3, 1 ];

case v.E_Achievement_AwardClick:
return [ 3, 2 ];

case f.E_BlocksProducer_TouchEnd:
return [ 3, 3 ];

case d.E_Game_Replay:
return [ 3, 5 ];

case b.E_Achievement_Chapter_Pass:
return [ 3, 6 ];

case h.E_Launch_Start:
return [ 3, 7 ];

case p.E_GameOver_GameEnd:
return [ 3, 8 ];
}
return [ 3, 9 ];

case 1:
this.onAchievement_Entrance(e);
return [ 3, 9 ];

case 2:
this.onAchievement_AwardClick(e);
return [ 3, 9 ];

case 3:
return [ 4, c.nextFrame() ];

case 4:
t.sent();
this.onBlocksProducer_TouchEnd(e);
return [ 3, 9 ];

case 5:
this.onGameReplay();
return [ 3, 9 ];

case 6:
this.onAchievement_Chapter_Pass(e);
return [ 3, 9 ];

case 7:
this.onLaunchStart(e);
return [ 3, 9 ];

case 8:
this.onGameOver(e);
return [ 3, 9 ];

case 9:
return [ 2 ];
}
});
});
};
t.prototype.onGameOver = function() {
DS("usr_data_migration_achieve_info", {
data: S.achievementInfo.achievementLocalStatisticsData
});
};
t.prototype.onLaunchStart = function() {
DS("usr_data_migration_achieve_info", {
data: S.achievementInfo.achievementLocalStatisticsData
});
};
t.prototype.onAchievement_Chapter_Pass = function() {};
t.prototype.onGameReplay = function() {};
t.prototype.onBlocksProducer_TouchEnd = function() {};
t.prototype.onAchievement_Entrance = function() {
s.UI.show(_.PrefabConfig.Achievement_Main, m.uiLayer).then(function(e) {
e.getComponent(g.default).setState({
statisticsDataList: S.achievementInfo.achievementStatisticsData,
awardDataList: S.achievementInfo.achievementAwardData
});
});
};
t.prototype.onAchievement_AwardClick = function(e) {
s.UI.show(_.PrefabConfig.Achievement_Details, m.uiLayer).then(function(t) {
t.getComponent(y.default).setState({
awardData: e.awardData
});
});
};
return a([ classId("Achievement_Proxy"), classMethodWatch() ], t);
}(u.Proxy);
o.Achievement_Proxy = P;
cc._RF.pop();
}, {
"../../../base/timer/Timer": "Timer",
"../../../base/ui/UI": "UI",
"../../../falcon/Proxy": "Proxy",
"../../blocksProducer/events/E_BlocksProducer_TouchEnd": "E_BlocksProducer_TouchEnd",
"../../game/events/E_Game_Replay": "E_Game_Replay",
"../../gameOver/events/E_GameOver_GameEnd": "E_GameOver_GameEnd",
"../../launch/events/E_Launch_Start": "E_Launch_Start",
"../../layer/vo/LayerInfo": "LayerInfo",
"../../prefab/PrefabConfig": "PrefabConfig",
"../components/Achievement_Detail": "Achievement_Detail",
"../components/Achievement_Main": "Achievement_Main",
"../events/E_Achievement_AwardClick": "E_Achievement_AwardClick",
"../events/E_Achievement_Chapter_Pass": "E_Achievement_Chapter_Pass",
"../events/E_Achievement_Entrance": "E_Achievement_Entrance",
"../vo/AchievementInfo": "AchievementInfo"
} ],
Achievement_Statistics_Item_Bg: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d3aa4amQWZM7bXU1oqHwNpi", "Achievement_Statistics_Item_Bg");
var r, n = this && this.__extends || (r = function(e, t) {
re