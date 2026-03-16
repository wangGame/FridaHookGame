function(t) {
if (t) {
var e = t.font;
e = !e || e instanceof cc.BitmapFont ? t.fontFamily : t.font._fontFamily;
var i = t.fontSize * t.node.scaleY;
if (this._placeholderLabelFont !== e || this._placeholderLabelFontSize !== i || this._placeholderLabelFontColor !== t.fontColor || this._placeholderLabelAlign !== t.horizontalAlign || this._placeholderLineHeight !== t.fontSize) {
this._placeholderLabelFon