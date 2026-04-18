function isWellFormedCurrencyCode(bv){
return typeof bv==="string"&&bv.length===3&&
(%regexp_internal_match(/[^A-Za-z]/,bv)===null);
}
function defaultNumberOption(ah,bw,bx,by,ad){
if(!(ah===(void 0))){
ah=(%_ToNumber(ah));
if((%IS_VAR(ah)!==ah)
||ah<bw||ah>bx){
throw %make_range_error(201,ad);
}
return %math_floor(ah);
}
return by;
}
function getNumberOption(C,ad,bw,bx,by){
var ah=C[ad];
return defaultNumberOption(ah,bw,bx,by,ad);
}
function SetNumberFormatDigitOptions(bl,C,
mnfdDefault,mxfdDefault){
var bz=getNumberOption(C,'minimumIntegerDigits',1,21,1);
defineWEProperty(bl,'minimumIntegerDigits',bz);
var bA=getNumberOption(C,'minimumFractionDigits',0,20,
mnfdDefault);
defineWEProperty(bl,'minimumFractionDigits',bA);
var bB=q(bA,mxfdDefault);
var bC=getNumberOption(C,'maximumFractionDigits',bA,20,
bB);
defineWEProperty(bl,'maximumFractionDigits',bC);
var bD=C['minimumSignificantDigits'];
var bE=C['maximumSignificantDigits'];
if(!(bD===(void 0))||!(bE===(void 0))){
bD=defaultNumberOption(bD,1,21,1,'minimumSignificantDigits');
defineWEProperty(bl,'minimumSignificantDigits',bD);
bE=defaultNumberOption(bE,bD,21,21,'maximumSignificantDigits');
defineWEProperty(bl,'maximumSignificantDigits',bE);
}
}
function CreateNumberFormat(B,C){
if((C===(void 0))){
C={__proto__:null};
}
var ac=getGetOption(C,'numberformat');
var Z=resolveLocale('numberformat',B,C);
var bl={__proto__:null};
defineWEProperty(bl,'style',ac(
'style','string',['decimal','percent','currency'],'decimal'));
var bv=ac('currency','string');
if(!(bv===(void 0))&&!isWellFormedCurrencyCode(bv)){
throw %make_range_error(180,bv);
}
if(bl.style==='currency'&&(bv===(void 0))){
throw %make_type_error(40);
}
var bF,bG;
var bH=ac(
'currencyDisplay','string',['code','symbol','name'],'symbol');
if(bl.style==='currency'){
defineWEProperty(bl,'currency',%StringToUpperCaseIntl(bv));
defineWEProperty(bl,'currencyDisplay',bH);
bF=bG=%CurrencyDigits(bl.currency);
}else{
bF=0;
bG=bl.style==='percent'?0:3;
}
SetNumberFormatDigitOptions(bl,C,bF,
bG);
defineWEProperty(bl,'useGrouping',ac(
'useGrouping','boolean',(void 0),true));
var ar=parseExtension(Z.extension);
var bI={
'nu':{'property':(void 0),'type':'string'}
};
var an=setOptions(C,ar,bI,
ac,bl);
var aj=Z.locale+an;
var ai=%object_define_properties({__proto__:null},{
currency:{writable:true},
currencyDisplay:{writable:true},
locale:{writable:true},
maximumFractionDigits:{writable:true},
minimumFractionDigits:{writable:true},
minimumIntegerDigits:{writable:true},
numberingSystem:{writable:true},
requestedLocale:{value:aj,writable:true},
style:{value:bl.style,writable:true},
useGrouping:{writable:true}
});
if((%_Call(r,bl,'minimumSignificantDigits'))){
defineWEProperty(ai,'minimumSignificantDigits',(void 0));
}
if((%_Call(r,bl,'maximumSignificantDigits'))){
defineWEProperty(ai,'maximumSignificantDigits',(void 0));
}
var bJ=%CreateNumberFormat(aj,bl,
ai);
if(bl.style==='currency'){
%object_define_property(ai,'currencyDisplay',
{value:bH,writable:true});
}
%MarkAsInitializedIntlObjectOfType(bJ,'numberformat');
bJ[u]=ai;
return bJ;
}
function NumberFormatConstructor(){
return IntlConstruct(this,h,CreateNumberFormat,
new.target,arguments,true);
}
%SetCode(h,NumberFormatConstructor);
%DefineMethodsInternal(h.prototype,class{resolvedOptions(){
var bK=Unwrap(this,'numberformat',h,
'resolvedOptions',true);
var ao={
locale:bK[u].locale,
numberingSystem:bK[u].numberingSystem,
style:bK[u].style,
useGrouping:bK[u].useGrouping,
minimumIntegerDigits:bK[u].minimumIntegerDigits,
minimumFractionDigits:bK[u].minimumFractionDigits,
maximumFractionDigits:bK[u].maximumFractionDigits,
};
if(ao.style==='currency'){
defineWECProperty(ao,'currency',bK[u].currency);
defineWECProperty(ao,'currencyDisplay',
bK[u].currencyDisplay);
}
if((%_Call(r,bK[u],'minimumSignificantDigits'))){
defineWECProperty(ao,'minimumSignificantDigits',
bK[u].minimumSignificantDigits);
}
if((%_Call(r,bK[u],'maximumSignificantDigits'))){
defineWECProperty(ao,'maximumSignificantDigits',
bK[u].maximumSignificantDigits);
}
return ao;
}},-1);
%DefineMethodsInternal(h,class{supportedLocalesOf(B){
return supportedLocalesOf('numberformat',B,arguments[1]);
}},-1);
function formatNumber(bL,ah){
var bM=(%_ToNumber(ah))+0;
return %InternalNumberFormat(bL,bM);
}
AddBoundMethod(h,'format',formatNumber,1,
'numberformat',true);
function toLDMLString(C){
var ac=getGetOption(C,'dateformat');
var bN='';
var bO=ac('weekday','string',['narrow','short','long']);
bN+=appendToLDMLString(
bO,{narrow:'EEEEE',short:'EEE',long:'EEEE'});
bO=ac('era','string',['narrow','short','long']);
bN+=appendToLDMLString(
bO,{narrow:'GGGGG',short:'GGG',long:'GGGG'});
bO=ac('year','string',['2-digit','numeric']);
bN+=appendToLDMLString(bO,{'2-digit':'yy','numeric':'y'});
bO=ac('month','string',
['2-digit','numeric','narrow','short','long']);
bN+=appendToLDMLString(bO,{'2-digit':'MM','numeric':'M',
'narrow':'MMMMM','short':'MMM','long':'MMMM'});
bO=ac('day','string',['2-digit','numeric']);
bN+=appendToLDMLString(
bO,{'2-digit':'dd','numeric':'d'});
var bP=ac('hour12','boolean');
bO=ac('hour','string',['2-digit','numeric']);
if((bP===(void 0))){
bN+=appendToLDMLString(bO,{'2-digit':'jj','numeric':'j'});
}else if(bP===true){
bN+=appendToLDMLString(bO,{'2-digit':'hh','numeric':'h'});
}else{
bN+=appendToLDMLString(bO,{'2-digit':'HH','numeric':'H'});
}
bO=ac('minute','string',['2-digit','numeric']);
bN+=appendToLDMLString(bO,{'2-digit':'mm','numeric':'m'});
bO=ac('second','string',['2-digit','numeric']);
bN+=appendToLDMLString(bO,{'2-digit':'ss','numeric':'s'});
bO=ac('timeZoneName','string',['short','long']);
bN+=appendToLDMLString(bO,{short:'z',long:'zzzz'});
return bN;
}
function appendToLDMLString(bO,bQ){
if(!(bO===(void 0))){
return bQ[bO];
}else{
return'';
}
}
function fromLDMLString(bN){
bN=%RegExpInternalReplace(GetQuotedStringRE(),bN,'');
var C={__proto__:null};
var aJ=%regexp_internal_match(/E{3,5}/,bN);
C=appendToDateTimeObject(
C,'weekday',aJ,{EEEEE:'narrow',EEE:'short',EEEE:'long'});
aJ=%regexp_internal_match(/G{3,5}/,bN);
C=appendToDateTimeObject(
C,'era',aJ,{GGGGG:'narrow',GGG:'short',GGGG:'long'});
aJ=%regexp_internal_match(/y{1,2}/,bN);
C=appendToDateTimeObject(
C,'year',aJ,{y:'numeric',yy:'2-digit'});
aJ=%regexp_internal_match(/M{1,5}/,bN);
C=appendToDateTimeObject(C,'month',aJ,{MM:'2-digit',
M:'numeric',MMMMM:'narrow',MMM:'short',MMMM:'long'});
aJ=%regexp_internal_match(/L{1,5}/,bN);
C=appendToDateTimeObject(C,'month',aJ,{LL:'2-digit',
L:'numeric',LLLLL:'narrow',LLL:'short',LLLL:'long'});
aJ=%regexp_internal_match(/d{1,2}/,bN);
C=appendToDateTimeObject(
C,'day',aJ,{d:'numeric',dd:'2-digit'});
aJ=%regexp_internal_match(/h{1,2}/,bN);
if(aJ!==null){
C['hour12']=true;
}
C=appendToDateTimeObject(
C,'hour',aJ,{h:'numeric',hh:'2-digit'});
aJ=%regexp_internal_match(/H{1,2}/,bN);
if(aJ!==null){
C['hour12']=false;
}
C=appendToDateTimeObject(
C,'hour',aJ,{H:'numeric',HH:'2-digit'});
aJ=%regexp_internal_match(/m{1,2}/,bN);
C=appendToDateTimeObject(
C,'minute',aJ,{m:'numeric',mm:'2-digit'});
aJ=%regexp_internal_match(/s{1,2}/,bN);
C=appendToDateTimeObject(
C,'second',aJ,{s:'numeric',ss:'2-digit'});
aJ=%regexp_internal_match(/z|zzzz/,bN);
C=appendToDateTimeObject(
C,'timeZoneName',aJ,{z:'short',zzzz:'long'});
return C;
}
function appendToDateTimeObject(C,bO,aJ,bQ){
if((aJ===null)){
if(!(%_Call(r,C,bO))){
defineWEProperty(C,bO,(void 0));
}
return C;
}
var ad=aJ[0];
defineWEProperty(C,bO,bQ[ad]);
return C;
}
function toDateTimeOptions(C,bR,bS){
if((C===(void 0))){
C={__proto__:null};
}else{
C=(%_ToObject(C));
}
C=%object_create(C);
var bT=true;
if((bR==='date'||bR==='any')&&
(!(C.weekday===(void 0))||!(C.year===(void 0))||
!(C.month===(void 0))||!(C.day===(void 0)))){
bT=false;
}
if((bR==='time'||bR==='any')&&
(!(C.hour===(void 0))||!(C.minute===(void 0))||
!(C.second===(void 0)))){
bT=false;
}
if(bT&&(bS==='date'||bS==='all')){
%object_define_property(C,'year',{value:'numeric',
writable:true,
enumerable:true,
configurable:true});
%object_define_property(C,'month',{value:'numeric',
writable:true,
enumerable:true,
configurable:true});
%object_define_property(C,'day',{value:'numeric',
writable:true,
enumerable:true,
configurable:true});
}
if(bT&&(bS==='time'||bS==='all')){
%object_define_property(C,'hour',{value:'numeric',
writable:true,
enumerable:true,
configurable:true});
%object_define_property(C,'minute',{value:'numeric',
writable:true,
enumerable:true,
configurable:true});
%object_define_property(C,'second',{value:'numeric',
writable:true,
enumerable:true,
configurable:true});
}
return C;
}
function CreateDateTimeFormat(B,C){
if((C===(void 0))){
C={__proto__:null};
}
var Z=resolveLocale('dateformat',B,C);
C=toDateTimeOptions(C,'any','date');
var ac=getGetOption(C,'dateformat');
var U=ac('formatMatcher','string',
['basic','best fit'],'best fit');
var bN=toLDMLString(C);
var bU=canonicalizeTimeZoneID(C.timeZone);
var bl={__proto__:null};
var ar=parseExtension(Z.extension);
var bV={
'ca':{'property':(void 0),'type':'string'},
'nu':{'property':(void 0),'type':'string'}
};
var an=setOptions(C,ar,bV,
ac,bl);
var aj=Z.locale+an;
var ai=%object_define_properties({__proto__:null},{
calendar:{writable:true},
day:{writable:true},
era:{writable:true},
hour12:{writable:true},
hour:{writable:true},
locale:{writable:true},
minute:{writable:true},
month:{writable:true},
numberingSystem:{writable:true},
[t]:{writable:true},
requestedLocale:{value:aj,writable:true},
second:{writable:true},
timeZone:{writable:true},
timeZoneName:{writable:true},
tz:{value:bU,writable:true},
weekday:{writable:true},
year:{writable:true}
});
var bW=%CreateDateTimeFormat(
aj,{skeleton:bN,timeZone:bU},ai);
if(ai.timeZone==="Etc/Unknown"){
throw %make_range_error(207,bU);
}
%MarkAsInitializedIntlObjectOfType(bW,'dateformat');
bW[u]=ai;
return bW;
}
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

