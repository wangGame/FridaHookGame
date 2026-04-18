function') {
                    vpaidwrapper = new VPAIDWrapper(fn(), vpaidDiv, slot, videoSlot)
                } else {
                    vpaidwrapper = new VPAIDWrapper();
                }
                window.vpaidwrapper = vpaidwrapper;
            }
        }
    </script>
    <script src="vpaid.js" type="text/javascript"></script>
</head>

<body style="display: flex; justify-content: center; align-items: center;">
<div id="ad-container">
    <video height="100%" id="video-slot" muted playsinline width="100%"></video>
</div>
<div id="vpaid-container"
     style="position: absolute; width: 100%; height: 100%; margin: 0px; padding: 0px; border: none;">
    <iframe frameborder="0" height="100%" id="vpaid-iframe" marginheight="0" marginwidth="0"
            scrolling="no"
            src="vpaid_iframe.html"
            style="margin: 0px; padding: 0px; border: none;"
            width="100%"></iframe>
</div>
</body>
</html>