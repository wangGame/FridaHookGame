import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const image = Il2Cpp.domain
        .assembly("Assembly-CSharp")
        .image;

    const targets = image.classes.filter((klass: any) =>
        klass.name.includes("Game")   // 改关键字
    );

    targets.forEach((klass: any) => {
        console.log(`[Class] ${klass.name}`);
    });
});
