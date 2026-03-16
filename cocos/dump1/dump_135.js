function CCClass(){
this._super=null;
this.__initProps__(CCClass);
var cs=CCClass.__ctors__;
cs[0].apply(this,arguments);
cs[1].apply(this,arguments);
cs[2].apply(this,arguments);
cs[3].apply(this,arguments);
}