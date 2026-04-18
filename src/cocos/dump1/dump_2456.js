function() {
"use strict";
if (!ArrayBuffer.isView) {
var t = Object.getPrototypeOf(Int8Array);
ArrayBuffer.isView = "funct