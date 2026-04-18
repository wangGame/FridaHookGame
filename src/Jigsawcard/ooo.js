//Process.enumerateModules().forEach(m => {
//    console.log("[loaded]", m.name);
//});
//
//// 2. dlopen
//hookDlopen();
//
//// 3. NativeBridge（关键）
//setTimeout(hookNativeBridge, 1000);

//'use strict';
//
//function ptrToHex(p) {
//    return p ? p.toString() : "NULL";
//}
//
//setImmediate(function () {
//    const soName = "libil2cpp.so";
//    const mod = Process.findModuleByName(soName);
//    if (!mod) {
//        console.log("[-] libil2cpp.so not found");
//        return;
//    }
//
//    console.log("[+] libil2cpp.so =", mod.base, "size =", mod.size);
//
//    function exp(name) {
//        const p = Module.findExportByName(soName, name);
//        if (!p) throw new Error("missing export: " + name);
//        console.log("[+] " + name + " =", p);
//        return p;
//    }
//
//    // === 需要的导出 ===
//    const p_il2cpp_domain_get      = exp("il2cpp_domain_get");
//    const p_il2cpp_class_for_each  = exp("il2cpp_class_for_each");
//    const p_il2cpp_class_get_image = exp("il2cpp_class_get_image");
//    const p_il2cpp_class_get_name  = exp("il2cpp_class_get_name");
//    const p_il2cpp_class_get_namespace = exp("il2cpp_class_get_namespace");
//    const p_il2cpp_image_get_name  = exp("il2cpp_image_get_name");
//    const p_il2cpp_image_get_filename = exp("il2cpp_image_get_filename");
//    const p_il2cpp_image_get_class_count = exp("il2cpp_image_get_class_count");
//
//    // === NativeFunction ===
//    const il2cpp_domain_get = new NativeFunction(p_il2cpp_domain_get, 'pointer', []);
//    const il2cpp_class_for_each = new NativeFunction(p_il2cpp_class_for_each, 'void', ['pointer', 'pointer']);
//    const il2cpp_class_get_image = new NativeFunction(p_il2cpp_class_get_image, 'pointer', ['pointer']);
//    const il2cpp_class_get_name = new NativeFunction(p_il2cpp_class_get_name, 'pointer', ['pointer']);
//    const il2cpp_class_get_namespace = new NativeFunction(p_il2cpp_class_get_namespace, 'pointer', ['pointer']);
//    const il2cpp_image_get_name = new NativeFunction(p_il2cpp_image_get_name, 'pointer', ['pointer']);
//    const il2cpp_image_get_filename = new NativeFunction(p_il2cpp_image_get_filename, 'pointer', ['pointer']);
//    const il2cpp_image_get_class_count = new NativeFunction(p_il2cpp_image_get_class_count, 'uint32', ['pointer']);
//
//    const domain = il2cpp_domain_get();
//    console.log("[+] domain =", ptrToHex(domain));
//
//    const imageMap = new Map();
//    let classCount = 0;
//
//    const cb = new NativeCallback(function (klass, userData) {
//        try {
//            if (klass.isNull()) return;
//
//            classCount++;
//
//            const image = il2cpp_class_get_image(klass);
//            if (image.isNull()) return;
//
//            const imageNamePtr = il2cpp_image_get_name(image);
//            const fileNamePtr = il2cpp_image_get_filename(image);
//            const classNamePtr = il2cpp_class_get_name(klass);
//            const nsPtr = il2cpp_class_get_namespace(klass);
//
//            const imageName = imageNamePtr.isNull() ? "" : imageNamePtr.readUtf8String();
//            const fileName = fileNamePtr.isNull() ? "" : fileNamePtr.readUtf8String();
//            const className = classNamePtr.isNull() ? "" : classNamePtr.readUtf8String();
//            const ns = nsPtr.isNull() ? "" : nsPtr.readUtf8String();
//
//            if (!imageMap.has(image.toString())) {
//                let imgClassCount = 0;
//                try {
//                    imgClassCount = il2cpp_image_get_class_count(image);
//                } catch (e) {}
//
//                imageMap.set(image.toString(), {
//                    imagePtr: image,
//                    imageName: imageName,
//                    fileName: fileName,
//                    classCount: imgClassCount,
//                    sampleClass: (ns ? ns + "." : "") + className
//                });
//            }
//        } catch (e) {
//            console.log("[callback error] " + e);
//        }
//    }, 'void', ['pointer', 'pointer']);
//
//    console.log("[*] walking classes...");
//    il2cpp_class_for_each(cb, ptr(0));
//
//    console.log("\n[+] total classes walked =", classCount);
//    console.log("[+] unique images/assemblies =", imageMap.size);
//    console.log("");
//
//    const arr = Array.from(imageMap.values()).sort((a, b) => {
//        return a.imageName.localeCompare(b.imageName);
//    });
//
//    for (const item of arr) {
//        console.log(
//            "[IMAGE] " + item.imageName +
//            " | file=" + item.fileName +
//            " | classes=" + item.classCount +
//            " | sample=" + item.sampleClass
//        );
//    }
//
//    console.log("\n[+] Suggested targetAssemblies = [");
//    for (const item of arr) {
//        console.log('    "' + item.imageName + '",');
//    }
//    console.log("];");
//});