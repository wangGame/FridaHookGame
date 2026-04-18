function")
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