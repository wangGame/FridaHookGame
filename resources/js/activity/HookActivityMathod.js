console.log("JS injected OK");
Java.perform(function () {
    console.log("Java ready");
    var Activity = Java.use("android.app.Activity");
    /**
     onWindowFocusChanged 方法
    */
    Activity.onWindowFocusChanged.implementation = function (hasFocus) {
        //1.打印方法的参数
        console.log(
            "Focus change:",
            this.getClass().getName(),
            "hasFocus=" + hasFocus
        );
        return this.onWindowFocusChanged(hasFocus);
    };

    var mainActivity = Java.use("com.tony.MathActivity");
    mainActivity.add.implementation = function (a,b) {
        //1.打印方法的参数
        //ab是方法的参数值
        console.log(a)
        console.log(b)
        //方法二：通过argement[0]这种方式进行
        console.log(arguments[0])
        console.log(arguments[1])

        console.log(
            "Focus change:",
            this.getClass().getName(),
            "hasFocus=" + hasFocus
        );
        return this.onWindowFocusChanged(hasFocus);
    };
});