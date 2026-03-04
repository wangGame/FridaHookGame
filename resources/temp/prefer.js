////////////setImmediate(function () {
////////////
////////////    var base = Module.findBaseAddress("libil2cpp.so");
////////////    console.log("libil2cpp base:", base);
////////////
////////////    function readIl2CppString(ptr) {
////////////
////////////        if (ptr.isNull()) return "";
////////////
////////////        var len = ptr.add(0x10).readU32();
////////////        return ptr.add(0x14).readUtf16String(len);
////////////    }
////////////
////////////    function hook(name, rva, callbacks) {
////////////
////////////        var addr = base.add(rva);
////////////        console.log("hook", name, addr);
////////////
////////////        Interceptor.attach(addr, callbacks);
////////////    }
//////////////
//////////////    // SetInt
//////////////    hook("SetInt", 38491280, {
//////////////        onEnter: function (args) {
//////////////
//////////////            var key = readIl2CppString(args[0]);
//////////////            var value = args[1].toInt32();
//////////////
//////////////            console.log("PlayerPrefs SetInt ->", key, value);
//////////////        }
//////////////    });
//////////////
//////////////    // GetInt
//////////////    hook("GetInt", 38491456, {
//////////////        onEnter: function (args) {
//////////////
//////////////            var key = readIl2CppString(args[0]);
//////////////            console.log("PlayerPrefs GetInt ->", key);
//////////////        },
//////////////        onLeave: function (retval) {
//////////////
//////////////            console.log("Return:", retval.toInt32());
//////////////        }
//////////////    });
////////////
//////////////    // SetFloat
//////////////    hook("SetFloat", 38491620, {
//////////////        onEnter: function (args) {
//////////////
//////////////            var key = readIl2CppString(args[0]);
//////////////            var value = args[1].readFloat();
//////////////
//////////////            console.log("PlayerPrefs SetFloat ->", key, value);
//////////////        }
//////////////    });
////////////
////////////    // SetString
////////////    hook("SetString", 38491960, {
////////////        onEnter: function (args) {
////////////
////////////            var key = readIl2CppString(args[0]);
////////////            var value = readIl2CppString(args[1]);
////////////
////////////            console.log("PlayerPrefs SetString ->", key, value);
////////////
////////////        console.log("------ call stack ------");
////////////
////////////        console.log(
////////////            Thread.backtrace(this.context, Backtracer.ACCURATE)
////////////            .map(DebugSymbol.fromAddress)
////////////            .join("\n")
////////////        );
////////////
////////////        console.log("------------------------");
////////////        }
////////////    });
////////////
//////////////    // Save
//////////////    hook("Save", 38492588, {
//////////////        onEnter: function () {
//////////////            console.log("PlayerPrefs Save()");
//////////////        }
//////////////    });
////////////
//////////////Interceptor.attach(base.add(0x22991a0),{
//////////////
//////////////    onEnter:function(args){
//////////////
//////////////        console.log("======== 22991a0 ========")
//////////////
//////////////        for(let i=0;i<4;i++){
//////////////
//////////////            console.log("arg"+i,args[i])
//////////////
//////////////            if(!args[i].isNull()){
//////////////
//////////////                try{
//////////////                    console.log(
//////////////                        hexdump(args[i],{
//////////////                            length:64
//////////////                        })
//////////////                    )
//////////////                }catch(e){}
//////////////            }
//////////////
//////////////        }
//////////////
//////////////    }
//////////////})
////////////
////////////
////////////});
//////////
//////////
//////////setImmediate(function () {
//////////
//////////    var base = Module.findBaseAddress("libil2cpp.so");
//////////    console.log("libil2cpp base:", base);
//////////
//////////    function readIl2CppString(ptr) {
//////////
//////////        if (ptr.isNull()) return "";
//////////
//////////        try {
//////////            var len = ptr.add(0x10).readU32();
//////////            return ptr.add(0x14).readUtf16String(len);
//////////        } catch (e) {
//////////            return "read error";
//////////        }
//////////    }
//////////
//////////    function hook(offset, name) {
//////////
//////////        var addr = base.add(offset);
//////////
//////////        console.log("hook ->", name, addr);
//////////
//////////        Interceptor.attach(addr, {
//////////
//////////            onEnter: function (args) {
//////////
//////////                console.log("========", name, "========");
//////////
//////////                for (var i = 0; i < 6; i++) {
//////////
//////////                    try {
//////////
//////////                        var p = args[i];
//////////
//////////                        if (p.isNull()) {
//////////                            console.log("arg" + i + " = NULL");
//////////                            continue;
//////////                        }
//////////
//////////                        console.log("arg" + i, p);
//////////
//////////                        try {
//////////                            var str = readIl2CppString(p);
//////////                            if (str.length > 0 && str.length < 100)
//////////                                console.log("arg" + i + " str:", str);
//////////                        } catch (e) {}
//////////
//////////                        try {
//////////                            console.log(
//////////                                hexdump(p, {
//////////                                    offset: 0,
//////////                                    length: 64,
//////////                                    header: false,
//////////                                    ansi: false
//////////                                })
//////////                            );
//////////                        } catch (e) {}
//////////
//////////                    } catch (e) {}
//////////                }
//////////
//////////                console.log("------ call stack ------");
//////////
//////////                console.log(
//////////                    Thread.backtrace(this.context, Backtracer.ACCURATE)
//////////                    .map(DebugSymbol.fromAddress)
//////////                    .join("\n")
//////////                );
//////////
//////////                console.log("------------------------");
//////////            }
//////////        });
//////////    }
//////////
//////////    // hook 调用链所有函数
//////////    hook(0x22991a0, "func_22991a0");
//////////    hook(0x2299834, "func_2299834");
//////////    hook(0x24bfbf8, "func_24bfbf8");
//////////    hook(0x5aa0c4, "func_5aa0c4");
//////////    hook(0x5a9f20, "func_5a9f20");
//////////
//////////    Interceptor.attach(base.add(0x5a9f20),{
//////////
//////////    onEnter:function(args){
//////////
//////////        console.log("encrypt input");
//////////
//////////        try{
//////////            console.log(hexdump(args[1],{length:64}));
//////////        }catch(e){}
//////////    },
//////////
//////////    onLeave:function(retval){
//////////
//////////        console.log("encrypt output");
//////////
//////////        try{
//////////            console.log(hexdump(retval,{length:64}));
//////////        }catch(e){}
//////////    }
//////////});
//////////
//////////});
////////
////////Interceptor.attach(ptr(0x5AA064), {
////////
////////    onEnter(args) {
////////
////////        var method = args[0];
////////
////////        console.log("method =", method);
////////        console.log("params =", args[1]);
////////        console.log("paramCount =", args[2]);
////////
////////    },
////////
////////    onLeave(ret) {
////////
////////        console.log("return =", ret);
////////
////////    }
////////
////////});
//////
//////
//////
//////'use strict';
//////
//////function waitForIl2Cpp(callback) {
//////    var check = setInterval(function () {
//////
//////        var base = Module.findBaseAddress("libil2cpp.so");
//////
//////        if (base) {
//////            clearInterval(check);
//////            console.log("[+] libil2cpp loaded @ " + base);
//////            callback(base);
//////        }
//////
//////    }, 100);
//////}
//////
//////waitForIl2Cpp(function (base) {
//////
//////    console.log("[+] Start hook");
//////
//////    /*
//////        这里的地址需要你自己在 IDA 里找
//////        比如 SerializationUtility::SerializeValue
//////    */
//////
//////    var serializeAddr = base.add(0x123456);     // 改成真实地址
//////    var deserializeAddr = base.add(0x234567);   // 改成真实地址
//////
//////    console.log("[+] SerializeValue addr:", serializeAddr);
//////    console.log("[+] DeserializeValue addr:", deserializeAddr);
//////
//////    Interceptor.attach(serializeAddr, {
//////
//////        onEnter: function (args) {
//////
//////            console.log("========== SerializeValue ==========");
//////
//////            console.log("arg0:", args[0]);
//////            console.log("arg1:", args[1]);
//////            console.log("arg2:", args[2]);
//////
//////        },
//////
//////        onLeave: function (retval) {
//////
//////            console.log("Serialize finished");
//////        }
//////
//////    });
//////
//////    Interceptor.attach(deserializeAddr, {
//////
//////        onEnter: function (args) {
//////
//////            console.log("========== DeserializeValue ==========");
//////
//////        },
//////
//////        onLeave: function (retval) {
//////
//////            console.log("result:", retval);
//////
//////        }
//////
//////    });
//////
//////});
////
////// 'use strict';
//////
//////const soName = "libil2cpp.so";
//////
//////const funcs = {
//////    GetInt:38491456,
//////    SetInt:38491280,
//////    GetFloat:38491796,
//////    SetFloat:38491620,
//////    GetString:38492136,
//////    SetString:38491960,
//////    HasKey:38492364,
//////    DeleteKey:38492440,
//////    DeleteAll:38492516,
//////    Save:38492588
//////};
//////
//////function addr(rva){
//////    return Module.findBaseAddress(soName).add(rva);
//////}
//////
//////function readStr(str){
//////
//////    if(str.isNull()) return "";
//////
//////    const len = str.add(0x10).readU32();
//////    return str.add(0x14).readUtf16String(len);
//////}
//////
//////Object.keys(funcs).forEach(name=>{
//////
//////    const address = addr(funcs[name]);
//////
//////    console.log("Hook",name,address);
//////
//////    Interceptor.attach(address,{
//////
//////        onEnter(args){
//////
//////            if(name.includes("Get") || name.includes("Set")){
//////                console.log("\nPlayerPrefs."+name);
//////                console.log("key:",readStr(args[0]));
//////            }
//////
//////        },
//////
//////        onLeave(retval){
//////
//////            if(name==="GetInt")
//////                console.log("value:",retval.toInt32());
//////
//////        }
//////
//////    });
//////
//////});
////
////
////
////
////'use strict';
////
////const soName = "libil2cpp.so";
////
/////*
////RVA
////*/
////const SetString_rva = 38491960;
////
/////*
////获取函数地址
////*/
////function addr(rva) {
////    return Module.findBaseAddress(soName).add(rva);
////}
////
/////*
////读取 Il2CppString
////*/
////function readIl2cppString(str) {
////
////    if (str.isNull()) return "";
////
////    const len = str.add(0x10).readU32();
////    return str.add(0x14).readUtf16String(len);
////}
////
/////*
////Hook SetString
////*/
////const target = addr(SetString_rva);
////
////console.log("PlayerPrefs.SetString ->", target);
////
////Interceptor.attach(target, {
////
////    onEnter(args) {
////
////        const key = readIl2cppString(args[0]);
////
////        console.log("\n==============================");
////        console.log("PlayerPrefs.SetString");
////        console.log("key:", key);
////        console.log("==============================");
////
////        const tid = Process.getCurrentThreadId();
////        this.tid = tid;
////
////        Stalker.follow(tid, {
////
////            events: {
////                call: true
////            },
////
////            onReceive(events) {
////
////                const parsed = Stalker.parse(events);
////
////                parsed.forEach(function (e) {
////
////                    const addr = ptr(e[1]);
////                    const module = Process.findModuleByAddress(addr);
////
////                    if (!module) return;
////
////                    /*
////                    只打印 libil2cpp
////                    */
////                    if (module.name === soName) {
////
////                        const offset = addr.sub(module.base);
////
////                        console.log(
////                            "CALL ->",
////                            module.name,
////                            "+",
////                            offset
////                        );
////                    }
////
////                });
////
////            }
////
////        });
////
////    },
////
////    onLeave(retval) {
////
////        Stalker.unfollow(this.tid);
////        Stalker.garbageCollect();
////
////        console.log("====== Stalker End ======\n");
////
////    }
////
////});
//
//'use strict';
//
//const soName = "libil2cpp.so";
//
///*
//PlayerPrefs.SetString RVA
//*/
//const SetString_rva = 38491960;
//
///*
//获取模块
//*/
//const module = Process.getModuleByName(soName);
//const base = module.base;
//
///*
//真实地址
//*/
//const target = base.add(SetString_rva);
//
//console.log("PlayerPrefs.SetString ->", target);
//
///*
//读取Il2CppString
//*/
//function readIl2cppString(str){
//
//    if(str.isNull()) return "";
//
//    const len = str.add(0x10).readU32();
//    return str.add(0x14).readUtf16String(len);
//}
//
///*
//地址转符号
//*/
//function symbol(addr){
//
//    const s = DebugSymbol.fromAddress(addr);
//
//    if(s && s.name)
//        return s.moduleName + "!" + s.name;
//
//    return addr;
//}
//
///*
//Hook
//*/
//Interceptor.attach(target,{
//
//    onEnter(args){
//
//        const key = readIl2cppString(args[0]);
//
//        console.log("\n==========================");
//        console.log("PlayerPrefs.SetString");
//        console.log("key:",key);
//        console.log("==========================");
//
//        const tid = Process.getCurrentThreadId();
//        this.tid = tid;
//
//        Stalker.follow(tid,{
//
//            events:{
//                call:true
//            },
//
//            onReceive(events){
//
//                const parsed = Stalker.parse(events);
//
//                parsed.forEach(function(e){
//
//                    const addr = ptr(e[1]);
//
//                    const m = Process.findModuleByAddress(addr);
//                    if(!m) return;
//
//                    if(m.name !== soName) return;
//
//                    const off = addr.sub(base);
//
//                    const sym = symbol(addr);
//
//                    console.log(
//                        "CALL ->",
//                        off,
//                        sym
//                    );
//
//                });
//
//            }
//
//        });
//
//    },
//
//    onLeave(retval){
//
//        Stalker.unfollow(this.tid);
//        Stalker.garbageCollect();
//
//        console.log("========== END ==========\n");
//
//    }
//
//});



'use strict';

const soName = "libil2cpp.so";
const rva = 38491960;

const base = Module.findBaseAddress(soName);
const target = base.add(rva);

function readIl2cppString(str){

    if(str.isNull()) return "";

    const len = str.add(0x10).readU32();
    return str.add(0x14).readUtf16String(len);
}

console.log("PlayerPrefs.SetString ->", target);

Interceptor.attach(target, {

    onEnter(args){

        const key = readIl2cppString(args[0]);

        console.log("\n==========================");
        console.log("PlayerPrefs.SetString");
        console.log("key:", key);
        console.log("==========================");

        const bt = Thread.backtrace(this.context, Backtracer.ACCURATE)
        .map(DebugSymbol.fromAddress);

        bt.forEach(function(x){
            console.log(x);
        });

        console.log("========== END ==========\n");

    }

});