function(t) {
n(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.registerTraitEventsMethods = function() {
return [];
};
e.prototype.onActive = function(t) {
if (hs.tp.isIsOpenComboContinuousTraitUpdateComboPost(t) && hs.gameInfo.gameMode === hs.GameMode.Class) {
t.replace = !0;
var e = t.args[0];
e.continuousEliminateTimes = e.continuousEliminateTimes - 1;
var o = storage.getItem("classComboContinuous", 0);
storage.setItem("classComboContinuous", o - 1);
}
};
return i([ classId("ComboScoreSplitTrait") ], e);
}(Trait);
o.ComboScoreSplitTrait = c;
cc._RF.pop();
}, {} ]
}, {}, [ "ComboScoreSplitTrait" ]);