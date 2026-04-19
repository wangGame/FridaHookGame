'use strict';

/*
 * Frida file read monitor (Android)
 *
 * Run:
 *   frida -U -f com.xxx.game -l hook_file_read.js --no-pause
 * or:
 *   frida -U -n com.xxx.game -l hook_file_read.js
 */

const DUMP_TEXT = true;     // 是否dump文本内容
const MAX_DUMP = 65536;     // 单次最多dump字节

const interestingExt = [
  ".txt", ".json", ".cfg", ".bytes", ".dat"
];

function hasInterestingExt(p) {
  if (!p) return false;
  const s = p.toLowerCase();
  return interestingExt.some(e => s.includes(e));
}

function now() {
  const d = new Date();
  return d.getTime();
}

const fdMap = {};   // fd -> path

function safeRead(ptr, len) {
  try {
    return Memory.readByteArray(ptr, len);
  } catch (e) {
    return null;
  }
}

function safeStr(ptr) {
  try {
    if (ptr.isNull()) return null;
    return Memory.readCString(ptr);
  } catch (e) {
    return null;
  }
}

function hook_open() {
  const openPtr = Module.getExportByName("libc.so", "open");
  Interceptor.attach(openPtr, {
    onEnter(args) {
      this.path = safeStr(args[0]);
    },
    onLeave(ret) {
      const fd = ret.toInt32();
      if (fd >= 0 && this.path) {
        fdMap[fd] = this.path;
        if (hasInterestingExt(this.path)) {
          console.log("[open] fd=", fd, this.path);
        }
      }
    }
  });
}

function hook_openat() {
  const ptr = Module.getExportByName("libc.so", "openat");
  Interceptor.attach(ptr, {
    onEnter(args) {
      this.path = safeStr(args[1]);
    },
    onLeave(ret) {
      const fd = ret.toInt32();
      if (fd >= 0 && this.path) {
        fdMap[fd] = this.path;
        if (hasInterestingExt(this.path)) {
          console.log("[openat] fd=", fd, this.path);
        }
      }
    }
  });
}

function hook_read() {
  const ptr = Module.getExportByName("libc.so", "read");
  Interceptor.attach(ptr, {
    onEnter(args) {
      this.fd = args[0].toInt32();
      this.buf = args[1];
      this.len = args[2].toInt32();
    },
    onLeave(ret) {
      const r = ret.toInt32();
      if (r <= 0) return;
    console.log("[read]", path, "bytes=", r);
      const path = fdMap[this.fd];
      if (!path) return;
      if (!hasInterestingExt(path)) return;

      console.log("[read]", path, "bytes=", r);

      if (DUMP_TEXT) {
        const n = Math.min(r, MAX_DUMP);
        const data = safeRead(this.buf, n);
        if (data) {
          try {
            const s = Memory.readUtf8String(this.buf, n);
            console.log("---- text preview ----");
            console.log(s.slice(0, 300));
            console.log("----------------------");
          } catch (_) {}
        }
      }
    }
  });
}

function hook_fopen() {
  const ptr = Module.getExportByName("libc.so", "fopen");
  Interceptor.attach(ptr, {
    onEnter(args) {
      this.path = safeStr(args[0]);
    },
    onLeave(ret) {
      if (!ret.isNull() && this.path && hasInterestingExt(this.path)) {
        console.log("[fopen]", this.path);
      }
    }
  });
}

function hook_fread() {
  const ptr = Module.getExportByName("libc.so", "fread");
  Interceptor.attach(ptr, {
    onEnter(args) {
      this.buf = args[0];
      this.size = args[1].toInt32();
      this.count = args[2].toInt32();
      this.fp = args[3];
    },
    onLeave(ret) {
      const n = ret.toInt32() * this.size;
      if (n <= 0) return;

      if (n > MAX_DUMP) return;

      try {
        const s = Memory.readUtf8String(this.buf, n);
        if (s && (s.startsWith("{") || s.startsWith("["))) {
          console.log("[fread JSON head]");
          console.log(s.slice(0, 200));
        }
      } catch (_) {}
    }
  });
}

function hook_close() {
  const ptr = Module.getExportByName("libc.so", "close");
  Interceptor.attach(ptr, {
    onEnter(args) {
      const fd = args[0].toInt32();
      if (fdMap[fd]) {
        delete fdMap[fd];
      }
    }
  });
}

setImmediate(function () {
  console.log("[*] file read hooks installing…");
  hook_open();
  hook_openat();
  hook_read();
  hook_fopen();
  hook_fread();
  hook_close();
  console.log("[+] file read hooks ready");
});
