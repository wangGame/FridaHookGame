function (e) {
            if (e) {
                var target = e.target || e.srcElement;
                var isElementTarget = target instanceof HTMLElement;
                if (isElementTarget) {
                    var url = target.href || target.src;
                    var width = parseInt(window.getComputedStyle(target).width);
                    var height = parseInt(window.getComputedStyle(target).height);
                    var errorInfo = { "url": url, "w": width, "h": height };
                    //object格式 { "act": "error", "type": e.type, "target": e.target.nodeName, "url": "http://testhehe.com/test", "w": 20, "h": 20}
                    var object = { "act": "error", "type": e.type, "target": e.target.nodeName, "url": url };
                    if (width) object["w"] = width;
                    if (height) object["h"] = height;
                    window.bigossp.webCollect(JSON.stringify(object));
                }
            }
        }, true);
    }());
</script>
