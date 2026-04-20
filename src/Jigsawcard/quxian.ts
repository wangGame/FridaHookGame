import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const AnimationCurve = Il2Cpp.domain
        .assembly("UnityEngine.CoreModule")
        .image
        .class("UnityEngine.AnimationCurve");

    {
        const Evaluate = AnimationCurve.method("Evaluate");

    Evaluate.implementation = function (...args: any[]) {

        const time = args[0];

        const self = this as Il2Cpp.Object;



      const result = this.method("Evaluate").invoke(time);
        console.log("🔥 curve time:", time, "result:", result);
        return result;
    };

    }


    {
        const Evaluate = AnimationCurve.method("Evaluate");

    Evaluate.implementation = function (...args: any[]) {

        const time = args[0];

        const self = this as Il2Cpp.Object;



      const result = this.method("Evaluate").invoke(time);
        console.log("🔥 curve time:", time, "result:", result);
        return result;
    };

    }


});