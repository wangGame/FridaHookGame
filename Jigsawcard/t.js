import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    console.log("🚀 Start dump");

    const assemblies = Il2Cpp.domain.assemblies;

    assemblies.forEach(assembly => {

        console.log("📦 Assembly:", assembly.name);

        const classes = assembly.image.classes;

        classes.forEach(klass => {

            const className = klass.name;
            const namespace = klass.namespace;

            klass.methods.forEach(method => {
                console.log(
                    `🧩 ${namespace}.${className}::${method.name}`
                );
            });

        });

    });

    console.log("✅ Dump finished");

});