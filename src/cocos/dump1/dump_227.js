function(t) {
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