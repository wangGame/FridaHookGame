import frida

dm = frida.get_device_manager()
device = dm.add_remote_device("127.0.0.1:27042")

print("Connected device:", device)

procs = device.enumerate_processes()
# 打印包含 oakever 的
hits = [p for p in procs if "oakever" in p.name.lower() or "jigsaw" in p.name.lower()]
print("Matched processes:")
for p in hits:
    print(p.pid, p.name)

print("Total process count:", len(procs))
