function o(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(n) {
if (r) throw new TypeError("Generator is already executing.");
for (;s; ) try {
if (r = 1, i && (a = 2 & n[0] ? i.return : n[0] ? i.throw || ((a = i.return) && a.call(i), 
0) : i.next) && !(a = a.call(i, n[1])).done) return a;
(i = 0, a) && (n = [ 2 & n[0], a.value ]);
switch (n[0]) {
case 0:
case 1:
a = n;
break;

case 4:
s.label++;
return {
value: n[1],
done: !1
};

case 5:
s.label++;
i = n[1];
n = [ 0 ];
continue;

case 7:
n = s.ops.pop();
s.trys.pop();
continue;

default:
if (!(a = s.trys, a = a.length > 0 && a[a.length - 1]) && (6 === n[0] || 2 === n[0])) {
s = 0;
continue;
}
if (3 === n[0] && (!a || n[1] > a[0] && n[1] < a[3])) {
s.label = n[1];
break;
}
if (6 === n[0] && s.label < a[1]) {
s.label = a[1];
a = n;
break;
}
if (a && s.label < a[2]) {
s.label = a[2];
s.ops.push(n);
break;
}
a[2] && s.ops.pop();
s.trys.pop();
continue;
}
n = t.call(e, s);
} catch (e) {
n = [ 6, e ];
i = 0;
} finally {
r = a = 0;
}
if (5 & n[0]) throw n[1];
return {
value: n[0] ? n[1] : void 0,
done: !0
};
}
};
Object.defineProperty(r, "__esModule", {
value: !0
});
r.UserSelectChapterTrait = void 0;
var c = function(e) {
a(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t._btn_continuePath = "textures/chapterList/traits/BPuzzleTimeTrait/btn_continue";
t._btn_continuePath_old = "textures/setup/setting_btn_common";
return t;
}
t.prototype.onActive = function(e) {
if (hs.tp.isChapterItemRender(e)) {
if (!this.isSelectChapterEnabled()) {
this.clearChapterItemClickEvent(e);
return;
}
this.addChapterItemClickEvent(e);
}
if (hs.tp.isChapterListGetChapterContentState(e)) {
if (!this.isSelectChapterEnabled()) {
this.resetForNextPeriod();
return;
}
this.initSelectModeIfNeeded();
}
if (hs.tp.isChapterContentResetNotPassLevelCell(e)) {
if (!this.isSelectChapterEnabled()) return;
e.replace = !0;
this.resetNotPassLevelCell(e);
}
if (hs.tp.isChapterGame_GameInfoUpdate_ProxyUpdateChapterNum(e)) {
if (!this.isSelectChapterEnabled()) return;
e.args[0] && this.onChapterPassComplete();
}
if (hs.tp.isChapterContentMoveChapter(e)) {
if (!this.isSelectChapterEnabled()) return;
this.customMoveChapter(e);
e.replace = !0;
}
if (hs.tp.isChapterListSetChapterBtnState(e)) {
if (!this.isSelectChapterEnabled()) return;
this.updateChapterBtnState(e);
e.replace = !0;
}
if (hs.tp.isTravelResultOptimizingTraitMoveChapter(e)) {
if (!this.isSelectChapterEnabled()) return;
this.settlementMoveChapter(e);
e.replace = !0;
}
};
t.prototype.initSelectModeIfNeeded = function() {
if (!hs.storage.getItem("chapterIsUserSelectMode", !1)) {
var e = hs.storage.getItem("chapterNum", 0) + 1;
hs.storage.setItem("chapterUserSelectedLevel", e);
this.initPassedLevelsIfNeeded();
hs.storage.setItem("chapterIsUserSelectMode", !0);
}
};
t.prototype.initPassedLevelsIfNeeded = function() {
for (var e = hs.storage.getItem("chapterNum", 0), t = [], r = 1; r <= e; r++) t.push(r);
hs.storage.setItem("chapterPassedLevels", t);
};
t.prototype.addChapterItemClickEvent = function(e) {
var t = this, r = e.target;
if (r && r.node && cc.isValid(r.node)) {
r.node.targetOff(this);
r.node.on(cc.Node.EventType.TOUCH_END, function() {
t.onChapterItemClick(r);
}, this);
}
};
t.prototype.clearChapterItemClickEvent = function(e) {
var t = e.target;
t && t.node && cc.isValid(t.node) && t.node.targetOff(this);
};
t.prototype.onChapterItemClick = function(e) {
if (!hs.UI.activeState(hs.ChapterPrefabConfig.ChapterReduceScoreWin.url) && !hs.UI.activeState(hs.ChapterPrefabConfig.ChapterReduceCollectWin.url) && e && e.node && cc.isValid(e.node)) {
var t = e.state.levelNum;
if (!hs.storage.getItem("chapterPassedLevels", []).includes(t)) {
hs.storage.setItem("chapterUserSelectedLevel", t);
this.moveChapterSeatToItem(e);
this.updateCurSeatLevelNum(t);
this.refreshStartGameBtn();
}
}
};
t.prototype.moveChapterSeatToItem = function(e) {
var t = Cinst(hs.ChapterContent), r = null == t ? void 0 : t.curChapterBtn;
if (r && cc.isValid(r)) {
var i = r.getComponent(cc.Button);
i && (i.interactable = !1);
r.setPosition(e.node.position);
r.active || (r.active = !0);
}
};
t.prototype.updateCurSeatLevelNum = function(e) {
var t = Cinst(hs.ChapterContent), r = null == t ? void 0 : t.curChapterBtn;
if (r && cc.isValid(r)) {
var i = r.getComponentInChildren(hs.ChapterCurSeat);
i && cc.isValid(i) && i.setState({
animName: "stand",
playTimes: 1,
curNumId: e
});
}
};
t.prototype.refreshStartGameBtn = function() {
var e = Cinst(hs.ChapterList), t = null == e ? void 0 : e.chapterLb;
if (t && cc.isValid(t)) {
var r = hs.storage.getItem("chapterUserSelectedLevel", 1);
t.string = "+" + r;
}
};
t.prototype.restoreUserSelectUI = function() {
if (hs.storage.getItem("chapterIsUserSelectMode", !1)) {
var e = hs.storage.getItem("chapterUserSelectedLevel", 1);
if (!(e <= 0)) {
var t = Cinst(hs.ChapterContent);
if (t && cc.isValid(t.node)) {
var r = t.itemList.find(function(t) {
return (null == t ? void 0 : t.state.levelNum) === e;
});
if (r && cc.isValid(r.node)) {
this.moveChapterSeatToItem(r);
this.updateCurSeatLevelNum(e);
}
}
}
}
};
t.prototype.updateChapterBtnState = function(e) {
return s(this, void 0, void 0, function() {
var t, r, i, a, n;
return o(this, function(s) {
switch (s.label) {
case 0:
if (!(t = e.target) || !cc.isValid(t.node)) return [ 2 ];
r = e.target.chapterBtn;
i = this.isAllLevelsPassed();
if (hs.themeInfo.remoteLoadBefore && i && !hs.NativeNetwork.getNetWorkState()) {
r.active = !1;
t.nextTip.active = !0;
t.chapterLb.node.active = !1;
return [ 2 ];
}
if (!i) return [ 3, 2 ];
t.nextTip.active = !1;
t.chapterBtn.active = !0;
t.chapterLb.node.active = !1;
return [ 4, hs.ResLoader.asyncLoadByBundle("chapter", this._btn_continuePath, cc.SpriteFrame) ];

case 1:
(a = s.sent()) && (r.getComponent(cc.Sprite).spriteFrame = a);
return [ 3, 4 ];

case 2:
t.nextTip.active = !1;
t.chapterBtn.active = !0;
t.chapterLb.node.active = !0;
hs.storage.setItem("isShowChapterRedPoint", 1);
n = hs.storage.getItem("chapterUserSelectedLevel", 1);
t.chapterLb.string = "+" + n;
return [ 4, this.setOldChapterBtnSprite(r) ];

case 3:
s.sent();
r.getComponent(cc.Button).interactable = !0;
s.label = 4;

case 4:
return [ 2 ];
}
});
});
};
t.prototype.setOldChapterBtnSprite = function(e) {
return s(this, void 0, void 0, function() {
var t;
return o(this, function(r) {
switch (r.label) {
case 0:
return [ 4, hs.ResLoader.asyncLoad(this._btn_continuePath_old, cc.SpriteFrame) ];

case 1:
(t = r.sent()) && (e.getComponent(cc.Sprite).spriteFrame = t);
return [ 2 ];
}
});
});
};
t.prototype.customMoveChapter = function(e) {
var t = e.target;
if (t && cc.isValid(t.node)) {
var r = hs.storage.getItem("chapterPassedLevels", []), i = t.state.curChapter - t.state.lastChapter, a = r.length >= hs.chapterGameInfo.chapterAllNum;
if (i <= 0) {
for (var n = 0; n < t.itemList.length; n++) {
var s = t.itemList[n], o = t.getLevelTextComp(n);
if ((l = r.indexOf(s.state.levelNum)) > -1) {
null == o || o.setState({
opacity: 0
});
null == s || s.setState({
isStopAllAction: !0,
isShowAnimation: !1,
showColor: !0,
isOpacityAni: !1,
opacity: 255
});
} else {
null == o || o.setState({
opacity: 255
});
null == s || s.setState({
isStopAllAction: !0,
isShowAnimation: !1,
isOpacityAni: !1
});
}
}
this.refreshUIState(e);
a ? this.hideUserSelectUI() : this.restoreUserSelectUI();
} else {
var c = r[r.length - 1];
if (a) {
for (n = 0; n < t.itemList.length; n++) {
s = t.itemList[n];
null == (o = t.getLevelTextComp(n)) || o.setState({
opacity: 0
});
null == s || s.setState({
isStopAllAction: !0,
isShowAnimation: !1,
showColor: !0,
isOpacityAni: !1,
opacity: 255
});
}
this.refreshUIState(e);
this.hideUserSelectUI();
} else {
for (n = 0; n < t.itemList.length; n++) {
s = t.itemList[n];
var l = r.indexOf(s.state.levelNum);
o = t.getLevelTextComp(n);
if (l > -1) if (s.state.levelNum === c) {
null == o || o.setState({
opacity: 0
});
null == s || s.setState({
isShowAnimation: !0,
showColor: !0,
isOpacityAni: !1,
opacity: 255
});
} else {
null == o || o.setState({
opacity: 0
});
null == s || s.setState({
isStopAllAction: !0,
isShowAnimation: !1,
showColor: !0,
isOpacityAni: !1,
opacity: 255
});
} else {
null == o || o.setState({
opacity: 255
});
null == s || s.setState({
isStopAllAction: !0,
isShowAnimation: !1,
isOpacityAni: !1
});
}
}
this.refreshUIState(e);
this.restoreUserSelectUI();
}
}
}
};
t.prototype.hideUserSelectUI = function() {
var e = Cinst(hs.ChapterContent), t = null == e ? void 0 : e.curChapterBtn;
t && cc.isValid(t) && (t.active = !1);
};
t.prototype.refreshUIState = function(e) {
var t = e.target;
t && cc.isValid(t.node) && t.state.isThrough && this.showWaveAnimation(e).then(function() {
t.showCupAnimation();
});
};
t.prototype.showWaveAnimation = function(e) {
var t = e.target;
if (t && cc.isValid(t.node)) {
for (var r = t.sortedAnimationList, i = r.length, a = function(e) {
for (var i = r[e], a = function(r) {
cc.tween(t.node).delay(.07 * (e + 1)).call(function() {
i[r].setState({
isThrough: !0,
isShowAnimation: !1,
throughRatio: 1
});
}).start();
}, n = 0; n < i.length; n++) a(n);
}, n = 0; n < r.length; n++) a(n);
return new Promise(function(e) {
cc.tween(t.node).delay(i / 2 * .07).call(function() {
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