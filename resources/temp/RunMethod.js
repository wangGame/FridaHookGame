setImmediate(function () {

    const soName = "libil2cpp.so";
    const base = Module.findBaseAddress(soName);

    if (!base) {
        console.log("[-] libil2cpp not found");
        return;
    }

    console.log("[+] libil2cpp base:", base);

    // ===== 可选配置 =====
    const PRINT_STACK = false;       // 是否打印调用栈
    const FILTER_REPEAT_THIS = false; // 是否过滤重复this
    const printedThis = {};

    /**
     * @param {string} name 方法名
     * @param {number|string} addrOrRVA RVA 偏移或者绝对地址
     * @param {boolean} absolute 是否是绝对地址
     */
    function hookMethod(name, addrOrRVA, absolute = false) {

        try {
            let addr;
            if (absolute) {
                addr = ptr(addrOrRVA);      // 直接绝对地址
            } else {
                addr = base.add(addrOrRVA); // RVA + base
            }

            Interceptor.attach(addr, {
                onEnter: function (args) {

                    if (FILTER_REPEAT_THIS) {
                        if (printedThis[name] === args[0].toString())
                            return;
                        printedThis[name] = args[0].toString();
                    }

                    console.log("\n======== " + name + " ========");
                    console.log("this:", args[0]);

                    if (PRINT_STACK) {
                        console.log(
                            Thread.backtrace(this.context, Backtracer.ACCURATE)
                                .map(DebugSymbol.fromAddress)
                                .join("\n")
                        );
                    }

                    console.log("================================");
                }
            });

            console.log("[+] Hooked:", name, "@", addr);

        } catch (e) {
            console.log("[-] Hook failed:", name, e.message);
        }
    }

    // ===== Game 方法全集（RVA） =====
    const methods = [

//        // getter / setter
//        ["Game_get_Camera", 0x9817c8],
//        ["Game_set_Camera", 0x981818],
//        ["Game_get_IsInitialized", 0x98187c],
//        ["Game_set_IsInitialized", 0x981884],
//        ["Game_get_YC", 0x98188c],
//        ["Game_get_XC", 0x981894],
//        ["Game_get_Sprite", 0x98189c],
//        ["Game_get_OnComplete", 0x9818a4],
//        ["Game_get_PuzzleView", 0x9818ac],
//        ["Game_get_LinkCalculator", 0x9818b4],
//        ["Game_get_VS", 0x9818bc],
//        ["Game_get_Columns", 0x9818c4],
//        ["Game_get_Rows", 0x9818cc],
//        ["Game_get_IsDragging", 0x9818d4],
//
//        // 初始化
//        ["Game_Initialize", 0x9818dc],
//        ["Game_Clear", 0x982170],
//        ["Game_InitWhenGameStart", 0x982744],
//
//        // 拖拽
//        ["Game_OnBeginDrag", 0x986a40],
//        ["Game_OnDrag", 0x9885e8],
//        ["Game_OnEndDrag", 0x9887e4],
//        ["Game_NotifyStartDrag", 0x988184],
//        ["Game_NotifyEndDrag", 0x994db8],
//
//        // 交换
//        ["Game_SwapPieces", 0x99471c],
//        ["Game_DoMove", 0x9939b0],
//        ["Game_DoMoveWithControl", 0x993df4],
//        ["Game_HandleValidMove", 0x98e9f8],
//        ["Game_HandleInvalidMove", 0x98e6f8],
//
//        // Cheat
//        ["Game_CheatFinishExceptTopLeftSwap", 0x994414],
//        ["Game_CheatFinishWithSwap", 0x994980],
//
//        // 关键逻辑
//        ["Game_TryFormNewLinks", 0x99b51c],
//        ["Game_FindConnectedGroups", 0x99dd68],
//        ["Game_CalculateLink", 0x9a69a4],
//        ["Game_HandleLinkResult", 0x984094],
//        ["Game_HandleGameCompleteWithFlipAnimation", 0x985948],
//
//        // 统计上报
//        ["Game_SendGameStart", 0x9a6d84],
//        ["Game_SendGameEnd", 0x9a7834],
//        ["Game_SendGameExit", 0x9a80ec],
//
//        // 构造函数
//        ["Game_ctor", 0x9a9010],
//
//        // Lambda
//        ["Game_DoMove_b__125_0", 0x9a9330],
//        ["Game_TryFormNewLinks_b__166_0", 0x9a9460],
//        ["Game_TryFormNewLinks_b__166_2", 0x9a9468],
    ];
//
//    methods.forEach(function (m) {
//        hookMethod(m[0], m[1]); // 默认按 RVA
//    });
//
//    // ===== 直接用绝对地址示例 =====
//    const absMethods = [
//        ["Game_CalculateLink_abs", "0x66866e80"],  // 注意字符串形式
//    ];
//
//    absMethods.forEach(function (m) {
//        hookMethod(m[0], m[1], true); // true 表示直接绝对地址
//    });

});
