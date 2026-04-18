import "frida-il2cpp-bridge";
declare const Il2Cpp: any;

Il2Cpp.perform(() => {

    const klass = Il2Cpp.domain
        .assembly("Assembly-CSharp")
        .image
        .class("Game");   // 换成你的类名

    console.log("==== Fields of class:", klass.name, "====");

    klass.fields.forEach((field: any) => {
        console.log(
            `字段名: ${field.name} | 类型: ${field.type.name} | 静态: ${field.isStatic}`
        );
    });
});