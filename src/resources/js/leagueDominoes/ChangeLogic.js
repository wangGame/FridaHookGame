'use strict';

/**
 * ==========================
 * 配置偏移（根据你的游戏内存结构修改）
 * ==========================
 */
const TILE_VALUE_OFFSET = 0x28; // Tile -> TileValue*
const TILE_LEFT_OFFSET  = 0x08; // TileValue.leftEnd
const TILE_RIGHT_OFFSET = 0x0C; // TileValue.rightEnd

/**
 * ==========================
 * 获取函数地址
 * ==========================
 */
const base = Module.findBaseAddress("libil2cpp.so");
if (!base) {
    console.log("❌ libil2cpp.so 未加载");
    throw "libil2cpp.so not found";
}

const RVA_GetTileForNextMove = 0x64BC38; // 你自己测得偏移
const addr = base.add(RVA_GetTileForNextMove);
console.log("🎯 AILogic.GetTileForNextMove =", addr);

/**
 * ==========================
 * 原函数声明
 * ==========================
 */
const orig_GetTileForNextMove = new NativeFunction(
    addr,
    'pointer',
    ['int', 'pointer', 'pointer']
);

/**
 * ==========================
 * Tile 值操作函数
 * ==========================
 */
function setTileValue(tilePtr, left, right) {
    if (tilePtr.isNull()) return;

    const tileValuePtr = tilePtr.add(TILE_VALUE_OFFSET).readPointer();
    if (tileValuePtr.isNull()) return;

    // 打印修改前的值
    const oldLeft  = tileValuePtr.add(TILE_LEFT_OFFSET).readS32();
    const oldRight = tileValuePtr.add(TILE_RIGHT_OFFSET).readS32();
    console.log(`🀄 原 Tile 值 [${oldLeft}|${oldRight}]`);

    tileValuePtr.add(TILE_LEFT_OFFSET).writeS32(left);
    tileValuePtr.add(TILE_RIGHT_OFFSET).writeS32(right);

    // 打印修改后的值
    console.log(`🀄 修改后 Tile 值 [${left}|${right}]`);
}

/**
 * ==========================
 * 完全接管
 * ==========================
 */


Interceptor.replace(
    addr,
    new NativeCallback(function(mode, aiPlayer, table) {
        console.log("\n🎮 GetTileForNextMove 被完全接管");
        console.log("   mode     =", mode);
        console.log("   aiPlayer =", aiPlayer);
        console.log("   table    =", table);

        // 1️⃣ 调一次原函数拿合法 Tile
        const tile = orig_GetTileForNextMove(mode, aiPlayer, table);
        if (tile.isNull()) {
            console.log("❌ 原函数返回 null");
            return tile;
        }

        // 2️⃣ 完全自定义 Tile 值，比如永远 [0|6]
        setTileValue(tile, 0, 6);

        // 3️⃣ 返回这个 Tile
        return tile;

    }, 'pointer', ['int', 'pointer', 'pointer'])
);

console.log("✅ GetTileForNextMove 已完全接管");
