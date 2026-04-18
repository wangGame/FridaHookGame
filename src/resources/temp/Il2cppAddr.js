//==================Run end========================
//#
//# name = libil2cpp.so
//# base = 0x83b87000
//# size = 49754112
//# path = /data/app/com.playvalve.dominoes-IQS9Sh_OuyTOBeh2pGusnA==/lib/arm/libil2cpp.so
//
//==================Run end========================


const m = Process.getModuleByName("libil2cpp.so");
console.log("name =", m.name);
console.log("base =", m.base);
console.log("size =", m.size);
console.log("path =", m.path);