'use strict';

/**
 * Hook image loading for cocos2d on Android via libc open/openat/fopen.
 * Logs png/jpg/jpeg/webp/ktx/pkm/astc/etc paths.
 *
 * Run:
 *   frida -U -f com.your.game -l hook_cocos_image.js --no-pause
 * or attach:
 *   frida -U -n com.your.game -l hook_cocos_image.js
 */

const IMG_EXT = [
  '.png', '.jpg', '.jpeg', '.webp', '.ktx', '.ktx2', '.pkm', '.pvr', '.astc'
];

function isImagePath(p) {
  if (!p) return false;
  const s = p.toLowerCase();
  return IMG_EXT.some(ext => s.includes(ext));
}

function safeReadCString(ptr) {
  try {
    if (ptr.isNull()) return null;
    return Memory.readCString(ptr);
  } catch (e) {
    return null;
  }
}

function now() {
  return (new Date()).toISOString();
}

function hookLibcIO() {
  const libc = Process.getModuleByName('libc.so');

  // open(const char* pathname, int flags, ...)
  const openPtr = Module.findExportByName('libc.so', 'open');
  if (openPtr) {
    Interceptor.attach(openPtr, {
      onEnter(args) {
        const path = safeReadCString(args[0]);
        if (isImagePath(path)) {
          console.log(`[${now()}] open -> ${path}`);
        }
      }
    });
  } else {
    console.log('[-] open not found');
  }

  // openat(int dirfd, const char* pathname, int flags, ...)
  const openatPtr = Module.findExportByName('libc.so', 'openat');
  if (openatPtr) {
    Interceptor.attach(openatPtr, {
      onEnter(args) {
        const path = safeReadCString(args[1]);
        if (isImagePath(path)) {
          console.log(`[${now()}] openat -> ${path}`);
        }
      }
    });
  } else {
    console.log('[-] openat not found');
  }

  // fopen(const char* pathname, const char* mode)
  const fopenPtr = Module.findExportByName('libc.so', 'fopen');
  if (fopenPtr) {
    Interceptor.attach(fopenPtr, {
      onEnter(args) {
        const path = safeReadCString(args[0]);
        if (isImagePath(path)) {
          console.log(`[${now()}] fopen -> ${path}`);
        }
      }
    });
  } else {
    console.log('[-] fopen not found');
  }

  console.log('[+] libc IO hooks installed');
}

hookLibcIO();
