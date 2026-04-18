const m = Process.getModuleByName("libil2cpp.so");
console.log("name =", m.name);
console.log("base =", m.base);
console.log("size =", m.size);
console.log("path =", m.path);