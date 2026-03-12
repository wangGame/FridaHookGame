/*
PrintView Tree
*/

Java.perform(function () {

    var StartActivity = Java.use("com.june.game.doudizhu.activities.game.StartActivity");

    StartActivity.onWindowFocusChanged.implementation = function (hasFocus) {

        this.onWindowFocusChanged(hasFocus);

        if (hasFocus) {

            console.log("StartActivity get focus");

            var rootView = this.getWindow().getDecorView();

            printView(rootView, 0);
        }
    };

});


function printView(view, depth) {

    var prefix = "";
    for (var i = 0; i < depth; i++) {
        prefix += "  ";
    }

    var viewClass = view.getClass().getName();

    var idInfo = "";

    try {
        var id = view.getId();
        if (id != -1) {
            var name = view.getResources().getResourceEntryName(id);
            idInfo = " id=" + name;
        }
    } catch (e) {}

    console.log(prefix + viewClass + idInfo);

    var ViewGroup = Java.use("android.view.ViewGroup");

    if (ViewGroup.class.isInstance(view)) {

        var vg = Java.cast(view, ViewGroup);

        var count = vg.getChildCount();

        for (var i = 0; i < count; i++) {

            var child = vg.getChildAt(i);

            printView(child, depth + 1);
        }
    }
}