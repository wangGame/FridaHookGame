function(replacements) {
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
