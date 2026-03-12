var addr = DebugSymbol.findFunctionsNamed("CompileBroker::compile_method")[0];

Interceptor.attach(addr, {

    onEnter: function (args) {

        console.log("JIT compiling method");

    }

});