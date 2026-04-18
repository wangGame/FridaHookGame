functionality

  /**
   * @protected
   */
  _shouldRender() {
    return Boolean(this.items && this.container && this.newChild);
  }

  /**
   * @private
   */
  _scheduleRender() {
    if (!this._pendingRender && this._shouldRender()) {
      this._pendingRender = Promise.resolve().then(() => this._render());
    }
  }

  /**
   * Returns those children that are about to be displayed and that
   * require to be positioned. If reset or remeasure has been triggered,
   * all children are returned.
   * @return {{indices:Array<number>,children:Array<Element>}}
   * @private
   */
  get _toMeasure() {
    return this._ordered.reduce((toMeasure, c, i) => {
      const idx = this._first + i;
      if (this._needsReset || this._needsRemeasure || idx < this._prevFirst ||
          idx > this._prevLast) {
        toMeasure.indices.push(idx);
        toMeasure.children.push(c);
      }
      return toMeasure;
    }, {indices: [], children: []});
  }

  /**
   * Measures each child bounds and builds a map of index/bounds to be passed to
   * the `_measureCallback`
   * @private
   */
  async _measureChildren() {
    if (this._ordered.length > 0) {
      const {indices, children} = this._toMeasure;
      await Promise.resolve();
      const pm = await Promise.all(children.map(
          (c, i) => this._indexToMeasure[indices[i]] || this._measureChild(c)));
      const mm = /** @type {{ number: { width: number, height: number } }} */
          (pm.reduce((out, cur, i) => {
            out[indices[i]] = this._indexToMeasure[indices[i]] = cur;
            return out;
          }, {}));
      this._measureCallback(mm);
    }
  }

  /**
   * @protected
   */
  _render() {
    // 1. create DOM
    // 2. measure DOM
    // 3. recycle DOM
    const rangeChanged =
        this._first !== this._prevFirst || this._num !== this._prevNum;
    if (rangeChanged || this._needsReset) {
      this._last = this._first +
          Math.min(this._num, this._items.length - this._first) - 1;
      if (this._num || this._prevNum) {
        if (this._needsReset) {
          this._reset(this._first, this._last);
        } else {
          this._discardHead();
          this._discardTail();
          this._addHead();
          this._addTail();
        }
      }
    }
    if (this._needsRemeasure || this._needsReset) {
      this._indexToMeasure = {};
    }
    const shouldMeasure = this._num > 0 && this._measureCallback &&
        (rangeChanged || this._needsRemeasure || this._needsReset);
    // console.debug(`#${this._container.id} _render: ${this._num}/${
    //     this._items.length} ${this._first} -> ${this._last}
    //     (${this._prevNum}/${this._items.length} ${this._prevFirst} ->
    //     ${this._prevLast}) measure=${shouldMeasure}`);
    if (shouldMeasure) {
      this._measureChildren();
    }

    // Cleanup
    if (!this._incremental) {
      this._prevActive.forEach((idx, child) => this._unassignChild(child, idx));
      this._prevActive.clear();
    }

    this._prevFirst = this._first;
    this._prevLast = this._last;
    this._prevNum = this._num;
    this._needsReset = false;
    this._needsRemeasure = false;
    this._pendingRender = null;
  }

  /**
   * @private
   */
  _discardHead() {
    const o = this._ordered;
    for (let idx = this._prevFirst; o.length && idx < this._first; idx++) {
      this._unassignChild(o.shift(), idx);
    }
  }

  /**
   * @private
   */
  _discardTail() {
    const o = this._ordered;
    for (let idx = this._prevLast; o.length && idx > this._last; idx--) {
      this._unassignChild(o.pop(), idx);
    }
  }

  /**
   * @private
   */
  _addHead() {
    const start = this._first;
    const end = Math.min(this._last, this._prevFirst - 1);
    for (let idx = end; idx >= start; idx--) {
      const child = this._assignChild(idx);
      const item = this._items[idx];
      if (this._manageDom) {
        if (this._maintainDomOrder || !this._childIsAttached(child)) {
          this._insertBefore(child, this._firstChild);
        }
      }
      if (this.updateChild) {
        this.updateChild(child, item, idx);
      }
      this._ordered.unshift(child);
    }
  }

  /**
   * @private
   */
  _addTail() {
    const start = Math.max(this._first, this._prevLast + 1);
    const end = this._last;
    for (let idx = start; idx <= end; idx++) {
      const child = this._assignChild(idx);
      const item = this._items[idx];
      if (this._manageDom) {
        if (this._maintainDomOrder || !this._childIsAttached(child)) {
          this._insertBefore(child, null);
        }
      }
      if (this.updateChild) {
        this.updateChild(child, item, idx);
      }
      this._ordered.push(child);
    }
  }

  /**
   * @param {number} first
   * @param {number} last
   * @private
   */
  _reset(first, last) {
    const len = last - first + 1;
    // Explain why swap prevActive with active - affects _assignChild.
    const prevActive = this._active;
    this._active = this._prevActive;
    this._prevActive = prevActive;
    let currentMarker = this._manageDom && this._firstChild;
    this._ordered.length = 0;
    for (let n = 0; n < len; n++) {
      const idx = first + n;
      const item = this._items[idx];
      const child = this._assignChild(idx);
      this._ordered.push(child);
      if (this._manageDom) {
        if (currentMarker && this._maintainDomOrder) {
          if (currentMarker === this._node(child)) {
            currentMarker = this._nextSibling(child);
          } else {
            this._insertBefore(child, currentMarker);
          }
        } else if (!this._childIsAttached(child)) {
          this._insertBefore(child, null);
        }
      }
      if (this.updateChild) {
        this.updateChild(child, item, idx);
      }
    }
  }

  /**
   * @param {number} idx
   * @private
   */
  _assignChild(idx) {
    const item = this._items[idx];
    const key = this.itemKey ? this.itemKey(item) : idx;
    let child;
    if (child = this._keyToChild.get(key)) {
      this._prevActive.delete(child);
    } else {
      child = this.newChild(item, idx);
      this._keyToChild.set(key, child);
      this._childToKey.set(child, key);
    }
    this._showChild(child);
    this._active.set(child, idx);
    return child;
  }

  /**
   * @param {*} child
   * @param {number} idx
   * @private
   */
  _unassignChild(child, idx) {
    this._hideChild(child);
    if (this._incremental) {
      this._active.delete(child);
      this._prevActive.set(child, idx);
    } else {
      const key = this._childToKey.get(child);
      this._childToKey.delete(child);
      this._keyToChild.delete(key);
      this._active.delete(child);
      if (this.recycleChild) {
        this.recycleChild(child, this._items[idx], idx);
      } else {
        this._removeChild(child);
      }
    }
  }

  // TODO: Is this the right name?
  /**
   * @private
   */
  get _firstChild() {
    return this._ordered.length ? this._node(this._ordered[0]) : null;
  }

  // Overridable abstractions for child manipulation
  /**
   * @protected
   */
  _node(child) {
    return child;
  }
  /**
   * @protected
   */
  _nextSibling(child) {
    return child.nextSibling;
  }
  /**
   * @protected
   */
  _insertBefore(child, referenceNode) {
    this._container.insertBefore(child, referenceNode);
  }
  /**
   * @protected
   */
  _childIsAttached(child) {
    const node = this._node(child);
    return node && node.parentNode === this._container;
  }
  /**
   * @protected
   */
  _hideChild(child) {
    if (child.style) {
      child.style.display = 'none';
    }
  }
  /**
   * @protected
   */
  _showChild(child) {
    if (child.style) {
      child.style.display = null;
    }
  }

  /**
   *
   * @param {!Element} child
   * @return {{width: number, height: number, marginTop: number, marginBottom: number, marginLeft: number, marginRight: number}} childMeasures
   * @protected
   */
  _measureChild(child) {
    // offsetWidth doesn't take transforms in consideration,
    // so we use getBoundingClientRect which does.
    const {width, height} = child.getBoundingClientRect();
    // console.debug(`_measureChild #${this._container.id} > #${
    //     child.id}: height: ${height}px`);
    return Object.assign({width, height}, getMargins(child));
  }

  /**
   * Remove child.
   * Override to control child removal.
   *
   * @param {*} child
   * @protected
   */
  _removeChild(child) {
    child.parentNode.removeChild(child);
  }
}

