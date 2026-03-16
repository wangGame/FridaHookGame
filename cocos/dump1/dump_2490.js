function () {
  if (!cc.TiledMap) return;
  var RenderFlow = cc.RenderFlow; // tiled layer

  var TiledLayer = cc.TiledLayer.prototype;
  var _addUserNode = TiledLayer.addUserNode;

  TiledLayer.addUserNode = function (node) {
    var result = _addUserNode.call(this, node);

    if (result) {
      var proxy = node._proxy;
      proxy && proxy.enableVisit(false);
    }
  };

  var _removeUserNode = TiledLayer.removeUserNode;

  TiledLayer.removeUserNode = function (node) {
    var result = _removeUserNode.call(this, node);

    if (result) {
      var proxy = node._proxy;
      proxy && proxy.enableVisit(true);
    }
  }; // override _buildMaterial to upload hash value to native


  var _buildMaterial = TiledLayer._buildMaterial;

  TiledLayer._buildMaterial = function (tilesetIdx) {
    var material = _buildMaterial.call(this, tilesetIdx);

    if (material) material.getHash();
  }; // tiledmap buffer


  var TiledMapBuffer = cc.TiledMapBuffer.prototype;

  TiledMapBuffer._updateOffset = function () {
    var offsetInfo = this._offsetInfo;
    offsetInfo.vertexOffset = this.vertexOffset;
    offsetInfo.indiceOffset = this.indiceOffset;
    offsetInfo.byteOffset = this.byteOffset;
  }; // tiledmap render data list


  var TiledMapRenderDataList = cc.TiledMapRenderDataList.prototype;

  TiledMapRenderDataList._pushRenderData = function () {
    var renderData = {};
    renderData.ia = {};
    renderData.nodesRenderList = [];

    this._dataList.push(renderData);
  };

  TiledMapRenderDataList.reset = function () {
    this._offset = 0;
    var assembler = this._nativeAssembler;
    assembler._effect.length = 0;
    assembler.reset();
  };

  TiledMapRenderDataList.setNativeAssembler = function (assembler) {
    this._nativeAssembler = assembler;
  };

  TiledMapRenderDataList.popRenderData = function (buffer) {
    if (this._offset >= this._dataList.length) {
      this._pushRenderData();
    }

    var renderData = this._dataList[this._offset];
    renderData.nodesRenderList.length = 0;

    this._nativeAssembler.clearNodes(this._offset);

    var ia = renderData.ia;
    ia._meshIndex = buffer.getCurMeshIndex();
    ia._start = buffer.indiceOffset;
    ia._count = 0;
    ia._verticesStart = buffer.vertexOffset;
    ia._index = this._offset;
    this._offset++;
    return renderData;
  };

  TiledMapRenderDataList.pushNodesList = function (renderData, nodesList) {
    var nodesRenderList = renderData.nodesRenderList;
    nodesRenderList.push(nodesList);
    var nativeNodes = [];

    for (var j = 0; j < nodesRenderList.length; j++) {
      var _nodesList = nodesRenderList[j];
      if (!_nodesList) continue;

      for (var idx = 0; idx < _nodesList.length; idx++) {
        var dataComp = _nodesList[idx];
        if (!dataComp) continue;
        nativeNodes.push(dataComp.node._id);
      }
    }

    this._nativeAssembler.updateNodes(renderData.ia._index, nativeNodes);
  };

  var ModelBatcherDelegate = cc.Class({
    ctor: function ctor() {
      this._nativeAssembler = null;
    },
    setNativeAssembler: function setNativeAssembler(assembler) {
      this._nativeAssembler = assembler;
    },
    setBuffer: function setBuffer(buffer) {
      this._buffer = buffer;
    },
    _flushIA: function _flushIA(ia) {
      var iaIndex = ia._index;
      var meshIndex = ia._meshIndex;

      this._nativeAssembler.updateMeshIndex(iaIndex, meshIndex);

      var verticesStart = ia._verticesStart;
      var verticesOffset = this._buffer.vertexOffset;
      var vertexCount = verticesOffset - verticesStart;

      this._nativeAssembler.updateVerticesRange(iaIndex, verticesStart, vertexCount);

      this._nativeAssembler.updateIndicesRange(iaIndex, ia._start, ia._count);

      this._nativeAssembler.updateMaterial(iaIndex, this.material);
    },
    _flush: function _flush() {}
  });
  var TiledMapAssembler = cc.TiledLayer.__assembler__.prototype;
  var _fillBuffers = TiledMapAssembler.fillBuffers;
  cc.js.mixin(TiledMapAssembler, {
    _extendNative: function _extendNative() {
      renderer.TiledMapAssembler.prototype.ctor.call(this);
    },
    // override _updateRenderData function avoid base class cover material
    _updateRenderData: function _updateRenderData() {
      if (!this._renderComp || !this._renderComp.isValid) return;
      this.updateRenderData(this._renderComp);
    },
    updateRenderData: function updateRenderData(comp) {
      if (!comp._modelBatcherDelegate) {
        comp._buffer = new cc.TiledMapBuffer(null, cc.gfx.VertexFormat.XY_UV_Color);
        comp._renderDataList = new cc.TiledMapRenderDataList();
        comp._modelBatcherDelegate = new ModelBatcherDelegate();

        comp._buffer.setNativeAssembler(this);

        comp._renderDataList.setNativeAssembler(this);

        comp._modelBatcherDelegate.setBuffer(comp._buffer);

        comp._modelBatcherDelegate.setNativeAssembler(this);
      }

      _fillBuffers.call(this, comp, comp._modelBatcherDelegate);

      comp.node._renderFlag |= RenderFlow.FLAG_UPDATE_RENDER_DATA;
    }
  }, renderer.TiledMapAssembler.prototype);
})();

},{}],45:[function(require,module,exports){
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
var nativeCameraProto = renderer.Camera.prototype;
var _setNode = nativeCameraProto.setNode;
cc.js.mixin(nativeCameraProto, {
  setNode: function setNode(node) {
    this._persistentNode = node;

    _setNode.call(this, node);
  }
});

},{}],46:[function(require,module,exports){
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
var nativeLightProto = renderer.Light.prototype;
var _setNode = nativeLightProto.setNode;
cc.js.mixin(nativeLightProto, {
  setNode: function setNode(node) {
    this._node = node;

    _setNode.call(this, node);
  }
});

},{}],47:[function(require,module,exports){
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
  if (!cc.MeshBuffer) return;
  var MeshBuffer = cc.MeshBuffer.prototype;

  MeshBuffer.init = function (batcher, vertexFormat) {
    this.byteOffset = 0;
    this.indiceOffset = 0;
    this.vertexOffset = 0;
    this._vertexFormat = vertexFormat;
    this._vertexBytes = this._vertexFormat._bytes;
    this._vDatas = [];
    this._uintVDatas = [];
    this._iDatas = [];
    this._arrOffset = 0;
    this._vData = null;
    this._uintVData = null;
    this._iData = null;
    this._initVDataCount = 256 * vertexFormat._bytes; // actually 256 * 4 * (vertexFormat._bytes / 4)

    this._initIDataCount = 256 * 6;
    this._offsetInfo = {
      byteOffset: 0,
      vertexOffset: 0,
      indiceOffset: 0
    };
    this._renderDataList = new renderer.RenderDataList();

    this._reallocBuffer();
  };

  MeshBuffer.setNativeAssembler = function (assembler) {
    if (assembler !== this._nativeAssembler) {
      this._nativeAssembler = assembler;
      assembler.setRenderDataList(this._renderDataList);
    }
  };

  MeshBuffer._updateVIDatas = function () {
    var offset = this._arrOffset;
    this._vDatas[offset] = this._vData;
    this._uintVDatas[offset] = this._uintVData;
    this._iDatas[offset] = this._iData;

    this._renderDataList.updateMesh(offset, this._vData, this._iData);
  };

  MeshBuffer.getNativeAssembler = function () {
    return this._nativeAssembler;
  };

  MeshBuffer.getCurMeshIndex = function () {
    return this._arrOffset;
  };

  MeshBuffer.uploadData = function () {};

  MeshBuffer.switchBuffer = function () {
    var offset = ++this._arrOffset;
    this.byteOffset = 0;
    this.vertexOffset = 0;
    this.indiceOffset = 0;

    if (offset < this._vDatas.length) {
      this._vData = this._vDatas[offset];
      this._uintVData = this._uintVDatas[offset];
      this._iData = this._iDatas[offset];
    } else {
      this._reallocBuffer();
    }
  };

  MeshBuffer.checkAndSwitchBuffer = function (vertexCount) {
    if (this.vertexOffset + vertexCount > 65535) {
      this.switchBuffer();
      if (!this._nativeAssembler) return;
      this._nativeAssembler.updateIADatas && this._nativeAssembler.updateIADatas(this._arrOffset, this._arrOffset);
    }
  };

  MeshBuffer.used = function (vertexCount, indiceCount) {
    if (!this._nativeAssembler) return;

    this._nativeAssembler.updateVerticesRange(this._arrOffset, 0, vertexCount);

    this._nativeAssembler.updateIndicesRange(this._arrOffset, 0, indiceCount);
  };

  MeshBuffer.request = function (vertexCount, indiceCount) {
    this.requestStatic(vertexCount, indiceCount);
    return this._offsetInfo;
  };

  MeshBuffer._reallocBuffer = function () {
    this._reallocVData(true);

    this._reallocIData(true);

    this._updateVIDatas();
  };

  MeshBuffer._reallocVData = function (copyOldData) {
    var oldVData;

    if (this._vData) {
      oldVData = new Uint8Array(this._vData.buffer);
    }

    this._vData = new Float32Array(this._initVDataCount);
    this._uintVData = new Uint32Array(this._vData.buffer);
    var newData = new Uint8Array(this._uintVData.buffer);

    if (oldVData && copyOldData) {
      for (var i = 0, l = oldVData.length; i < l; i++) {
        newData[i] = oldVData[i];
      }
    }
  };

  MeshBuffer._reallocIData = function (copyOldData) {
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