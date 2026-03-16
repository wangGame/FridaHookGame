function(event) {
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