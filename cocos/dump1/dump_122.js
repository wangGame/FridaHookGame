function()
        {
            if (window.safedkXHRMonitoring) {
                return;
            }

            var webviewAddress = "{{webviewAddress}}";
            var sdkId = "{{SDK_ID}}";
            var webviewType = "{{webviewType}}"
            var origOpen = window.XMLHttpRequest.prototype.open;
            function open(method, url, async, user, password) {
                origOpen.apply(this, arguments);
                try {
                    this.safedkURL = url.toString();
                    this.addEventListener('load', function() {
                        try {
                            var message = {direction: "amazon_vast_prefetch_response", sdkId: sdkId, webviewAddress: webviewAddress, webviewType: webviewType};
                            if (typeof(this.safedkURL) != 'undefined' && this.safedkURL) message.url = this.safedkURL;
                            if (typeof(this.safedkRequestText) != 'undefined' && this.safedkRequestText) message.safedkRequestText = this.safedkRequestText;
                            if (typeof(this.responseText) != 'undefined' && this.responseText) message.responseText = this.responseText;
                            if ( typeof(window.webkit.messageHandlers.safedkDebug.interceptXmlHttpRequest) === 'function'){
                                window.webkit.messageHandlers.safedkDebug.interceptXmlHttpRequest(JSON.stringify(message));
                            }else{
                                console.log('SafeDKWebAppInterface safedkDebug object missing')
                            }
                        }
                        catch (error) {
                            printError(error);
                        }
                    });
                }
                catch (error) {
                    printError(error);
                }
            }
            window.XMLHttpRequest.prototype.open = open;

            var origSend = window.XMLHttpRequest.prototype.send;
            function send(body) {
                try {
                    var message = {direction: "request", sdkId: sdkId, webviewAddress: webviewAddress};
                    if (typeof(this.safedkURL) != 'undefined' && this.safedkURL) message.url = this.safedkURL;
                    if (typeof(body) != 'undefined' && body) {
                        if (typeof(body) === 'string') {
                            this.safedkRequestText = body;
                            message.requestText = this.safedkRequestText;
                        }
                    }
                }
                catch (error) {
                    printError(error);
                }
                origSend.apply(this, arguments);
            }
            window.XMLHttpRequest.prototype.send = send;
            window.safedkXHRMonitoring = true
        }
        hookXMLHTTPRequest();
      })();
    `;try{const s=win.document.createElement("script");s.textContent=code;(win.document.head||win.document.documentElement).appendChild(s);s.remove()}catch(e){}}function isTargetAdIframe(node){try{if(!node)return false;if(node.tagName==="IFRAME"){if(node.id==="apsAdIframe")return true}}catch(_){}return false}function tryHookIframe(ifr){if(!ifr||ifr.safedkIFrameAnalyzed!=null)return;var injectIfReady=function(){try{if(ifr.contentWindow&&ifr.contentDocument){const rs=ifr.contentDocument.readyState;if(!rs||rs==="interactive"||rs==="complete"){injectIntoIframe(ifr.contentWindow);ifr.safedkIFrameAnalyzed=true;log("iframe found");return true}}}catch(e){}return false};if(injectIfReady())return;log("adding load listener to iframe");try{ifr.addEventListener("load",function onload(){try{ifr.removeEventListener("load",onload)}catch(_){}injectIfReady()})}catch(_){}}try{var ifr=document.getElementById("apsAdIframe");if(isTargetAdIframe(ifr)){tryHookIframe(ifr)}}catch(_){}var mo=new MutationObserver(function(mutations){for(var i=0;i<mutations.length;i++){var m=mutations[i];for(var j=0;j<m.addedNodes.length;j++){var node=m.addedNodes[j];if(node.nodeType!==1)continue;if(isTargetAdIframe(node)){tryHookIframe(node)}else{var ifr=node.querySelector("#apsAdIframe");if(isTargetAdIframe(ifr)){tryHookIframe(node)}}}}});try{mo.observe(document.documentElement||document,{childList:true,subtree:true})}catch(_){}function attachMraid(){if(isMraidAttached){return}var webviewAddress="{{webviewAddress}}";var sdkId="{{SDK_ID}}";var webviewType="{{webviewType}}";var originalAAXRenderAd=window.aax_render_ad;if(typeof originalAAXRenderAd==="function"){window.aax_render_ad=function(...args){log("render ad found");try{if(args.length>0){var message={direction:"amazon_mraid_prefetch_response",sdkId:sdkId,webviewAddress:webviewAddress,webviewType:webviewType};message.responseText=JSON.stringify(args[0]);if(typeof window.webkit.messageHandlers.safedkDebug.interceptXmlHttpRequest==="function"){window.webkit.messageHandlers.safedkDebug.interceptXmlHttpRequest(JSON.stringify(message))}else{console.log("SafeDKWebAppInterface safedkDebug object missing")}}}catch(error){}return originalAAXRenderAd.apply(this,args)};isMraidAttached=true}}setTimeout(attachMraid,0)})();
