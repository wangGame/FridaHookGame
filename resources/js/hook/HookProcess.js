console.log("===== Loaded SO Modules =====");

Process.enumerateModules()
    .filter(m => m.name.endsWith(".so"))
    .forEach(m => {
        console.log(
            "BASE:", m.base,
            "SIZE:", m.size,
            "NAME:", m.name,
            "PATH:", m.path
        );
    });

console.log("===== End =====");
