function" == typeof __require && __require;
if (!n && u) return u(c, !0);
if (a) return a(c, !0);
throw new Error("Cannot find module '" + i + "'");
}
i = c;
}
var l = t[i] = {
exports: {}
};
e[i][0].call(l.exports, function(r) {
return s(e[i][1][r] || r);
}, l, l.exports, r, e, t, o);
}
return t[i].exports;
}
for (var a = "function" == typeof __require && __require, i = 0; i < o.length; i++) s(o[i]);
return s;
}({
FirstEightGamesConfig: [ function(r, e, t) {
"use strict";
cc._RF.push(e, "bb2d76hHltJfJxDKAYwh7Tb", "FirstEightGamesConfig");
Object.defineProperty(t, "__esModule", {
value: !0
});
t.isInFirstEightGames = t.getFirstEightGameConfig = t.FirstEightGamesConfig = void 0;
t.FirstEightGamesConfig = [ {
gameNum: 1,
boardData: [ [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ 4, 4, 4, -1, -1, 4, 4, 4 ], [ 4, -1, -1, -1, -1, -1, -1, 4 ], [ -1, -1, 7, -1, -1, 7, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ] ],
producerBlocks: [ 14, 18, 9 ],
blocksColors: [ 6, 3, 1 ]
}, {
gameNum: 2,
boardData: [ [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, 7, -1, -1, -1, -1, 7, -1 ], [ -1, 7, 7, 7, 7, 7, 7, -1 ], [ -1, -1, -1, 2, 2, -1, -1, -1 ] ],
producerBlocks: [ 24, 36, 23 ],
blocksColors: [ 6, 4, 5 ]
}, {
gameNum: 3,
boardData: [ [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, 5, -1, -1, -1, -1, -1, -1 ], [ 5, 2, 5, -1, -1, -1, -1, -1 ], [ -1, 5, -1, -1, 7, -1, -1, -1 ], [ -1, -1, -1, 7, 2, 7, -1, -1 ], [ -1, -1, -1, -1, 7, -1, -1, -1 ] ],
producerBlocks: [ 33, 19, 16 ],
blocksColors: [ 4, 2, 6 ]
}, {
gameNum: 4,
boardData: [ [ -1, 4, -1, -1, -1, -1, 4, -1 ], [ -1, -1, 4, -1, -1, 4, -1, -1 ], [ 4, 4, 4, -1, -1, 4, 4, 4 ], [ 4, -1, -1, -1, -1, -1, -1, 4 ], [ -1, -1, 6, -1, -1, 6, -1, -1 ], [ 4, -1, -1, -1, -1, -1, -1, 4 ], [ 4, 4, 4, -1, -1, 4, 4, 4 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ] ],
producerBlocks: [ 18, 14, 9 ],
blocksColors: [ 7, 2, 1 ]
}, {
gameNum: 5,
boardData: [ [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, 2, 2, 2, 2, 2, 2, -1 ], [ -1, 3, 3, -1, -1, 3, 3, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ] ],
producerBlocks: [ 24, 36, 23 ],
blocksColors: [ 4, 3, 7 ]
}, {
gameNum: 6,
boardData: [ [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, 5, -1 ], [ -1, -1, -1, -1, -1, 5, 2, 5 ], [ -1, 4, -1, -1, -1, 6, 5, -1 ], [ 4, 2, 4, -1, -1, 6, -1, -1 ], [ -1, 4, 6, -1, -1, 6, -1, -1 ], [ -1, -1, 6, -1, -1, 6, -1, -1 ], [ -1, -1, 6, -1, -1, 6, -1, -1 ] ],
producerBlocks: [ 36, 19, 15 ],
blocksColors: [ 4, 4, 7 ]
}, {
gameNum: 7,
boardData: [ [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ 3, 3, 3, -1, -1, 3, 3, 3 ], [ 3, -1, 5, -1, -1, 5, -1, 3 ], [ -1, -1, -1, -1, -1, -1, -1, -1 ], [ -1, -1, -1, 6, 5, -1, -1, -1 ], [ -1, -1, -1, 5, 6, -1, -1, -1 ] ],
producerBlocks: [ 35, 10, 36 ],
blocksColors: [ 4, 7, 2 ]
}, {
gameNum: 8,
boardData: [ [ -1, 1, -1, 5, 5, -1, 1, -1 ], [ 1, 1, -1, 5, 5, -1, 1, 1 ], [ 1, -1, 7, 5, 5, 7, -1, 1 ], [ 1, 1, -1, 5, 5, -1, 1, 1 ], [ -1, 1, -1, 5, 5, -1, 1, -1 ], [ -1, 1, -1, 5, 5, -1, 1, -1 ], [ 5, 5, 2, -1, -1, 2, 5, 5 ], [ 5, 5, 2, -1, -1, 2, 5, 5 ] ],
producerBlocks: [ 23, 9, 24 ],
blocksColors: [ 6, 5, 7 ]
} ];
t.getFirstEightGameConfig = function(r, e) {
void 0 === e && (e = !1);
e && r--;
return t.FirstEightGamesConfig.find(function(e) {
return e.gameNum === r;
});
};
t.isInFirstEightGames = function(r, e) {
void 0 === e && (e = !1);
e && r--;
return r >= 1 && r <= 8;
};
cc._RF.pop();
}, {} ],
FirstEightGamesFixedBoardTrait: [ function(r, e, t) {
"use strict";
cc._RF.push(e, "e7349dzhJRDr7mynjlcMS0T", "FirstEightGamesFixedBoardTrait");
var o, s = this && this.__extends || (o = function(r, e) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(r, e) {
r.__proto__ = e;
} || function(r, e) {
for (var t in e) Object.prototype.hasOwnProperty.call(e, t) && (r[t] = e[t]);
})(r, e);
}, function(r, e) {
o(r, e);
function t() {
this.constructor = r;
}
r.prototype = null === e ? Object.create(e) : (t.prototype = e.prototype, new t());
}), a = this && this.__decorate || function(r, e, t, o) {
var s, a = arguments.length, i = a < 3 ? e : null === o ? o = Object.getOwnPropertyDescriptor(e, t) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(r, e, t, o); else for (var n = r.length - 1; n >= 0; n--) (s = r[n]) && (i = (a < 3 ? s(i) : a > 3 ? s(e, t, i) : s(e, t)) || i);
return a > 3 && i && Object.defineProperty(e, t, i), i;
};
Object.defineProperty(t, "__esModule", {
value: !0
});
t.FirstEightGamesFixedBoardTrait = void 0;
var i = r("./FirstEightGamesConfig"), n = function(r) {
s(e, r);
function e() {
return null !== r && r.apply(this, arguments) || this;
}
Object.defineProperty(e.prototype, "fixGameNum", {
get: function() {
return this.props.fixGameNum;
},
enumerable: !1,
configurable: !0
});
e.prototype.registerTraitEventsMethods = function() {
return [ {
className: "ClassBlocksProducer_BlocksProducerValidate_Proxy",
methodName: "onBoardSplashAnimationEnd"
} ];
};
e.prototype.onActive = function(r) {
if (hs.tp.isClassDefaultBoard_ProxyProduceDefaultBoard(r)) {
var e = hs.classGameInfo.gameNum;
if (!i.isInFirstEightGames(e)) return;
var t = e + 1;
if (!(a = i.getFirstEightGameConfig(t, this.fixGameNum))) return;
r.args[0] = a.boardData;
r.returnState = !0;
}
if (hs.tp.isClassDefaultBoard_ProxyProduceDefaultColor(r)) {
e = hs.classGameInfo.gameNum;
i.isInFirstEightGames(e) && (r.returnState = !0);
}
if (hs.tp.isClassDefaultBoard_ProxyProduceDefaultBoardTurnAround(r)) {
e = hs.classGameInfo.gameNum;
i.isInFirstEightGames(e) && (r.returnState = !0);
}
if (hs.tp.isClassBlocksProducer_ProxyGuideRequestBlocksProducer(r)) {
var o = hs.classGameInfo, s = (e = o.gameNum, o.roundNum);
if (this.fixGameNum && e < 1) return;
var a = i.getFirstEightGameConfig(e + 1, this.fixGameNum);
Cinst(hs.BlocksProducer).setState({
producerBlocks: a.producerBlocks,
colors: a.blocksColors
});
storage.setItem("classFaceBlocks", a.boardData);
storage.setItem("classProducerBlocks", a.producerBlocks);
hs.EventManager.dispatchModuleEvent(new hs.E_ClassBoard_Render(a.boardData));
r.replace = !0;
}
if (hs.tp.isClassBlocksProducer_BlocksProducerValidate_ProxyOnBoardSplashAnimationEnd(r)) {
var n = hs.classGameInfo;
e = n.gameNum, s = n.roundNum;
if (!i.isInFirstEightGames(e)) return;
if (0 !== s) return;
t = e + 1;
if (!(a = i.getFirstEightGameConfig(t, this.fixGameNum))) return;
storage.setItem("classProducerBlocks", a.producerBlocks);
hs.classColorProducerGameInfo.setColorList(a.blocksColors);
}
if (hs.tp.isClassBlocksProducer_BlocksProducerValidate_ProxySetRecordOperationColor(r)) {
var c = hs.classGameInfo;
e = c.gameNum, s = c.roundNum;
if (!i.isInFirstEightGames(e)) return;
if (0 === s) {
r.returnState = !0;
r.replace = !0;
}
}
};
return a([ classId("FirstEightGamesFixedBoardTrait") ], e);
}(Trait);
t.FirstEightGamesFixedBoardTrait = n;
cc._RF.pop();
}, {
"./FirstEightGamesConfig": "FirstEightGamesConfig"
} ]
}, {}, [ "FirstEightGamesConfig", "FirstEightGamesFixedBoardTrait" ]);