import sys
import lief

libnative = lief.parse(r"../a.apk")

print(libnative)

libnative.add_library("C:\\Users\\Doodle\\PycharmProjects\\PythonProject\\frid.so") # Injection!
libnative.write("a.apk")