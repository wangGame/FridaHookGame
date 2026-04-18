function(e) {
0 === e ? DS("usr_data_push_remove", {
new_skin_unlock_push_remove: 1
}) : DS("usr_data_push_remove", {
new_skin_update_push_delay: 1
});
};
t.prototype.getPushTimeMs = function(e) {
var t = h(e.split(":").map(Number), 3), n = t[0], r = t[1];
t[2];
(isNaN(n) || n > 24 || n < 0) && (n = 0);
(isNaN(r) || r > 60 || r < 0) && (r = 0);
var i = new Date();
i.setHours(n, r, 0, 0);
return Math.floor(i.getTime());
};
return s([ classId("SkinChangeAblePushTrait") ], t);
}(Trait);
n.SkinChangeAblePushTrait = u;
cc._RF.pop();
}, {} ]
}, {}, [ "SkinChangeAblePushTrait" ]);