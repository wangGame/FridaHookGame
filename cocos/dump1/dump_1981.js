function breakType(cf){
return %BreakIteratorBreakType(cf);
}
AddBoundMethod(k,'adoptText',adoptText,1,
'breakiterator');
AddBoundMethod(k,'first',first,0,'breakiterator');
AddBoundMethod(k,'next',next,0,'breakiterator');
AddBoundMethod(k,'current',current,0,
'breakiterator');
AddBoundMethod(k,'breakType',breakType,0,
'breakiterator');
var ci={
'collator':i,
'numberformat':h,
'dateformatall':g,
'dateformatdate':g,
'dateformattime':g
};
var cj={
'collator':(void 0),
'numberformat':(void 0),
'dateformatall':(void 0),
'dateformatdate':(void 0),
'dateformattime':(void 0),
};
function clearDefaultObjects(){
cj['dateformatall']=(void 0);
cj['dateformatdate']=(void 0);
cj['dateformattime']=(void 0);
}
var ck=0;
function checkDateCacheCurrent(){
var cl=%DateCacheVersion();
if(cl==ck){
return;
}
ck=cl;
clearDefaultObjects();
}
function cachedOrNewService(T,B,C,bS){
var cm=((bS===(void 0)))?C:bS;
if((B===(void 0))&&(C===(void 0))){
checkDateCacheCurrent();
if((cj[T]===(void 0))){
cj[T]=new ci[T](B,cm);
}
return cj[T];
}
return new ci[T](B,cm);
}
function LocaleConvertCase(cn,B,co){
var bi;
if((B===(void 0))){
bi=GetDefaultICULocaleJS();
}else if((typeof(B)==='string')){
bi=canonicalizeLanguageTag(B);
}else{
var B=initializeLocaleList(B);
bi=B.length>0?B[0]:GetDefaultICULocaleJS();
}
var aa=%StringIndexOf(bi,'-',0);
if(aa!==-1){
bi=%_Call(w,bi,0,aa);
}
return %StringLocaleConvertCase(cn,co,bi);
}
%DefineMethodsInternal(n.prototype,class{localeCompare(that){
if((this==null)){
throw %make_type_error(72);
}
var B=arguments[1];
var C=arguments[2];
var bq=cachedOrNewService('collator',B,C);
return compare(bq,this,that);
}},-1);
%DefineMethodsInternal(n.prototype,class{
toLocaleLowerCase(B){
if((%IS_VAR(this)===null)||(this===(void 0)))throw %make_type_error(25,"String.prototype.toLocaleLowerCase");
return LocaleConvertCase((%_ToString(this)),B,false);
}
toLocaleUpperCase(B){
if((%IS_VAR(this)===null)||(this===(void 0)))throw %make_type_error(25,"String.prototype.toLocaleUpperCase");
return LocaleConvertCase((%_ToString(this)),B,true);
}
},0);
%DefineMethodsInternal(l.prototype,class{toLocaleString(){
if(!(this instanceof l)&&typeof(this)!=='number'){
throw %make_type_error(73,"Number");
}
var B=arguments[0];
var C=arguments[1];
var bJ=cachedOrNewService('numberformat',B,C);
return formatNumber(bJ,this);
}},-1);
function toLocaleDateTime(cp,B,C,bR,bS,T){
if(!(cp instanceof e)){
throw %make_type_error(73,"Date");
}
var ca=(%_ToNumber(cp));
if((%IS_VAR(ca)!==ca)
)return'Invalid Date';
var bl=toDateTimeOptions(C,bR,bS);
var bW=
cachedOrNewService(T,B,C,bl);
return formatDate(bW,cp);
}
%DefineMethodsInternal(e.prototype,class{toLocaleString(){
var B=arguments[0];
var C=arguments[1];
return toLocaleDateTime(
this,B,C,'any','all','dateformatall');
}},-1);
%DefineMethodsInternal(e.prototype,class{toLocaleDateString(){
var B=arguments[0];
var C=arguments[1];
return toLocaleDateTime(
this,B,C,'date','date','dateformatdate');
}},-1);
%DefineMethodsInternal(e.prototype,class{toLocaleTimeString(){
var B=arguments[0];
var C=arguments[1];
return toLocaleDateTime(
this,B,C,'time','time','dateformattime');
}},-1);
})

