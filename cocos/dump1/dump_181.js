function() {
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