function getMargins(el) {
  const style = window.getComputedStyle(el);
  // console.log(el.id, style.position);
  return {
    marginLeft: getMarginValue(style.marginLeft),
    marginRight: getMarginValue(style.marginRight),
    marginTop: getMarginValue(style.marginTop),
    marginBottom: getMarginValue(style.marginBottom),
  };
}

function getMarginValue(value) {
  value = value ? parseFloat(value) : NaN;
  return value !== value ? 0 : value;
}

export const VirtualRepeater = Repeats(class {});var ProcessingRoot;
var i18nTemplate=function(){var handlers={"i18n-content":function(element,key,data,visited){element.textContent=data.getString(key)},"i18n-options":function(select,key,data,visited){var options=data.getValue(key);options.forEach(function(optionData){var option=typeof optionData=="string"?new Option(optionData):new Option(optionData[1],optionData[0]);select.appendChild(option)})},"i18n-values":function(element,attributeAndKeys,data,visited){var parts=attributeAndKeys.replace(/\s/g,"").split(/;/);parts.forEach(function(part){if(!part)return;
var attributeAndKeyPair=part.match(/^([^:]+):(.+)$/);if(!attributeAndKeyPair)throw new Error("malformed i18n-values: "+attributeAndKeys);var propName=attributeAndKeyPair[1];var propExpr=attributeAndKeyPair[2];var value=data.getValue(propExpr);if(propName[0]=="."){var path=propName.slice(1).split(".");var targetObject=element;while(targetObject&&path.length>1)targetObject=targetObject[path.shift()];if(targetObject){targetObject[path]=value;if(path=="innerHTML")for(var i=0;i<element.children.length;++i)processWithoutCycles(element.children[i],
data,visited,false)}}else element.setAttribute(propName,value)})}};var prefixes=[""];if(Element.prototype.createShadowRoot)prefixes.push("* /deep/ ");var attributeNames=Object.keys(handlers);var selector=prefixes.map(function(prefix){return prefix+"["+attributeNames.join("], "+prefix+"[")+"]"}).join(", ");function process(root,data){processWithoutCycles(root,data,new Set,true)}function processWithoutCycles(root,data,visited,mark){if(visited.has(root))return;visited.add(root);var importLinks=root.querySelectorAll("link[rel=import]");
for(var i=0;i<importLinks.length;++i){var importLink=importLinks[i];if(!importLink.import)continue;processWithoutCycles(importLink.import,data,visited,mark)}var templates=root.querySelectorAll("template");for(var i=0;i<templates.length;++i){var template=templates[i];if(!template.content)continue;processWithoutCycles(template.content,data,visited,mark)}var isElement=root instanceof Element;if(isElement&&root.webkitMatchesSelector(selector))processElement(root,data,visited);var elements=root.querySelectorAll(selector);
for(var i=0;i<elements.length;++i)processElement(elements[i],data,visited);if(mark){var processed=isElement?[root]:root.children;if(processed)for(var i=0;i<processed.length;++i)processed[i].setAttribute("i18n-processed","")}}function processElement(element,data,visited){for(var i=0;i<attributeNames.length;i++){var name=attributeNames[i];var attribute=element.getAttribute(name);if(attribute!=null)handlers[name](element,attribute,data,visited)}}return{process:process}}();
i18nTemplate.process(document,loadTimeData);

