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

