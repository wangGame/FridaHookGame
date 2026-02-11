//'use strict';
//
//if (typeof Il2Cpp === 'undefined') {
//    throw new Error('❌ Il2Cpp not found. Did you forget to load frida-il2cpp-bridge?');
//}
//
//console.log('🚀 IL2CPP class dumper start (SAFE)...');
//
//Il2Cpp.perform(() => {
//
//    console.log('✅ libil2cpp.so base = ' + Il2Cpp.module.base);
//
//    let classCount = 0;
//    let methodCount = 0;
//
//    Il2Cpp.domain.assemblies.forEach(assembly => {
//
//        console.log('\n📦 Assembly:', assembly.name);
//
//        assembly.image.classes.forEach(klass => {
//
//            classCount++;
//
//            const className =
//                (klass.namespace ? klass.namespace + '.' : '') + klass.name;
//
//            console.log('\n🏷️ Class:', className);
//
//            klass.methods.forEach(method => {
//
//                methodCount++;
//
//                let addr = method.virtualAddress;
//                let rva = addr ? addr.sub(Il2Cpp.module.base) : ptr(0);
//
//                let args = method.parameters
//                    .map(p => p.type.name)
//                    .join(', ');
//
//                console.log(
//                    `  🎯 ${method.returnType.name} ${method.name}(${args})` +
//                    (addr ? ` @ ${addr} [RVA: ${rva}]` : '')
//                );
//            });
//        });
//    });
//
//    console.log('\n📊 Dump finished');
//    console.log('Classes:', classCount);
//    console.log('Methods:', methodCount);
//});


'use strict';

if (typeof Il2Cpp === 'undefined') {
    throw new Error('❌ Il2Cpp not found. Did you forget to load frida-il2cpp-bridge?');
}

console.log('🚀 IL2CPP game class dumper start...');

Il2Cpp.perform(() => {

    console.log('✅ libil2cpp.so base = ' + Il2Cpp.module.base);

    let classCount = 0;
    let methodCount = 0;

    Il2Cpp.domain.assemblies.forEach(assembly => {

        // ✅ 只保留游戏主 Assembly
        if (!assembly.name.startsWith('Assembly-CSharp')) {
            return;
        }

        console.log('\n📦 Assembly:', assembly.name);

        assembly.image.classes.forEach(klass => {

            const ns = klass.namespace || '';

            // ❌ 过滤 Unity / 系统类
            if (
                ns.startsWith('Unity') ||
                ns.startsWith('System') ||
                ns.startsWith('TMPro') ||
                ns.startsWith('mscorlib')||
                ns.startsWith('UnityEngine')
            ) {
                return;
            }

            classCount++;

            const className =
                (ns ? ns + '.' : '') + klass.name;

            console.log('\n🏷️ Class:', className);

            klass.methods.forEach(method => {

                methodCount++;

                const addr = method.virtualAddress;
                if (!addr) return;

                const rva = addr.sub(Il2Cpp.module.base);

                const args = method.parameters
                    .map(p => p.type.name)
                    .join(', ');

                console.log(
                    `  🎯 ${method.returnType.name} ${method.name || '<unknown>'}(${args})` +
                    ` @ ${addr} [RVA: ${rva}]`
                );
            });
        });
    });

    console.log('\n📊 Dump finished');
    console.log('Classes:', classCount);
    console.log('Methods:', methodCount);
});
