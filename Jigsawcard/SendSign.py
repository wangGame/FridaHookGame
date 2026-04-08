import frida

PACKAGE_NAME = "jigsawcard"
device = frida.get_usb_device(timeout=5)
print("[*] Waiting for app to start...")
session = device.attach(PACKAGE_NAME)
print("[*] Attached!")

print("[*] Running...")