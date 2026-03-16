function(t, e, i) {
this._onEvent = i;
this._type = t || 0;
this._listenerID = e || "";
this._registered = !1;
this._fixedPriority = 0;
this._node = null;
this._target = null;
this._paused = !0;
this._isEnabled = !0;
};
cc.EventListener.prototype = {
constructor: cc.EventListener,
_setPaused: function(t) {
this._paused = t;
},
_isPaused: function() {
return this._paused;
},
_setRegistered: function(t) {
this._registered = t;
},
_isRegistered: function() {