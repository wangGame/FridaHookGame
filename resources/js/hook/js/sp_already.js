console.log("======= Loaded Modules =======");

Process.enumerateModules().forEach(function (m) {

    console.log(
        "BASE:", m.base,
        "SIZE:", m.size,
        "NAME:", m.name,
        "PATH:", m.path
    );
});

console.log("======= END =======");
