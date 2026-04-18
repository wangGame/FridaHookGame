import "frida-il2cpp-bridge";
import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const klass = Il2Cpp.domain
        .assembly("UnityEngine.ParticleSystemModule")
        .image
        .class("UnityEngine.ParticleSystem");

    console.log("✅ ParticleSystem class:", klass);

    ["Play", "Emit", "Stop"].forEach(name => {

        const m = klass.methods.find(m => m.name === name);

        if (!m) {
            console.log("❌ 没有方法:", name);
            return;
        }

        console.log(`Hook ${name} @`, m.virtualAddress);

        Interceptor.attach(m.virtualAddress, {
            onEnter(args) {

                try {
                    const ps = new Il2Cpp.Object(args[0]);
                    const nameStr = ps.method("get_name").invoke();

                    console.log(`\n🎆 粒子触发: ${nameStr}`);
                } catch (e) {}

                console.log(`🎯 ParticleSystem.${name}`);

                console.log(
                    Thread.backtrace(this.context, Backtracer.ACCURATE)
                        .map(DebugSymbol.fromAddress)
                        .join("\n")
                );
            }
        });
    });

});