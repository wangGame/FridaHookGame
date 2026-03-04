import "frida-il2cpp-bridge";
Il2Cpp.perform(() => {
    const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;
    image.classes.forEach(c => {
        c.methods.forEach(m => {
            console.log(
                c.name,
                m.name,
                "VA:",
                m.virtualAddress,
                "RVA:",
                m.relativeVirtualAddress
            );
        });
    });
});