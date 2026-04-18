function(e) {
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