(function(){var i=null;function k(){return Function.prototype.call.apply(Array.prototype.slice,arguments)}function l(a,b){var c=k(arguments,2);return function(){return b.apply(a,c)}}function m(a,b){var c=new n(b);for(c.f=[a];c.f.length;){var e=c,d=c.f.shift();e.g(d);for(d=d.firstChild;d;d=d.nextSibling)d.nodeType==1&&e.f.push(d)}}function n(a){this.g=a}function o(a){a.style.display=""}function p(a){a.style.display="none"}var q=":",r=/\s*;\s*/;function s(){this.i.apply(this,arguments)}s.prototype.i=
function(a,b){if(!this.a)this.a={};if(b){var c=this.a,e=b.a,d;for(d in e)c[d]=e[d]}else for(c in d=this.a,e=t,e)d[c]=e[c];this.a.$this=a;this.a.$context=this;this.d=typeof a!="undefined"&&a!=i?a:"";if(!b)this.a.$top=this.d};var t={$default:i},u=[];function v(a){for(var b in a.a)delete a.a[b];a.d=i;u.push(a)}function w(a,b,c){try{return b.call(c,a.a,a.d)}catch(e){return t.$default}}function x(a,b,c,e){if(u.length>0){var d=u.pop();s.call(d,b,a);a=d}else a=new s(b,a);a.a.$index=c;a.a.$count=e;return a}
var y="a_",z="b_",A="with (a_) with (b_) return ",D={};function E(a){if(!D[a])try{D[a]=new Function(y,z,A+a)}catch(b){}return D[a]}function F(a){for(var b=[],a=a.split(r),c=0,e=a.length;c<e;++c){var d=a[c].indexOf(q);if(!(d<0)){var f;f=a[c].substr(0,d).replace(/^\s+/,"").replace(/\s+$/,"");d=E(a[c].substr(d+1));b.push(f,d)}}return b}var G="jsinstance",H="jsts",I="*",J="div",K="id";function L(){}var M=0,N={0:{}},P={},Q={},R=[];function S(a){a.__jstcache||m(a,function(a){T(a)})}var U=[["jsselect",E],
["jsdisplay",E],["jsvalues",F],["jsvars",F],["jseval",function(a){for(var b=[],a=a.split(r),c=0,e=a.length;c<e;++c)if(a[c]){var d=E(a[c]);b.push(d)}return b}],["transclude",function(a){return a}],["jscontent",E],["jsskip",E]];function T(a){if(a.__jstcache)return a.__jstcache;var b=a.getAttribute("jstcache");if(b!=i)return a.__jstcache=N[b];for(var b=R.length=0,c=U.length;b<c;++b){var e=U[b][0],d=a.getAttribute(e);Q[e]=d;d!=i&&R.push(e+"="+d)}if(R.length==0)return a.setAttribute("jstcache","0"),a.__jstcache=
N[0];var f=R.join("&");if(b=P[f])return a.setAttribute("jstcache",b),a.__jstcache=N[b];for(var h={},b=0,c=U.length;b<c;++b){var d=U[b],e=d[0],g=d[1],d=Q[e];d!=i&&(h[e]=g(d))}b=""+ ++M;a.setAttribute("jstcache",b);N[b]=h;P[f]=b;return a.__jstcache=h}function V(a,b){a.h.push(b);a.k.push(0)}function W(a){return a.c.length?a.c.pop():[]}L.prototype.e=function(a,b){var c=X(b),e=c.transclude;if(e)(c=Y(e))?(b.parentNode.replaceChild(c,b),e=W(this),e.push(this.e,a,c),V(this,e)):b.parentNode.removeChild(b);
else if(c=c.jsselect){var c=w(a,c,b),d=b.getAttribute(G),f=!1;d&&(d.charAt(0)==I?(d=parseInt(d.substr(1),10),f=!0):d=parseInt(d,10));var h=c!=i&&typeof c=="object"&&typeof c.length=="number",e=h?c.length:1,g=h&&e==0;if(h)if(g)d?b.parentNode.removeChild(b):(b.setAttribute(G,"*0"),p(b));else if(o(b),d===i||d===""||f&&d<e-1){f=W(this);d=d||0;for(h=e-1;d<h;++d){var j=b.cloneNode(!0);b.parentNode.insertBefore(j,b);Z(j,c,d);g=x(a,c[d],d,e);f.push(this.b,g,j,v,g,i)}Z(b,c,d);g=x(a,c[d],d,e);f.push(this.b,
g,b,v,g,i);V(this,f)}else d<e?(f=c[d],Z(b,c,d),g=x(a,f,d,e),f=W(this),f.push(this.b,g,b,v,g,i),V(this,f)):b.parentNode.removeChild(b);else c==i?p(b):(o(b),g=x(a,c,0,1),f=W(this),f.push(this.b,g,b,v,g,i),V(this,f))}else this.b(a,b)};L.prototype.b=function(a,b){var c=X(b),e=c.jsdisplay;if(e){if(!w(a,e,b)){p(b);return}o(b)}if(e=c.jsvars)for(var d=0,f=e.length;d<f;d+=2){var h=e[d],g=w(a,e[d+1],b);a.a[h]=g}if(e=c.jsvalues){d=0;for(f=e.length;d<f;d+=2)if(g=e[d],h=w(a,e[d+1],b),g.charAt(0)=="$")a.a[g]=h;
else if(g.charAt(0)=="."){for(var g=g.substr(1).split("."),j=b,O=g.length,B=0,$=O-1;B<$;++B){var C=g[B];j[C]||(j[C]={});j=j[C]}j[g[O-1]]=h}else g&&(typeof h=="boolean"?h?b.setAttribute(g,g):b.removeAttribute(g):b.setAttribute(g,""+h))}if(e=c.jseval){d=0;for(f=e.length;d<f;++d)w(a,e[d],b)}e=c.jsskip;if(!e||!w(a,e,b))if(c=c.jscontent){if(c=""+w(a,c,b),b.innerHTML!=c){for(;b.firstChild;)e=b.firstChild,e.parentNode.removeChild(e);b.appendChild(this.j.createTextNode(c))}}else{c=W(this);for(e=b.firstChild;e;e=
e.nextSibling)e.nodeType==1&&c.push(this.e,a,e);c.length&&V(this,c)}};function X(a){if(a.__jstcache)return a.__jstcache;var b=a.getAttribute("jstcache");if(b)return a.__jstcache=N[b];return T(a)}function Y(a,b){var c=document;if(b){var e=c.getElementById(a);if(!e){var e=b(),d=H,f=c.getElementById(d);if(!f)f=c.createElement(J),f.id=d,p(f),f.style.position="absolute",c.body.appendChild(f);d=c.createElement(J);f.appendChild(d);d.innerHTML=e;e=c.getElementById(a)}c=e}else c=c.getElementById(a);return c?
(S(c),c=c.cloneNode(!0),c.removeAttribute(K),c):i}function Z(a,b,c){c==b.length-1?a.setAttribute(G,I+c):a.setAttribute(G,""+c)}window.jstGetTemplate=Y;window.JsEvalContext=s;window.jstProcess=function(a,b){var c=new L;S(b);c.j=b?b.nodeType==9?b:b.ownerDocument||document:document;var e=l(c,c.e,a,b),d=c.h=[],f=c.k=[];c.c=[];e();for(var h,g,j;d.length;)h=d[d.length-1],e=f[f.length-1],e>=h.length?(e=c,g=d.pop(),g.length=0,e.c.push(g),f.pop()):(g=h[e++],j=h[e++],h=h[e++],f[f.length-1]=e,g.call(c,j,h))}})();

