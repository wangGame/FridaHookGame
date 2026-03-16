function() {
return Object.entries(this.toJSON())[Symbol.iterator]();
}
}, {
key: "toString",
value: function() {
return Object.entries(this.toJSON()).map(function(e) {
var t = o(e, 2);
return t[0] + ": " + t[1];
}).join("\n");
}
}, {
key: Symbol.toStringTag,
get: function() {
return "AxiosHeaders";
}
} ], [ {
key: "from",
value: function(e) {
return e instanceof this ? e : new this(e);
}
}, {
key: "concat",
value: function(e) {
for (var t = new this(e), n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
r.forEach(function(e) {
return t.set(e);
});
return t;
}
}, {
key: "accessor",
value: function(e) {
var t = (this[ye] = this[ye] = {
accessors: {}
}).accessors, n = this.prototype;
function r(e) {
var r = ve(e);
if (!t[r]) {
Oe(n, e);
t[r] = !0;
}
}
H.isArray(e) ? e.forEach(r) : r(e);
return this;
}
} ]);
return e;
}();
Se.accessor([ "Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization" ]);
H.reduceDescriptors(Se.prototype, function(e, t) {
var n = e.value, r = t[0].toUpperCase() + t.slice(1);
return {
get: function() {
return n;
},
set: function(e) {
this[r] = e;
}
};
});
H.freezeMethods(Se);
var Ae = Se;
function Re(e, t) {
var n = this || pe, r = t || n, o = Ae.from(r.headers), i = r.data;
H.forEach(e, function(e) {
i = e.call(n, i, o.normalize(), t ? t.status : void 0);
});
o.normalize();
return i;
}
function Te(e) {
return !(!e || !e.__CANCEL__);
}
function je(e, t, n) {
J.call(this, null == e ? "canceled" : e, J.ERR_CANCELED, t, n);
this.name = "CanceledError";
}
H.inherits(je, J, {
__CANCEL__: !0
});
function Ce(e, t, n) {
var r = n.config.validateStatus;
n.status && r && !r(n.status) ? t(new J("Request failed with status code " + n.status, [ J.ERR_BAD_REQUEST, J.ERR_BAD_RESPONSE ][Math.floor(n.status / 100) - 4], n.config, n.request, n)) : e(n);
}
var Ne = ae.isStandardBrowserEnv ? {
write: function(e, t, n, r, o, i) {
var a = [];
a.push(e + "=" + encodeURIComponent(t));
H.isNumber(n) && a.push("expires=" + new Date(n).toGMTString());
H.isString(r) && a.push("path=" + r);
H.isString(o) && a.push("domain=" + o);
!0 === i && a.push("secure");
document.cookie = a.join("; ");
},
read: function(e) {
var t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
return t ? decodeURIComponent(t[3]) : null;
},
remove: function(e) {
this.write(e, "", Date.now() - 864e5);
}
} : {
write: function() {},
read: function() {
return null;
},
remove: function() {}
};
function xe(e, t) {
return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function Pe(e, t) {
return e && !(n = t, /^([a-z][a-z\d+\-.]*:)?\/\//i.test(n)) ? xe(e, t) : t;
var n;
}
var ke = ae.isStandardBrowserEnv ? function() {
var e, t = /(msie|trident)/i.test(navigator.userAgent), n = document.createElement("a");
function r(e) {
var r = e;
if (t) {
n.setAttribute("href", r);
r = n.href;
}
n.setAttribute("href", r);
return {
href: n.href,
protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
host: n.host,
search: n.search ? n.search.replace(/^\?/, "") : "",
hash: n.hash ? n.hash.replace(/^#/, "") : "",
hostname: n.hostname,
port: n.port,
pathname: "/" === n.pathname.charAt(0) ? n.pathname : "/" + n.pathname
};
}
e = r(window.location.href);
return function(t) {
var n = H.isString(t) ? r(t) : t;
return n.protocol === e.protocol && n.host === e.host;
};
}() : function() {
return !0;
};
function Ue(e, t) {
e = e || 10;
var n, r = new Array(e), o = new Array(e), i = 0, a = 0;
t = void 0 !== t ? t : 1e3;
return function(s) {
var u = Date.now(), c = o[a];
n || (n = u);
r[i] = s;
o[i] = u;
for (var f = a, l = 0; f !== i; ) {
l += r[f++];
f %= e;
}
(i = (i + 1) % e) === a && (a = (a + 1) % e);
if (!(u - n < t)) {
var d = c && u - c;
return d ? Math.round(1e3 * l / d) : void 0;
}
};
}
function _e(e, t) {
var n = 0, r = Ue(50, 250);
return function(o) {
var i = o.loaded, a = o.lengthComputable ? o.total : void 0, s = i - n, u = r(s);
n = i;
var c = {
loaded: i,
total: a,
progress: a ? i / a : void 0,
bytes: s,
rate: u || void 0,
estimated: u && a && i <= a ? (a - i) / u : void 0,
event: o
};
c[t ? "download" : "upload"] = !0;
e(c);
};
}
var Fe = {
http: null,
xhr: "undefined" != typeof XMLHttpRequest && function(e) {
return new Promise(function(t, n) {
var r, o = e.data, i = Ae.from(e.headers).normalize(), a = e.responseType;
function s() {
e.cancelToken && e.cancelToken.unsubscribe(r);
e.signal && e.signal.removeEventListener("abort", r);
}
H.isFormData(o) && (ae.isStandardBrowserEnv || ae.isStandardBrowserWebWorkerEnv ? i.setContentType(!1) : i.setContentType("multipart/form-data;", !1));
var u = new XMLHttpRequest();
if (e.auth) {
var c = e.auth.username || "", f = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
i.set("Authorization", "Basic " + btoa(c + ":" + f));
}
var l = Pe(e.baseURL, e.url);
u.open(e.method.toUpperCase(), re(l, e.params, e.paramsSerializer), !0);
u.timeout = e.timeout;
function d() {
if (u) {
var r = Ae.from("getAllResponseHeaders" in u && u.getAllResponseHeaders());
Ce(function(e) {
t(e);
s();
}, function(e) {
n(e);
s();
}, {
data: a && "text" !== a && "json" !== a ? u.response : u.responseText,
status: u.status,
statusText: u.statusText,
headers: r,
config: e,
request: u
});
u = null;
}
}
"onloadend" in u ? u.onloadend = d : u.onreadystatechange = function() {
u && 4 === u.readyState && (0 !== u.status || u.responseURL && 0 === u.responseURL.indexOf("file:")) && setTimeout(d, 16);
};
u.onabort = function() {
if (u) {
n(new J("Request aborted", J.ECONNABORTED, e, u));
u = null;
}
};
u.onerror = function() {
n(new J("Network Error", J.ERR_NETWORK, e, u));
u = null;
};
u.ontimeout = function() {
var t = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded", r = e.transitional || ie;
e.timeoutErrorMessage && (t = e.timeoutErrorMessage);
n(new J(t, r.clarifyTimeoutError ? J.ETIMEDOUT : J.ECONNABORTED, e, u));
u = null;
};
if (ae.isStandardBrowserEnv) {
var p = (e.withCredentials || ke(l)) && e.xsrfCookieName && Ne.read(e.xsrfCookieName);
p && i.set(e.xsrfHeaderName, p);
}
void 0 === o && i.setContentType(null);
"setRequestHeader" in u && H.forEach(i.toJSON(), function(e, t) {
u.setRequestHeader(t, e);
});
H.isUndefined(e.withCredentials) || (u.withCredentials = !!e.withCredentials);
a && "json" !== a && (u.responseType = e.responseType);
"function" == typeof e.onDownloadProgress && u.addEventListener("progress", _e(e.onDownloadProgress, !0));
"function" == typeof e.onUploadProgress && u.upload && u.upload.addEventListener("progress", _e(e.onUploadProgress));
if (e.cancelToken || e.signal) {
r = function(t) {
if (u) {
n(!t || t.type ? new je(null, e, u) : t);
u.abort();
u = null;
}
};
e.cancelToken && e.cancelToken.subscribe(r);
e.signal && (e.signal.aborted ? r() : e.signal.addEventListener("abort", r));
}
var h, m = (h = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l)) && h[1] || "";
m && -1 === ae.protocols.indexOf(m) ? n(new J("Unsupported protocol " + m + ":", J.ERR_BAD_REQUEST, e)) : u.send(o || null);
});
}
};
H.forEach(Fe, function(e, t) {
if (e) {
try {
Object.defineProperty(e, "name", {
value: t
});
} catch (e) {}
Object.defineProperty(e, "adapterName", {
value: t
});
}
});
var Be = {
getAdapter: function(e) {
for (var t, n, r = (e = H.isArray(e) ? e : [ e ]).length, o = 0; o < r; o++) {
t = e[o];
if (n = H.isString(t) ? Fe[t.toLowerCase()] : t) break;
}
if (!n) {
if (!1 === n) throw new J("Adapter ".concat(t, " is not supported by the environment"), "ERR_NOT_SUPPORT");
throw new Error(H.hasOwnProp(Fe, t) ? "Adapter '".concat(t, "' is not available in the build") : "Unknown adapter '".concat(t, "'"));
}
if (!H.isFunction(n)) throw new TypeError("adapter is not a function");
return n;
},
adapters: Fe
};
function Le(e) {
e.cancelToken && e.cancelToken.throwIfRequested();
if (e.signal && e.signal.aborted) throw new je(null, e);
}
function De(e) {
Le(e);
e.headers = Ae.from(e.headers);
e.data = Re.call(e, e.transformRequest);
-1 !== [ "post", "put", "patch" ].indexOf(e.method) && e.headers.setContentType("application/x-www-form-urlencoded", !1);
return Be.getAdapter(e.adapter || pe.adapter)(e).then(function(t) {
Le(e);
t.data = Re.call(e, e.transformResponse, t);
t.headers = Ae.from(t.headers);
return t;
}, function(t) {
if (!Te(t)) {
Le(e);
if (t && t.response) {
t.response.data = Re.call(e, e.transformResponse, t.response);
t.response.headers = Ae.from(t.response.headers);
}
}
return Promise.reject(t);
});
}
var Ie = function(e) {
return e instanceof Ae ? e.toJSON() : e;
};
function qe(e, t) {
t = t || {};
var n = {};
function r(e, t, n) {
return H.isPlainObject(e) && H.isPlainObject(t) ? H.merge.call({
caseless: n
}, e, t) : H.isPlainObject(t) ? H.merge({}, t) : H.isArray(t) ? t.slice() : t;
}
function o(e, t, n) {
return H.isUndefined(t) ? H.isUndefined(e) ? void 0 : r(void 0, e, n) : r(e, t, n);
}
function i(e, t) {
if (!H.isUndefined(t)) return r(void 0, t);
}
function a(e, t) {
return H.isUndefined(t) ? H.isUndefined(e) ? void 0 : r(void 0, e) : r(void 0, t);
}
function s(n, o, i) {
return i in t ? r(n, o) : i in e ? r(void 0, n) : void 0;
}
var u = {
url: i,
method: i,
data: i,
baseURL: a,
transformRequest: a,
transformResponse: a,
paramsSerializer: a,
timeout: a,
timeoutMessage: a,
withCredentials: a,
adapter: a,
responseType: a,
xsrfCookieName: a,
xsrfHeaderName: a,
onUploadProgress: a,
onDownloadProgress: a,
decompress: a,
maxContentLength: a,
maxBodyLength: a,
beforeRedirect: a,
transport: a,
httpAgent: a,
httpsAgent: a,
cancelToken: a,
socketPath: a,
responseEncoding: a,
validateStatus: s,
headers: function(e, t) {
return o(Ie(e), Ie(t), !0);
}
};
H.forEach(Object.keys(Object.assign({}, e, t)), function(r) {
var i = u[r] || o, a = i(e[r], t[r], r);
H.isUndefined(a) && i !== s || (n[r] = a);
});
return n;
}
var Me = "1.5.0", ze = {};
[ "object", "boolean", "number", "function", "string", "symbol" ].forEach(function(t, n) {
ze[t] = function(r) {
return e(r) === t || "a" + (n < 1 ? "n " : " ") + t;
};
});
var He = {};
ze.transitional = function(e, t, n) {
function r(e, t) {
return "[Axios v" + Me + "] Transitional option '" + e + "'" + t + (n ? ". " + n : "");
}
return function(n, o, i) {
if (!1 === e) throw new J(r(o, " has been removed" + (t ? " in " + t : "")), J.ERR_DEPRECATED);
t && !He[o] && (He[o] = !0);
return !e || e(n, o, i);
};
};
var Je = {
assertOptions: function(t, n, r) {
if ("object" !== e(t)) throw new J("options must be an object", J.ERR_BAD_OPTION_VALUE);
for (var o = Object.keys(t), i = o.length; i-- > 0; ) {
var a = o[i], s = n[a];
if (s) {
var u = t[a], c = void 0 === u || s(u, a, t);
if (!0 !== c) throw new J("option " + a + " must be " + c, J.ERR_BAD_OPTION_VALUE);
} else if (!0 !== r) throw new J("Unknown option " + a, J.ERR_BAD_OPTION);
}
},
validators: ze
}, We = Je.validators, Ke = function() {
function e(n) {
t(this, e);
this.defaults = n;
this.interceptors = {
request: new oe(),
response: new oe()
};
}
r(e, [ {
key: "request",
value: function(e, t) {
"string" == typeof e ? (t = t || {}).url = e : t = e || {};
var n = t = qe(this.defaults, t), r = n.transitional, o = n.paramsSerializer, i = n.headers;
void 0 !== r && Je.assertOptions(r, {
silentJSONParsing: We.transitional(We.boolean),
forcedJSONParsing: We.transitional(We.boolean),
clarifyTimeoutError: We.transitional(We.boolean)
}, !1);
null != o && (H.isFunction(o) ? t.paramsSerializer = {
serialize: o
} : Je.assertOptions(o, {
encode: We.function,
serialize: We.function
}, !0));
t.method = (t.method || this.defaults.method || "get").toLowerCase();
var a = i && H.merge(i.common, i[t.method]);
i && H.forEach([ "delete", "get", "head", "post", "put", "patch", "common" ], function(e) {
delete i[e];
});
t.headers = Ae.concat(a, i);
var s = [], u = !0;
this.interceptors.request.forEach(function(e) {
if ("function" != typeof e.runWhen || !1 !== e.runWhen(t)) {
u = u && e.synchronous;
s.unshift(e.fulfilled, e.rejected);
}
});
var c, f = [];
this.interceptors.response.forEach(function(e) {
f.push(e.fulfilled, e.rejected);
});
var l, d = 0;
if (!u) {
var p = [ De.bind(this), void 0 ];
p.unshift.apply(p, s);
p.push.apply(p, f);
l = p.length;
c = Promise.resolve(t);
for (;d < l; ) c = c.then(p[d++], p[d++]);
return c;
}
l = s.length;
var h = t;
d = 0;
for (;d < l; ) {
var m = s[d++], y = s[d++];
try {
h = m(h);
} catch (e) {
y.call(this, e);
break;
}
}
try {
c = De.call(this, h);
} catch (e) {
return Promise.reject(e);
}
d = 0;
l = f.length;
for (;d < l; ) c = c.then(f[d++], f[d++]);
return c;
}
}, {
key: "getUri",
value: function(e) {
return re(Pe((e = qe(this.defaults, e)).baseURL, e.url), e.params, e.paramsSerializer);
}
} ]);
return e;
}();
H.forEach([ "delete", "get", "head", "options" ], function(e) {
Ke.prototype[e] = function(t, n) {
return this.request(qe(n || {}, {
method: e,
url: t,
data: (n || {}).data
}));
};
});
H.forEach([ "post", "put", "patch" ], function(e) {
function t(t) {
return function(n, r, o) {
return this.request(qe(o || {}, {
method: e,
headers: t ? {
"Content-Type": "multipart/form-data"
} : {},
url: n,
data: r
}));
};
}
Ke.prototype[e] = t();
Ke.prototype[e + "Form"] = t(!0);
});
var Ve = Ke, Ge = function() {
function e(n) {
t(this, e);
if ("function" != typeof n) throw new TypeError("executor must be a function.");
var r;
this.promise = new Promise(function(e) {
r = e;
});
var o = this;
this.promise.then(function(e) {
if (o._listeners) {
for (var t = o._listeners.length; t-- > 0; ) o._listeners[t](e);
o._listeners = null;
}
});
this.promise.then = function(e) {
var t, n = new Promise(function(e) {
o.subscribe(e);
t = e;
}).then(e);
n.cancel = function() {
o.unsubscribe(t);
};
return n;
};
n(function(e, t, n) {
if (!o.reason) {
o.reason = new je(e, t, n);
r(o.reason);
}
});
}
r(e, [ {
key: "throwIfRequested",
value: function() {
if (this.reason) throw this.reason;
}
}, {
key: "subscribe",
value: function(e) {
this.reason ? e(this.reason) : this._listeners ? this._listeners.push(e) : this._listeners = [ e ];
}
}, {
key: "unsubscribe",
value: function(e) {
if (this._listeners) {
var t = this._listeners.indexOf(e);
-1 !== t && this._listeners.splice(t, 1);
}
}
} ], [ {
key: "source",
value: function() {
var t;
return {
token: new e(function(e) {
t = e;
}),
cancel: t
};
}
} ]);
return e;
}(), $e = {
Continue: 100,
SwitchingProtocols: 101,
Processing: 102,
EarlyHints: 103,
Ok: 200,
Created: 201,
Accepted: 202,
NonAuthoritativeInformation: 203,
NoContent: 204,
ResetContent: 205,
PartialContent: 206,
MultiStatus: 207,
AlreadyReported: 208,
ImUsed: 226,
MultipleChoices: 300,
MovedPermanently: 301,
Found: 302,
SeeOther: 303,
NotModified: 304,
UseProxy: 305,
Unused: 306,
TemporaryRedirect: 307,
PermanentRedirect: 308,
BadRequest: 400,
Unauthorized: 401,
PaymentRequired: 402,
Forbidden: 403,
NotFound: 404,
MethodNotAllowed: 405,
NotAcceptable: 406,
ProxyAuthenticationRequired: 407,
RequestTimeout: 408,
Conflict: 409,
Gone: 410,
LengthRequired: 411,
PreconditionFailed: 412,
PayloadTooLarge: 413,
UriTooLong: 414,
UnsupportedMediaType: 415,
RangeNotSatisfiable: 416,
ExpectationFailed: 417,
ImATeapot: 418,
MisdirectedRequest: 421,
UnprocessableEntity: 422,
Locked: 423,
FailedDependency: 424,
TooEarly: 425,
UpgradeRequired: 426,
PreconditionRequired: 428,
TooManyRequests: 429,
RequestHeaderFieldsTooLarge: 431,
UnavailableForLegalReasons: 451,
InternalServerError: 500,
NotImplemented: 501,
BadGateway: 502,
ServiceUnavailable: 503,
GatewayTimeout: 504,
HttpVersionNotSupported: 505,
VariantAlsoNegotiates: 506,
InsufficientStorage: 507,
LoopDetected: 508,
NotExtended: 510,
NetworkAuthenticationRequired: 511
};
Object.entries($e).forEach(function(e) {
var t = o(e, 2), n = t[0], r = t[1];
$e[r] = n;
});
var Xe = $e, Qe = function e(t) {
var n = new Ve(t), r = f(Ve.prototype.request, n);
H.extend(r, Ve.prototype, n, {
allOwnKeys: !0
});
H.extend(r, n, null, {
allOwnKeys: !0
});
r.create = function(n) {
return e(qe(t, n));
};
return r;
}(pe);
Qe.Axios = Ve;
Qe.CanceledError = je;
Qe.CancelToken = Ge;
Qe.isCancel = Te;
Qe.VERSION = Me;
Qe.toFormData = Z;
Qe.AxiosError = J;
Qe.Cancel = Qe.CanceledError;
Qe.all = function(e) {
return Promise.all(e);
};
Qe.spread = function(e) {
return function(t) {
return e.apply(null, t);
};
};
Qe.isAxiosError = function(e) {
return H.isObject(e) && !0 === e.isAxiosError;
};
Qe.mergeConfig = qe;
Qe.AxiosHeaders = Ae;
Qe.formToJSON = function(e) {
return fe(H.isHTMLForm(e) ? new FormData(e) : e);
};
Qe.getAdapter = Be.getAdapter;
Qe.HttpStatusCode = Xe;
Qe.default = Qe;
return Qe;
});