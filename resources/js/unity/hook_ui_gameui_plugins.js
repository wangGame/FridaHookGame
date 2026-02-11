'use strict';

if (typeof Il2Cpp === 'undefined') {
    throw new Error('❌ Il2Cpp not found. Did you load frida-il2cpp-bridge?');
}

setTimeout(() => {
    Il2Cpp.perform(() => {

        console.log('🚀 Hook UI.GameUI Plugins');

        const asm = Il2Cpp.domain.assemblies
            .find(a => a.name.includes('Assembly-CSharp'));

        if (!asm) {
            console.log('❌ Assembly-CSharp not found');
            return;
        }

        asm.image.classes
            .filter(c => c.namespace === 'UI.GameUI')
            .forEach(clazz => {

                console.log(`\n📦 Class: ${clazz.name}`);

                clazz.methods.forEach(m => {
                    if (!m.virtualAddress) return;

                    try {
                        Interceptor.attach(m.virtualAddress, {
                            onEnter(args) {
                                console.log(
                                    `➡️ ${clazz.name}::${m.name || '<unknown>'} this=${args[0]}`
                                );
                            },
                            onLeave(ret) {
                                console.log(
                                    `⬅️ ${clazz.name}::${m.name || '<unknown>'} ret=${ret}`
                                );
                            }
                        });
                    } catch (e) {}
                });
            });

        console.log('✅ UI.GameUI hook installed');
    });
}, 3000);
