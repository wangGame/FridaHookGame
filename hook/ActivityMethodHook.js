console.log("JS injected OK");
Java.perform(function () {
    console.log("Java ready");
    var mainActivity = Java.use("com.example.androidhook.MainActivity");
    mainActivity.onWindowFocusChanged.implementation = function (hasFocus) {
        console.log(
            "Focus change:",
            this.getClass().getName(),
            "hasFocus=" + hasFocus
        );
        return this.onWindowFocusChanged(hasFocus);
    };

    /*
    implementation和overload的选择，只有一个方法的使用，使用implementation和overload的选择，如果是多个方法，有重载的时候使用overload

    */

   mainActivity.add.implementation = function(a,b){
        console.log("add ==== >")
        this.add(4,5)
   }


    var addFunc = mainActivity.add.overload('int','int')

    addFunc.implementation = function(a, b) {

        console.log("xxadd ====>", a, b)

        var ret = addFunc.call(this, a, b)

        return ret
    }
})