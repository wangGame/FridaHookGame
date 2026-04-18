import frida

device = frida.get_usb_device()

js_code = """
Java.perform(function () {
    var ActivityThread = Java.use("android.app.ActivityThread");
    var app = ActivityThread.currentApplication();
    if (app) {
        console.log(app.getPackageName());
    }
});
"""

for p in device.enumerate_processes():

        session = device.attach(p.pid)
        script = session.create_script(js_code)

        script.on("message", lambda m, d: print(p.pid, "=>", m["payload"]))
        script.load()

