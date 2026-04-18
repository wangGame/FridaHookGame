import frida, sys


rdev = frida.get_usb_device()
# find front app
front_app = rdev.get_frontmost_application()
# Application(identifier="com.oakever.jigsawcard", name="Jigsawcard", pid=15908, parameters={})
print(front_app)
print(front_app.pid)