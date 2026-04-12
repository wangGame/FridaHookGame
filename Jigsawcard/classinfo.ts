import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    console.log("===== IL2CPP SCAN START =====");

    // 遍历所有程序集
    Il2Cpp.domain.assemblies.forEach((assembly) => {

        console.log("\n[Assembly] " + assembly.name);

        const image = assembly.image;

        // 遍历所有类
        image.classes.forEach((klass) => {

            console.log("  [Class] " + klass.name);

            // 遍历方法
            klass.methods.forEach((method) => {
                console.log("    -> " + method.name);
            });

        });

    });

    console.log("===== SCAN END =====");

});