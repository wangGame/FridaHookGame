Java.perform(function() {
    Java.enumerateLoadedClasses({
        onMatch: function(cn) {
            try {
                var cls = Java.use(cn);
                var methods = cls.class.getDeclaredMethods();
                methods.forEach(function(m) {
                    console.log(cn + " : " + m);
                });
            } catch(e){}
        },
        onComplete: function() {}
    });
});