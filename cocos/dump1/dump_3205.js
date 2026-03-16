function (d) {
        let backgroundDivs = Array.from(document.querySelectorAll('div'));
        var backgroundImags = [];
        backgroundDivs.forEach(div => {
            let imgUrl = window.getComputedStyle(div).backgroundImage.match(/url\(["']?(.*)["']?\)/)
            if (!imgUrl) imgUrl = window.getComputedStyle(div, ':before').backgroundImage.match(/url\(["']?(.*)["']?\)/);
            if (!imgUrl) imgUrl = window.getComputedStyle(div, ':after').backgroundImage.match(/url\(["']?(.*)["']?\)/);
            if (imgUrl) {
                var object = { "act": "stash", "type": "mayError", "target": "background-image", "url": imgUrl[1]};
                backgroundImags.push(object);
            }
        });
        // console.log('webCollect: ' + JSON.stringify(backgroundImags));
        window.bigossp.webCollect(JSON.stringify(backgroundImags));
    });
</script>