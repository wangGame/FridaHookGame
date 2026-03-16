function e(t) {
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