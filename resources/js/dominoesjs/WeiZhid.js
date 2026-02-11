
'use strict';

/*
 * Player::getPlayCnt thunk + real impl hook
 * ARM64 / cocos2d-x
 */

const soName = "libcocos2dcpp.so";

// thunk 函数（反编译里看到的那个）
const thunkName = "_android_log_print";
// ⚠️ 注意：很多情况下 thunk 和 real 是同名的
// 如果你确认有两个地址，下面 realAddr 可以手动填

// 先找符号
const thunkAddr = Module.findExportByName(soName, thunkName);

if (!thunkAddr) {
    console.error("❌ thunk not found:", thunkName);

}

console.log("[+] Player::getPlayCnt thunk @", thunkAddr);

// ==============================
// Hook thunk
// ==============================
function dumpIntArray(ptr, count, name) {
    if (ptr.isNull()) return;
    console.log(`-- ${name} --`);
    for (let i = 0; i < count; i++) {
        console.log(`${name}[${i}] =`, ptr.add(i * 4).readInt());
    }
}

function dumpInt64Array(ptr, count, name) {
    if (ptr.isNull()) return;
    console.log(`-- ${name} --`);
    for (let i = 0; i < count; i++) {
        console.log(`${name}[${i}] =`, ptr.add(i * 8).readS64());
    }
}

Interceptor.attach(thunkAddr, {
    onEnter: function (args) {
        this.a2 = args[1];
        this.a3 = args[2];
        this.a4 = args[3];

        console.log("=== ENTER ===");
        console.log("a2[6] odds? =", this.a2.add(6 * 4).readInt());
    },

    onLeave: function (retval) {
        console.log("=== LEAVE ===");

        // 看 a3 是否被写入“结果”
        for (let i = 0; i < 4; i++) {
            const v = this.a3.add(i * 8).readS64();
            console.log(`a3[${i}] =`, v, v.toString(16));
        }

        // 看 a2 是否被修改
        for (let i = 0; i < 12; i++) {
            console.log(`a2[${i}] =`, this.a2.add(i * 4).readInt());
        }
    }
});