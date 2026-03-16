function() {
hs.storage.setItem("chapterPassedLevels", []);
hs.storage.setItem("chapterUserSelectedLevel", 1);
};
t.prototype.settlementMoveChapter = function(e) {
var t = e.target;
if (t && t.itemList) {
for (var r = hs.storage.getItem("chapterPassedLevels", []), i = t.itemList, a = hs.chapterGameInfo.chapterNum, n = r.length > 0 ? r[r.length - 1] : 0, s = 0; s < i.length; s++) {
var o = i[s], c = o.state.levelNum;
r.includes(c) ? c === n ? o.setState({
isShowAnimation: !0,
showColor: !0,
isOpacityAni: !1,
opacity: 255
}) : o.setState({
isStopAllAction: !0,
isShowAnimation: !1,
showColor: !0,
isOpacityAni: !1,
opacity: 255
}) : o.setState({
isStopAllAction: !0,
isShowAnimation: !1,
isOpacityAni: !1
});
}
hs.chapterGameInfo.isThroughAll || hs.storage.setItem("lastChapterNum", a);
}
};
t.prototype.isSelectChapterEnabled = function() {
return 1 === hs.storage.getItem("chapterPeriodsIndex", 1);
};
t.prototype.isAllLevelsPassed = function() {
return hs.chapterGameInfo.isThroughAll;
};
t.prototype.getNextUnpassedLevel = function() {
for (var e = hs.storage.getItem("chapterPassedLevels", []), t = hs.chapterGameInfo.chapterAllNum, r = hs.storage.getItem("chapterUserSelectedLevel", 1), i = r + 1; i <= t; i++) if (!e.includes(i)) return i;
for (i = 1; i < r; i++) if (!e.includes(i)) return i;
return 1;
};
return n([ classId("UserSelectChapterTrait") ], t);
}(Trait);
r.UserSelectChapterTrait = c;
cc._RF.pop();
}, {} ]
}, {}, [ "UserSelectChapterTrait" ]);