import frida

rdev = frida.get_usb_device()
# find front app
front_app = rdev.get_frontmost_application()
# Application(identifier="com.oakever.jigsawcard", name="Jigsawcard", pid=15908, parameters={})
print(front_app)
print(front_app.pid)

PID = front_app.pid

device = frida.get_usb_device(timeout=5)
session = device.attach(PID)

with open("../../resources/js/maps.js", "r", encoding="utf-8") as f:
    js_code = f.read()

script = session.create_script(js_code)
script.load()

api = script.exports_sync   # 注意 sync

print("[*] Reading maps...")

maps = api.dumpmaps()        # 名字必须匹配

print(maps)
