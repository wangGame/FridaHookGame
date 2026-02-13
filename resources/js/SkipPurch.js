Java.perform(function () {

    var Cls = Java.use("com.diguo.iap.googleplay.DDIap");
    console.log(Cls)
    Cls.purchase
        .overload(
            "android.app.Activity",
            "java.lang.String"
        )
        .implementation = function (activity, str2) {
            console.log("🔥 launchBillingFlow called");

            console.log("type =", str2);
            console.log("activity =", activity);
            this. testHandlePurchase(str2);
            const AppContext = Java.use("com.diguo.common.AppContext");
            var v = AppContext.getInstance().getActivity().getPreferences(0).getBoolean("DDIap_NOAD", false);
            console.log(v)


                // 获取 Activity
                var act = AppContext.getInstance().getActivity();

                // 获取 SharedPreferences
                var prefs = act.getPreferences(0);

                // 写入 DDIap_NOAD = true
                var editor = prefs.edit();
                editor.putBoolean("DDIap_NOAD", false);
                editor.commit();   // 或 apply()

                console.log("✅ DDIap_NOAD written = true");
                console.log(prefs.getBoolean("DDIap_NOAD", false));

            // ===== 如果你想拦截不让它执行 =====
            // return;

            // ===== 如果你想强制改参数 =====
            // return this.m5012x74ee2e69("vip", str2, activity);
        };
});

