function(e, t) {
for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
})(e, t);
}, function(e, t) {
i(e, t);
function r() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (r.prototype = t.prototype, new r());
}), o = this && this.__decorate || function(e, t, r, i) {
var n, o = arguments.length, s = o < 3 ? t : null === i ? i = Object.getOwnPropertyDescriptor(t, r) : i;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, r, i); else for (var a = e.length - 1; a >= 0; a--) (n = e[a]) && (s = (o < 3 ? n(s) : o > 3 ? n(t, r, s) : n(t, r)) || s);
return o > 3 && s && Object.defineProperty(t, r, s), s;
};
Object.defineProperty(r, "__esModule", {
value: !0
});
r.DailyClassReviveCountTrait = void 0;
var s = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.reviveAmount = 0;
return t;
}
t.prototype.onActive = function(e) {
if (hs.tp.isClassRevive_ProxyIsTriggerRevive(e) && hs.classReviveGameInfo.reviveNum > 0) {
var t = this.reviveCount();
if (this.reviveAmount < t) {
storage.setItem("classReviveNum", 0);
this.reviveAmount++;
}
}
hs.tp.isClassGameDataClear_Disk_ProxyResetReviveAndAdvertisementData(e) && (this.reviveAmount = 0);
};
t.prototype.reviveCount = function() {
var e = hs.achievementInfo.achievementLocalStatisticsData.loginDays, t = hs.classScoreInfo.score;
if (2 === e) {
if (t > 7500) return 1;
} else if (3 === e) {
if (t > 15e3) return 2;
} else if (e > 3 && t > 3e4) return 3;
return 0;
};
return o([ classId("DailyClassReviveCountTrait") ], t);
}(Trait);
r.DailyClassReviveCountTrait = s;
cc._RF.pop();
}, {} ]
}, {}, [ "DailyClassReviveCountTrait" ]);