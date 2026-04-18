function(t, e) {
r(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), i = this && this.__decorate || function(t, e, o, r) {
var n, i = arguments.length, c = i < 3 ? e : null === r ? r = Object.getOwnPropertyDescriptor(e, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, r); else for (var s = t.length - 1; s >= 0; s--) (n = t[s]) && (c = (i < 3 ? n(c) : i > 3 ? n(e, o, c) : n(e, o)) || c);
return i > 3 && c && Object.defineProperty(e, o, c), c;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.ComboScoreSplitTrait = void 0;
var c = function(t) {
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