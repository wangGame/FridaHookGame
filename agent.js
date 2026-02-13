import "frida-il2cpp-bridge";

setImmediate(() => {

    console.log("Waiting for IL2CPP...");

    Il2Cpp.perform(() => {

        console.log("IL2CPP READY!");

        const assemblies = Il2Cpp.domain.assemblies;

        assemblies.forEach(a => {
            console.log("Assembly:", a.name);
        });

    });

});
