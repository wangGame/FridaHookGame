'use strict';

const TARGET = "_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb";

// 读取 libc++ (std::__ndk1::basic_string) ——匹配你反编译逻辑：
// b0 = *a2;  (b0&1)==1 => long: len=[+4], ptr=[+8]; else short: len=b0>>1, data=[+1]
function readStdString(strPtr) {
  try {
    if (strPtr.isNull()) return null;
    const b0 = Memory.readU8(strPtr);
    const isLong = (b0 & 1) === 1;
    if (!isLong) {
      const len = (b0 >> 1) & 0x7f;
      return Memory.readUtf8String(strPtr.add(1), len);
    } else {
      const len = Memory.readU32(strPtr.add(4));
      const data = Memory.readPointer(strPtr.add(8));
      if (data.isNull()) return null;
      return Memory.readUtf8String(data, len);
    }
  } catch (e) {
    return null;
  }
}

function extFromFlag(a3) {
  // 你反编译里：a3!=0 => ".txt", a3==0 => ".json"
  return (a3 !== 0) ? ".txt" : ".json";
}

function findSymbolAddrExact(name) {
  const mods = Process.enumerateModulesSync();
  for (const m of mods) {
    try {
      const syms = Module.enumerateSymbolsSync(m.name);
      for (const s of syms) {
        if (s.name === name) {
          console.log(`[+] Found ${name} in ${m.name} @ ${s.address}`);
          return s.address;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

function listCandidates() {
  console.log("[-] Exact symbol not found. Listing candidates contains 'ConfigManager4open' ...");
  const mods = Process.enumerateModulesSync();
  let count = 0;
  for (const m of mods) {
    try {
      const syms = Module.enumerateSymbolsSync(m.name);
      for (const s of syms) {
        if (s.name.indexOf("ConfigManager4open") !== -1) {
          console.log(`[?] ${m.name} @ ${s.address}  ${s.name}`);
          count++;
          if (count >= 50) return;
        }
      }
    } catch (e) {}
  }
  if (count === 0) console.log("[-] No candidates found. Likely stripped symbols.");
}

setImmediate(() => {
  const addr = findSymbolAddrExact(TARGET);
  console.log(addr)
  if (!addr) {
    listCandidates();
    return;
  }
  Interceptor.attach(addr, {
    onEnter(args) {
      // a1=this, a2=std::string*, a3=bool/int
      const a3 = args[2].toInt32();
      const name = readStdString(args[1]) || "(null)";
      // 你只关心文件名：直接输出拼好的逻辑名
      console.log(`CFG: ${name}${extFromFlag(a3)}`);
    }
  });

  console.log("[+] Hook installed.");
});
