function setOptions(av,ar,aw,ac,ax){
var an='';
var ay=function updateExtension(as,ah){
return'-'+as+'-'+(%_ToString(ah));
}
var az=function updateProperty(ad,ae,ah){
if(ae==='boolean'&&(typeof ah==='string')){
ah=(ah==='true')?true:false;
}
if(!(ad===(void 0))){
defineWEProperty(ax,ad,ah);
}
}
for(var as in aw){
if((%_Call(r,aw,as))){
var ah=(void 0);
var aA=aw[as];
if(!(aA.property===(void 0))){
ah=ac(aA.property,aA.type,aA.values);
}
if(!(ah===(void 0))){
az(aA.property,aA.type,ah);
an+=ay(as,ah);
continue;
}
if((%_Call(r,ar,as))){
ah=ar[as];
if(!(ah===(void 0))){
az(aA.property,aA.type,ah);
an+=ay(as,ah);
}else if(aA.type==='boolean'){
az(aA.property,aA.type,true);
an+=ay(as,true);
}
}
}
}
return an===''?'':'-u'+an;
}
function freezeArray(aB){
var aC=[];
var aD=aB.length;
for(var Y=0;Y<aD;Y++){
if(Y in aB){
%object_define_property(aC,Y,{value:aB[Y],
configurable:false,
writable:false,
enumerable:true});
}
}
%object_define_property(aC,'length',{value:aD,writable:false});
return aC;
}
function makeArray(aB){
var aC=[];
%MoveArrayContents(aB,aC);
return aC;
}
function getAvailableLocalesOf(T){
if(!(I[T]===(void 0))){
return I[T];
}
var aE=%AvailableLocalesOf(T);
for(var Y in aE){
if((%_Call(r,aE,Y))){
var aF=%regexp_internal_match(
/^([a-z]{2,3})-([A-Z][a-z]{3})-([A-Z]{2})$/,Y);
if(!(aF===null)){
aE[aF[1]+'-'+aF[3]]=null;
}
}
}
I[T]=aE;
return aE;
}
function defineWEProperty(aG,ad,ah){
%object_define_property(aG,ad,
{value:ah,writable:true,enumerable:true});
}
function addWEPropertyIfDefined(aG,ad,ah){
if(!(ah===(void 0))){
defineWEProperty(aG,ad,ah);
}
}
function defineWECProperty(aG,ad,ah){
%object_define_property(aG,ad,{value:ah,
writable:true,
enumerable:true,
configurable:true});
}
function addWECPropertyIfDefined(aG,ad,ah){
if(!(ah===(void 0))){
defineWECProperty(aG,ad,ah);
}
}
function toTitleCaseWord(aH){
return %StringToUpperCaseIntl(%_Call(v,aH,0,1))+
%StringToLowerCaseIntl(%_Call(v,aH,1));
}
function toTitleCaseTimezoneLocation(aI){
var aJ=%regexp_internal_match(GetTimezoneNameLocationPartRE(),aI)
if((aJ===null))throw %make_range_error(173,aI);
var ao=toTitleCaseWord(aJ[1]);
if(!(aJ[2]===(void 0))&&2<aJ.length){
var aK=%_Call(w,aJ[2],0,1);
var aF=%StringSplit(aJ[2],aK,4294967295);
for(var Y=1;Y<aF.length;Y++){
var aL=aF[Y]
var aM=%StringToLowerCaseIntl(aL);
ao=ao+aK+
((aM!=='es'&&
aM!=='of'&&aM!=='au')?
toTitleCaseWord(aL):aM);
}
}
return ao;
}
function canonicalizeLanguageTag(aN){
if((!(typeof(aN)==='string')&&!(%_IsJSReceiver(aN)))||
(aN===null)){
throw %make_type_error(67);
}
var aO=(%_ToString(aN));
if((!(%regexp_internal_match(/^[a-z]{2}$/,aO)===null)&&
(%regexp_internal_match(/^(in|iw|ji|jw)$/,aO)===null))||
aO==="fil"){
return aO;
}
if(isStructuallyValidLanguageTag(aO)===false){
throw %make_range_error(186,aO);
}
var aP=%CanonicalizeLanguageTag(aO);
if(aP==='invalid-tag'){
throw %make_range_error(186,aO);
}
return aP;
}
function canonicalizeLocaleList(B){
var aQ=new p();
if(!(B===(void 0))){
if(typeof B==='string'){
%_Call(d,aQ,canonicalizeLanguageTag(B));
return aQ;
}
var aR=(%_ToObject(B));
var aS=(%_ToLength(aR.length));
for(var aT=0;aT<aS;aT++){
if(aT in aR){
var ah=aR[aT];
var aP=canonicalizeLanguageTag(ah);
if(%ArrayIndexOf(aQ,aP,0)===-1){
%_Call(d,aQ,aP);
}
}
}
}
return aQ;
}
function initializeLocaleList(B){
return freezeArray(canonicalizeLocaleList(B));
}
function isStructuallyValidLanguageTag(Z){
if((%regexp_internal_match(GetLanguageTagRE(),Z)===null)){
return false;
}
Z=%StringToLowerCaseIntl(Z);
if(%StringIndexOf(Z,'x-',0)===0){
return true;
}
Z=%StringSplit(Z,'-x-',4294967295)[0];
var aU=new p();
var aV=new p();
var aF=%StringSplit(Z,'-',4294967295);
for(var Y=1;Y<aF.length;Y++){
var ah=aF[Y];
if(!(%regexp_internal_match(GetLanguageVariantRE(),ah)===null)&&
aV.length===0){
if(%ArrayIndexOf(aU,ah,0)===-1){
%_Call(d,aU,ah);
}else{
return false;
}
}
if(!(%regexp_internal_match(GetLanguageSingletonRE(),ah)===null)){
if(%ArrayIndexOf(aV,ah,0)===-1){
%_Call(d,aV,ah);
}else{
return false;
}
}
}
return true;
}
function BuildLanguageTagREs(){
var aW='[a-zA-Z]';
var aX='[0-9]';
var aY='('+aW+'|'+aX+')';
var aZ='(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|'+
'zh-min|zh-min-nan|zh-xiang)';
var ba='(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|'+
'i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|'+
'i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)';
var bb='('+ba+'|'+aZ+')';
var bc='(x(-'+aY+'{1,8})+)';
var bd='('+aX+'|[A-WY-Za-wy-z])';
Q=new m('^'+bd+'$','i');
var an='('+bd+'(-'+aY+'{2,8})+)';
var be='('+aY+'{5,8}|('+aX+aY+'{3}))';
P=new m('^'+be+'$','i');
var bf='('+aW+'{2}|'+aX+'{3})';
var bg='('+aW+'{4})';
var bh='('+aW+'{3}(-'+aW+'{3}){0,2})';
var bi='('+aW+'{2,3}(-'+bh+')?|'+aW+'{4}|'+
aW+'{5,8})';
var bj=bi+'(-'+bg+')?(-'+bf+')?(-'+
be+')*(-'+an+')*(-'+bc+')?';
var bk=
'^('+bj+'|'+bc+'|'+bb+')$';
O=new m(bk,'i');
}
%DefineMethodsInternal(f,class{getCanonicalLocales(B){
return makeArray(canonicalizeLocaleList(B));
}},-1);
function CreateCollator(B,C){
if((C===(void 0))){
C={__proto__:null};
}
var ac=getGetOption(C,'collator');
var bl={__proto__:null};
defineWEProperty(bl,'usage',ac(
'usage','string',['sort','search'],'sort'));
var bm=ac('sensitivity','string',
['base','accent','case','variant']);
if((bm===(void 0))&&bl.usage==='sort'){
bm='variant';
}
defineWEProperty(bl,'sensitivity',bm);
defineWEProperty(bl,'ignorePunctuation',ac(
'ignorePunctuation','boolean',(void 0),false));
var Z=resolveLocale('collator',B,C);
var ar=parseExtension(Z.extension);
var bn={
'kn':{'property':'numeric','type':'boolean'},
'kf':{'property':'caseFirst','type':'string',
'values':['false','lower','upper']}
};
setOptions(
C,ar,bn,ac,bl);
var bo='default';
var an='';
if((%_Call(r,ar,'co'))&&bl.usage==='sort'){
var bp=[
'big5han','dict','direct','ducet','gb2312','phonebk','phonetic',
'pinyin','reformed','searchjl','stroke','trad','unihan','zhuyin'
];
if(%ArrayIndexOf(bp,ar.co,0)!==-1){
an='-u-co-'+ar.co;
bo=ar.co;
}
}else if(bl.usage==='search'){
an='-u-co-search';
}
defineWEProperty(bl,'collation',bo);
var aj=Z.locale+an;
var ai=%object_define_properties({__proto__:null},{
caseFirst:{writable:true},
collation:{value:bl.collation,writable:true},
ignorePunctuation:{writable:true},
locale:{writable:true},
numeric:{writable:true},
requestedLocale:{value:aj,writable:true},
sensitivity:{writable:true},
strength:{writable:true},
usage:{value:bl.usage,writable:true}
});
var bq=%CreateCollator(aj,bl,ai);
%MarkAsInitializedIntlObjectOfType(bq,'collator');
bq[u]=ai;
return bq;
}
function CollatorConstructor(){
return IntlConstruct(this,i,CreateCollator,new.target,
arguments);
}
%SetCode(i,CollatorConstructor);
%DefineMethodsInternal(i.prototype,class{resolvedOptions(){
var br=Unwrap(this,'collator',i,'resolvedOptions',
false);
return{
locale:br[u].locale,
usage:br[u].usage,
sensitivity:br[u].sensitivity,
ignorePunctuation:br[u].ignorePunctuation,
numeric:br[u].numeric,
caseFirst:br[u].caseFirst,
collation:br[u].collation
};
}},-1);
%DefineMethodsInternal(i,class{supportedLocalesOf(B){
return supportedLocalesOf('collator',B,arguments[1]);
}},-1);
function compare(bq,bs,bt){
return %InternalCompare(bq,(%_ToString(bs)),(%_ToString(bt)));
};
AddBoundMethod(i,'compare',compare,2,'collator',false);
function PluralRulesConstructor(){
if((new.target===(void 0))){
throw %make_type_error(38,"PluralRules");
}
var B=arguments[0];
var C=arguments[1];
if((C===(void 0))){
C={__proto__:null};
}
var ac=getGetOption(C,'pluralrules');
var Z=resolveLocale('pluralrules',B,C);
var bl={__proto__:null};
defineWEProperty(bl,'type',ac(
'type','string',['cardinal','ordinal'],'cardinal'));
SetNumberFormatDigitOptions(bl,C,0,3);
var aj=Z.locale;
var ai=%object_define_properties({__proto__:null},{
type:{value:bl.type,writable:true},
locale:{writable:true},
maximumFractionDigits:{writable:true},
minimumFractionDigits:{writable:true},
minimumIntegerDigits:{writable:true},
requestedLocale:{value:aj,writable:true},
});
if((%_Call(r,bl,'minimumSignificantDigits'))){
defineWEProperty(ai,'minimumSignificantDigits',(void 0));
}
if((%_Call(r,bl,'maximumSignificantDigits'))){
defineWEProperty(ai,'maximumSignificantDigits',(void 0));
}
defineWEProperty(ai,'pluralCategories',[]);
var bu=%CreatePluralRules(aj,bl,
ai);
%MarkAsInitializedIntlObjectOfType(bu,'pluralrules');
bu[u]=ai;
return bu;
}
%SetCode(j,PluralRulesConstructor);
%DefineMethodsInternal(j.prototype,class{resolvedOptions(){
if(!%IsInitializedIntlObjectOfType(this,'pluralrules')){
throw %make_type_error(59,
'Intl.PluralRules.prototype.resolvedOptions',
this);
}
var ao={
locale:this[u].locale,
type:this[u].type,
minimumIntegerDigits:this[u].minimumIntegerDigits,
minimumFractionDigits:this[u].minimumFractionDigits,
maximumFractionDigits:this[u].maximumFractionDigits,
};
if((%_Call(r,this[u],'minimumSignificantDigits'))){
defineWECProperty(ao,'minimumSignificantDigits',
this[u].minimumSignificantDigits);
}
if((%_Call(r,this[u],'maximumSignificantDigits'))){
defineWECProperty(ao,'maximumSignificantDigits',
this[u].maximumSignificantDigits);
}
defineWECProperty(ao,'pluralCategories',
this[u].pluralCategories);
return ao;
}},-1);
%DefineMethodsInternal(j,class{supportedLocalesOf(B){
return supportedLocalesOf('pluralrules',B,arguments[1]);
}},-1);
%DefineMethodsInternal(j.prototype,class{select(ah){
if(!%IsInitializedIntlObjectOfType(this,'pluralrules')){
throw %make_type_error(59,
'Intl.PluralRules.prototype.select',
this);
}
return %PluralRulesSelect(this,(%_ToNumber(ah))+0);
}},-1);
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

