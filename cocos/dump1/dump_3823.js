function(objectGroupName,jsonMLObject)
{var maxCustomPreviewRecursionDepth=20;this._customPreviewRecursionDepth=(this._customPreviewRecursionDepth||0)+1
try{if(this._customPreviewRecursionDepth>=maxCustomPreviewRecursionDepth)
throw new Error("Too deep hierarchy of inlined custom previews");if(!isArrayLike(jsonMLObject))
return;if(jsonMLObject[0]==="object"){var attributes=jsonMLObject[1];var originObject=attributes["object"];var config=attributes["config"];if(typeof originObject==="undefined")
throw new Error("Illegal format: obligatory attribute \"object\" isn't specified");jsonMLObject[1]=this._wrapObject(originObject,objectGroupName,false,false,null,false,false,config);return;}
for(var i=0;i<jsonMLObject.length;++i)
this._substituteObjectTagsInCustomPreview(objectGroupName,jsonMLObject[i]);}finally{this._customPreviewRecursionDepth--;}},_isDefined:function(object)
{return!!object||this._isHTMLAllCollection(object);},_isHTMLAllCollection:function(object)
{return(typeof object==="undefined")&&!!InjectedScriptHost.subtype(object);},_subtype:function(obj)
{if(obj===null)
return"null";if(this.isPrimitiveValue(obj))
return null;var subtype=InjectedScriptHost.subtype(obj);if(subtype)
return subtype;if(isArrayLike(obj))
return"array";return null;},_describe:function(obj)
{if(this.isPrimitiveValue(obj))
return null;var subtype=this._subtype(obj);if(subtype==="regexp")
return toString(obj);if(subtype==="date")
return toString(obj);if(subtype==="node"){var description="";var nodeName=InjectedScriptHost.getProperty(obj,"nodeName");if(nodeName){description=nodeName.toLowerCase();}else{var constructor=InjectedScriptHost.getProperty(obj,"constructor");if(constructor)
description=(InjectedScriptHost.getProperty(constructor,"name")||"").toLowerCase();}
var nodeType=InjectedScriptHost.getProperty(obj,"nodeType");switch(nodeType){case 1:var id=InjectedScriptHost.getProperty(obj,"id");description+=id?"#"+id:"";var className=InjectedScriptHost.getProperty(obj,"className");description+=(className&&typeof className==="string")?"."+className.trim().replace(/\s+/g,"."):"";break;case 10:description="<!DOCTYPE "+description+">";break;}
return description;}
if(subtype==="proxy")
return"Proxy";var className=InjectedScriptHost.internalConstructorName(obj);if(subtype==="array"||subtype==="typedarray"){if(typeof obj.length==="number")
return className+"("+obj.length+")";return className;}
if(subtype==="map"||subtype==="set"||subtype==="blob"){if(typeof obj.size==="number")
return className+"("+obj.size+")";return className;}
if(subtype==="arraybuffer"||subtype==="dataview"){if(typeof obj.byteLength==="number")
return className+"("+obj.byteLength+")";return className;}
if(typeof obj==="function")
return toString(obj);if(isSymbol(obj)){try{return obj.toString()||"Symbol";}catch(e){return"Symbol";}}
if(InjectedScriptHost.subtype(obj)==="error"){try{var stack=obj.stack;var message=obj.message&&obj.message.length?": "+obj.message:"";var firstCallFrame=/^\s+at\s/m.exec(stack);var stackMessageEnd=firstCallFrame?firstCallFrame.index:-1;if(stackMessageEnd!==-1){var stackTrace=stack.substr(stackMessageEnd);return className+message+"\n"+stackTrace;}
return className+message;}catch(e){}}
if(subtype==="internal#entry"){if("key"in obj)
return"{"+this._describeIncludingPrimitives(obj.key)+" => "+this._describeIncludingPrimitives(obj.value)+"}";return this._describeIncludingPrimitives(obj.value);}
if(subtype==="internal#scopeList")
return"Scopes["+obj.length+"]";if(subtype==="internal#scope")
return(InjectedScript.closureTypes[obj.type]||"Unknown")+(obj.name?" ("+obj.name+")":"");return className;},_describeIncludingPrimitives:function(value)
{if(typeof value==="string")
return"\""+value.replace(/\n/g,"\u21B5")+"\"";if(value===null)
return""+value;return this.isPrimitiveValue(value)?toStringDescription(value):(this._describe(value)||"");},setCustomObjectFormatterEnabled:function(enabled)
{this._customObjectFormatterEnabled=enabled;}}
var injectedScript=new InjectedScript();InjectedScript.RemoteObject=function(object,objectGroupName,doNotBind,forceValueType,generatePreview,columnNames,isTable,skipEntriesPreview,customObjectConfig)
{this.type=typeof object;if(this.type==="undefined"&&injectedScript._isHTMLAllCollection(object))
this.type="object";if(injectedScript.isPrimitiveValue(object)||object===null||forceValueType){if(this.type!=="undefined")
this.value=object;if(object===null)
this.subtype="null";if(this.type==="number"){this.description=toStringDescription(object);switch(this.description){case"NaN":case"Infinity":case"-Infinity":case"-0":delete this.value;this.unserializableValue=this.description;break;}}
if(this.type==="bigint"){delete this.value;this.description=toStringDescription(object);this.unserializableValue=this.description;}
return;}
if(injectedScript._shouldPassByValue(object)){this.value=object;this.subtype=injectedScript._subtype(object);this.description=injectedScript._describeIncludingPrimitives(object);return;}
object=(object);if(!doNotBind)
this.objectId=injectedScript._bind(object,objectGroupName);var subtype=injectedScript._subtype(object);if(subtype)
this.subtype=subtype;var className=InjectedScriptHost.internalConstructorName(object);if(className)
this.className=className;this.description=injectedScript._describe(object);if(generatePreview&&this.type==="object"){if(this.subtype==="proxy")
this.preview=this._generatePreview(InjectedScriptHost.proxyTargetValue(object),undefined,columnNames,isTable,skipEntriesPreview);else
this.preview=this._generatePreview(object,undefined,columnNames,isTable,skipEntriesPreview);}
if(injectedScript._customObjectFormatterEnabled){var customPreview=this._customPreview(object,objectGroupName,customObjectConfig);if(customPreview)
this.customPreview=customPreview;}}
InjectedScript.RemoteObject.prototype={_customPreview:function(object,objectGroupName,customObjectConfig)
{function logError(error)
{Promise.resolve().then(inspectedGlobalObject.console.error.bind(inspectedGlobalObject.console,"Custom Formatter Failed: "+error.message));}
function wrap(object,customObjectConfig)
{return injectedScript._wrapObject(object,objectGroupName,false,false,null,false,false,customObjectConfig);}
try{var formatters=inspectedGlobalObject["devtoolsFormatters"];if(!formatters||!isArrayLike(formatters))
return null;for(var i=0;i<formatters.length;++i){try{var formatted=formatters[i].header(object,customObjectConfig);if(!formatted)
continue;var hasBody=formatters[i].hasBody(object,customObjectConfig);injectedScript._substituteObjectTagsInCustomPreview(objectGroupName,formatted);var formatterObjectId=injectedScript._bind(formatters[i],objectGroupName);var bindRemoteObjectFunctionId=injectedScript._bind(wrap,objectGroupName);var result={header:JSON.stringify(formatted),hasBody:!!hasBody,formatterObjectId:formatterObjectId,bindRemoteObjectFunctionId:bindRemoteObjectFunctionId};if(customObjectConfig)
result["configObjectId"]=injectedScript._bind(customObjectConfig,objectGroupName);return result;}catch(e){logError(e);}}}catch(e){logError(e);}
return null;},_createEmptyPreview:function()
{var preview={type:(this.type),description:this.description||toStringDescription(this.value),overflow:false,properties:[],__proto__:null};InjectedScriptHost.nullifyPrototype(preview.properties);if(this.subtype)
preview.subtype=(this.subtype);return preview;},_generatePreview:function(object,firstLevelKeys,secondLevelKeys,isTable,skipEntriesPreview)
{var preview=this._createEmptyPreview();var firstLevelKeysCount=firstLevelKeys?firstLevelKeys.length:0;var propertiesThreshold={properties:isTable?1000:max(5,firstLevelKeysCount),indexes:isTable?1000:max(100,firstLevelKeysCount),__proto__:null};var subtype=this.subtype;var primitiveString;try{var descriptors=[];InjectedScriptHost.nullifyPrototype(descriptors);var rawInternalProperties=InjectedScriptHost.getInternalProperties(object)||[];var internalProperties=[];InjectedScriptHost.nullifyPrototype(rawInternalProperties);InjectedScriptHost.nullifyPrototype(internalProperties);var entries=null;for(var i=0;i<rawInternalProperties.length;i+=2){if(rawInternalProperties[i]==="[[Entries]]"){entries=(rawInternalProperties[i+1]);continue;}
if(rawInternalProperties[i]==="[[PrimitiveValue]]"&&typeof rawInternalProperties[i+1]==='string')
primitiveString=rawInternalProperties[i+1];var internalPropertyDescriptor={name:rawInternalProperties[i],value:rawInternalProperties[i+1],isOwn:true,enumerable:true,__proto__:null};push(descriptors,internalPropertyDescriptor);}
var naturalDescriptors=injectedScript._propertyDescriptors(object,addPropertyIfNeeded,false,undefined,firstLevelKeys);for(var i=0;i<naturalDescriptors.length;i++)
push(descriptors,naturalDescriptors[i]);this._appendPropertyPreviewDescriptors(preview,descriptors,secondLevelKeys,isTable);if(subtype==="map"||subtype==="set"||subtype==="weakmap"||subtype==="weakset"||subtype==="iterator")
this._appendEntriesPreview(entries,preview,skipEntriesPreview);}catch(e){}
return preview;function addPropertyIfNeeded(descriptors,descriptor){if(descriptor.wasThrown)
return true;if(descriptor.name==="__proto__")
return true;if((subtype==="array"||subtype==="typedarray")&&descriptor.name==="length")
return true;if((subtype==="map"||subtype==="set")&&descriptor.name==="size")
return true;if(subtype==='arraybuffer'&&(descriptor.name==="[[Int8Array]]"||descriptor.name==="[[Uint8Array]]"||descriptor.name==="[[Int16Array]]"||descriptor.name==="[[Int32Array]]"))
return true;if(!descriptor.isOwn)
return true;if(!("value"in descriptor)&&!descriptor.get)
return true;if(primitiveString&&primitiveString[descriptor.name]===descriptor.value)
return true;if(toString(descriptor.name>>>0)===descriptor.name)
propertiesThreshold.indexes--;else
propertiesThreshold.properties--;var canContinue=propertiesThreshold.indexes>=0&&propertiesThreshold.properties>=0;if(!canContinue){preview.overflow=true;return false;}
push(descriptors,descriptor);return true;}},_appendPropertyPreviewDescriptors:function(preview,descriptors,secondLevelKeys,isTable)
{for(var i=0;i<descriptors.length;++i){var descriptor=descriptors[i];var name=descriptor.name;var value=descriptor.value;var type=typeof value;if(type==="undefined"&&injectedScript._isHTMLAllCollection(value))
type="object";if(descriptor.get&&!("value"in descriptor)){push(preview.properties,{name:name,type:"accessor",__proto__:null});continue;}
if(value===null){push(preview.properties,{name:name,type:"object",subtype:"null",value:"null",__proto__:null});continue;}
var maxLength=100;if(InjectedScript.primitiveTypes[type]){var valueString=type==="string"?value:toStringDescription(value);if(valueString.length>maxLength)
valueString=this._abbreviateString(valueString,maxLength,true);push(preview.properties,{name:name,type:type,value:valueString,__proto__:null});continue;}
var property={name:name,type:type,__proto__:null};var subtype=injectedScript._subtype(value);if(subtype)
property.subtype=subtype;if(secondLevelKeys===null||secondLevelKeys){var subPreview=this._generatePreview(value,secondLevelKeys||undefined,undefined,isTable);property.valuePreview=subPreview;if(subPreview.overflow)
preview.overflow=true;}else{var description="";if(type!=="function")
description=this._abbreviateString((injectedScript._describe(value)),maxLength,subtype==="regexp");property.value=description;}
push(preview.properties,property);}},_appendEntriesPreview:function(entries,preview,skipEntriesPreview)
{if(!entries)
return;if(skipEntriesPreview){if(entries.length)
preview.overflow=true;return;}
preview.entries=[];InjectedScriptHost.nullifyPrototype(preview.entries);var entriesThreshold=5;for(var i=0;i<entries.length;++i){if(preview.entries.length>=entriesThreshold){preview.overflow=true;break;}
var entry=entries[i];InjectedScriptHost.nullifyPrototype(entry);var previewEntry={value:generateValuePreview(entry.value),__proto__:null};if("key"in entry)
previewEntry.key=generateValuePreview(entry.key);push(preview.entries,previewEntry);}
function generateValuePreview(value)
{var remoteObject=new InjectedScript.RemoteObject(value,undefined,true,undefined,true,undefined,undefined,true);var valuePreview=remoteObject.preview||remoteObject._createEmptyPreview();return valuePreview;}},_abbreviateString:function(string,maxLength,middle)
{if(string.length<=maxLength)
return string;if(middle){var leftHalf=maxLength>>1;var rightHalf=maxLength-leftHalf-1;return string.substr(0,leftHalf)+"\u2026"+string.substr(string.length-rightHalf,rightHalf);}
return string.substr(0,maxLength)+"\u2026";},__proto__:null}
return injectedScript;})v8-inspector#injectedScript