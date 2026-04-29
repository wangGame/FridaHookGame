import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    console.log("🔥 CalculateBlockPriority HOOK START");

    // =========================
    // 强制 any（解决 TS2345 / Type 冲突）
    // =========================
    const Game: any = Il2Cpp.domain
        .assembly("Assembly-CSharp")
        .image
        .class("Game");

    const method: any = Game.method("CalculateBlockPriority");

    // =========================
    // BlockInfo 字段读取（全 k__BackingField）
    // =========================
    function getField(obj: any, name: string) {
        try {
            return obj.field(name).value;
        } catch {
            return "<err>";
        }
    }

    // =========================
    // HashSet<int> 展开
    // =========================
    function dumpHashSet(setObj: any) {
        try {
            const result: number[] = [];

            const enumerator = setObj.method("GetEnumerator").invoke();

            while (enumerator.method("MoveNext").invoke()) {
                const cur = enumerator.method("get_Current").invoke();
                result.push(cur);
            }

            return result;
        } catch {
            return "<hashset error>";
        }
    }

    // =========================
    // BlockInfo dump
    // =========================
    function dumpBlock(block: any) {

        console.log("\n{ BlockInfo }");

        const score = getField(block, "<Score>k__BackingField");
        const minX  = getField(block, "<MinX>k__BackingField");
        const maxX  = getField(block, "<MaxX>k__BackingField");
        const minY  = getField(block, "<MinY>k__BackingField");
        const maxY  = getField(block, "<MaxY>k__BackingField");

        console.log("  Score =", score);
        console.log("  MinX  =", minX);
        console.log("  MaxX  =", maxX);
        console.log("  MinY  =", minY);
        console.log("  MaxY  =", maxY);

        const indices = getField(block, "<Indices>k__BackingField");

        if (indices) {
            const arr = dumpHashSet(indices);
            console.log("  Indices =", arr);
        } else {
            console.log("  Indices = null");
        }
    }

    // =========================
    // HOOK 主逻辑
    // =========================
    method.implementation = function (...args: any[]) {

        console.log("\n==============================");
        console.log("🔥 CalculateBlockPriority");
        console.log("==============================");
        const k = this.method("CalculateBlockPriority").invoke(...args);

        const blocks = args[0];
        const vacantGroups = args[1];

        try {
            const count = blocks.method("get_Count").invoke();
            console.log("Blocks size =", count);

            for (let i = 0; i < count; i++) {

                const block = blocks.method("get_Item").invoke(i);

                console.log(`\n--- Block ${i} ---`);
                dumpBlock(block);
            }

        } catch (e) {
            console.log("❌ dump error:", e);
        }
        // =========================
        // 调用原函数（关键）
        // =========================
         return k;
    };

});