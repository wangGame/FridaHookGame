// SpriteAll.ts
import "frida-il2cpp-bridge";

declare const console: any;

Il2Cpp.perform(() => {

    console.log("====================================");
    console.log("[*] Sprite Dump Hook Start");
    console.log("====================================");

    const OUT_DIR = "D:\\Hook\\HookLearn\\dump_sprites";

    const Il2CppAny: any = Il2Cpp;

    function getClass(asmNames: string[], className: string): any {
        for (const asmName of asmNames) {
            try {
                return Il2Cpp.domain.assembly(asmName).image.class(className);
            } catch (_) {}
        }
        throw new Error("Class not found: " + className);
    }

    function tryGetClass(asmNames: string[], className: string): any {
        try {
            return getClass(asmNames, className);
        } catch (e) {
            console.log("[!] get class failed: " + className + " " + e);
            return null;
        }
    }

    const Directory: any = Il2Cpp.corlib.class("System.IO.Directory");
    const File: any = Il2Cpp.corlib.class("System.IO.File");

    const Texture2D: any = getClass(
        ["UnityEngine.CoreModule"],
        "UnityEngine.Texture2D"
    );

    const RenderTexture: any = getClass(
        ["UnityEngine.CoreModule"],
        "UnityEngine.RenderTexture"
    );

    const Graphics: any = getClass(
        ["UnityEngine.CoreModule"],
        "UnityEngine.Graphics"
    );

    const Rect: any = getClass(
        ["UnityEngine.CoreModule"],
        "UnityEngine.Rect"
    );

    const ImageConversion: any = tryGetClass(
        ["UnityEngine.ImageConversionModule", "UnityEngine.CoreModule"],
        "UnityEngine.ImageConversion"
    );

    try {
        Directory.method("CreateDirectory", 1).invoke(Il2Cpp.string(OUT_DIR));
        console.log("[+] Output dir: " + OUT_DIR);
    } catch (e) {
        console.log("[!] CreateDirectory failed: " + e);
    }

    const dumped = new Set<string>();

    function isNullObj(obj: any): boolean {
        try {
            if (obj === null || obj === undefined) return true;
            if (obj.isNull && obj.isNull()) return true;
            return false;
        } catch (_) {
            return obj === null || obj === undefined;
        }
    }

    function getObjName(obj: any): string {
        try {
            const s: any = obj.method("get_name", 0).invoke();
            if (s && s.content !== undefined) {
                return s.content;
            }
        } catch (_) {}

        return "noname";
    }

    function safeFileName(name: string): string {
        return name.replace(/[\\/:*?"<>|]/g, "_");
    }

    function getInstanceKey(obj: any): string {
        try {
            const id: any = obj.method("GetInstanceID", 0).invoke();
            return String(id);
        } catch (_) {
            try {
                return obj.handle.toString();
            } catch (_) {
                return String(Math.random());
            }
        }
    }

    function invokeNumber(obj: any, methodName: string): number {
        const v: any = obj.method(methodName, 0).invoke();
        return Number(v);
    }

    function newRect(x: number, y: number, w: number, h: number): any {
        const rectObj: any = Rect.new();

        try {
            rectObj.method(".ctor", 4).invoke(x, y, w, h);
        } catch (e) {
            console.log("[!] Rect ctor failed: " + e);
        }

        try {
            return rectObj.unbox();
        } catch (_) {
            return rectObj;
        }
    }

    function newTexture2D(w: number, h: number): any {
        let tex: any = Texture2D.new();

        try {
            // UnityEngine.TextureFormat.RGBA32 = 4
            tex.method(".ctor", 4).invoke(w, h, 4, false);
            return tex;
        } catch (e) {
            console.log("[!] Texture2D(w,h,RGBA32,false) failed, fallback Texture2D(w,h)");
        }

        tex = Texture2D.new();
        tex.method(".ctor", 2).invoke(w, h);
        return tex;
    }

    function encodeToPng(tex: any): any {
        if (ImageConversion !== null) {
            try {
                return ImageConversion.method("EncodeToPNG", 1).invoke(tex);
            } catch (e) {
                console.log("[!] ImageConversion.EncodeToPNG failed: " + e);
            }
        }

        return tex.method("EncodeToPNG", 0).invoke();
    }

    function saveTextureRectToPng(
        sourceTex: any,
        x: number,
        y: number,
        w: number,
        h: number,
        savePath: string
    ) {
        const sourceW = invokeNumber(sourceTex, "get_width");
        const sourceH = invokeNumber(sourceTex, "get_height");

        let rt: any = null;
        let oldRT: any = null;

        try {
            rt = RenderTexture.method("GetTemporary", 3).invoke(sourceW, sourceH, 0);
            oldRT = RenderTexture.method("get_active", 0).invoke();

            Graphics.method("Blit", 2).invoke(sourceTex, rt);
            RenderTexture.method("set_active", 1).invoke(rt);

            const outTex: any = newTexture2D(w, h);
            const readRect: any = newRect(x, y, w, h);

            // Texture2D.ReadPixels(Rect source, int destX, int destY, bool recalculateMipMaps)
            outTex.method("ReadPixels", 4).invoke(readRect, 0, 0, false);

            try {
                outTex.method("Apply", 0).invoke();
            } catch (_) {
                outTex.method("Apply", 1).invoke(false);
            }

            const pngBytes: any = encodeToPng(outTex);

            File.method("WriteAllBytes", 2).invoke(
                Il2Cpp.string(savePath),
                pngBytes
            );

            console.log("[+] Saved: " + savePath);

        } finally {
            try {
                if (!isNullObj(oldRT)) {
                    RenderTexture.method("set_active", 1).invoke(oldRT);
                }
            } catch (_) {}

            try {
                if (!isNullObj(rt)) {
                    RenderTexture.method("ReleaseTemporary", 1).invoke(rt);
                }
            } catch (_) {}
        }
    }

    function dumpSprite(sprite: any, from: string) {
        if (isNullObj(sprite)) return;

        const key = getInstanceKey(sprite);

        if (dumped.has(key)) {
            return;
        }

        dumped.add(key);

        const spriteName = getObjName(sprite);

        console.log("------------------------------------");
        console.log("[*] Sprite from: " + from);
        console.log("[*] name = " + spriteName);
        console.log("[*] id   = " + key);

        let texture: any = null;

        try {
            texture = sprite.method("get_texture", 0).invoke();
        } catch (e) {
            console.log("[!] get_texture failed: " + e);
            return;
        }

        if (isNullObj(texture)) {
            console.log("[!] texture is null");
            return;
        }

        let x = 0;
        let y = 0;
        let w = 0;
        let h = 0;

        try {
            const rect: any = sprite.method("get_textureRect", 0).invoke();

            x = Math.round(invokeNumber(rect, "get_x"));
            y = Math.round(invokeNumber(rect, "get_y"));
            w = Math.round(invokeNumber(rect, "get_width"));
            h = Math.round(invokeNumber(rect, "get_height"));

            console.log("[*] textureRect = x:" + x + " y:" + y + " w:" + w + " h:" + h);

        } catch (e) {
            console.log("[!] get_textureRect failed, fallback save whole texture");
            console.log("[!] reason: " + e);

            try {
                x = 0;
                y = 0;
                w = invokeNumber(texture, "get_width");
                h = invokeNumber(texture, "get_height");
            } catch (e2) {
                console.log("[!] get texture size failed: " + e2);
                return;
            }
        }

        if (w <= 0 || h <= 0) {
            console.log("[!] invalid size: " + w + "x" + h);
            return;
        }

        const fileName = safeFileName(key + "_" + spriteName + ".png");
        const savePath = OUT_DIR + "\\" + fileName;

        try {
            saveTextureRectToPng(texture, x, y, w, h, savePath);
        } catch (e) {
            console.log("[!] save failed: " + spriteName);
            console.log(e);
        }
    }

    function hookUIImage() {
        try {
            const UIImage: any = getClass(
                ["UnityEngine.UI"],
                "UnityEngine.UI.Image"
            );

            const setSprite: any = UIImage.method("set_sprite", 1);

            setSprite.implementation = function (sprite: any) {
                dumpSprite(sprite, "UnityEngine.UI.Image.set_sprite");

                return this.method("set_sprite", 1).invoke(sprite);
            };

            console.log("[+] Hooked UnityEngine.UI.Image.set_sprite");

        } catch (e) {
            console.log("[!] Hook UI.Image.set_sprite failed: " + e);
        }
    }

    function hookSpriteRenderer() {
        try {
            const SpriteRenderer: any = getClass(
                ["UnityEngine.CoreModule"],
                "UnityEngine.SpriteRenderer"
            );

            const setSprite: any = SpriteRenderer.method("set_sprite", 1);

            setSprite.implementation = function (sprite: any) {
                dumpSprite(sprite, "UnityEngine.SpriteRenderer.set_sprite");

                return this.method("set_sprite", 1).invoke(sprite);
            };

            console.log("[+] Hooked UnityEngine.SpriteRenderer.set_sprite");

        } catch (e) {
            console.log("[!] Hook SpriteRenderer.set_sprite failed: " + e);
        }
    }

    hookUIImage();
    hookSpriteRenderer();

    console.log("[*] Sprite Dump Hook Ready");
});