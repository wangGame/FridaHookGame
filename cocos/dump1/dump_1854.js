function isArrayBuffer(value) {
  try {
    byteLengthGetter.call(value);
    return true;
  } catch (e) { // TODO: remove useless binding
    return false;
  }
}

function throwForDisallowedKey(key) {
  if (!isAllowedAsAKey(key)) {
    throw new DOMException("The given value is not allowed as a key", "DataError");
  }
}

function zip(a, b) {
  const result = [];
  for (let i = 0; i < a.length; ++i) {
    result.push([a[i], b[i]]);
  }

  return result;
}

function deleteDatabase(name) {
  return new Promise((resolve, reject) => {
    const request = self.indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
import {VirtualList} from './virtual-list.js';

/** Properties */
const _items = Symbol();
const _list = Symbol();
const _newChild = Symbol();
const _updateChild = Symbol();
const _recycleChild = Symbol();
const _itemKey = Symbol();
const _grid = Symbol();
const _horizontal = Symbol();
const _pendingRender = Symbol();
/** Functions */
const _render = Symbol();
const _scheduleRender = Symbol();

// Lazily loaded Layout classes.
const dynamicImports = {};
const importLayoutClass = async (url) => {
  if (!dynamicImports[url]) {
    dynamicImports[url] = import(url).then(module => module.default);
  }
  return await dynamicImports[url];
};

export class VirtualListElement extends HTMLElement {
  constructor() {
    super();
    this[_items] = null;
    this[_list] = null;
    this[_newChild] = null;
    this[_updateChild] = null;
    this[_recycleChild] = null;
    this[_itemKey] = null;
    this[_grid] = false;
    this[_horizontal] = false;
    this[_pendingRender] = null;
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({mode: 'open'}).innerHTML = `
<style>
  :host {
    display: block;
    position: relative;
    contain: strict;
  }
  ::slotted(*) {
    box-sizing: border-box;
    max-width: 100%;
    max-height: 100%;
  }
</style>
<slot></slot>`;
    }
    this[_scheduleRender]();
  }

  static get observedAttributes() {
    return ['layout'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'layout') {
      this.layout = newVal;
    }
  }

  get newChild() {
    return this[_newChild];
  }
  set newChild(fn) {
    this[_newChild] = fn;
    this[_scheduleRender]();
  }

  get updateChild() {
    return this[_updateChild];
  }
  set updateChild(fn) {
    this[_updateChild] = fn;
    this[_scheduleRender]();
  }

  get recycleChild() {
    return this[_recycleChild];
  }
  set recycleChild(fn) {
    this[_recycleChild] = fn;
    this[_scheduleRender]();
  }

  get itemKey() {
    return this[_itemKey];
  }
  set itemKey(fn) {
    this[_itemKey] = fn;
    this[_scheduleRender]();
  }

  get layout() {
    const prefix = this[_horizontal] ? 'horizontal' : 'vertical';
    const suffix = this[_grid] ? '-grid' : '';
    return prefix + suffix;
  }
  set layout(layout) {
    this[_horizontal] = layout && layout.startsWith('horizontal');
    this[_grid] = layout && layout.endsWith('-grid');
    this[_scheduleRender]();
  }

  get items() {
    return this[_items];
  }
  set items(items) {
    this[_items] = items;
    this[_scheduleRender]();
  }

  requestReset() {
    if (this[_list]) {
      this[_list].requestReset();
    }
  }

  [_scheduleRender]() {
    if (!this[_pendingRender]) {
      this[_pendingRender] = Promise.resolve().then(() => {
        this[_pendingRender] = null;
        this[_render]();
      });
    }
  }

  async[_render]() {
    if (!this.newChild) {
      return;
    }
    // Delay init to first connected as list needs to measure
    // sizes of container and children.
    if (!this[_list] && !this.isConnected) {
      return;
    }

    if (!this[_list]) {
      this[_list] = new VirtualList({container: this});
    }
    const list = this[_list];

    const {newChild, updateChild, recycleChild, itemKey, items} = this;
    Object.assign(list, {newChild, updateChild, recycleChild, itemKey, items});

    const Layout = await importLayoutClass(
        this[_grid] ? './layouts/layout-1d-grid.js' : './layouts/layout-1d.js');
    const direction = this[_horizontal] ? 'horizontal' : 'vertical';
    if (list.layout instanceof Layout === false ||
        list.layout.direction !== direction) {
      list.layout = new Layout({direction});
    }
  }
}
customElements.define('virtual-list', VirtualListElement);export default class Layout extends EventTarget {
  constructor(config) {
    super();

    this._physicalMin = 0;
    this._physicalMax = 0;

    this._first = -1;
    this._last = -1;

    this._latestCoords = {left: 0, top: 0};

    this._itemSize = {width: 100, height: 100};
    this._spacing = 0;

    this._virtualScroll = false;

    this._sizeDim = 'height';
    this._secondarySizeDim = 'width';
    this._positionDim = 'top';
    this._secondaryPositionDim = 'left';
    this._direction = 'vertical';

    this._scrollPosition = 0;
    this._viewportSize = {width: 0, height: 0};
    this._totalItems = 0;

    this._scrollSize = 1;

    this._overhang = 150;

    Object.assign(this, config);
  }

  // public properties

  set virtualScroll(bool) {
    this._virtualScroll = bool;
  }

  get virtualScroll() {
    return this._virtualScroll;
  }

  set spacing(px) {
    if (px !== this._spacing) {
      this._spacing = px;
      this._scheduleReflow();
    }
  }

  get spacing() {
    return this._spacing;
  }

  set itemSize(dims) {
    const {_itemDim1, _itemDim2} = this;
    Object.assign(this._itemSize, dims);
    if (_itemDim1 !== this._itemDim1 || _itemDim2 !== this._itemDim2) {
      if (_itemDim2 !== this._itemDim2) {
        this._itemDim2Changed();
      } else {
        this._scheduleReflow();
      }
    }
  }

  _itemDim2Changed() {
    // Override
  }

  get _delta() {
    return this._itemDim1 + this._spacing;
  }

  get _itemDim1() {
    return this._itemSize[this._sizeDim];
  }

  get _itemDim2() {
    return this._itemSize[this._secondarySizeDim];
  }

  get itemSize() {
    return this._itemSize;
  }

  set direction(dir) {
    // Force it to be either horizontal or vertical.
    dir = (dir === 'horizontal') ? dir : 'vertical';
    if (dir !== this._direction) {
      this._direction = dir;
      this._sizeDim = (dir === 'horizontal') ? 'width' : 'height';
      this._secondarySizeDim = (dir === 'horizontal') ? 'height' : 'width';
      this._positionDim = (dir === 'horizontal') ? 'left' : 'top';
      this._secondaryPositionDim = (dir === 'horizontal') ? 'top' : 'left';
      this._scheduleReflow();
    }
  }

  get direction() {
    return this._direction;
  }

  set viewportSize(dims) {
    const {_viewDim1, _viewDim2} = this;
    Object.assign(this._viewportSize, dims);
    if (_viewDim1 !== this._viewDim1 || _viewDim2 !== this._viewDim2) {
      if (_viewDim2 !== this._viewDim2) {
        this._viewDim2Changed();
      } else {
        this._checkThresholds();
      }
    }
  }

  _viewDim2Changed() {
    // Override
  }

  get _viewDim1() {
    return this._viewportSize[this._sizeDim];
  }

  get _viewDim2() {
    return this._viewportSize[this._secondarySizeDim];
  }

  get viewportSize() {
    return this._viewportSize;
  }

  set totalItems(num) {
    if (num !== this._totalItems) {
      this._totalItems = num;
      this._maxIdx = num - 1;
      this._scheduleReflow();
    }
  }

  get totalItems() {
    return this._totalItems;
  }

  // private properties

  get _num() {
    if (this._first === -1 || this._last === -1) {
      return 0;
    }
    return this._last - this._first + 1;
  }

  // public methods

  scrollTo(coords) {
    this._latestCoords = coords;
    this._scroll();
  }

  //

  _scroll() {
    this._scrollPosition = this._latestCoords[this._positionDim];

    this._checkThresholds();
  }

  _getActiveItems() {
    // Override
  }

  // TODO: Does this need to be public?
  _reflow() {
    const {_first, _last, _scrollSize} = this;

    this._updateScrollSize();
    this._getActiveItems();

    if (this._scrollSize !== _scrollSize) {
      this._emitScrollSize();
    }

    if (this._first === -1 && this._last === -1) {
      this._emitRange();
    } else if (
        this._first !== _first || this._last !== _last ||
        this._spacingChanged) {
      this._emitRange();
      this._emitChildPositions();
    }
    this._pendingReflow = null;
  }

  _scheduleReflow() {
    if (!this._pendingReflow) {
      this._pendingReflow = Promise.resolve().then(() => this._reflow());
    }
  }

  _updateScrollSize() {
    // Ensure we have at least 1px - this allows getting at least 1 item to be
    // rendered.
    this._scrollSize = Math.max(1, this._totalItems * this._delta);
  }

  _checkThresholds() {
    if (this._viewDim1 === 0 && this._num > 0) {
      this._scheduleReflow();
    } else {
      const min = Math.max(0, this._scrollPosition - this._overhang);
      const max = Math.min(
          this._scrollSize,
          this._scrollPosition + this._viewDim1 + this._overhang);
      if (this._physicalMin > min || this._physicalMax < max) {
        this._scheduleReflow();
      }
    }
  }

  ///

  _emitRange(inProps) {
    const detail = Object.assign(
        {
          first: this._first,
          last: this._last,
          num: this._num,
          stable: true,
        },
        inProps);
    this.dispatchEvent(new CustomEvent('rangechange', {detail}));
  }

  _emitScrollSize() {
    const detail = {
      [this._sizeDim]: this._scrollSize,
    };
    this.dispatchEvent(new CustomEvent('scrollsizechange', {detail}));
  }

  _emitScrollError() {
    if (this._scrollError) {
      const detail = {
        [this._positionDim]: this._scrollError,
        [this._secondaryPositionDim]: 0,
      };
      this.dispatchEvent(new CustomEvent('scrollerrorchange', {detail}));
      this._scrollError = 0;
    }
  }

  _emitChildPositions() {
    const detail = {};
    for (let idx = this._first; idx <= this._last; idx++) {
      detail[idx] = this._getItemPosition(idx);
    }
    this.dispatchEvent(new CustomEvent('itempositionchange', {detail}));
  }

  _getItemPosition(idx) {
    // Override.
  }
}import Layout1dBase from './layout-1d-base.js';

export default class Layout extends Layout1dBase {
  constructor(config) {
    super(config);
    this._rolumns = 1;
  }

  updateItemSizes(sizes) {
    // Assume all items have the same size.
    const size = Object.values(sizes)[0];
    if (size) {
      this.itemSize = size;
    }
  }

  _viewDim2Changed() {
    this._defineGrid();
  }

  _itemDim2Changed() {
    this._defineGrid();
  }

  _getActiveItems() {
    const {_scrollPosition, _scrollSize} = this;

    const min = Math.max(0, this._scrollPosition - this._overhang);
    const max = Math.min(
        this._scrollSize,
        this._scrollPosition + this._viewDim1 + this._overhang);
    const firstCow = Math.floor(min / this._delta);
    const lastCow = Math.ceil(max / this._delta) - 1;

    this._first = firstCow * this._rolumns;
    this._last =
        Math.min(((lastCow + 1) * this._rolumns) - 1, this._totalItems);
    this._physicalMin = this._delta * firstCow;
    this._physicalMax = this._delta * (lastCow + 1);
  }

  _getItemPosition(idx) {
    return {
      [this._positionDim]: Math.floor(idx / this._rolumns) * this._delta,
          [this._secondaryPositionDim]: this._spacing +
          ((idx % this._rolumns) * (this._spacing + this._itemDim2))
    }
  }


  _defineGrid() {
    const {_spacing} = this;
    this._rolumns = Math.max(1, Math.floor(this._viewDim2 / this._itemDim2));
    if (this._rolumns > 1) {
      this._spacing = (this._viewDim2 % (this._rolumns * this._itemDim2)) /
          (this._rolumns + 1);
    }
    this._spacingChanged = !(_spacing === this._spacing);
    this._scheduleReflow();
  }

  _updateScrollSize() {
    this._scrollSize =
        Math.max(1, Math.ceil(this._totalItems / this._rolumns) * this._delta);
  }
}import Layout1dBase from './layout-1d-base.js';

export default class Layout extends Layout1dBase {
  constructor(config) {
    super(config);
    this._physicalItems = new Map();
    this._newPhysicalItems = new Map();

    this._metrics = new Map();

    this._anchorIdx = null;
    this._anchorPos = null;
    this._scrollError = 0;
    this._stable = true;

    this._needsRemeasure = false;

    this._nMeasured = 0;
    this._tMeasured = 0;

    this._estimate = true;
  }

  updateItemSizes(sizes) {
    Object.keys(sizes).forEach((key) => {
      const metrics = sizes[key], mi = this._getMetrics(key),
            prevSize = mi[this._sizeDim];

      // TODO(valdrin) Handle margin collapsing.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing
      mi.width = metrics.width + (metrics.marginLeft || 0) +
          (metrics.marginRight || 0);
      mi.height = metrics.height + (metrics.marginTop || 0) +
          (metrics.marginBottom || 0);

      const size = mi[this._sizeDim];
      const item = this._getPhysicalItem(Number(key));
      if (item) {
        let delta;

        if (size !== undefined) {
          item.size = size;
          if (prevSize === undefined) {
            delta = size;
            this._nMeasured++;
          } else {
            delta = size - prevSize;
          }
        }
        this._tMeasured = this._tMeasured + delta;
      } else {
        // console.debug(`Could not find physical item for key ${key}`);
      }
    });
    if (!this._nMeasured) {
      console.warn(`No items measured yet.`);
    } else {
      this._updateItemSize();
      this._scheduleReflow();
    }
  }

  _updateItemSize() {
    this._itemSize[this._sizeDim] = this._tMeasured / this._nMeasured;
  }

  //

  _getMetrics(idx) {
    return (this._metrics[idx] = this._metrics[idx] || {});
  }

  _getPhysicalItem(idx) {
    return this._newPhysicalItems.get(idx) || this._physicalItems.get(idx);
  }

  _getSize(idx) {
    const item = this._getPhysicalItem(idx);
    return item && item.size;
  }

  _getPosition(idx) {
    const item = this._physicalItems.get(idx);
    return item ? item.pos : (idx * (this._delta)) + this._spacing;
  }

  _calculateAnchor(lower, upper) {
    if (lower === 0) {
      return 0;
    }
    if (upper > this._scrollSize - this._viewDim1) {
      return this._maxIdx;
    }
    return Math.max(
        0,
        Math.min(
            this._maxIdx, Math.floor(((lower + upper) / 2) / this._delta)));
  }

  _setAnchor(lower, upper) {
    if (this._physicalItems.size === 0) {
      return this._calculateAnchor(lower, upper);
    }
    if (this._first < 0) {
      console.error('_setAnchor: negative _first');
      return this._calculateAnchor(lower, upper);
    }
    if (this._last < 0) {
      console.error('_setAnchor: negative _last');
      return this._calculateAnchor(lower, upper);
    }

    const firstItem = this._getPhysicalItem(this._first),
          lastItem = this._getPhysicalItem(this._last),
          firstMin = firstItem.pos, firstMax = firstMin + firstItem.size,
          lastMin = lastItem.pos, lastMax = lastMin + lastItem.size;

    if (lastMax < lower) {
      // Window is entirely past physical items, calculate new anchor
      return this._calculateAnchor(lower, upper);
    }
    if (firstMin > upper) {
      // Window is entirely before physical items, calculate new anchor
      return this._calculateAnchor(lower, upper);
    }
    if (firstMin >= lower || firstMax >= lower) {
      // First physical item overlaps window, choose it
      return this._first;
    }
    if (lastMax <= upper || lastMin <= upper) {
      // Last physical overlaps window, choose it
      return this._last;
    }
    // Window contains a physical item, but not the first or last
    let maxIdx = this._last, minIdx = this._first;

    while (true) {
      let candidateIdx = Math.round((maxIdx + minIdx) / 2),
          candidate = this._physicalItems.get(candidateIdx),
          cMin = candidate.pos, cMax = cMin + candidate.size;

      if ((cMin >= lower && cMin <= upper) ||
          (cMax >= lower && cMax <= upper)) {
        return candidateIdx;
      } else if (cMax < lower) {
        minIdx = candidateIdx + 1;
      } else if (cMin > upper) {
        maxIdx = candidateIdx - 1;
      }
    }
  }

  _getActiveItems() {
    if (this._viewDim1 === 0 || this._totalItems === 0) {
      this._clearItems();
    } else {
      const upper = Math.min(
          this._scrollSize,
          this._scrollPosition + this._viewDim1 + this._overhang),
            lower = Math.max(0, upper - this._viewDim1 - (2 * this._overhang));

      this._getItems(lower, upper);
    }
  }

  _clearItems() {
    this._first = -1;
    this._last = -1;
    this._physicalMin = 0;
    this._physicalMax = 0;
    const items = this._newPhysicalItems;
    this._newPhysicalItems = this._physicalItems;
    this._newPhysicalItems.clear();
    this._physicalItems = items;
    this._stable = true;
  }

  _getItems(lower, upper) {
    const items = this._newPhysicalItems;

    if (this._anchorIdx === null || this._anchorPos === null) {
      this._anchorIdx = this._setAnchor(lower, upper);
      this._anchorPos = this._getPosition(this._anchorIdx);
    }

    let anchorSize = this._getSize(this._anchorIdx);
    if (anchorSize === undefined) {
      anchorSize = this._itemDim1;
    }

    let anchorErr = 0;

    if (this._anchorPos + anchorSize + this._spacing < lower) {
      anchorErr = lower - (this._anchorPos + anchorSize + this._spacing);
    }

    if (this._anchorPos > upper) {
      anchorErr = upper - this._anchorPos;
    }

    if (anchorErr) {
      this._scrollPosition -= anchorErr;
      lower -= anchorErr;
      upper -= anchorErr;
      this._scrollError += anchorErr;
    }

    items.set(this._anchorIdx, {pos: this._anchorPos, size: anchorSize});

    this._first = (this._last = this._anchorIdx);
    this._physicalMin = (this._physicalMax = this._anchorPos);

    this._stable = true;

    while (this._physicalMin > lower && this._first > 0) {
      let size = this._getSize(--this._first);
      if (size === undefined) {
        this._stable = false;
        size = this._itemDim1;
      }
      const pos = (this._physicalMin -= size + this._spacing);
      items.set(this._first, {pos, size});
      if (this._stable === false && this._estimate === false) {
        break;
      }
    }

    while (this._physicalMax < upper && this._last < this._totalItems) {
      let size = this._getSize(this._last);
      if (size === undefined) {
        this._stable = false;
        size = this._itemDim1;
      }
      items.set(this._last++, {pos: this._physicalMax, size});
      if (this._stable === false && this._estimate === false) {
        break;
      } else {
        this._physicalMax += size + this._spacing;
      }
    }

    this._last--;

    const extentErr = this._calculateError();
    if (extentErr) {
      this._physicalMin -= extentErr;
      this._physicalMax -= extentErr;
      this._anchorPos -= extentErr;
      this._scrollPosition -= extentErr;
      items.forEach(item => item.pos -= extentErr);
      this._scrollError += extentErr;
    }

    if (this._stable) {
      this._newPhysicalItems = this._physicalItems;
      this._newPhysicalItems.clear();
      this._physicalItems = items;
    }
  }

  _calculateError() {
    if (this._first === 0) {
      return this._physicalMin;
    } else if (this._physicalMin <= 0) {
      return this._physicalMin - (this._first * this._delta);
    } else if (this._last === this._maxIdx) {
      return this._physicalMax - this._scrollSize;
    } else if (this._physicalMax >= this._scrollSize) {
      return (
          (this._physicalMax - this._scrollSize) +
          ((this._maxIdx - this._last) * this._delta));
    }
    return 0;
  }

  // TODO: Can this be made to inherit from base, with proper hooks?
  _reflow() {
    const {_first, _last, _scrollSize} = this;

    this._updateScrollSize();
    this._getActiveItems();

    if (this._scrollSize !== _scrollSize) {
      this._emitScrollSize();
    }

    if (this._first === -1 && this._last === -1) {
      this._emitRange();
      this._resetReflowState();
    } else if (
        this._first !== _first || this._last !== _last ||
        this._needsRemeasure) {
      this._emitRange();
      this._emitScrollError();
      this._emitChildPositions();
    } else {
      this._emitRange();
      this._emitScrollError();
      this._emitChildPositions();
      this._resetReflowState();
    }
    this._pendingReflow = null;
  }

  _resetReflowState() {
    this._anchorIdx = null;
    this._anchorPos = null;
    this._stable = true;
  }

  _getItemPosition(idx) {
    return {
      [this._positionDim]: this._getPosition(idx),
          [this._secondaryPositionDim]: 0
    }
  }

  _viewDim2Changed() {
    this._needsRemeasure = true;
    this._scheduleReflow();
  }

  _emitRange() {
    const remeasure = this._needsRemeasure;
    const stable = this._stable;
    this._needsRemeasure = false;
    super._emitRange({remeasure, stable});
  }
}
import {Repeats} from './virtual-repeater.js';

export class RangeChangeEvent extends Event {
  constructor(type, init) {
    super(type, init);
    this._first = Math.floor(init.first || 0);
    this._last = Math.floor(init.last || 0);
  }
  get first() {
    return this._first;
  }
  get last() {
    return this._last;
  }
}

export const RepeatsAndScrolls = Superclass => class extends Repeats
(Superclass) {
  constructor(config) {
    super();
    this._num = 0;
    this._first = -1;
    this._last = -1;
    this._prevFirst = -1;
    this._prevLast = -1;

    this._pendingUpdateView = null;
    this._isContainerVisible = false;
    this._containerElement = null;

    if (config) {
      Object.assign(this, config);
    }
  }

  get container() {
    return this._container;
  }
  set container(container) {
    if (container === this._container) {
      return;
    }

    removeEventListener('scroll', this);
    removeEventListener('resize', this);

    super.container = container;

    if (container) {
      addEventListener('scroll', this);
      addEventListener('resize', this);
      this._scheduleUpdateView();
    }

    // Update the containerElement, copy min-width/height styles to new
    // container.
    let containerStyle = null;
    if (this._containerElement) {
      containerStyle = this._containerElement.getAttribute('style');
      this._containerElement.removeAttribute('style');
    }
    // Consider document fragments as shadowRoots.
    this._containerElement =
        (container && container.nodeType === Node.DOCUMENT_FRAGMENT_NODE) ?
        container.host :
        container;

    if (this._containerElement && containerStyle) {
      this._containerElement.setAttribute('style', containerStyle);
    }
  }

  get layout() {
    return this._layout;
  }
  set layout(layout) {
    if (layout === this._layout) {
      return;
    }

    if (this._layout) {
      this._measureCallback = null;
      this._layout.removeEventListener('scrollsizechange', this);
      this._layout.removeEventListener('scrollerrorchange', this);
      this._layout.removeEventListener('itempositionchange', this);
      this._layout.removeEventListener('rangechange', this);
      // Remove min-width/height from containerElement so
      // layout can get correct viewport size.
      if (this._containerElement) {
        this._containerElement.removeAttribute('style');
        this.requestRemeasure();
      }
    }

    this._layout = layout;

    if (this._layout) {
      if (typeof this._layout.updateItemSizes === 'function') {
        this._measureCallback = this._layout.updateItemSizes.bind(this._layout);
      }
      this._layout.addEventListener('scrollsizechange', this);
      this._layout.addEventListener('scrollerrorchange', this);
      this._layout.addEventListener('itempositionchange', this);
      this._layout.addEventListener('rangechange', this);
      this._scheduleUpdateView();
    }
  }

  requestReset() {
    super.requestReset();
    this._scheduleUpdateView();
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleEvent(event) {
    switch (event.type) {
      case 'scroll':
      case 'resize':
        this._scheduleUpdateView();
        break;
      case 'scrollsizechange':
        this._sizeContainer(event.detail);
        break;
      case 'scrollerrorchange':
        this._correctScrollError(event.detail);
        break;
      case 'itempositionchange':
        this._positionChildren(event.detail);
        break;
      case 'rangechange':
        this._adjustRange(event.detail);
        break;
      default:
        console.warn('event not handled', event);
    }
  }

  // Rename _ordered to _kids?
  /**
   * @protected
   */
  get _kids() {
    return this._ordered;
  }
  /**
   * @private
   */
  _scheduleUpdateView() {
    if (!this._pendingUpdateView && this._container && this._layout) {
      this._pendingUpdateView =
          Promise.resolve().then(() => this._updateView());
    }
  }
  /**
   * @private
   */
  _updateView() {
    this._pendingUpdateView = null;

    this._layout.totalItems = this._items ? this._items.length : 0;

    const listBounds = this._containerElement.getBoundingClientRect();
    // Avoid updating viewport if container is not visible.
    this._isContainerVisible = Boolean(
        listBounds.width || listBounds.height || listBounds.top ||
        listBounds.left);
    if (!this._isContainerVisible) {
      return;
    }

    const scrollerWidth = window.innerWidth;
    const scrollerHeight = window.innerHeight;
    const xMin = Math.max(0, Math.min(scrollerWidth, listBounds.left));
    const yMin = Math.max(0, Math.min(scrollerHeight, listBounds.top));
    const xMax = this._layout.direction === 'vertical' ?
        Math.max(0, Math.min(scrollerWidth, listBounds.right)) :
        scrollerWidth;
    const yMax = this._layout.direction === 'vertical' ?
        scrollerHeight :
        Math.max(0, Math.min(scrollerHeight, listBounds.bottom));
    const width = xMax - xMin;
    const height = yMax - yMin;
    this._layout.viewportSize = {width, height};

    const left = Math.max(0, -listBounds.x);
    const top = Math.max(0, -listBounds.y);
    this._layout.scrollTo({top, left});
  }
  /**
   * @private
   */
  _sizeContainer(size) {
    const style = this._containerElement.style;
    style.minWidth = size.width ? size.width + 'px' : null;
    style.minHeight = size.height ? size.height + 'px' : null;
  }
  /**
   * @private
   */
  async _positionChildren(pos) {
    await Promise.resolve();
    const kids = this._kids;
    Object.keys(pos).forEach(key => {
      const idx = key - this._first;
      const child = kids[idx];
      if (child) {
        const {top, left} = pos[key];
        // console.debug(`_positionChild #${this._container.id} > #${child.id}:
        // top ${top}`);
        child.style.position = 'absolute';
        child.style.transform = `translate(${left}px, ${top}px)`;
      }
    });
  }
  /**
   * @private
   */
  _adjustRange(range) {
    this.num = range.num;
    this.first = range.first;
    this._incremental = !(range.stable);
    if (range.remeasure) {
      this.requestRemeasure();
    } else if (range.stable) {
      this._notifyStable();
    }
  }
  /**
   * @protected
   */
  _shouldRender() {
    return Boolean(
        this._isContainerVisible && this._layout && super._shouldRender());
  }
  /**
   * @private
   */
  _correctScrollError(err) {
    window.scroll(window.scrollX - err.left, window.scrollY - err.top);
  }
  /**
   * @protected
   */
  _notifyStable() {
    const {first, num} = this;
    const last = first + num;
    this._container.dispatchEvent(
        new RangeChangeEvent('rangechange', {first, last}));
  }
};

export const VirtualList = RepeatsAndScrolls(class {});
export const Repeats = Superclass => class extends Superclass {
  constructor(config) {
    super();

    this._newChildFn = null;
    this._updateChildFn = null;
    this._recycleChildFn = null;
    this._itemKeyFn = null;

    this._measureCallback = null;

    this._items = null;
    // Consider renaming this. firstVisibleIndex?
    this._first = 0;
    // Consider renaming this. count? visibleElements?
    this._num = Infinity;

    this.__incremental = false;

    // used only internally..
    // legacy from 1st approach to preact integration
    this._manageDom = true;
    // used to check if it is more perf if you don't care of dom order?
    this._maintainDomOrder = true;

    this._last = 0;
    this._prevFirst = 0;
    this._prevLast = 0;

    this._needsReset = false;
    this._needsRemeasure = false;
    this._pendingRender = null;

    // Contains child nodes in the rendered order.
    this._ordered = [];
    // this._pool = [];
    this._active = new Map();
    this._prevActive = new Map();
    // Both used for recycling purposes.
    this._keyToChild = new Map();
    this._childToKey = new WeakMap();
    // Used to keep track of measures by index.
    this._indexToMeasure = {};

    if (config) {
      Object.assign(this, config);
    }
  }

  // API

  get container() {
    return this._container;
  }
  set container(container) {
    if (container === this._container) {
      return;
    }
    if (this._container) {
      // Remove children from old container.
      this._ordered.forEach((child) => this._removeChild(child));
    }

    this._container = container;

    if (container) {
      // Insert children in new container.
      this._ordered.forEach((child) => this._insertBefore(child, null));
    } else {
      this._ordered.length = 0;
      this._active.clear();
      this._prevActive.clear();
    }
    this.requestReset();
  }

  get newChild() {
    return this._newChildFn;
  }
  set newChild(fn) {
    if (fn !== this._newChildFn) {
      this._newChildFn = fn;
      this._keyToChild.clear();
      this.requestReset();
    }
  }

  get updateChild() {
    return this._updateChildFn;
  }
  set updateChild(fn) {
    if (fn !== this._updateChildFn) {
      this._updateChildFn = fn;
      this.requestReset();
    }
  }

  get recycleChild() {
    return this._recycleChildFn;
  }
  set recycleChild(fn) {
    if (fn !== this._recycleChildFn) {
      this._recycleChildFn = fn;
      this.requestReset();
    }
  }

  get itemKey() {
    return this._itemKeyFn;
  }
  set itemKey(fn) {
    if (fn !== this._itemKeyFn) {
      this._itemKeyFn = fn;
      this._keyToChild.clear();
      this.requestReset();
    }
  }

  get first() {
    return this._first;
  }

  set first(idx) {
    if (typeof idx === 'number') {
      const len = this._items ? this._items.length : 0;
      const newFirst = Math.max(0, Math.min(idx, len - this._num));
      if (newFirst !== this._first) {
        this._first = newFirst;
        this._scheduleRender();
      }
    }
  }

  get num() {
    return this._num;
  }

  set num(n) {
    if (typeof n === 'number') {
      if (n !== this._num) {
        this._num = n;
        this.first = this._first;
        this._scheduleRender();
      }
    }
  }

  get items() {
    return this._items;
  }

  set items(arr) {
    if (arr !== this._items) {
      this._items = arr;
      this.first = this._first;
      this.requestReset();
    }
  }

  get _incremental() {
    return this.__incremental;
  }

  set _incremental(inc) {
    if (inc !== this.__incremental) {
      this.__incremental = inc;
      this._scheduleRender();
    }
  }

  requestReset() {
    this._needsReset = true;
    this._scheduleRender();
  }

  requestRemeasure() {
    this._needsRemeasure = true;
    this._scheduleRender();
  }

  // Core functionality

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
