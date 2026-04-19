// 第一阶段：Dump 所有类
import "frida-il2cpp-bridge";
Il2Cpp.perform(() => {
    const assembly = Il2Cpp.domain.assemblies
        .find(a => a.name === "Assembly-CSharp")!;

    assembly.image.classes.forEach(klass => {
        if (klass.name.includes("Ribbon")) {
            console.log("name =", klass.name);
            console.log("namespace =", klass.namespace);
            console.log("full =", klass.namespace + "." + klass.name);
        }
    });
});