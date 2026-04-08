'use strict';

const moduleName = "libil2cpp.so";
const ON_PIECE_LINKED_RVA = 11860232;   // ThumbsUpFeedbackPlugin__OnPieceLinked
const HAS_TAG_RVA = 0x0;                // 这里填 sub_115CA34 的 RVA
const RETRY_INTERVAL = 200;

function p(x) {
    return ptr(x);
}

function readU8Safe(addr) {
    try {
        if (!addr || addr.isNull()) return -1;
        return Memory.readU8(addr);
    } catch (e) {
        return -1;
    }
}

function readS32Safe(addr) {
    try {
        if (!addr || addr.isNull()) return 0x7fffffff;
        return Memory.readS32(addr);
    } catch (e) {
        return 0x7fffffff;
    }
}

function readPtrSafe(addr) {
    try {
        if (!addr || addr.isNull()) return ptr(0);
        return Memory.readPointer(addr);
    } catch (e) {
        return ptr(0);
    }
}

function boolText(v) {
    if (v < 0) return "read-failed";
    return v ? "true" : "false";
}

function dumpLinkData(data) {
    if (!data || data.isNull()) {
        console.log("[LinkData] data is NULL");
        return;
    }

    const all = readPtrSafe(data.add(0x08));
    const linkId = readPtrSafe(data.add(0x0c));
    const isLast = readU8Safe(data.add(0x10));
    const draggingBlock = readPtrSafe(data.add(0x18));
    const tags = readPtrSafe(data.add(0x1c));

    console.log("[LinkData]");
    console.log("  data          =", data);
    console.log("  all           =", all);
    console.log("  linkId        =", linkId);
    console.log("  isLast        =", isLast, `(${boolText(isLast)})`);
    console.log("  draggingBlock =", draggingBlock);
    console.log("  tags          =", tags);

    return {
        all,
        linkId,
        isLast,
        draggingBlock,
        tags
    };
}

function installHook() {
    const base = Module.findBaseAddress(moduleName);
    if (base === null) {
        console.log(`[*] ${moduleName} not loaded, retry...`);
        setTimeout(installHook, RETRY_INTERVAL);
        return;
    }

    const onPieceLinked = base.add(ON_PIECE_LINKED_RVA);
    console.log("[*] module base =", base);
    console.log("[*] OnPieceLinked =", onPieceLinked);

    Interceptor.attach(onPieceLinked, {
        onEnter(args) {
            const thiz = args[0];
            const data = args[1];

            this.data = data;

            console.log("\n=== ThumbsUpFeedbackPlugin__OnPieceLinked ===");
            console.log("this =", thiz);
            dumpLinkData(data);
        },
        onLeave(retval) {
            console.log("ret =", retval);
            console.log("=== leave ThumbsUpFeedbackPlugin__OnPieceLinked ===");
        }
    });

    if (HAS_TAG_RVA !== 0) {
        const hasTag = base.add(HAS_TAG_RVA);
        console.log("[*] sub_115CA34 =", hasTag);

        Interceptor.attach(hasTag, {
            onEnter(args) {
                this.tags = args[0];
                this.tag = args[1].toInt32();
                this.caller = this.returnAddress;

                if (this.tag === 3 || this.tag === 5 || this.tag === 6) {
                    console.log(`[hasTag] tags=${this.tags} tag=${this.tag} caller=${this.caller}`);
                }
            },
            onLeave(retval) {
                if (this.tag === 3 || this.tag === 5 || this.tag === 6) {
                    console.log(`[hasTag] => ${retval.toInt32()}`);
                }
            }
        });
    } else {
        console.log("[!] HAS_TAG_RVA not set, tag checks not hooked");
    }

    console.log("[*] hooks installed");
}

setImmediate(installHook);
