function(omidGlobal) {
        try {
            this.geometryChangeCallback = false;
            var omVer = Object.keys(omidGlobal.OmidVerificationClient)[0];
            var verificationClient = new omidGlobal.OmidVerificationClient[omVer]();
            var eventTypes = ["%4$s", "%5$s", "%6$s"];
            for (var i = 0; i < eventTypes.length; i++) {
                verificationClient.addEventListener(eventTypes[i], function(event) {
                    if (event.type == "%6$s") { 
                       var pixels = event.data.adView.onScreenGeometry.pixels;
                       if ( pixels <= 0 || this.geometryChangeCallback) { return; }
                       %1$s.onCustomJSEventCallback("%2$s", JSON.stringify(event));
                       this.geometryChangeCallback = true;
                    } else {
                       %1$s.onCustomJSEventCallback("%2$s", JSON.stringify(event));
                    }
                });
            }
        } catch (e) {
            var errorJson = {};
            errorJson.type = "%2$s";
            errorJson.message = e.toString();
            %1$s.onCustomJSEventCallback("%3$s", JSON.stringify(errorJson));
        }
    }(typeof global === 'undefined' ? this : global));