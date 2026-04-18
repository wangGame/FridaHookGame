/*
这部分操作不会打印游戏逻辑名,只会打印

C# 方法名不会作为 ELF 导出符号存在,最终变成内部函数
几乎都不会 export
*/

//==================Run end========================
//#
//_ZTSNSt6__ndk18ios_baseE
//_ZNSt6__ndk17promiseIvED2Ev
//mono_class_num_methods
//_ZNKSt6__ndk15ctypeIwE5do_isEPKwS3_Pm
//_ZNKSt6__ndk115__codecvt_utf16IDsLb1EE13do_max_lengthEv
//_ZTINSt6__ndk118__time_get_storageIcEE
//_ZNSt6__ndk117__assoc_sub_state28set_exception_at_thread_exitESt13exception_ptr
//
//==================Run end========================

const il2cpp = "libil2cpp.so";

const exps = Module.enumerateExportsSync(il2cpp)
//  .filter(e => e.type === "function" && e.name.startsWith("il2cpp_"))
  .map(e => e.name);

console.log("il2cpp exports count =", exps.length);


exps.forEach(k=>{
   console.log(k)
});
//// 只看你关心的几个关键词
//["class_get_methods", "method_get_", "class_get_name", "class_get_namespace", "method_get_name"].forEach(k => {
//  const hit = exps.filter(n => n.includes(k));
//  console.log("\n== contains:", k, "==");
//  hit.slice(0, 50).forEach(n => console.log(" ", n));
//});