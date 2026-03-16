function(e) {
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