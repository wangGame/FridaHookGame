function() {
"use strict";
Number.parseFloat = Number.parseFloat || parseFloat;
Number.parseInt = Number.parseInt || parseInt;
}), {} ],
334: [ (function() {
"use strict";
Object.assign || (Object.assign = function(t, e) {
return cc.js.mixin(t, e);
});
Object.getOwnPropertyDescriptors ||