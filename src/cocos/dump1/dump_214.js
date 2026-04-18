function(t, e, r) {
"use strict";
cc._RF.push(e, "b389fkoi/9GZbzbkMgUEAE6", "LimitNoviceBlockSizeTrait");
var o, i = this && this.__extends || (o = function(t, e) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
})(t, e);
}, function(t, e) {
o(t, e);
function r() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (r.prototype = e.prototype, new r());
}), n = this && this.__decorate || function(t, e, r, o) {
var i, n = arguments.length, u = n < 3 ? e : null === o ? o = Object.getOwnPropertyDescriptor(e, r) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) u = Reflect.decorate(t, e, r, o); else for (var c = t.length - 1; c >= 0; c--) (i = t[c]) && (u = (n < 3 ? i(u) : n > 3 ? i(e, r, u) : i(e, r)) || u);
return n > 3 && u && Object.defineProperty(e, r, u), u;
};
Object.defineProperty(r, "__esModule", {
value: !0
});
r.LimitNoviceBlockSizeTrait = void 0;
var u = function(t) {
i(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
r = e;
e.prototype.onActive = function(t) {
var e;
if (hs.tp.isAlgorithmProcessInfoHandleArgs(t)) {
if (!this.shouldApplyForCurrentRound()) return;
var r = null === (e = t.args) || void 0 === e ? void 0 : e[0];
if (!r || "object" != typeof r) return;
this.applyFilterBlocks(r);
}
};
e.prototype.shouldApplyForCurrentRound = function() {
if (hs.gameInfo.gameMode !== hs.GameMode.Class) return !1;
if (hs.classGuideInfo.show) return !1;
var t = hs.classGameInfo.gameNum, e = hs.classGameInfo.roundNum, r = this.getLimitRoundsByGameNum(t);
return !(r <= 0 || !Number.isFinite(e) || e < 1 || e > r);
};
e.prototype.getLimitRoundsByGameNum = function(t) {
var e, r = null === (e = this.props) || void 0 === e ? void 0 : e.config, o = (Array.isArray(r) ? r : [])[Number.isFinite(t) && t >= 0 ? Math.floor(t) : 0], i = "number" == typeof o ? o : 0;
return Number.isFinite(i) && i > 0 ? Math.floor(i) : 0;
};
e.prototype.applyFilterBlocks = function(t) {
for (var e = r.LIMIT_BLOCK_IDS_OVER_5, o = (Array.isArray(t.filterBlocks) ? t.filterBlocks : []).slice(), i = 0; i < e.length; i++) {
var n = e[i];
"number" == typeof n && Number.isFinite(n) && !o.includes(n) && o.push(n);
}
t.filterBlocks = o;
};
var r;
e.LIMIT_BLOCK_IDS_OVER_5 = [ 13, 35, 36 ];
return r = n([ classId("LimitNoviceBlockSizeTrait") ], e);
}(Trait);
r.LimitNoviceBlockSizeTrait = u;
cc._RF.pop();
}, {} ]
}, {}, [ "LimitNoviceBlockSizeTrait" ]);