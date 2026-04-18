function generateValuePreview(value)
{var remoteObject=new InjectedScript.RemoteObject(value,undefined,true,undefined,true,undefined,undefined,true);var valuePreview=remoteObject.preview||remoteObject._createEmptyPreview();return valuePreview;}},_abbreviateString:function(string,maxLength,middle)
{if(string.length<=maxLength)
return string;if(middle){var leftHalf=maxLength>>1;var rightHalf=maxLength-leftHalf-1;return string.substr(0,leftHalf)+"\u2026"+string.substr(string.length-rightHalf,rightHalf);}
return string.substr(0,maxLength)+"\u2026";},__proto__:null}
return injectedScript;})v8-inspector#injectedScript