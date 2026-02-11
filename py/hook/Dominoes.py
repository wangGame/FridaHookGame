import frida  # 导入frida模块
import sys  # 导入sys模块

jscriptFile = 'checkil2cpp.js'
jscriptFile = "HookMathod.js"
jscriptFile = "ChangeLogic.js"
jscriptFile = "Condition.js"
def on_message(message, data):  # js中执行send函数后要回调的函数
    print(message)

rdev = frida.get_usb_device()
attachSession = rdev.attach("Domino Legends")
with open(jscriptFile, "r", encoding="utf-8") as f:
    script = attachSession.create_script(f.read())

script.on('message', on_message)  # 加载回调函数，也就是js中执行send函数规定要执行的python函数
script.load()  # 加载脚本

sys.stdin.read()