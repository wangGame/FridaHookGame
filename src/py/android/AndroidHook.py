import frida  # 导入frida模块
import sys  # 导入sys模块

def on_message(message, data):  # js中执行send函数后要回调的函数
    print(message)
'''
spawn模式，Frida会自行启动并注入进目标App，Hook的时机非常早
'''
# device=frida.get_remote_device()
# pid=device.spawn(['com.jx885.reward'])  #包名
# device.resume(pid)
# time.sleep(1)
# session = device.attach(pid)

'''
attach模式，Frida会附加到当前的目标进程中，即需要App处于启动状态，这也意味着只能从当前时机往后Hook，
'''
rdev = frida.get_usb_device()
front_app = rdev.get_frontmost_application()
attachxx = rdev.attach(front_app.pid)  #APPNAME这里是填APP名字

with open("../../resources/js/getHook.js", "r", encoding="utf-8") as f:
    script = attachxx.create_script(f.read())

script.on('message', on_message)  # 加载回调函数，也就是js中执行send函数规定要执行的python函数
script.load()  # 加载脚本

sys.stdin.read()