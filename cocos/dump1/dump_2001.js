function TransformStreamDefaultControllerTerminate(controller) {
const stream = controller[_controlledTransformStream];
const readableController =
binding.getReadableStreamController(stream[_readable]);
if (binding.ReadableStreamDefaultControllerCanCloseOrEnqueue(
readableController)) {
binding.ReadableStreamDefaultControllerClose(readableController);
}
const error = new TypeError(errStreamTerminated);
TransformStreamErrorWritableAndUnblockWrite(stream, error);
}
function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
const controller = stream[_transformStreamController];
if (stream[_backpressure]) {
const backpressureChangePromise = stream[_backpressureChangePromise];
return thenPromise(backpressureChangePromise, () => {
const writable = stream[_writable];
if (binding.isWritableStreamErroring(writable)) {
throw binding.getWritableStreamStoredError(writable);
}
return controller[_transformAlgorithm](chunk);
});
}
return controller[_transformAlgorithm](chunk);
}
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
