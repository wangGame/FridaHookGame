import frida, sys


rdev = frida.get_usb_device()
# find front app
front_app = rdev.get_frontmost_application()
# Application(identifier="com.oakever.jigsawcard", name="Jigsawcard", pid=15908, parameters={})
print(front_app)
print(front_app.pid)


print("===========================")

processes = rdev.enumerate_processes()
for p in processes:
    if "jigsaw" in p.name.lower():
        print(p.pid, p.name)

print("===========================")

# 链接 它
session = rdev.attach(front_app.pid)

# 读取js
with open("../../resources/js/maps.js", "r", encoding="utf-8") as f:
    js_code = f.read()

# create js
script = session.create_script(js_code)
# load js
script.load()

api = script.exports_sync   # 注意 sync

print("[*] Reading maps...")

# maps = api.dumpmaps()        # 名字必须匹配
#
# print(maps)