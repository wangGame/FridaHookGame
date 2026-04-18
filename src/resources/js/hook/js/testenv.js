import frida
import sys
import time

package_name = "com.android.settings"   # 系统设置，100%存在

js_code = """
console.log("JS injected OK");

Java.perform(function () {
    console.log("Java VM ready");

    var Activity = Java.use("android.app.Activity");

    Activity.onResume.implementation = function () {
        console.log("onResume called:", this.getClass().getName());
        return this.onResume();
    };
});
"""

def on_message(message, data):
    print("[FRIDA]", message)

# USB 设备
device = frida.get_usb_device(timeout=5)

print("[*] Attaching to:", package_name)

session = device.attach(package_name)

script = session.create_script(js_code)
script.on("message", on_message)

script.load()

print("[*] Script loaded successfully")

# 防止退出
sys.stdin.read()
