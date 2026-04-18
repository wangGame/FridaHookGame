'use strict';

//int __fastcall Level::startLevel(int a1, int a2, int a3)
// a2是模式
// a3是存储还是新开
// v10 = 150;  局的分数


const soName   = "libcocos2dcpp.so";      // 替换为你的实际 so
const funcName = "_ZN5Level10startLevelE11ELevelModel10EStartType"; // 替换为你的实际函数名

const addr = Module.findExportByName(soName, funcName);
console.log("[+] cards2Str @", addr);

Interceptor.attach(addr, {
    onEnter(args) {
        this.thisStr = args[0];   // std::string* 返回值
        this.level   = args[1].toInt32();   // Level*
        this.flag    = args[2].toInt32();

        console.log(this.level)
        console.log(this.flag)

    },

    onLeave(retval) {
        try {
            console.log(" 🟢 RESULT =", retval.toInt32());
        } catch (e) {
            console.error("read string failed", e);
        }
    }
});