function(e) {
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