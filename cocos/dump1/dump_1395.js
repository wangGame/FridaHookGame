function() {
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