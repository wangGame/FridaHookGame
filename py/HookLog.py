import frida  # 导入frida模块
import sys  # 导入sys模块

filename = "../resources/js/dominoesjs/HookMult.js"
# filename = "../resources/js/dominoesjs/test.ts"
# filename = "../resources/js/dominoesjs/cehnc.js"
# filename = "../resources/js/xx.js"
# filename = "../resources/js/SkipPurch.js"
# filename = "../resources/js/activity/PrintAllMethod.js"
def on_message(message, data):  # js中执行send函数后要回调的函数
    print(message)
rdev = frida.get_usb_device()
attachSession = rdev.attach("Block Blast!")
with open(filename, "r", encoding="utf-8") as f:
    script = attachSession.create_script(f.read())
script.on('message', on_message)  # 加载回调函数，也就是js中执行send函数规定要执行的python函数
script.load()  # 加载脚本
sys.stdin.read()