import "frida-il2cpp-bridge";
declare const Il2Cpp: any;   // ⭐ 关键
Il2Cpp.perform(() => {

    const Game = Il2Cpp.domain
        .assembly("Assembly-CSharp")
        .image
        .class("Game");

    console.log("[+] Tracing all Game methods");

    Il2Cpp.trace(true)
        .classes(Game)
        .and()
        .attach();
});