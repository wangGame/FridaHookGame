import frida

# 连接本地 gadget
device = frida.get_device_manager().add_remote_device("127.0.0.1:27042")

session = device.attach("Gadget")

script = session.create_script("""
Java.perform(function() {
    console.log("Gadget hook start");

    var Activity = Java.use("android.app.Activity");
    Activity.onResume.implementation = function() {
        console.log("Activity resumed");
        return this.onResume();
    };
});
""")

script.load()
input()