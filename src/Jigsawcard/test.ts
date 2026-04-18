import "frida-il2cpp-bridge";
Il2Cpp.perform(() => {
    Il2Cpp.domain.assemblies.forEach(asm => {
        asm.image.classes.forEach(clazz => {

            console.log("Class:", clazz.name);

            clazz.fields.forEach(field => {
                console.log(
                    "   Field:",
                    field.name,
                    "| type:", field.type.name,
                    "| offset:", field.offset
                );
            });

        });
    });
});