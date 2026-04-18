function() {
if (0 == this.state.defaultSurfaceData.length) {
storage.setItem("classDefaultBoardConfigType", p.ClassDefautBoardConfigType.BOARD_2000);
for (var e = m.classDefaultBoardInfo.usedLevelConfigs, t = 0; t < e.length; t++) this.state.defaultSurfaceData.push(e[t].Map);
}
};
return a([ classId("DefaultSurfaceTrait") ], t);
}(s.Trait);
o.DefaultSurfaceTrait = f;
cc._RF.pop();
}, {
"../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../scripts/modules/GBM/vo/GBMInfo": void 0,
"../../../../../../scripts/modules/algorithmStrategy/type/AlgorithmStrategyType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo": void 0,
"../../../../../../scripts/modules/board/vo/BoardInfo": void 0,
"../../../../../../scripts/modules/board/vo/BoardRendererInfo": void 0,
"../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0,
"../../GBM/vo/ClassGBMInfo": "ClassGBMInfo",
"../type/ClassDefaultBoardType": "ClassDefaultBoardType",
"../vo/ClassDefaultBoardInfo": "ClassDefaultBoardInfo"
} ],
DifToAllGroupFilEmptyTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "f534aRlFu5MYbfkRuhql82r", "DifToAllGroupFilEmptyTrait");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), a = this && this.__decorate || function(e, t, o, r) {
var i, a = arguments.length, s = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, o, r); else for (var n = e.length - 1; n >= 0; n--) (i = e[n]) && (s = (a < 3 ? i(s) : a > 3 ? i(t, o, s) : i(t, o)) || s);
return a > 3 && s && Object.defineProperty(t, o, s), s;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.DifToAllGroupFilEmptyTrait = void 0;
var s = e("../../../../../../scripts/base/trait/Trait"), n = e("../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo"), l = e("../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate"), c = e("../../../../../../scripts/modules/algorithm/type/AlgorithmType"), u = e("../../../../../../scripts/modules/traitConfig/vo/TraitConfigSafePropsInfo"), d = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onActive = function(e) {
if (l.tp.isClassAlgorithmStrategy_Replace_ProxyPreprocessingAlgorithm(e) && Math.random() <= this.propRate) {
var t = n.algorithmStrategyInfo.algorithmList, o = this.propReplaceArray;
if (t.some(function(e) {
return o.includes(e);
})) {
var r = this.propTargetId;
n.algorithmStrategyInfo.setAlgorithmList([ r ]);
}
}
};
Object.defineProperty(t.prototype, "propRate", {
get: function() {
return u.traitConfigSafePropsInfo.getSafePropValueByKey("DifToAllGroupFilEmptyTrait", "rate", this.props, .03);
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(t.prototype, "propTargetId", {
get: function() {
return u.traitConfigSafePropsInfo.getSafePropValueByKey("DifToAllGroupFilEmptyTrait", "targetId", this.props, c.OFFER_TYPE.ALL_COMBINATION_ID9);
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(t.prototype, "propReplaceArray", {
get: function() {
var e = u.traitConfigSafePropsInfo.getSafePropValueByKey("DifToAllGroupFilEmptyTrait", "replaceArray", this.props, null);
null != e && 0 !== e.length || (e = Object.values(c.OFFER_TYPE_DIFFICULTY));
return e;
},
enumerable: !1,
configurable: !0
});
return a([ classId("DifToAllGroupFilEmptyTrait") ], t);
}(s.Trait);
o.DifToAllGroupFilEmptyTrait = d;
cc._RF.pop();
}, {
"../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../scripts/modules/algorithm/type/AlgorithmType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo": void 0,
"../../../../../../scripts/modules/traitConfig/vo/TraitConfigSafePropsInfo": void 0,
"../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0
} ],
DiffRoundChangeScoreTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "e6b81ay+xBAHLidFQUQpCcj", "DiffRoundChangeScoreTrait");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), a = this && this.__decorate || function(e, t, o, r) {
var i, a = arguments.length, s = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, o, r); else for (var n = e.length - 1; n >= 0; n--) (i = e[n]) && (s = (a < 3 ? i(s) : a > 3 ? i(t, o, s) : i(t, o)) || s);
return a > 3 && s && Object.defineProperty(t, o, s), s;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.DiffRoundChangeScoreTrait = void 0;
var s = e("../../../../../../scripts/modules/algorithm/vo/AlgorithmName"), n = e("../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate"), l = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onActive = function(e) {
if (n.tp.isClassScore_ProxyComputeBaseScore(e) && (null == (o = (s.algorithmName.algoActualName || []).join(",")) ? void 0 : o.includes("难题"))) {
var t = e.args[0];
e.args[0] = t * (this.props.times || 2);
}
if (n.tp.isClassScoreInfoGetEliminateScorePost(e)) {
var o;
if (null == (o = (s.algorithmName.algoActualName || []).join(",")) ? void 0 : o.includes("难题")) {
var r = e.args[2];
e.returnValue = r * (this.props.times || 2);
}
}
};
return a([ classId("DiffRoundChangeScoreTrait") ], t);
}(Trait);
o.DiffRoundChangeScoreTrait = l;
cc._RF.pop();
}, {
"../../../../../../scripts/modules/algorithm/vo/AlgorithmName": void 0,
"../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0
} ],
DragScoreTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "c1a32dLnQVK7Yg/cVpzQNVo", "DragScoreTrait");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), a = this && this.__decorate || function(e, t, o, r) {
var i, a = arguments.length, s = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, o, r); else for (var n = e.length - 1; n >= 0; n--) (i = e[n]) && (s = (a < 3 ? i(s) : a > 3 ? i(t, o, s) : i(t, o)) || s);
return a > 3 && s && Object.defineProperty(t, o, s), s;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.DragScoreTrait = void 0;
var s = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onActive = function() {};
return a([ classId("DragScoreTrait") ], t);
}(e("../../../../../../scripts/base/trait/Trait").Trait);
o.DragScoreTrait = s;
cc._RF.pop();
}, {
"../../../../../../scripts/base/trait/Trait": void 0
} ],
DurationPreAlgoToOhterAlgoTrait: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "0d41a3JdmlOKJHbR93TA/EI", "DurationPreAlgoToOhterAlgoTrait");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), a = this && this.__decorate || function(e, t, o, r) {
var i, a = arguments.length, s = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, t, o, r); else for (var n = e.length - 1; n >= 0; n--) (i = e[n]) && (s = (a < 3 ? i(s) : a > 3 ? i(t, o, s) : i(t, o)) || s);
return a > 3 && s && Object.defineProperty(t, o, s), s;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.DurationPreAlgoToOhterAlgoTrait = void 0;
var s = e("../../../../../../scripts/base/trait/Trait"), n = e("../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo"), l = e("../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate"), c = e("../../game/vo/ClassGameInfo"), u = e("../../../../../../scripts/modules/algorithmStrategy/type/AlgorithmStrategyType"), d = e("../../../../../../scripts/base/enum/enum"), p = e("../../../../../../scripts/modules/algorithm/type/AlgorithmType"), m = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.storeValue = function(e) {
storage.setItem("DurationPreAlgoToOhterAlgoTrait", e);
};
t.prototype.hadValue = function() {
return storage.getItem("DurationPreAlgoToOhterAlgoTrait", 0);
};
t.prototype.storePuzzleTimeValue = function(e) {
storage.setItem("DurationPreAlgoToOhterAlgoTraitPuzzleTime", e);
};
t.prototype.hadPuzzleTimeValue = function() {
return storage.getItem("DurationPreAlgoToOhterAlgoTraitPuzzleTime", 0);
};
t.prototype.onActive = function(e) {
c.classGameInfo.roundNum <= 1 && this.storePuzzleTimeValue(0);
c.classGameInfo.roundNum <= 1 && this.storeValue(0);
if (l.tp.isClassAlgorithmStrategy_Replace_ProxyPreprocessingAlgorithm(e)) {
var t = this.props.PreAlgo, o = this.props.AfterAlgo, r = this.props.Duration, i = c.classGameInfo.gameTime / 1e3;
if (1 == this.hadValue()) return;
if (1 == t && 4 == o && i < r) {
var a = n.algorithmStrategyInfo.algorithmList, s = !1;
a.forEach(function(e) {
d.isValueInEnum(e, p.OFFER_TYPE_DIFFICULTY) && (s = !0);
});
if (s && 0 == this.hadValue()) {
n.algorithmStrategyInfo.setAlgorithmList([ p.OFFER_TYPE.TIAN_KONG_XIAO_CHU ]);
n.algorithmStrategyInfo.setAlgorithmSourceLevel2(this.traitName);
this.storeValue(1);
}
}
}
if (l.tp.isIsPuzzleTimeTraitFirstPuzzleTimeCall(e)) {
t = this.props.PreAlgo, o = this.props.AfterAlgo;
var m = this.hadPuzzleTimeValue();
if (2 == t && 1 == o && 0 == m) {
var f = TRAIT("Puzzle100Trait");
if ((null == f ? void 0 : f.active) && !f.state.isHard) {
n.algorithmStrategyInfo.setAlgorithmSourceLevel1(u.ClassAlgorithmSourceType.Puzzle100);
n.algorithmStrategyInfo.setAlgorithmList([ p.OFFER_TYPE.KUN_NAN_TI ]);
f.setState({
isHard: !0
});
this.storePuzzleTimeValue(1);
}
}
}
};
return a([ classId("DurationPreAlgoToOhterAlgoTrait") ], t);
}(s.Trait);
o.DurationPreAlgoToOhterAlgoTrait = m;
cc._RF.pop();
}, {
"../../../../../../scripts/base/enum/enum": void 0,
"../../../../../../scripts/base/trait/Trait": void 0,
"../../../../../../scripts/modules/algorithm/type/AlgorithmType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/type/AlgorithmStrategyType": void 0,
"../../../../../../scripts/modules/algorithmStrategy/vo/AlgorithmStrategyInfo": void 0,
"../../../../../../scripts/modules/traits/typePredicate/TraitTypePredicate": void 0,
"../../game/vo/ClassGameInfo": "ClassGameInfo"
} ],
E_ClassAdvertisement_Show: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "b0008mls0VOfL5nW6A0y0fW", "E_ClassAdvertisement_Show");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAdvertisement_Show = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAdvertisement_Show = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_BlocksPos: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "9ff3clQ2utE24/VWfpdHEey", "E_ClassAlgorithmStrategy_BlocksPos");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_BlocksPos = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_BlocksPos = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_Condition: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "f41cbhi9t5DMa49QxzRqygD", "E_ClassAlgorithmStrategy_Condition");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_Condition = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_Condition = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_Deal: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "b0df9Fr4xJNDrk9rpRI+n5b", "E_ClassAlgorithmStrategy_Deal");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_Deal = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = e.call(this) || this;
o.option = t;
return o;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_Deal = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_Priority: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "35fd7ODv2RJy4yovKC0IJzF", "E_ClassAlgorithmStrategy_Priority");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_Priority = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_Priority = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_Replace: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "7a7c54xYA5OB7xLutPxAC3j", "E_ClassAlgorithmStrategy_Replace");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_Replace = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_Replace = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_Reset: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "66a2bwWFJxI/45gsotKQvsA", "E_ClassAlgorithmStrategy_Reset");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_Reset = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_Reset = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_RunState: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "08fcaLZJHVPfougt1NL3ZFl", "E_ClassAlgorithmStrategy_RunState");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_RunState = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = e.call(this) || this;
o.option = t;
return o;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_RunState = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassAlgorithmStrategy_Run: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d6825Nrwy5FboOpjTr24JB9", "E_ClassAlgorithmStrategy_Run");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassAlgorithmStrategy_Run = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = e.call(this) || this;
o.option = t;
return o;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassAlgorithmStrategy_Run = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassBlockOutStrategy_Exe: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "2f282Rq39FFz57JPPSNhxab", "E_ClassBlockOutStrategy_Exe");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassBlockOutStrategy_Exe = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassBlockOutStrategy_Exe = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassBlockOutStrategy_FirstRound: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "efa1bPjXEZF8YLtpFuPQb07", "E_ClassBlockOutStrategy_FirstRound");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassBlockOutStrategy_FirstRound = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassBlockOutStrategy_FirstRound = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassBoard_CanPutValidateStart: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "17bc1lddx5OiKYUtgPry9te", "E_ClassBoard_CanPutValidateStart");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassBoard_CanPutValidateStart = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassBoard_CanPutValidateStart = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassBoard_Render: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "41adeaxcERJKbFnory9sOra", "E_ClassBoard_Render");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassBoard_Render = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = e.call(this) || this;
o.boards = t;
return o;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassBoard_Render = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassColorProducer_Exe: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "e0318upj8RHEZdPu9Dk76Wz", "E_ClassColorProducer_Exe");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassColorProducer_Exe = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassColorProducer_Exe = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassDataStatistics_Clear: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "13800+t5BROy6VHswBsX7Bo", "E_ClassDataStatistics_Clear");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassDataStatistics_Clear = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassDataStatistics_Clear = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassDataStatistics_Count: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "aa3daczcsVE45AKXHFI7oSe", "E_ClassDataStatistics_Count");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassDataStatistics_Count = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassDataStatistics_Count = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassDefaultBoard_ReadyComplete: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "fa331q2jgFHe7YOH92oJ+IS", "E_ClassDefaultBoard_ReadyComplete");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassDefaultBoard_ReadyComplete = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassDefaultBoard_ReadyComplete = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassEliminate_Play_EliminateEffect: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "df02eqvVn9M7YE09TIZU/3g", "E_ClassEliminate_Play_EliminateEffect");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassEliminate_Play_EliminateEffect = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = e.call(this) || this;
o.state = t;
return o;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassEliminate_Play_EliminateEffect = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassEliminate_Play_PreEliminateEffect: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "9d9ebCF7DBCZZwLu6kQ70Er", "E_ClassEliminate_Play_PreEliminateEffect");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassEliminate_Play_PreEliminateEffect = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = e.call(this) || this;
o.state = t;
return o;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassEliminate_Play_PreEliminateEffect = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassEliminate_Recycle_Effect: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "c1b4bIywsdKVZ2sQQ/qfQWj", "E_ClassEliminate_Recycle_Effect");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassEliminate_Recycle_Effect = void 0;
var a = function(e) {
i(t, e);
function t() {
return e.call(this) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassEliminate_Recycle_Effect = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassFail_Click: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d6af95boR9D6r+pa+OX3V2M", "E_ClassFail_Click");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassFail_Click = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassFail_Click = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassFail_Show: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "8accfc0B3ZOoa+U2B2sL5A2", "E_ClassFail_Show");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassFail_Show = void 0;
var a = function(e) {
i(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../../../../scripts/falcon/ModuleEvent").ModuleEvent);
o.E_ClassFail_Show = a;
cc._RF.pop();
}, {
"../../../../../../scripts/falcon/ModuleEvent": void 0
} ],
E_ClassGameDataClear_Disk: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "5b55do3YeFMPIMvGlKoTFPr", "E_ClassGameDataClear_Disk");
var r, i = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.E_ClassGameDataClear_Disk = void 0;
var a = function(e) {
i(t, e);
function t(t) {
var o = 