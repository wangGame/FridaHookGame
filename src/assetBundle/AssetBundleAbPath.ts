// AssetBundle.ts
import "frida-il2cpp-bridge";

declare const console: any;
declare const Il2Cpp: any;

Il2Cpp.perform(() => {

    console.log("====================================");
    console.log("[*] AssetBundle Hook Start");
    console.log("====================================");

    // 记录 AssetBundle 对象 -> 文件路径
    // key 用 AssetBundle 对象 handle
    const bundlePathMap: Map<string, string> = new Map();

    // =========================
    // 安全打印 Il2Cpp.String
    // =========================
    function getStringValue(s: any): string {
        try {
            if (s === null || s === undefined) return "null";

            if (typeof s === "string") return s;

            if (typeof s.isNull === "function" && s.isNull()) return "null";

            if (s.content !== undefined) return s.content;

            return s.toString();
        } catch (e) {
            return String(s);
        }
    }

    // =========================
    // 安全打印对象
    // =========================
    function objToString(o: any): string {
        try {
            if (o === null || o === undefined) return "null";
            if (typeof o.isNull === "function" && o.isNull()) return "null";
            return o.toString();
        } catch (e) {
            return String(o);
        }
    }

    // =========================
    // 给 Il2Cpp.Object 生成稳定 key
    // =========================
    function objKey(o: any): string {
        try {
            if (o === null || o === undefined) return "null";
            if (typeof o.isNull === "function" && o.isNull()) return "null";

            if (o.handle !== undefined) {
                return o.handle.toString();
            }

            return o.toString();
        } catch (e) {
            return String(o);
        }
    }

    // =========================
    // 获取 AssetBundle.name
    // 例如 local_config.ab
    // =========================
    function getBundleName(bundle: any): string {
        try {
            if (bundle === null || bundle === undefined) return "unknown";
            if (typeof bundle.isNull === "function" && bundle.isNull()) return "unknown";

            const nameObj = bundle.method("get_name", 0).invoke();
            return getStringValue(nameObj);
        } catch (e) {
            return "unknown";
        }
    }

    // =========================
    // 根据当前 this 获取 bundle 路径
    // =========================
    function getBundlePath(bundle: any): string {
        try {
            const key = objKey(bundle);
            const path = bundlePathMap.get(key);
            if (path !== undefined) return path;
            return "unknown";
        } catch (e) {
            return "unknown";
        }
    }

    // =========================
    // 打印 AssetBundle + Asset 组合信息
    // =========================
    function printBundleAssetInfo(bundle: any, assetName: string, typeName?: string) {
        const key = objKey(bundle);
        const bundleName = getBundleName(bundle);
        const bundlePath = getBundlePath(bundle);

        console.log("this:", objToString(bundle));
        console.log("BundleKey:", key);
        console.log("BundleName:", bundleName);
        console.log("BundleFilePath:", bundlePath);
        console.log("AssetPathInBundle:", assetName);

        if (typeName !== undefined) {
            console.log("Type:", typeName);
        }

        if (bundlePath !== "unknown") {
            console.log("FullLogicalPath:", bundlePath + " -> " + assetName);
        } else {
            console.log("FullLogicalPath:", bundleName + " -> " + assetName);
        }
    }

    // =========================
    // 查找类
    // =========================
    function findClass(fullName: string): any {
        for (const asm of Il2Cpp.domain.assemblies) {
            try {
                const image = asm.image;
                const klass = image.class(fullName);

                if (klass) {
                    console.log(`[+] Found ${fullName} in assembly: ${asm.name}`);
                    return klass;
                }
            } catch (e) {
                // 忽略找不到的程序集
            }
        }

        return null;
    }

    const AssetBundle = findClass("UnityEngine.AssetBundle");

    if (!AssetBundle) {
        console.log("[-] UnityEngine.AssetBundle not found");

        console.log("[*] Dump classes contains AssetBundle:");

        for (const asm of Il2Cpp.domain.assemblies) {
            try {
                for (const klass of asm.image.classes) {
                    try {
                        const full = `${klass.namespace}.${klass.name}`;
                        if (full.includes("AssetBundle")) {
                            console.log(`    ${asm.name} -> ${full}`);
                        }
                    } catch (e) {}
                }
            } catch (e) {}
        }

        return;
    }

    // =========================
    // 辅助：找方法
    // =========================
    function findMethod(klass: any, name: string, paramCount: number): any {
        try {
            return klass.methods.find((m: any) =>
                m.name === name &&
                m.parameters.length === paramCount
            );
        } catch (e) {
            return null;
        }
    }

    // ============================================================
    // 1. AssetBundle.LoadFromFile(string path)
    // static AssetBundle LoadFromFile(string path)
    // ============================================================
    const loadFromFile1 = findMethod(AssetBundle, "LoadFromFile", 1);

    if (loadFromFile1) {
        loadFromFile1.implementation = function (path: any) {

            const filePath = getStringValue(path);

            console.log("\n========== AssetBundle.LoadFromFile(path) ==========");
            console.log("Path:", filePath);

            const ret = loadFromFile1.invoke(path);

            console.log("Return:", objToString(ret));

            if (ret && !(typeof ret.isNull === "function" && ret.isNull())) {
                const key = objKey(ret);
                bundlePathMap.set(key, filePath);

                console.log("SavedBundleKey:", key);
                console.log("SavedBundleFilePath:", filePath);
            }

            console.log("====================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadFromFile(string)");
    } else {
        console.log("[-] AssetBundle.LoadFromFile(string) not found");
    }

    // ============================================================
    // 2. AssetBundle.LoadFromFile(string path, uint crc, ulong offset)
    // static AssetBundle LoadFromFile(string path, uint crc, ulong offset)
    // ============================================================
    const loadFromFile3 = findMethod(AssetBundle, "LoadFromFile", 3);

    if (loadFromFile3) {
        loadFromFile3.implementation = function (path: any, crc: any, offset: any) {

            const filePath = getStringValue(path);

            console.log("\n========== AssetBundle.LoadFromFile(path, crc, offset) ==========");
            console.log("Path:", filePath);
            console.log("CRC:", crc);
            console.log("Offset:", offset);

            const ret = loadFromFile3.invoke(path, crc, offset);

            console.log("Return:", objToString(ret));

            if (ret && !(typeof ret.isNull === "function" && ret.isNull())) {
                const key = objKey(ret);
                bundlePathMap.set(key, filePath);

                console.log("SavedBundleKey:", key);
                console.log("SavedBundleFilePath:", filePath);
            }

            console.log("=================================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadFromFile(string, uint, ulong)");
    } else {
        console.log("[-] AssetBundle.LoadFromFile(string, uint, ulong) not found");
    }

    // ============================================================
    // 3. AssetBundle.LoadFromMemory(byte[] binary)
    // static AssetBundle LoadFromMemory(byte[] binary)
    // 这种没有磁盘路径，只能标记为 Memory
    // ============================================================
    const loadFromMemory1 = findMethod(AssetBundle, "LoadFromMemory", 1);

    if (loadFromMemory1) {
        loadFromMemory1.implementation = function (binary: any) {

            console.log("\n========== AssetBundle.LoadFromMemory(byte[]) ==========");
            console.log("Binary:", objToString(binary));

            const ret = loadFromMemory1.invoke(binary);

            console.log("Return:", objToString(ret));

            if (ret && !(typeof ret.isNull === "function" && ret.isNull())) {
                const key = objKey(ret);
                bundlePathMap.set(key, "[LoadFromMemory]");

                console.log("SavedBundleKey:", key);
                console.log("SavedBundleFilePath:", "[LoadFromMemory]");
            }

            console.log("========================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadFromMemory(byte[])");
    } else {
        console.log("[-] AssetBundle.LoadFromMemory(byte[]) not found");
    }

    // ============================================================
    // 4. AssetBundle.LoadFromMemory(byte[] binary, uint crc)
    // static AssetBundle LoadFromMemory(byte[] binary, uint crc)
    // ============================================================
    const loadFromMemory2 = findMethod(AssetBundle, "LoadFromMemory", 2);

    if (loadFromMemory2) {
        loadFromMemory2.implementation = function (binary: any, crc: any) {

            console.log("\n========== AssetBundle.LoadFromMemory(byte[], crc) ==========");
            console.log("Binary:", objToString(binary));
            console.log("CRC:", crc);

            const ret = loadFromMemory2.invoke(binary, crc);

            console.log("Return:", objToString(ret));

            if (ret && !(typeof ret.isNull === "function" && ret.isNull())) {
                const key = objKey(ret);
                bundlePathMap.set(key, "[LoadFromMemory]");

                console.log("SavedBundleKey:", key);
                console.log("SavedBundleFilePath:", "[LoadFromMemory]");
            }

            console.log("=============================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadFromMemory(byte[], uint)");
    } else {
        console.log("[-] AssetBundle.LoadFromMemory(byte[], uint) not found");
    }

    // ============================================================
    // 5. AssetBundle.LoadAsset(string name)
    // instance Object LoadAsset(string name)
    // ============================================================
    const loadAsset1 = findMethod(AssetBundle, "LoadAsset", 1);

    if (loadAsset1) {
        loadAsset1.implementation = function (name: any) {

            const assetName = getStringValue(name);

            console.log("\n========== AssetBundle.LoadAsset(name) ==========");
            printBundleAssetInfo(this, assetName);

            const ret = (this as any).method("LoadAsset", 1).invoke(name);

            console.log("Return:", objToString(ret));
            console.log("=================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadAsset(string)");
    } else {
        console.log("[-] AssetBundle.LoadAsset(string) not found");
    }

    // ============================================================
    // 6. AssetBundle.LoadAsset(string name, Type type)
    // instance Object LoadAsset(string name, Type type)
    // 你现在日志里走的就是这个重载
    // ============================================================
    const loadAsset2 = findMethod(AssetBundle, "LoadAsset", 2);

    if (loadAsset2) {
        loadAsset2.implementation = function (name: any, type: any) {

            const assetName = getStringValue(name);
            const typeName = objToString(type);

            console.log("\n========== AssetBundle.LoadAsset(name, type) ==========");
            printBundleAssetInfo(this, assetName, typeName);

            const ret = (this as any).method("LoadAsset", 2).invoke(name, type);

            console.log("Return:", objToString(ret));
            console.log("=======================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadAsset(string, Type)");
    } else {
        console.log("[-] AssetBundle.LoadAsset(string, Type) not found");
    }

    // ============================================================
    // 7. AssetBundle.LoadAssetAsync(string name)
    // instance AssetBundleRequest LoadAssetAsync(string name)
    // ============================================================
    const loadAssetAsync1 = findMethod(AssetBundle, "LoadAssetAsync", 1);

    if (loadAssetAsync1) {
        loadAssetAsync1.implementation = function (name: any) {

            const assetName = getStringValue(name);

            console.log("\n========== AssetBundle.LoadAssetAsync(name) ==========");
            printBundleAssetInfo(this, assetName);

            const ret = (this as any).method("LoadAssetAsync", 1).invoke(name);

            console.log("Return:", objToString(ret));
            console.log("======================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadAssetAsync(string)");
    } else {
        console.log("[-] AssetBundle.LoadAssetAsync(string) not found");
    }

    // ============================================================
    // 8. AssetBundle.LoadAssetAsync(string name, Type type)
    // instance AssetBundleRequest LoadAssetAsync(string name, Type type)
    // ============================================================
    const loadAssetAsync2 = findMethod(AssetBundle, "LoadAssetAsync", 2);

    if (loadAssetAsync2) {
        loadAssetAsync2.implementation = function (name: any, type: any) {

            const assetName = getStringValue(name);
            const typeName = objToString(type);

            console.log("\n========== AssetBundle.LoadAssetAsync(name, type) ==========");
            printBundleAssetInfo(this, assetName, typeName);

            const ret = (this as any).method("LoadAssetAsync", 2).invoke(name, type);

            console.log("Return:", objToString(ret));
            console.log("============================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadAssetAsync(string, Type)");
    } else {
        console.log("[-] AssetBundle.LoadAssetAsync(string, Type) not found");
    }

    // ============================================================
    // 9. AssetBundle.LoadAllAssets()
    // instance Object[] LoadAllAssets()
    // ============================================================
    const loadAllAssets0 = findMethod(AssetBundle, "LoadAllAssets", 0);

    if (loadAllAssets0) {
        loadAllAssets0.implementation = function () {

            console.log("\n========== AssetBundle.LoadAllAssets() ==========");
            console.log("this:", objToString(this));
            console.log("BundleKey:", objKey(this));
            console.log("BundleName:", getBundleName(this));
            console.log("BundleFilePath:", getBundlePath(this));

            const ret = (this as any).method("LoadAllAssets", 0).invoke();

            console.log("Return:", objToString(ret));
            console.log("=================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadAllAssets()");
    } else {
        console.log("[-] AssetBundle.LoadAllAssets() not found");
    }

    // ============================================================
    // 10. AssetBundle.LoadAllAssets(Type type)
    // instance Object[] LoadAllAssets(Type type)
    // ============================================================
    const loadAllAssets1 = findMethod(AssetBundle, "LoadAllAssets", 1);

    if (loadAllAssets1) {
        loadAllAssets1.implementation = function (type: any) {

            console.log("\n========== AssetBundle.LoadAllAssets(type) ==========");
            console.log("this:", objToString(this));
            console.log("BundleKey:", objKey(this));
            console.log("BundleName:", getBundleName(this));
            console.log("BundleFilePath:", getBundlePath(this));
            console.log("Type:", objToString(type));

            const ret = (this as any).method("LoadAllAssets", 1).invoke(type);

            console.log("Return:", objToString(ret));
            console.log("=====================================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.LoadAllAssets(Type)");
    } else {
        console.log("[-] AssetBundle.LoadAllAssets(Type) not found");
    }

    // ============================================================
    // 11. AssetBundle.Unload(bool unloadAllLoadedObjects)
    // 看 AssetBundle 什么时候被释放
    // ============================================================
    const unload1 = findMethod(AssetBundle, "Unload", 1);

    if (unload1) {
        unload1.implementation = function (unloadAllLoadedObjects: any) {

            console.log("\n========== AssetBundle.Unload(bool) ==========");
            console.log("this:", objToString(this));
            console.log("BundleKey:", objKey(this));
            console.log("BundleName:", getBundleName(this));
            console.log("BundleFilePath:", getBundlePath(this));
            console.log("UnloadAllLoadedObjects:", unloadAllLoadedObjects);

            const ret = (this as any).method("Unload", 1).invoke(unloadAllLoadedObjects);

            console.log("Return:", objToString(ret));
            console.log("==============================================");

            return ret;
        };

        console.log("[+] Hooked AssetBundle.Unload(bool)");
    } else {
        console.log("[-] AssetBundle.Unload(bool) not found");
    }

    console.log("====================================");
    console.log("[*] AssetBundle Hook Finished");
    console.log("====================================");
});
