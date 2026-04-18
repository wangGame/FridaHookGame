rpc.exports = {
    hello: function () {
        return "hello from frida";
    },

    add: function (a, b) {
        return a + b;
    },

    getpid: function () {
        return Process.id;
    }
};