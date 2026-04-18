function checkImgForBigo(img) {
        if (img.naturalWidth * img.naturalHeight >= 900 && img.offsetWidth * img.offsetHeight >= 900) {
            var object = { "act": "notify", "type": "render", "target": "IMG", "url": img.src, "w": img.width, "h": img.height };
            // console.log("notify render result: " + JSON.stringify(object));
            window.bigossp.webCollect(JSON.stringify(object));
            return true;
        }
        return false;
    }
</script>