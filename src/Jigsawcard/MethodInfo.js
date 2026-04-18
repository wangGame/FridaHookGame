'use strict';

const so = "libil2cpp.so";

function nf(name, ret, args, required = true) {
    const p = Module.findExportByName(so, name);
    if (!p) {
        if (required) throw new Error("missing export: " + name);
        console.log("[!] missing export:", name);
        return null;
    }
    return new NativeFunction(p, ret, args);
}

function cs(p) {
    try {
        return (!p || p.isNull()) ? "" : Memory.readCString(p);
    } catch (e) {
        return "";
    }
}

const mono_get_root_domain = nf("mono_get_root_domain", "pointer", []);
const il2cpp_thread_attach = nf("il2cpp_thread_attach", "pointer", ["pointer"]);
const il2cpp_domain_assembly_open = nf("il2cpp_domain_assembly_open", "pointer", ["pointer", "pointer"]);
const il2cpp_assembly_get_image = nf("il2cpp_assembly_get_image", "pointer", ["pointer"]);
const il2cpp_class_from_name = nf("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
const il2cpp_class_get_method_from_name = nf("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
const il2cpp_class_get_methods = nf("il2cpp_class_get_methods", "pointer", ["pointer", "pointer"], false);

const il2cpp_method_get_name = nf("il2cpp_method_get_name", "pointer", ["pointer"], false);
const il2cpp_method_get_param_count = nf("il2cpp_method_get_param_count", "uint32", ["pointer"], false);

const method_get_pointer_ptr = Module.findExportByName(so, "il2cpp_method_get_pointer");
const il2cpp_method_get_pointer = method_get_pointer_ptr
    ? new NativeFunction(method_get_pointer_ptr, "pointer", ["pointer"])
    : null;

const addrMap = {}; // "0x945dc858" -> "Game.SomeMethod(argc=1)"

function attachThread() {
    const domain = mono_get_root_domain();
    if (domain.isNull()) throw new Error("mono_get_root_domain returned NULL");
    il2cpp_thread_attach(domain);
    return domain;
}

function getImage(assemblyName) {
    const domain = attachThread();
    const asm = il2cpp_domain_assembly_open(domain, Memory.allocUtf8String(assemblyName));
    if (asm.isNull()) throw new Error("open assembly failed: " + assemblyName);

    const image = il2cpp_assembly_get_image(asm);
    if (image.isNull()) throw new Error("get image failed: " + assemblyName);

    return image;
}

function getClass(assemblyName, namespaceName, className) {
    const image = getImage(assemblyName);

    const klass = il2cpp_class_from_name(
        image,
        Memory.allocUtf8String(namespaceName),
        Memory.allocUtf8String(className)
    );
    if (klass.isNull()) {
        throw new Error("class not found: " + namespaceName + "." + className);
    }

    return klass;
}

function getMethodPointer(method) {
    if (il2cpp_method_get_pointer) {
        const p = il2cpp_method_get_pointer(method);
        if (p && !p.isNull()) return p;
    }
    return Memory.readPointer(method);
}

function buildClassMethodMap(assemblyName, namespaceName, className) {
    if (!il2cpp_class_get_methods) {
        console.log("[!] il2cpp_class_get_methods not exported, cannot enumerate class methods");
        return;
    }

    const klass = getClass(assemblyName, namespaceName, className);
    const iter = Memory.alloc(Process.pointerSize);
    Memory.writePointer(iter, ptr(0));

    console.log("[+] building method map for", className);

    while (true) {
        const method = il2cpp_class_get_methods(klass, iter);
        if (method.isNull()) break;

        const name = il2cpp_method_get_name ? cs(il2cpp_method_get_name(method)) : "unknown";
        const argc = il2cpp_method_get_param_count ? il2cpp_method_get_param_count(method) : -1;
        const addr = getMethodPointer(method);

        if (addr && !addr.isNull()) {
            const key = addr.toString();
            addrMap[key] = className + "." + name + "(argc=" + argc + ")";
            console.log("[MAP]", key, "=>", addrMap[key]);
        }
    }
}

function findMethod(assemblyName, namespaceName, className, methodName, argc) {
    const klass = getClass(assemblyName, namespaceName, className);

    const method = il2cpp_class_get_method_from_name(
        klass,
        Memory.allocUtf8String(methodName),
        argc
    );
    if (method.isNull()) {
        throw new Error("method not found: " + className + "." + methodName + " argc=" + argc);
    }

    return method;
}

function formatFrame(addr, base) {
    let s = addr.toString();

    try {
        if (base && addr.compare(base) >= 0) {
            s += " offset=" + addr.sub(base);
        }
    } catch (e) {}

    const key = addr.toString();
    if (addrMap[key]) {
        s += " => " + addrMap[key];
        return s;
    }

    try {
        s += " " + DebugSymbol.fromAddress(addr);
    } catch (e) {}

    return s;
}

function hookMethod(assemblyName, namespaceName, className, methodName, argc) {
    const method = findMethod(assemblyName, namespaceName, className, methodName, argc);
    const addr = getMethodPointer(method);

    if (!addr || addr.isNull()) {
        throw new Error("method pointer is NULL");
    }

    const base = Module.findBaseAddress(so);

    console.log("[+] target method =", className + "." + methodName);
    console.log("[+] addr =", addr);
    if (base) console.log("[+] ida offset =", addr.sub(base));

    Interceptor.attach(addr, {
        onEnter(args) {
            console.log("\n==============================");
            console.log(">>> ENTER " + className + "." + methodName);
            console.log("this =", args[0]);
            console.log("---- backtrace ----");

            Thread.backtrace(this.context, Backtracer.FUZZY).forEach((p, i) => {
                console.log("#" + i + " " + formatFrame(p, base));
            });
        },
        onLeave(retval) {
            console.log("<<< LEAVE " + className + "." + methodName + " ret=" + retval);
        }
    });

    console.log("[+] hook attached");
}

setImmediate(function () {
    try {
        buildClassMethodMap("Assembly-CSharp.dll", "", "Game");
        hookMethod("Assembly-CSharp.dll", "", "Game", "SmartMatchRemainingBlocks", 0);
    } catch (e) {
        console.log("[!] ERROR:", e);
    }
});