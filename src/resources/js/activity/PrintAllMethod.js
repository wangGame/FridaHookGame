
Java.perform(function () {
    var Cls = Java.use("com.diguo.iap.googleplay.BillingManager");
    console.log("===== All methods of BillingManager =====");
    // 获取 Class 对象
    var methods = Cls.class.getDeclaredMethods();
    // 遍历打印
    methods.forEach(function(m) {
        try {
            console.log(m.toString());
        } catch (e) {
            console.log("Error printing method: " + e);
        }
    });
    console.log("===== End of methods =====");
});