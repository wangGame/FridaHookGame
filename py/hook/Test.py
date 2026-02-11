import frida
import time
#
# PACKAGE = "com.oakever.jigsawcard"
#
# device = frida.get_usb_device()
#
# print("[*] Waiting Unity il2cpp process...")
#
# session = None
#
# processes = device.enumerate_processes()
#
# for p in processes:
#     print(p.name)

# PACKAGE = "com.oakever.jigsawcard"
#
# device = frida.get_usb_device()
#
# pid = device.spawn([PACKAGE])
# session = device.attach(pid)
#
# device.resume(pid)
#
# print("attached ok")



TARGET = "Jigsawcard"

device = frida.get_usb_device()
session = device.attach(TARGET)

script_code = """
Process.enumerateModules().forEach(function(m){
    if(m.name.indexOf("il2cpp") !== -1){
        console.log(m.name + " => " + m.base);
    }
});
"""

script = session.create_script(script_code)
script.load()


time.sleep(999)