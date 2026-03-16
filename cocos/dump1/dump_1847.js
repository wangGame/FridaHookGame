function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
TransformStreamError(stream, reason);
return Promise_resolve();
}
function TransformStreamDefaultSinkCloseAlgorithm(stream) {
const readable = stream[_readable];
const flushPromise = stream[_transformStreamController][_flushAlgorithm]();
return thenPromise(
flushPromise,
() => {
if (binding.IsReadableStreamErrored(readable)) {
throw binding.getReadableStreamStoredError(readable);
}
const readableController =
binding.getReadableStreamController(readable);
if (binding.ReadableStreamDefaultControllerCanCloseOrEnqueue(
readableController)) {
binding.ReadableStreamDefaultControllerClose(readableController);
}
},
r => {
TransformStreamError(stream, r);
throw binding.getReadableStreamStoredError(readable);
});
}
function TransformStreamDefaultSourcePullAlgorithm(stream) {
TransformStreamSetBackpressure(stream, false);
return stream[_backpressureChangePromise];
}
defineProperty(global, 'TransformStream', {
value: TransformStream,
enumerable: false,
configurable: true,
writable: true
});
binding.CreateTransformStream = CreateTransformStream;
});
