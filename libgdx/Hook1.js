Java.perform(function () {

    var Pixmap = Java.use("com.badlogic.gdx.graphics.Pixmap");

    function dumpPixmap(pixmap) {

        try {

            var buf = pixmap.getPixels();

            var width = pixmap.getWidth();
            var height = pixmap.getHeight();

            if (width < 32 || height < 32) return;

            var size = width * height * 4;

            var ptr = buf._pointer;

            var data = Memory.readByteArray(ptr, size);

            send({
                type: "pixmap",
                width: width,
                height: height
            }, data);

        } catch (e) {
            console.log("dump error", e);
        }
    }

    // Hook Texture(Pixmap)
    var Texture = Java.use("com.badlogic.gdx.graphics.Texture");

    Texture.$init.overload("com.badlogic.gdx.graphics.Pixmap").implementation = function (pixmap) {

        dumpPixmap(pixmap);

        return this.$init(pixmap);
    };

    // Hook drawPixmap
    Pixmap.drawPixmap.overload(
        "com.badlogic.gdx.graphics.Pixmap",
        "int",
        "int"
    ).implementation = function (pixmap, x, y) {

        dumpPixmap(pixmap);

        return this.drawPixmap(pixmap, x, y);
    };

    console.log("LibGDX pixmap dumper loaded");

});