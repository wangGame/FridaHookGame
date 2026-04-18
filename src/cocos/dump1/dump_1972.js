function DateTimeFormatConstructor(){
return IntlConstruct(this,g,CreateDateTimeFormat,
new.target,arguments,true);
}
%SetCode(g,DateTimeFormatConstructor);
%DefineMethodsInternal(g.prototype,class{resolvedOptions(){
var bK=Unwrap(this,'dateformat',g,
'resolvedOptions',true);
var bX={
'gregorian':'gregory',
'ethiopic-amete-alem':'ethioaa'
};
var bY=fromLDMLString(bK[u][t]);
var bZ=bX[bK[u].calendar];
if((bZ===(void 0))){
bZ=bK[u].calendar;
}
var ao={
locale:bK[u].locale,
numberingSystem:bK[u].numberingSystem,
calendar:bZ,
timeZone:bK[u].timeZone
};
addWECPropertyIfDefined(ao,'timeZoneName',bY.timeZoneName);
addWECPropertyIfDefined(ao,'era',bY.era);
addWECPropertyIfDefined(ao,'year',bY.year);
addWECPropertyIfDefined(ao,'month',bY.month);
addWECPropertyIfDefined(ao,'day',bY.day);
addWECPropertyIfDefined(ao,'weekday',bY.weekday);
addWECPropertyIfDefined(ao,'hour12',bY.hour12);
addWECPropertyIfDefined(ao,'hour',bY.hour);
addWECPropertyIfDefined(ao,'minute',bY.minute);
addWECPropertyIfDefined(ao,'second',bY.second);
return ao;
}},-1);
%DefineMethodsInternal(g,class{supportedLocalesOf(B){
return supportedLocalesOf('dateformat',B,arguments[1]);
}},-1);
function formatDate(bL,ca){
var cb;
if((ca===(void 0))){
cb=%DateCurrentTime();
}else{
cb=(%_ToNumber(ca));
}
return %InternalDateFormat(bL,cb);
}
AddBoundMethod(g,'format',formatDate,1,'dateformat',
true);
function canonicalizeTimeZoneID(cc){
if((cc===(void 0))){
return cc;
}
cc=(%_ToString(cc));
var cd=%StringToUpperCaseIntl(cc);
if(cd==='UTC'||cd==='GMT'||
cd==='ETC/UTC'||cd==='ETC/GMT'){
return'UTC';
}
var aJ=%regexp_internal_match(GetTimezoneNameCheckRE(),cc);
if((aJ===null))throw %make_range_error(172,cc);
var ao=toTitleCaseTimezoneLocation(aJ[1])+'/'+
toTitleCaseTimezoneLocation(aJ[2]);
if(!(aJ[3]===(void 0))&&3<aJ.length){
var ce=%StringSplit(aJ[3],'/',4294967295);
for(var Y=1;Y<ce.length;Y++){
ao=ao+'/'+toTitleCaseTimezoneLocation(ce[Y]);
}
}
return ao;
}
function CreateBreakIterator(B,C){
if((C===(void 0))){
C={__proto__:null};
}
var ac=getGetOption(C,'breakiterator');
var bl={__proto__:null};
defineWEProperty(bl,'type',ac(
'type','string',['character','word','sentence','line'],'word'));
var Z=resolveLocale('breakiterator',B,C);
var ai=%object_define_properties({__proto__:null},{
requestedLocale:{value:Z.locale,writable:true},
type:{value:bl.type,writable:true},
locale:{writable:true}
});
var cf=%CreateBreakIterator(Z.locale,bl,ai);
%MarkAsInitializedIntlObjectOfType(cf,'breakiterator');
cf[u]=ai;
return cf;
}
function v8BreakIteratorConstructor(){
return IntlConstruct(this,k,CreateBreakIterator,
new.target,arguments);
}
%SetCode(k,v8BreakIteratorConstructor);
%DefineMethodsInternal(k.prototype,class{resolvedOptions(){
if(!(new.target===(void 0))){
throw %make_type_error(103);
}
var cg=Unwrap(this,'breakiterator',k,
'resolvedOptions',false);
return{
locale:cg[u].locale,
type:cg[u].type
};
}},-1);
%DefineMethodsInternal(k,class{supportedLocalesOf(B){
if(!(new.target===(void 0))){
throw %make_type_error(103);
}
return supportedLocalesOf('breakiterator',B,arguments[1]);
}},-1);
function adoptText(cf,ch){
%BreakIteratorAdoptText(cf,(%_ToString(ch)));
}
function first(cf){
return %BreakIteratorFirst(cf);
}
function next(cf){
return %BreakIteratorNext(cf);
}
function current(cf){
return %BreakIteratorCurrent(cf);
}
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

