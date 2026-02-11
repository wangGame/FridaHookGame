function baseOf(name) {
  try {
    return Process.getModuleByName(name).base.toString();
  } catch (e) {
    return null;
  }
}

setImmediate(function () {
  function p() {
    var info = {
      pid: Process.id,
      arch: Process.arch,
      libart: baseOf("libart.so"),
      libil2cpp: baseOf("libil2cpp.so"),
      javaDefined: (typeof Java !== "undefined"),
      javaAvailable: (typeof Java !== "undefined") ? Java.available : null
    };
    send(JSON.stringify(info));
  }

  p();
  setInterval(p, 500);
});
