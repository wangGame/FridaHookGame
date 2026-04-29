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



});