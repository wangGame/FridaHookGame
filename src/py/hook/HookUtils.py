# -*- coding: utf-8 -*-
import frida
import sys

from frida.core import Session


class HookUtils:

    def runJsHook(self,jsPath: str, session: Session):
        # 当前Js文件
        with open(jsPath, "r", encoding="utf-8") as f:
            js_code = f.read()
        script = session.create_script(js_code)
        # 监听方法
        script.on("message", self.on_message)
        script.load()
        print("Hook OK")
        sys.stdin.read()

    def hookApplicationApp(self, jsPath:str):
        # 连接设备
        device = frida.get_usb_device(timeout=5)
        # 获取前台的APP
        apps = device.get_frontmost_application()
        print(apps.name + "   " + str(apps.pid))
        # hook
        session = device.attach(apps.pid)
        self.runJsHook(jsPath, session)

    # 接受js传递过来的脚本
    def on_message(self,message, data):
        print("[FRIDA]", message)

    def hookDefineApp(self,appPid,jsPath:str):
        device = frida.get_usb_device(timeout=5)
        session = device.attach("Jigsawcard")
        self.runJsHook(jsPath,session)

    # 遍历all process
    def listAllApps(self):
        device = frida.get_usb_device(timeout=5)
        # 枚举设备上所有进程
        processes = device.enumerate_processes()
        # 打印所有进程信息
        print(f"设备上总共有 {len(processes)} 个进程：\n")
        for p in processes:
            # p 是 frida.Process 对象，包含 pid, name, identifier 等属性
            print(f"PID: {p.pid}\tName: {p.name}")

    # 方式二
    def spawn_app(self,apkInfo:str, jsPath:str):
        device = frida.get_usb_device(timeout=5)
        pid = device.spawn([apkInfo])
        session = device.attach(pid)
        self.runJsHook(self,jsPath,session)

if __name__ == '__main__':
    hookUtils = HookUtils()
    hookUtils.hookApplicationApp("jspthook.js")
