'use strict';

const soName = "libcocos2dcpp.so"; // 按你的实际 so 改
const funcName = "_ZN5Level9cards2StrEb";

const addr = Module.findExportByName(soName, funcName);
console.log("[+] cards2Str @", addr);

Interceptor.attach(addr, {
    onEnter(args) {
        this.thisStr = args[0];   // std::string* (返回值)
        this.level   = args[1];   // Level*
        this.flag    = args[2].toInt32();

        const offset = this.flag ? 88 : 76;
        const vec = this.level.add(offset);

        this.begin = vec.readPointer();
        this.end   = vec.add(4).readPointer();

        const count = this.end.sub(this.begin).toInt32() / 24;

        console.log("🟦 cards2Str");
        console.log(" flag =", this.flag);
        console.log(" cardCount =", count);

        // 打印每张卡的原始数据
        for (let i = 0; i < count; i++) {
            const card = this.begin.add(i * 24);
            console.log(`  Card[${i}] @ ${card}`);
            dumpCard(card)
        }
    },

    onLeave(retval) {
        try {
            // std::string 内容
            const strPtr = this.thisStr;
            const isSmall = strPtr.readU8() & 1;

            let dataPtr, len;
            if (isSmall) {
                len = strPtr.readU8() >> 1;
                dataPtr = strPtr.add(1);
            } else {
                dataPtr = strPtr.add(8).readPointer();
                len = strPtr.add(16).readU32();
            }

            const result = dataPtr.readUtf8String(len);
            console.log(" 🟢 RESULT =", result);
        } catch (e) {
            console.error("read string failed", e);
        }
    }
});

function dumpCard(ptr) {
    try {
        const begin = ptr.add(8).readPointer();  // begin 指针
        const end   = ptr.add(12).readPointer(); // end 指针
        const count = end.sub(begin).toInt32() / 4; // 每张卡 4 字节

        const cards = [];
        for (let i = 0; i < count; i++) {
            const val = begin.add(i * 4).readS32();
            cards.push(val);
        }

        console.log("🧩 Card Values =", cards);
    } catch (e) {
        console.error("dumpCard failed", e);
    }
}