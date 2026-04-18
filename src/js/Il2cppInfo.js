const il2cpp = "libil2cpp.so";

Module.enumerateExportsSync(il2cpp).map(e=>console.log(e.name))

//const exps = Module.enumerateExportsSync(il2cpp)
//  .filter(e => e.type === "function" && e.name.startsWith("il2cpp_"))
//  .map(e => e.name);
//

//console.log("il2cpp exports count =", exps.length);