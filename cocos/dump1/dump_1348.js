function expectIsType(id, value, type) {
    expect(
        typeof value == type, '[' + value + '] (' + id + ') is not a ' + type);
  }

  expect(!loadTimeData, 'should only include this file once');
  loadTimeData = new LoadTimeData;
})();
PK
