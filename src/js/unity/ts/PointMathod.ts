import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const klass = Il2Cpp.domain
        .assembly("Assembly-CSharp")
        .image
        .class("Game");

    Il2Cpp.trace(true)
        .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
        .filterMethods(m => m.name.includes("SmartMatch")
                ||m.name.includes("FindConnect")
                ||m.name.includes("FindDisplacedBlocks")
                || m.name.includes("FloodFillCo")
                ||m.name.includes("CalculateBlockPriority")
                )
        .and()
        .attach();
});

