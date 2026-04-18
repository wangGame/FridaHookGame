function onDisable() {
      _onDisable.call(this);

      window.removeEventListener('orientationchange', this._adaptSafeAreaChangeWithThis);
      window.removeEventListener('safearea-change', this._updateAreaWithThis);
    },
    adaptSafeAreaChange: function adaptSafeAreaChange() {
  