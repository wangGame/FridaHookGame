setImmediate(() => {

    Il2Cpp.perform(() => {
        const assembly = Il2Cpp.domain.assembly("Assembly-CSharp");
        const image = assembly.image;
        let output = "";
        image.classes.forEach(c => {
            output += `\n// Namespace: ${c.namespace}\n`;
            output += `class ${c.name}\n{\n`;
            // 字段
            c.fields.forEach(f => {
                output += `    ${f.type.name} ${f.name};\n`;
            });
            // 方法
            c.methods.forEach(m => {
                output += `    ${m.returnType.name} ${m.name}(...);\n`;
            });
            output += "}\n";
        });
        console.log(output)
    });
});
