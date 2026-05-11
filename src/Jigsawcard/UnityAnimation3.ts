import "frida-il2cpp-bridge";

declare const console: any;

Il2Cpp.perform(() => {

    console.log("🔥 DOTween TweenInfo Collector Start");

    // =========================================================
    // TweenInfo 数据结构
    // =========================================================

    const TweenDB: any[] = [];

    function createTweenInfo() {
        return {
            target: "",
            from: null,
            to: null,
            duration: 0,
            ease: "Linear",
            delay: 0,
            loop: 0,
            callback: false,
            type: "",
            raw: null
        };
    }

    function getLastTween() {
        return TweenDB.length > 0 ? TweenDB[TweenDB.length - 1] : null;
    }

    // =========================================================
    // Unity 工具
    // =========================================================

    function unityName(obj: any): string {
        try {
            return obj.method("get_name").invoke();
        } catch (e) {
            try {
                return obj.name;
            } catch (e2) {
                return "Unknown";
            }
        }
    }

    function getPosition(transform: any) {
        try {
            return transform.method("get_position").invoke();
        } catch (e) {
            return null;
        }
    }

    // =========================================================
    // find class
    // =========================================================

    function findClass(name: string) {
        for (const asm of Il2Cpp.domain.assemblies) {
            try {
                return asm.image.class(name);
            } catch (e) {}
        }
        return null;
    }

    // =========================================================
    // Hook DOMove
    // =========================================================

    function hookDOMove() {

        const cls = findClass("DG.Tweening.ShortcutExtensions");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name !== "DOMove") continue;

            console.log("🎯 Hook DOMove");

            m.implementation = function (...args: any[]) {

                const target = args[0];

                const info = createTweenInfo();

                info.type = "DOMove";
                info.target = unityName(target);
                info.to = args[1];
                info.duration = args[2];
                info.raw = target;

                try {
                    info.from = getPosition(target);
                } catch (e) {}

                TweenDB.push(info);

                const ret = m.invoke(this, ...args);

                return ret;
            };
        }
    }

    // =========================================================
    // Hook To (DOTween core)
    // =========================================================

    function hookTo() {

        const cls = findClass("DG.Tweening.DOTween");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name !== "To") continue;

            console.log("🎯 Hook To");

            m.implementation = function (...args: any[]) {

                const info = createTweenInfo();

                info.type = "To";
                info.to = args[2];
                info.duration = args[3];

                TweenDB.push(info);

                return m.invoke(this, ...args);
            };
        }
    }

    // =========================================================
    // Hook SetEase
    // =========================================================

    function hookSetEase() {

        const cls = findClass("DG.Tweening.TweenSettingsExtensions");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name !== "SetEase") continue;

            console.log("🎯 Hook SetEase");

            m.implementation = function (...args: any[]) {

                const ease = args[1];

                const last = getLastTween();

                if (last) {
                    last.ease = String(ease);
                }

                return m.invoke(this, ...args);
            };
        }
    }

    // =========================================================
    // Hook SetDelay
    // =========================================================

    function hookSetDelay() {

        const cls = findClass("DG.Tweening.TweenSettingsExtensions");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name !== "SetDelay") continue;

            console.log("🎯 Hook SetDelay");

            m.implementation = function (...args: any[]) {

                const delay = args[1];

                const last = getLastTween();

                if (last) {
                    last.delay = delay;
                }

                return m.invoke(this, ...args);
            };
        }
    }

    // =========================================================
    // Hook SetLoops
    // =========================================================

    function hookSetLoops() {

        const cls = findClass("DG.Tweening.TweenSettingsExtensions");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name !== "SetLoops") continue;

            console.log("🎯 Hook SetLoops");

            m.implementation = function (...args: any[]) {

                const loop = args[1];

                const last = getLastTween();

                if (last) {
                    last.loop = loop;
                }

                return m.invoke(this, ...args);
            };
        }
    }

    // =========================================================
    // Hook Join / Append
    // =========================================================

    function hookSequence() {

        const cls = findClass("DG.Tweening.TweenSettingsExtensions");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name === "Join" || m.name === "Append") {

                console.log("🎯 Hook Sequence:", m.name);

                m.implementation = function (...args: any[]) {

                    const last = getLastTween();

                    if (last) {
                        last.callback = true;
                    }

                    return m.invoke(this, ...args);
                };
            }
        }
    }

    // =========================================================
    // Hook Complete / Kill
    // =========================================================

    function hookFinish() {

        const cls = findClass("DG.Tweening.Core.TweenManager");
        if (!cls) return;

        for (const m of cls.methods) {

            if (m.name !== "Complete" && m.name !== "Kill") continue;

            console.log("🎯 Hook Finish:", m.name);

            m.implementation = function (...args: any[]) {

                const last = getLastTween();

                if (last) {
                    last.finished = true;
                }

                return m.invoke(this, ...args);
            };
        }
    }

    // =========================================================
    // 输出系统
    // =========================================================

    function dumpTweens() {

        console.log("\n🔥 ========== TweenInfo Dump ==========");

        for (let i = 0; i < TweenDB.length; i++) {

            const t = TweenDB[i];

            console.log("\n----------------------");

            console.log("🎯 target:", t.target);
            console.log("📦 type:", t.type);
            console.log("📍 from:", t.from);
            console.log("🎯 to:", t.to);
            console.log("⏱ duration:", t.duration);
            console.log("🎢 ease:", t.ease);
            console.log("⏳ delay:", t.delay);
            console.log("🔁 loop:", t.loop);
            console.log("🔔 callback:", t.callback);
        }

        console.log("\n🔥 ===================================\n");
    }

    // =========================================================
    // 启动所有 hook
    // =========================================================

    hookDOMove();
    hookTo();
    hookSetEase();
    hookSetDelay();
    hookSetLoops();
    hookSequence();
    hookFinish();

    console.log("✅ TweenInfo Collector Ready");

    // =========================================================
    // 可选：5秒后输出一次
    // =========================================================

    setInterval(() => {
        dumpTweens();
    }, 5000);

});