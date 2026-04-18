import "frida-il2cpp-bridge";

setImmediate(() => {
    Il2Cpp.perform(() => {
        console.log("Unity Version:", Il2Cpp.unityVersion);
        const image = Il2Cpp.domain.assembly("Assembly-CSharp")?.image;
        console.log("Image:", image);
    });
});