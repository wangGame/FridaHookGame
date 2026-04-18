function() {
var e;
null === (e = t.originalCaller) || void 0 === e || e.call(t);
}, 0);
}
}
};
e.prototype.gameEnd = function(t) {
void 0 === t && (t = !1);
this.nextRoundCanChangeSkin = !1;
u.gameInfo.gameMode === p.GameMode.Class && this.classGameOver();
if (u.gameInfo.gam