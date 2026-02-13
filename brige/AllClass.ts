// 第一阶段：Dump 所有类
import "frida-il2cpp-bridge";

setImmediate(() => {

    Il2Cpp.perform(() => {

        console.log("Unity:", Il2Cpp.unityVersion);

        const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;

        console.log("Dumping classes...");

//         image.classes.forEach(c => {
//             console.log(c.name);
//         });
//

// Dumping classes...
// Found: AnalyzeData
// Found: AnalyzeDataFlatBuffersDirect
// Found: AnalyzeData
// Found: AnalyzeDataVerify

//         image.classes
//             .filter(c => c.name.includes("AnalyzeData"))
//             .forEach(c => console.log("Found:", c.name));

        image.classes.forEach(c => {
            console.log(c.namespace + "." + c.name);
        });

    });

});
