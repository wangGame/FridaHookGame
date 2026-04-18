function() {
e(1);
}).start();
});
}
};
t.prototype.resetNotPassLevelCell = function(e) {
var t = e.target;
if (t && cc.isValid(t.node)) for (var r = t.itemList, i = hs.storage.getItem("chapterPassedLevels", []), a = 0; a < r.length; a++) if (cc.isValid(r[a])) {
var n = r[a].getComponent(hs.ChapterItem), s = t.getLevelTextComp(a);
if (s && cc.isValid(s.node)) {
cc.Tween.stopAllByTarget(s);
if (i.includes(n.state.levelNum)) {
null == n || n.setState({
isThrough: !1,
isStopAllAction: !0,
isShowAnimation: !1,
showColor: !0,
isOpacityAni: !1
});
null == s || s.setState({
opacity: 0
});
} else {
null == n || n.setState({
isThrough: !1,
isStopAllAction: !0,
isShowAnimation: !1,
showColor: !1,
isOpacityAni: !1
});
var o = hs.chapterConfigInfo.isStageShowFromBottom ? 255 : 0;
null == s || s.setState({
opacity: o
});
}
}
}
};
t.prototype.onChapterPassComplete = function() {
if (hs.storage.getItem("chapterIsUserSelectMode", !1)) {
var e = hs.storage.getItem("chapterUserSelectedLevel", 1), t = hs.storage.getItem("chapterPassedLevels", []);
if (!t.includes(e)) {
t.push(e);
hs.storage.setItem("chapterPassedLevels", t);
}
if (!(t.length >= hs.chapterGameInfo.chapterAllNum)) {
var r = this.getNextUnpassedLevel();
hs.storage.setItem("chapterUserSelectedLevel", r);
}
}
};
t.prototype.resetForNextPeriod = function() {
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