'use strict';

const MODULE = "libcocos2dcpp.so";


function hook(name) {

   const addr = Module.findExportByName(MODULE, name);


  console.log("[+] hook", name, "@",addr);
  return addr;
}

// 1) 看 guide 有没有直接决定
const guide = hook("_ZN5Level19drawACardGuideLogicEbi"); // 你需要用你实际符号名
Interceptor.attach(guide, {
  onEnter(args) {
    console.log("🎯 guide ENTER a2=", args[1].toInt32(), "a3=", args[2].toInt32());
  },
  onLeave(retval) {
    console.log("🎯 guide RET =", retval.toInt32());
  }
});

// 2) 看最终 drawACardLogic 返回的卡牌 id
const draw = hook("_ZN5Level14drawACardLogicEbi"); // 你需要用你实际符号名
Interceptor.attach(draw, {
  onEnter(args) {
    console.log("🃏 draw ENTER this=", args[0], "a2=", args[1].toInt32(), "a3=", args[2].toInt32());
  },
  onLeave(retval) {
    console.log("🃏 draw RET(cardId) =", retval.toInt32());
  }
});