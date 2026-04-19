//最牛逼的一个
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
