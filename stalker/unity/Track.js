setImmediate(function () {

    const base = Module.findBaseAddress("libil2cpp.so");
    const target = base.add(0x9a69a4);   // Game_CalculateLink RVA

    console.log("Hook Game_CalculateLink @", target);

    Interceptor.attach(target, {

        onEnter: function (args) {

            console.log("\n===============================");
            console.log("Game_CalculateLink START");
            console.log("this:", args[0]);
            console.log("===============================");

            this.callCount = 0;
            this.seen = {};

            const tid = Process.getCurrentThreadId();
            this.tid = tid;

            Stalker.follow(tid, {
                events: { call: true },

                onReceive: (events) => {

                    const parsed = Stalker.parse(events);

                    parsed.forEach((e) => {

                        if (this.callCount > 50) return;   // 限制最多50条

                        const callTarget = ptr(e[1]);
                        const mod = Process.findModuleByAddress(callTarget);

                        if (!mod || mod.name !== "libil2cpp.so")
                            return;

                        try {

                            Il2Cpp.perform(() => {

                                const method = Il2Cpp.Method.fromAddress(callTarget);

                                if (!method) return;

                                const name = method.fullName;

                                // 过滤重复
                                if (this.seen[name]) return;
                                this.seen[name] = true;

                                console.log("  ↳ CALL -> " + name);

                                this.callCount++;

                            });

                        } catch (err) {
                            // 忽略解析失败
                        }

                    });

                }

            });

        },

        onLeave: function (retval) {

            Stalker.unfollow(this.tid);
            Stalker.garbageCollect();

            console.log("===============================");
            console.log("Game_CalculateLink END");
            console.log("return:", retval);
            console.log("===============================\n");
        }

    });

});
