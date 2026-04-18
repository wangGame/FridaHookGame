function(t) {
this.currData || (this.currData = this.getCommentLocalData());
if (1 == t && 1 != this.currData.lastType) {
this.currData.lastType = 1;
this.currData.travelContinCount = 0;
} else if (2 == t && 2 != this.currData.lastType) {
this.currData.lastType = 2;
this.currData.classContinCount = 0;
}
this.saveLocalData();
};
return a([ classId("$21013_f_CommentPopStartTrait") ], e);
}(c.Trait);
o.$21013_f_CommentPopStartTrait = y;
cc._RF.pop();
}, {
"../../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../../scripts/base/ui/UI": void 0,
"../../../../../../../scripts/modules/commentSkin/components/CommentSkin": void 0,
"../../../../../../../scripts/modules/game/type/GameType": void 0,
"../../../../../../../scripts/modules/