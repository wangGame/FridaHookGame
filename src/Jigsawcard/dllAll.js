import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const assemblies = Il2Cpp.domain.assemblies;

    assemblies.forEach(a => {
        console.log(a.name);
    });

});