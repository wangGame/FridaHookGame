# import frida
#
# device = frida.get_usb_device()
#
# js_code = """
# Java.perform(function () {
#     var ActivityThread = Java.use("android.app.ActivityThread");
#     var app = ActivityThread.currentApplication();
#     if (app) {
#         console.log(app.getPackageName());
#     }
# });
# """
#
# for p in device.enumerate_processes():
#
#         session = device.attach(p.pid)
#         script = session.create_script(js_code)
#
#         script.on("message", lambda m, d: print(p.pid, "=>", m["payload"]))
#         script.load()



import frida

# 连接到 USB 设备（如果是模拟器可以用 get_local_device()）
device = frida.get_usb_device(timeout=5)  # 可设置超时时间

# 枚举设备上所有进程
processes = device.enumerate_processes()

# 打印所有进程信息
print(f"设备上总共有 {len(processes)} 个进程：\n")
for p in processes:
    # p 是 frida.Process 对象，包含 pid, name, identifier 等属性
    print(f"PID: {p.pid}\tName: {p.name}")