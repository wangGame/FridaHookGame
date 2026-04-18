function()
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