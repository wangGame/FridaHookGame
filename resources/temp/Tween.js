//setImmediate(function () {
//
//    var soName = "libil2cpp.so";
//    var base = Module.findBaseAddress(soName);
//
//    if (!base) {
//        console.log("[-] libil2cpp not found!");
//        return;
//    }
//
//    console.log("[+] libil2cpp base:", base);
//
//    // ===== 统一Hook函数 =====
//    function hookMethod(name, rva) {
//
//        var addr = base.add(rva);
//
//        console.log("[+] Hooking", name, "@", addr);
//
//        Interceptor.attach(addr, {
//
//            onEnter: function (args) {
//
//                console.log("\n======== " + name + " ========");
//
//                console.log("this:", args[0]);
//
//                // 如果你想开调用栈，取消下面注释
//                /*
//                console.log(
//                    Thread.backtrace(this.context, Backtracer.ACCURATE)
//                        .map(DebugSymbol.fromAddress)
//                        .join("\n")
//                );
//                */
//
//                console.log("===============================");
//            }
//
//        });
//    }
//
//    // ===== Game 方法列表 =====
//    var methods = [
//
//        ["Game_OnEndDrag", 0x9887e4],
//        ["Game_RestartGame", 0x9922f8],
//        ["Game_GetCurrentLinkTargetSet", 0x9923b4],
//        ["Game_GetCurrentLinkDictionary", 0x9926d4],
//        ["Game_OnResetFinish", 0x992b30],
//        ["Game_GetChipOrder", 0x992b5c],
////        ["Game_GetPiecePositionInfoByIndex", 0x992aa0],
//        ["Game_FindPieceByTargetIndex", 0x9853fc],
//        ["Game_CheckLeft2Piece", 0x989328],
//        ["Game_HandleExchangeTwoLink", 0x98c354],
//        ["Game_HandleExchangeTwoPiece", 0x98a158],
//        ["Game_CheckFastCompleteLastStep", 0x9864a8],
//        ["Game_GetPuzzlePosition", 0x994104],
//        ["Game_GetSizeDelta", 0x9941d8],
//        ["Game_CheatFinishExceptTopLeftSwap", 0x994414],
//        ["Game_CheatFinishWithSwap", 0x994980],
//        ["Game_SwapPieces", 0x99471c],
//        ["Game_GetLink", 0x9854d8],
//        ["Game_ForeachLink", 0x98879c],
//        ["Game_NotifyPieceTouched", 0x987d7c],
//        ["Game_NotifyStartDrag", 0x988184],
//        ["Game_NotifyEndDrag", 0x994db8],
//        ["Game_IsValid", 0x98e4dc],
//        ["Game_CalculateDropTarget", 0x9890a4],
//        ["Game_HandleInvalidMove", 0x98e6f8],
//        ["Game_HandleValidMove", 0x98e9f8],
//        ["Game_DoMove", 0x9939b0],
//        ["Game_DoMoveWithControl", 0x993df4],
//        ["Game_CalculatePieceOverlapArea", 0x997e0c],
//
//    ];
//
//    // ===== 批量Hook =====
//    methods.forEach(function (item) {
//        hookMethod(item[0], item[1]);
//    });
//
//});

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

    function hookMethod(name, rva) {

        try {

            const addr = base.add(rva);

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

        } catch (e) {
            console.log("[-] Hook failed:", name);
        }
    }

    // ===== Game 方法全集 =====
    const methods = [

        // getter / setter
        ["Game_get_Camera", 0x9817c8],
        ["Game_set_Camera", 0x981818],
        ["Game_get_IsInitialized", 0x98187c],
        ["Game_set_IsInitialized", 0x981884],
        ["Game_get_YC", 0x98188c],
        ["Game_get_XC", 0x981894],
        ["Game_get_Sprite", 0x98189c],
        ["Game_get_OnComplete", 0x9818a4],
        ["Game_get_PuzzleView", 0x9818ac],
        ["Game_get_LinkCalculator", 0x9818b4],
        ["Game_get_VS", 0x9818bc],
        ["Game_get_Columns", 0x9818c4],
        ["Game_get_Rows", 0x9818cc],
        ["Game_get_IsDragging", 0x9818d4],

        // 初始化
        ["Game_Initialize", 0x9818dc],
        ["Game_Clear", 0x982170],
        ["Game_InitWhenGameStart", 0x982744],

        // 拖拽
        ["Game_OnBeginDrag", 0x986a40],
        ["Game_OnDrag", 0x9885e8],
        ["Game_OnEndDrag", 0x9887e4],
        ["Game_NotifyStartDrag", 0x988184],
        ["Game_NotifyEndDrag", 0x994db8],

        // 交换
        ["Game_SwapPieces", 0x99471c],
        ["Game_DoMove", 0x9939b0],
        ["Game_DoMoveWithControl", 0x993df4],
        ["Game_HandleValidMove", 0x98e9f8],
        ["Game_HandleInvalidMove", 0x98e6f8],

        // Cheat
        ["Game_CheatFinishExceptTopLeftSwap", 0x994414],
        ["Game_CheatFinishWithSwap", 0x994980],

        // 关键逻辑
        ["Game_TryFormNewLinks", 0x99b51c],
        ["Game_FindConnectedGroups", 0x99dd68],
        ["Game_CalculateLink", 0x9a69a4],
        ["Game_HandleLinkResult", 0x984094],
        ["Game_HandleGameCompleteWithFlipAnimation", 0x985948],

        // 统计上报
        ["Game_SendGameStart", 0x9a6d84],
        ["Game_SendGameEnd", 0x9a7834],
        ["Game_SendGameExit", 0x9a80ec],

        // 构造函数
        ["Game_ctor", 0x9a9010],

        // Lambda
        ["Game_DoMove_b__125_0", 0x9a9330],
        ["Game_TryFormNewLinks_b__166_0", 0x9a9460],
        ["Game_TryFormNewLinks_b__166_2", 0x9a9468],

    ];

    methods.forEach(function (m) {
        hookMethod(m[0], m[1]);
    });

});
