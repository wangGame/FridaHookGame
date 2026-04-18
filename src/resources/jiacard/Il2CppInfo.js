const il2cpp = "libil2cpp.so";

const exps = Module.enumerateExportsSync(il2cpp)
  .filter(e => e.type === "function" && e.name.startsWith("il2cpp_"))
  .map(e => e.name);

console.log("il2cpp exports count =", exps.length);

// 只看你关心的几个关键词
["class_get_methods", "method_get_", "class_get_name", "class_get_namespace", "method_get_name"].forEach(k => {
  const hit = exps.filter(n => n.includes(k));
  console.log("\n== contains:", k, "==");
  hit.slice(0, 50).forEach(n => console.log(" ", n));
});
