import "frida-il2cpp-bridge";
Il2Cpp.perform(function () {
    var klass = Il2Cpp.domain.assembly("Assembly-CSharp")
        .image
        .class("Effect_Ribbons_L");

    var method = klass.method("Create");

    console.log("addr =", method.virtualAddress);

    Interceptor.attach(method.virtualAddress, {
        onEnter: function (args) {
            console.log("Create called");
            console.log("this =", args[0]);
        }
    });
});