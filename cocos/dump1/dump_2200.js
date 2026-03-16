function() {
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