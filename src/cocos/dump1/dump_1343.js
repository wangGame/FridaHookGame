function anonymous(
) {
return function CCClass(){
this._super=null;
this.__initProps__(CCClass);
CCClass.__ctors__[0].apply(this,arguments);
}
})