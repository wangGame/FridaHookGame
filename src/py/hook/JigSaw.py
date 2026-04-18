import frida
import time

device = frida.get_usb_device()

TARGET = "Jigsawcard"

while True:

    for p in device.enumerate_processes():

        if p.name == TARGET:

            print("[+] Found Unity:", p.pid)

            session = device.attach(p.pid)

            script_code = """
            var dlopen = Module.findExportByName(null, "android_dlopen_ext");

            Interceptor.attach(dlopen, {
                onEnter: function(args) {
                    this.path = args[0].readCString();
                      console.log(this.path);
                },
                onLeave: function(retval) {
                    console.log(this.path);
                    if (this.path.indexOf("libil2cpp.so") !== -1) {

                        console.log(">>> il2cpp loaded");
                        var base = Module.findBaseAddress("libil2cpp.so");
                        console.log(">>> il2cpp base:", base);
                    }

                }
            });
            """

            script = session.create_script(script_code)
            script.load()

            print("[+] Hook installed")

            time.sleep(999)

    print("waiting...")
    time.sleep(1)
