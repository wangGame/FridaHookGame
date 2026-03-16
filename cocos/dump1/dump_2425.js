function(t) {
this.target.setPosition(t);
this._previousPosition = t;
},
getPoints: function() {
return this._points;
},
setPoints: function(t) {
this._points = t;
}
});
cc.cardinalSplineTo = function(t, e, i) {
return new cc.CardinalSplineTo(t, e, i);
};
cc.CardinalS