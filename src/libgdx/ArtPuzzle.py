
import frida
import sys
import numpy as np
from PIL import Image
import os

PACKAGE_NAME = "Art Jigsaw Puzzle"

index = 0

SAVE_DIR = "dump_images"

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)


def on_message(message, data):

    global index

    if message["type"] == "send":

        payload = message["payload"]

        if payload["type"] == "pixmap":

            w = payload["width"]
            h = payload["height"]

            print("receive pixmap", w, h)

            try:

                img = np.frombuffer(data, dtype=np.uint8)
                img = img.reshape((h, w, 4))

                image = Image.fromarray(img, "RGBA")

                name = f"{SAVE_DIR}/dump_{index}.png"

                image.save(name)

                print("saved", name)

                index += 1

            except Exception as e:
                print("image save error", e)


device = frida.get_usb_device()

print("attach:", PACKAGE_NAME)

session = device.attach(PACKAGE_NAME)

with open("Hook1.js") as f:
    script = session.create_script(f.read())

script.on("message", on_message)

script.load()

print("script loaded")

sys.stdin.read()