import frida

device = frida.get_usb_device(timeout=5)

print("===== Process list =====")
for p in device.enumerate_processes():
    print(f"{p.pid:<8} {p.name}")

    