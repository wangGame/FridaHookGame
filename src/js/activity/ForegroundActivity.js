//
// 开始页面
//====================
//Foreground Activity: com.june.game.doudizhu.activities.game.StartActivity
//====================

Java.perform(function () {

    var Activity = Java.use("android.app.Activity");

    Activity.onResume.implementation = function () {

        var name = this.getClass().getName();

        console.log("\n====================");
        console.log("Foreground Activity:", name);
        console.log("====================\n");

        return this.onResume();
    };

});