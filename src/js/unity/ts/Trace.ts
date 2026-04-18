import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {
    const asm = Il2Cpp.domain.assembly("Assembly-CSharp");
    const image = asm.image;
    const classes = image.classes;
    Il2Cpp.trace(false)
        .classes(...image.classes)
        .and()
        .attach();
});
