function (copyOldData) {
    var oldIData = this._iData;
    this._iData = new Uint16Array(this._initIDataCount);

    if (oldIData && copyOldData) {
      var iData = this._iData;

      for (var i = 0, l = oldIData.length; i < l; i++) {
        iData[i] = oldIData[i];
      }
    }
  };

  MeshBuffer.reset = function () {
    this._arrOffset = 0;
    this._vData = this._vDatas[0];
    this._uintVData = this._uintVDatas[0];
    this._iData = this._iDatas[0];
    this.byteOffset = 0;
    this.indiceOffset = 0;
    this.vertexOffset = 0;
    if (!this._nativeAssembler) return;

    for (var i = 0, len = this._vDatas.length; i < len; i++) {
      this._nativeAssembler.updateVerticesRange(i, 0, 0);

      this._nativeAssembler.updateIndicesRange(i, 0, 0);
    }
  };

  MeshBuffer.destroy = function () {
    this.reset();
  };
})();

},{}],48:[function(require,module,exports){
"use strict";

/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var RenderFlow = cc.RenderFlow;
cc.js.mixin(renderer.NodeProxy.prototype, {
  _ctor: function _ctor() {
    this._owner = null;
  },
  init: function init(owner) {
    this._owner = owner;
    var spaceInfo = owner._spaceInfo;
    this._owner._dirtyPtr = spaceInfo.dirty;
    this._dirtyPtr = spaceInfo.dirty;
    this._parentPtr = spaceInfo.parent;
    this._zOrderPtr = spaceInfo.zOrder;
    this._cullingMaskPtr = spaceInfo.cullingMask;
    this._opacityPtr = spaceInfo.opacity;
    this._is3DPtr = spaceInfo.is3D;
    this._skewPtr = spaceInfo.skew;
    this._isVisitingTraversal = false;
    owner._proxy = this;
    this.updateOpacity();
    this.update3DNode();
    this.updateZOrder();
    this.updateCullingMask();
    this.updateSkew();
    owner.on(cc.Node.EventType.SIBLING_ORDER_CHANGED, this.updateZOrder, this);
  },
  initNative: function initNative() {
    this.setName(this._owner._name);
    this.updateParent();
    this.updateOpacity();
    this.update3DNode();
    this.updateZOrder();
    this.updateSkew();
    this.updateCullingMask();
  },
  destroy: function destroy() {
    this.destroyImmediately();

    this._owner.off(cc.Node.EventType.SIBLING_ORDER_CHANGED, this.updateZOrder, this);

    this._owner._proxy = null;
    this._owner = null;
  },
  updateParent: function updateParent() {
    var parent = this._owner._parent;

    if (parent) {
      var parentSpaceInfo = parent._spaceInfo;
      this._parentPtr[0] = parentSpaceInfo.unitID;
      this._parentPtr[1] = parentSpaceInfo.index;
      var parentDirtyPtr = parentSpaceInfo.dirty;
      parentDirtyPtr[0] |= RenderFlow.FLAG_REORDER_CHILDREN;
      this._dirtyPtr[0] |= RenderFlow.FLAG_OPACITY;
    } else {
      this._parentPtr[0] = 0xffffffff;
      this._parentPtr[1] = 0xffffffff;
    }

    this.notifyUpdateParent();
  },
  updateZOrder: function updateZOrder() {
    this._zOrderPtr[0] = this._owner._localZOrder;
    var parent = this._owner._parent;

    if (parent && parent._proxy) {
      parent._proxy._dirtyPtr[0] |= RenderFlow.FLAG_REORDER_CHILDREN;
    }
  },
  updateCullingMask: function updateCullingMask() {
    this._cullingMaskPtr[0] = this._owner._cullingMask;
  },
  updateOpacity: function updateOpacity() {
    this._opacityPtr[0] = this._owner.opacity;
    this._dirtyPtr[0] |= RenderFlow.FLAG_OPACITY;
  },
  update3DNode: function update3DNode() {
    this._is3DPtr[0] = this._owner.is3DNode ? 0x1 : 0x0;
    this._dirtyPtr[0] |= RenderFlow.FLAG_LOCAL_TRANSFORM;
  },
  updateSkew: function updateSkew() {
    var skewPtr = this._skewPtr;
    var owner = this._owner;
    var skx = owner._skewX;
    var sky = owner._skewY;
    skewPtr[0] = skx;
    skewPtr[1] = sky;

    if (!this._isVisitingTraversal && (skx !== 0 || sky !== 0)) {
      this.switchTraverseToVisit();
      this._isVisitingTraversal = true;
    }
  }
});

},{}],49:[function(require,module,exports){
/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

var RenderFlow = cc.RenderFlow;
var LOCAL_TRANSFORM = RenderFlow.FLAG_LOCAL_TRANSFORM;
var COLOR = RenderFlow.FLAG_COLOR;
var UPDATE_RENDER_DATA = RenderFlow.FLAG_UPDATE_RENDER_DATA;
var POSITION_ON = 1 << 0;

cc.Node.prototype.setLocalDirty = function (flag) {
  this._localMatDirty |= flag;
  this._worldMatDirty = true;
  this._dirtyPtr[0] |= RenderFlow.FLAG_TRANSFORM;
};

cc.js.getset(cc.Node.prototype, "_renderFlag", function () {
  return this._dirtyPtr[0];
}, function (flag) {
  this._dirtyPtr[0] = flag;

  if (flag & UPDATE_RENDER_DATA || flag & COLOR) {
    cc.RenderFlow.register(this);
  }
});

cc.PrivateNode.prototype._posDirty = function (sendEvent) {
  var parent = this.parent;

  if (parent) {
    // Position correction for transform calculation
    this._trs[0] = this._originPos.x - (parent._anchorPoint.x - 0.5) * parent._contentSize.width;
    this._trs[1] = this._originPos.y - (parent._anchorPoint.y - 0.5) * parent._contentSize.height;
  }

  this.setLocalDirty(cc.Node._LocalDirtyFlag.POSITION);

  if (sendEvent === true && this._eventMask & POSITION_ON) {
    this.emit(cc.Node.EventType.POSITION_CHANGED);
  }
};

},{}],50:[function(require,module,exports){
"use strict";

/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
(function () {
  if (!cc.QuadBuffer) return;
  var QuadBuffer = cc.QuadBuffer.prototype;

  QuadBuffer._fillQuadBuffer = function () {
    var count = this._initIDataCount / 6;
    var buffer = this._iData;

    for (var i = 0, idx = 0; i < count; i++) {
      var vertextID = i * 4;
      buffer[idx++] = vertextID;
      buffer[idx++] = vertextID + 1;
      buffer[idx++] = vertextID + 2;
      buffer[idx++] = vertextID + 1;
      buffer[idx++] = vertextID + 3;
      buffer[idx++] = vertextID + 2;
    }
  };

  QuadBuffer._reallocBuffer = function () {
    this._reallocVData(true);

    this._reallocIData();

    this._fillQuadBuffer();

    this._updateVIDatas();
  }