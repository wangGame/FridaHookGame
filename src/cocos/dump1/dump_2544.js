function (scene, dt) {
  var camera = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  _rendering = true;
  RenderFlow.validateRenderers();

  for (var i = 0, l = _dirtyTargets.length; i < l; i++) {
    var node = _dirtyTargets[i];
    node._inJsbDirtyList = false;
    var comp = node._renderComponent;
    if (!comp) continue;
    var assembler = comp._assembler;
    if (!assembler) continue;
    var flag = node._dirtyPtr[0];

    if (flag & RenderFlow.FLAG_UPDATE_RENDER_DATA) {
      node._dirtyPtr[0] &= ~RenderFlow.FLAG_UPDATE_RENDER_DATA;
      assembler._updateRenderData && assembler._updateRenderData();
    }

    if (flag & RenderFlow.FLAG_COLOR) {
      node._dirtyPtr[0] &= ~RenderFlow.FLAG_COLOR;
      comp._updateColor && comp._updateColor();
    }
  }

  _dirtyTargets.length = 0;
  dt = dt || 0;

  this._nativeFlow.render(scene._proxy, dt, camera);

  _dirtyTargets = _dirtyWaiting.slice(0);
  _dirtyWaiting.length = 0;
  _rendering = false;
};

RenderFlow.renderCamera = function (camera, scene) {
  RenderFlow.ren