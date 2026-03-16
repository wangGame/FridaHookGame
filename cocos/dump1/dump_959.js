function() {
            return shallowClone(config.expandProperties);
        },

        /**
         * useCustomClose() request to use a custom close button
         * followed by close() event on click of it
         */
        useCustomClose: function(shouldUseCustomClose) {
            var properties = mraid.getExpandProperties();
            properties.useCustomClose = shouldUseCustomClose;
            mraid.setExpandProperties(properties);
            mraidService.nativeInvoke('useCustomClose', { shouldUseCustomClose: shouldUseCustomClose });
        },

        expand: function(url) {
            var params;

            if (!(config.state === STATES.DEFAULT || config.state === STATES.RESIZED)) {
                mraidService.handleMethodError('Ad can only be expanded from default or resized state.', 'expand');
            } else {
                params = mraid.getExpandProperties();
                params.url = url;
                mraidService.nativeInvoke('expand', params);
            }
        },

        setResizeProperties: function(properties) {
            var invalidProps = [];
            var validators = {
                width: function(v) { return !isNaN(v) && v > 50; },
                height: function(v) { return !isNaN(v) && v > 50; },
                offsetX: function(v) { return !isNaN(v); },
                offsetY: function(v) { return !isNaN(v); },
                allowOffscreen: function(v) { return (typeof v === 'boolean'); }
            };

            for (var prop in properties) {
                var validator = validators[prop];
                if (validator && !validator(properties[prop])) {
                    invalidProps.push(prop);
                }
            }

            if (invalidProps.length) {
                mraidService.handleMethodError('Properties have invalid values - ' + invalidProps.join(','), 'setResizeProperties');
            } else {
                setProperties(config.resizeProperties, properties);
            }
        },

        getResizeProperties: function() {
            return shallowClone(config.resizeProperties);
        },

        resize: function() {
            var props = mraid.getResizeProperties();

            if (!(config.state === STATES.DEFAULT || config.state === STATES.RESIZED)) {
                mraidService.handleMethodError('Ad can not be resized in "' + config.state + '" state', 'resize');
            } else if (!props.width || !props.height) {
                mraidService.handleMethodError('Resize properties must be set before calling resize()', 'resize');
            } else {
                mraidService.nativeInvoke('resize', props);
            }
        },

        setOrientationProperties: function(properties) {
            setProperties(config.orientationProperties, properties);
            mraidService.nativeInvoke('setOrientationProperties', mraid.getOrientationProperties());
        },

        getOrientationProperties: function() {
            // Clone the object so as it does not get changes by ad accidently
            return shallowClone(config.orientationProperties);
        },

        storePicture: function(uri) {
            if (!uri) {
                mraidService.handleMethodError('URI is required', 'storePicture');
            } else {
                mraidService.nativeInvoke('storePicture', { url: uri });
            }
        },

        createCalendarEvent: function(parameters) {
            var event = new CalendarEvent(parameters);

            if (event.hasErrors()) {
                mraidService.handleMethodError(event.errors[0], 'createCalendarEvent');
            } else {
                mraidService.nativeInvoke('createCalendarEvent', { event: JSON.stringify(event.parameters) });
            }
        }
    };

    /**************************************************************************
     * Operations to global objects
     *************************************************************************/

    // If apple device then delegate the console log
    if ((/iphone|ipad|ipod/i).test(window.navigator.userAgent.toLowerCase())) {
        logger.delegateConsoleLog();
    }

    /**
     * Attach Logger
     */
    logger.attachLogToMethods(mraidService, 'MRAID Service');
    logger.attachLogToMethods(mraid, 'MRAID JS');

    /**
     * Expose methods on window
     */
    window.addEventListener('error', function (e) {
        logger.log('Global Exception', e.error);
    });

    window.mraidService = mraidService;
    window.mraid = mraid;

})();
alue;l=h.next().value;h=h.next().value;a=a.g.setClientInfo(h,e,g,l);c(a);break;case 'injectVerificationScriptResources':e=p(d);c=e.next().value;e=e.next().value;
a.g.injectVerificationScriptResources(e,c);break;case 'setCreativeType':e=p(d);c=e.next().value;e=e.next().value;a.g.setCreativeType(e,c);break;case 'setImpressionType':e=p(d);c=e.next().value;e=e.next().value;a.g.setImpressionType(e,c);break;case 'setContentUrl':e=p(d);c=e.next().value;e=e.next().value;V(a.g.g,e).g.C=c;break;case 'sessionError':g=p(d),c=g.next().value,e=g.next().value,g=g.next().value,a.g.error(g,c,e)}};function Z(){this.g=qc}n=Z.prototype;
n.da=function(a,b){if(!(!(a&&N(a)&&Q(a.impressionOwner,qa))||'videoEventsOwner'in a&&null!=a.videoEventsOwner&&!Q(a.videoEventsOwner,qa)||'mediaEventsOwner'in a&&null!=a.mediaEventsOwner&&!Q(a.mediaEventsOwner,qa))){b=V(this.g.g,b);if(a.creativeType&&a.impressionType){var c=a.mediaEventsOwner;null==b.g.h&&b.setCreativeType(a.creativeType,c);null==b.g.l&&(b.g.l=a.impressionType);ob(b.h,c)}else c=a.videoEventsOwner,b.g.g=null==c||'none'===c?'display':'video',b.g.h=null,b.g.l=null,ob(b.h,c);qb(b.h,a.impressionOwner);
a&&null!=a.isolateVerificationScripts&&'boolean'===typeof a.isolateVerificationScripts&&(b.g.I=a.isolateVerificationScripts)}};
n.aa=function(a,b,c,d){b&&'string'===typeof b.adSessionType&&(b.adSessionType=b.adSessionType.toLowerCase());var e;if(N(b)){if(e=Q(b.environment,ua)&&Q(b.adSessionType,pa))e=b.omidNativeInfo,e=N(e)?P(e.partnerName)&&P(e.partnerVersion):!1;e&&(e=b.app,e=N(e)?P(e.libraryVersion)&&P(e.appId):!1)}else e=!1;if(e){if($b(d)){e=p(Object.values(d));for(var f=e.next();!f.done;f=e.next())f.value.accessMode='limited';V(this.g.g,a).g.v=new Map(Object.entries(d))}kc(this.g,a,b,!0,c)}else K('Native ad session context invalid; session not started.')};
n.W=function(a){lc(this.g,a,!0)};n.$=function(a,b){N(a)&&O(a.x)&&O(a.y)&&O(a.width)&&O(a.height)&&(b=V(this.g.g,b),b.g.L=a,M(b.j,'container'))};n.ha=function(a,b){Q(a,sa)&&(b=V(this.g.g,b),b.g.A=a,'backgrounded'===a?M(b.j,'container','backgrounded'):M(b.j,'container'))};n.Y=function(a,b){Q(a,ta)&&(b=V(this.g.g,b),b.g.M=a,'locked'===a?M(b.j,'container','deviceLocked'):M(b.j,'container'))};n.ea=function(a){'impression'===a&&this.T()};n.T=function(a){a=V(this.g.g,a);rb(a.h,'native')&&kb(a.h,'native')};
n.X=function(a,b){this.S('loaded',void 0===a?null:a,b)};n.error=function(a,b,c){Q(a,oa)&&this.g.error(c,a,b)};n.fa=function(a,b,c){this.S(a,b,c)};n.S=function(a,b,c){Q(a,y)&&(void 0===b||N(b))&&(c=V(this.g.g,c),pb(c.h,'native')&&('loaded'==a?lb(c.h,'native',b):mb(c.h,a,'native',b)))};n.Z=function(a,b){b=V(this.g.g,b);'none'===b.h.g.o||'number'!==typeof a||isNaN(a)||(b.g.D=a,a=b.s,b=a.g.J,null!=b&&mb(a.h,'volumeChange','native',{mediaPlayerVolume:b,deviceVolume:a.g.D}))};
n.ga=function(a){if(a&&N(a)&&O(a.timestamp)){var b=Na(),c=(b.g||{}).timestamp;if(!c||c<a.timestamp)b.g=a}};Z.prototype.startSession=Z.prototype.aa;Z.prototype.error=Z.prototype.error;Z.prototype.finishSession=Z.prototype.W;Z.prototype.publishAdEvent=Z.prototype.ea;Z.prototype.publishImpressionEvent=Z.prototype.T;Z.prototype.publishVideoEvent=Z.prototype.fa;Z.prototype.publishMediaEvent=Z.prototype.S;Z.prototype.publishLoadedEvent=Z.prototype.X;Z.prototype.setNativeViewHierarchy=Z.prototype.$;
Z.prototype.setState=Z.prototype.ha;Z.prototype.setDeviceLockState=Z.prototype.Y;Z.prototype.setDeviceVolume=Z.prototype.Z;Z.prototype.init=Z.prototype.da;Z.prototype.setLastActivity=Z.prototype.ga;function tc(){var a=jc,b=uc,c=this;var d=void 0===d?J:d;this.j=a;this.g=b;this.l={};this.m={};this.i=new X;d.omid=d.omid||{};d.omid.v1_VerificationServiceCommunication=this.i;this.h=null;d&&d.addEventListener&&d.postMessage&&(this.h=new gc(d));this.i.g=function(e,f){vc(c,e,f,c.i)};this.h&&(this.h.g=function(e,f){c.h&&vc(c,e,f,c.h)})}function wc(a,b,c,d){a=Yb(a.j,d).h;'media'===b||'video'===b?$a(a,c,d):(c={type:b,R:d,G:c},a.j.push(c),Za(a,b,c))}function xc(a,b,c,d){a=Yb(a.j,d);Xb(a,b,c,d)}
function yc(a,b,c,d){xb(a.g,b,c,d)}tc.prototype.setInterval=function(a,b){return this.g.setInterval(a,b)};tc.prototype.clearInterval=function(a){this.g.clearInterval(a)};function zc(a,b,c,d){wb(a.g,'downloadJavaScriptResource')(b,c,d)}
function vc(a,b,c,d){function e(){var B=new W(f,'response',h,nc(h,w.apply(0,arguments)));d.h(B,c)}var f=b.h,g=b.method,h=b.version;b=oc(h,b.g);if(null!=fc(g,'VerificationService.')){g=fc(g,'VerificationService.');try{switch(g){case 'addEventListener':var k=p(b),l=k.next().value,m=k.next().value||Ac(c);wc(a,l,e,m);break;case 'addSessionListener':var t=p(b),I=t.next().value,ba=t.next().value||Ac(c);xc(a,e,I,ba);break;case 'sendUrl':var R=p(b).next().value;yc(a,R,function(){return e(!0)},function(){return e(!1)});
break;case 'setTimeout':var F=p(b),Ec=F.next().value,Fc=F.next().value;a.l[Ec]=ub(a.g,'setTimeout')(e,Fc);break;case 'clearTimeout':var Gc=p(b).next().value;vb(a.g,a.l[Gc]);break;case 'setInterval':var Rb=p(b),Hc=Rb.next().value,Ic=Rb.next().value;a.m[Hc]=a.setInterval(e,Ic);break;case 'clearInterval':var Jc=p(b).next().value;a.clearInterval(a.m[Jc]);break;case 'injectJavaScriptResource':var Kc=p(b).next().value;zc(a,Kc,function(B){return e(!0,B)},function(){return e(!1)});break;case 'getVersion':e('1.5.4-iab4590')}}catch(B){d.h(new W(f,
'error',h,'\n              name: '+B.name+'\n              message: '+B.message+'\n              filename: '+B.filename+'\n              lineNumber: '+B.lineNumber+'\n              columnNumber: '+B.columnNumber+'\n              stack: '+B.stack+'\n              toString(): '+B.toString()+'\n          '),c)}}}
function Ac(a){for(var b=Na().h,c=p(b.keys()),d=c.next();!d.done;d=c.next()){d=d.value;var e=b.get(d);if(e){if(e.contentWindow===a)return d;try{if(e.contentWindow.Object.prototype.isPrototypeOf(a))return d}catch(f){}}}};function Bc(a){var b={};return(b.app='omid_v1_present_app',b.web='omid_v1_present_web',b)[a]}function Cc(a,b){a.document.write('<iframe style="display:none" id="'+(b+'" name="'+b+'" sandbox></iframe>'))}function Dc(a,b){var c=a.document.createElement('iframe');c.id=b;c.name=b;c.style.display='none';c.sandbox='';a.document.body.appendChild(c)}
function Lc(a,b){var c=new MutationObserver(function(d){d.forEach(function(e){'BODY'===e.addedNodes[0].nodeName&&(e=Bc(b),Dc(a,'omid_v1_present'),Dc(a,e),c.disconnect())})});c.observe(a.document.documentElement,{childList:!0})};var uc=new tb,jc=new function(){this.i=uc;this.h=new Map;this.g=Zb(this)},qc=new ic;new tc;J.omidBridge=new Z;new pc;(function(a,b){a.frames&&a.document&&!['omid_v1_present','omid_v1_present_web','omid_v1_present_app'].some(function(c){return!!a.frames[c]})&&(null==a.document.body&&'MutationObserver'in a?Lc(a,b):(b=Bc(b),a.document.body?(Dc(a,'omid_v1_present'),Dc(a,b)):(Cc(a,'omid_v1_present'),Cc(a,b))))})(J,'app');
}).call(this, this);

