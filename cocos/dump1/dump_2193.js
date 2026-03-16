function() {
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