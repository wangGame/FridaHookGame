import frida  # 导入frida模块
import sys  # 导入sys模块

# 文件次序为执行查看结果的次序
filename = "../resources/temp/Il2cppAddr.js"
filename = "../resources/jiacard/LookBaseAddr.js"
filename = "../resources/jiacard/PrintClassInfo.js"

filename = "../resources/temp/Il2cppAddr.js"
filename = "../resources/temp/Il2cppAbout.js"
filename = "../resources/temp/GameInvokeMethod.js"
filename = "../dump_il2cpp.js"
# filename = "../resources/temp/GameClassAllMethod.js"

filename = "../resources/temp/prefer.js"

# filename = "../resources/temp/Tween.js"

apkName = "Domino Legends"
# apkName = "Jigsawcard"

# filename = "../resources/js/activity/PrintAllMethod.js"
def on_message(message, data):  # js中执行send函数后要回调的函数
    print(message)
rdev = frida.get_usb_device()
attachSession = rdev.attach(apkName)
with open(filename, "r", encoding="utf-8") as f:
    script = attachSession.create_script(f.read())
script.on('message', on_message)  # 加载回调函数，也就是js中执行send函数规定要执行的python函数
script.load()  # 加载脚本
sys.stdin.read()