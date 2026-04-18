# import frida  # 导入frida模块
# import sys  # 导入sys模块
#
# filename = "HookMethod.js"
# def on_message(message, data):  # js中执行send函数后要回调的函数
#     print(message)
#
# rdev = frida.get_usb_device()
# attachSession = rdev.spawn("com.oakever.jigsawcard")
# with open(filename, "r", encoding="utf-8") as f:
#     script = attachSession.create_script(f.read())
# script.on('message', on_message)  # 加载回调函数，也就是js中执行send函数规定要执行的python函数
# script.load()  # 加载脚本
#
# sys.stdin.read()


import frida
import sys

package_name = "com.oakever.jigsawcard"

# JS 脚本（就是刚才写的 hook）
jscode = """
function hook_dlopen() {
    var dlopen = Module.findExportByName(null, "dlopen");
    if (dlopen) {
        Interceptor.attach(dlopen, {
            onEnter: function (args) {
                var path = args[0].readCString();
                send("[dlopen] " + path);
            }
        });
    }
}

function hook_android_dlopen_ext() {
    var ext = Module.findExportByName(null, "android_dlopen_ext");
    if (ext) {
        Interceptor.attach(ext, {
            onEnter: function (args) {
                var path = args[0].readCString();
                send("[android_dlopen_ext] " + path);
            }
        });
    }
}

setImmediate(function () {
    hook_dlopen();
    hook_android_dlopen_ext();
});

setTimeout(function () {
    var modules = Process.enumerateModules();
    modules.forEach(function(m){
        send(m.name)
        if (m.name.indexOf("il2cpp") !== -1) {
            send("FOUND IL2CPP => " + m.name);
        }
    });
}, 3000);
"""

def on_message(message, data):
    if message["type"] == "send":
        print(message["payload"])
    else:
        print(message)

# 连接 USB 设备
device = frida.get_usb_device()

# 🔥 spawn 模式（关键！）
pid = device.attach([package_name])

session = device.attach(pid)

script = session.create_script(jscode)
script.on("message", on_message)
script.load()

# 启动 App
device.resume(pid)

print("=== Start hooking ===")
sys.stdin.read()