/* Copyright 2014 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file. */

/* This file is dynamically processed by a C++ data source handler to fill in
 * some per-platform/locale styles that dramatically alter the page. This is
 * done to reduce flicker, as JS may not run before the page is rendered.
 *
 * There are two ways to include this stylesheet:
 * 1. via its chrome://resources/ URL in HTML, i.e.:
 *
 *   <link rel="stylesheet" href="chrome://resources/css/text_defaults.css">
 *
 * 2. via the webui::AppendWebUICSSTextDefaults() method to directly append it
 * to an HTML string.
 * Otherwise its placeholders won't be expanded. */

html {
  direction: $i18n{textDirection};
}

body {
  font-family: $i18nRaw{fontFamily};
  font-size: $i18n{fontSize};
}

button {
  font-family: $i18nRaw{fontFamily};
}
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview This file defines a singleton which provides access to all data
 * that is available as soon as the page's resources are loaded (before DOM
 * content has finished loading). This data includes both localized strings and
 * any data that is important to have ready from a very early stage (e.g. things
 * that must be displayed right away).
 *
 * Note that loadTimeData is not guaranteed to be consistent between page
 * refreshes (https://crbug.com/740629) and should not contain values that might
 * change if the page is re-opened later.
 */

/**
 * @typedef {{
 *   substitutions: (Array<string>|undefined),
 *   attrs: (Object<function(Node, string):boolean>|undefined),
 *   tags: (Array<string>|undefined),
 * }}
 */
var SanitizeInnerHtmlOpts;

/** @type {!LoadTimeData} */ var loadTimeData;

// Expose this type globally as a temporary work around until
// https://github.com/google/closure-compiler/issues/544 is fixed.
/** @constructor */
function LoadTimeData(){}

(function() {
  'use strict';

  LoadTimeData.prototype = {
    /**
     * Sets the backing object.
     *
     * Note that there is no getter for |data_| to discourage abuse of the form:
     *
     *     var value = loadTimeData.data()['key'];
     *
     * @param {Object} value The de-serialized page data.
     */
    set data(value) {
      expect(!this.data_, 'Re-setting data.');
      this.data_ = value;
    },

    /**
     * Returns a JsEvalContext for |data_|.
     * @returns {JsEvalContext}
     */
    createJsEvalContext: function() {
      return new JsEvalContext(this.data_);
    },

    /**
     * @param {string} id An ID of a value that might exist.
     * @return {boolean} True if |id| is a key in the dictionary.
     */
    valueExists: function(id) {
      return id in this.data_;
    },

    /**
     * Fetches a value, expecting that it exists.
     * @param {string} id The key that identifies the desired value.
     * @return {*} The corresponding value.
     */
    getValue: function(id) {
      expect(this.data_, 'No data. Did you remember to include strings.js?');
      var value = this.data_[id];
      expect(typeof value != 'undefined', 'Could not find value for ' + id);
      return value;
    },

    /**
     * As above, but also makes sure that the value is a string.
     * @param {string} id The key that identifies the desired string.
     * @return {string} The corresponding string value.
     */
    getString: function(id) {
      var value = this.getValue(id);
      expectIsType(id, value, 'string');
      return /** @type {string} */ (value);
    },

    /**
     * Returns a formatted localized string where $1 to $9 are replaced by the
     * second to the tenth argument.
     * @param {string} id The ID of the string we want.
     * @param {...(string|number)} var_args The extra values to include in the
     *     formatted output.
     * @return {string} The formatted string.
     */
    getStringF: function(id, var_args) {
      var value = this.getString(id);
      if (!value)
        return '';

      var args = Array.prototype.slice.call(arguments);
      args[0] = value;
      return this.substituteString.apply(this, args);
    },

    /**
     * Make a string safe for use with with Polymer bindings that are
     * inner-h-t-m-l (or other innerHTML use).
     * @param {string} rawString The unsanitized string.
     * @param {SanitizeInnerHtmlOpts=} opts Optional additional allowed tags and
     *     attributes.
     * @return {string}
     */
    sanitizeInnerHtml: function(rawString, opts) {
      opts = opts || {};
      return parseHtmlSubset('<b>' + rawString + '</b>', opts.tags, opts.attrs)
          .firstChild.innerHTML;
    },

    /**
     * Returns a formatted localized string where $1 to $9 are replaced by the
     * second to the tenth argument. Any standalone $ signs must be escaped as
     * $$.
     * @param {string} label The label to substitute through.
     *     This is not an resource ID.
     * @param {...(string|number)} var_args The extra values to include in the
     *     formatted output.
     * @return {string} The formatted string.
     */
    substituteString: function(label, var_args) {
      var varArgs = arguments;
      return label.replace(/\$(.|$|\n)/g, function(m) {
        assert(m.match(/\$[$1-9]/), 'Unescaped $ found in localized string.');
        return m == '$$' ? '$' : varArgs[m[1]];
      });
    },

    /**
     * Returns a formatted string where $1 to $9 are replaced by the second to
     * tenth argument, split apart into a list of pieces describing how the
     * substitution was performed. Any standalone $ signs must be escaped as $$.
     * @param {string} label A localized string to substitute through.
     *     This is not an resource ID.
     * @param {...(string|number)} var_args The extra values to include in the
     *     formatted output.
     * @return {!Array<!{value: string, arg: (null|string)}>} The formatted
     *     string pieces.
     */
    getSubstitutedStringPieces: function(label, var_args) {
      var varArgs = arguments;
      // Split the string by separately matching all occurrences of $1-9 and of
      // non $1-9 pieces.
      var pieces = (label.match(/(\$[1-9])|(([^$]|\$([^1-9]|$))+)/g) ||
                    []).map(function(p) {
        // Pieces that are not $1-9 should be returned after replacing $$
        // with $.
        if (!p.match(/^\$[1-9]$/)) {
          assert(
              (p.match(/\$/g) || []).length % 2 == 0,
              'Unescaped $ found in localized string.');
          return {value: p.replace(/\$\$/g, '$'), arg: null};
        }

        // Otherwise, return the substitution value.
        return {value: varArgs[p[1]], arg: p};
      });

      return pieces;
    },

    /**
     * As above, but also makes sure that the value is a boolean.
     * @param {string} id The key that identifies the desired boolean.
     * @return {boolean} The corresponding boolean value.
     */
    getBoolean: function(id) {
      var value = this.getValue(id);
      expectIsType(id, value, 'boolean');
      return /** @type {boolean} */ (value);
    },

    /**
     * As above, but also makes sure that the value is an integer.
     * @param {string} id The key that identifies the desired number.
     * @return {number} The corresponding number value.
     */
    getInteger: function(id) {
      var value = this.getValue(id);
      expectIsType(id, value, 'number');
      expect(value == Math.floor(value), 'Number isn\'t integer: ' + value);
      return /** @type {number} */ (value);
    },

    /**
     * Override values in loadTimeData with the values found in |replacements|.
     * @param {Object} replacements The dictionary object of keys to replace.
     */
    overrideValues: function(replacements) {
      expect(
          typeof replacements == 'object',
          'Replacements must be a dictionary object.');
      for (var key in replacements) {
        this.data_[key] = replacements[key];
      }
    }
  };

  /**
   * Checks condition, displays error message if expectation fails.
   * @param {*} condition The condition to check for truthiness.
   * @param {string} message The message to display if the check fails.
   */
  function expect(condition, message) {
    if (!condition) {
      console.error(
          'Unexpected condition on ' + document.location.href + ': ' + message);
    }
  }

  /**
   * Checks that the given value has the given type.
   * @param {string} id The id of the value (only used for error message).
   * @param {*} value The value to check the type on.
   * @param {string} type The type we expect |value| to be.
   */
  function expectIsType(id, value, type) {
    expect(
        typeof value == type, '[' + value + '] (' + id + ') is not a ' + type);
  }

  expect(!loadTimeData, 'should only include this file once');
  loadTimeData = new LoadTimeData;
})();
PK
