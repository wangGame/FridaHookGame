function IsTransformStream(x) {
return hasOwnPropertyNoThrow(x, _transformStreamController);
}
function TransformStreamError(stream, e) {
const readable = stream[_readable];
if (binding.IsReadableStreamReadable(readable)) {
binding.ReadableStreamDefaultControllerError(
binding.getReadableStreamController(readable), e);
}
TransformStreamErrorWritableAndUnblockWrite(stream, e);
}
function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
binding.WritableStreamDefaultControllerErrorIfNeeded(
binding.getWritableStreamController(stream[_writable]), e);
if (stream[_backpressure]) {
TransformStreamSetBackpressure(stream, false);
}
}
function TransformStreamSetBackpressure(stream, backpressure) {
if (stream[_backpressureChangePromise] !== undefined) {
resolvePromise(stream[_backpressureChangePromise], undefined);
}
stream[_backpressureChangePromise] = v8.createPromise();
stream[_backpressure] = backpressure;
}
class TransformStreamDefaultController {
constructor() {
throw new TypeError(streamErrors.illegalConstructor);
}
get desiredSize() {
if (!IsTransformStreamDefaultController(this)) {
throw new TypeError(streamErrors.illegalInvocation);
}
const readableController = binding.getReadableStreamController(
this[_controlledTransformStream][_readable]);
return binding.ReadableStreamDefaultControllerGetDesiredSize(
readableController);
}
enqueue(chunk) {
if (!IsTransformStreamDefaultController(this)) {
throw new TypeError(streamErrors.illegalInvocation);
}
TransformStreamDefaultControllerEnqueue(this, chunk);
}
error(reason) {
if (!IsTransformStreamDefaultController(this)) {
throw new TypeError(streamErrors.illegalInvocation);
}
TransformStreamDefaultControllerError(this, reason);
}
terminate() {
if (!IsTransformStreamDefaultController(this)) {
throw new TypeError(streamErrors.illegalInvocation);
}
TransformStreamDefaultControllerTerminate(this);
}
}
const TransformStreamDefaultController_prototype =
TransformStreamDefaultController.prototype;
function IsTransformStreamDefaultController(x) {
return hasOwnPropertyNoThrow(x, _controlledTransformStream);
}
function SetUpTransformStreamDefaultController(
stream, controller, transformAlgorithm, flushAlgorithm) {
controller[_controlledTransformStream] = stream;
stream[_transformStreamController] = controller;
controller[_transformAlgorithm] = transformAlgorithm;
controller[_flushAlgorithm] = flushAlgorithm;
}
function SetUpTransformStreamDefaultControllerFromTransformer(
stream, transformer) {
const controller = ObjectCreate(TransformStreamDefaultController_prototype);
let transformAlgorithm;
const transformMethod = transformer.transform;
if (transformMethod !== undefined) {
if (typeof transformMethod !== 'function') {
throw new TypeError('transformer.transform is not a function');
}
transformAlgorithm = chunk => {
const transformPromise =
PromiseCall2(transformMethod, transformer, chunk, controller);
return thenPromise(transformPromise, undefined, e => {
TransformStreamError(stream, e);
throw e;
});
};
} else {
transformAlgorithm = chunk => {
try {
TransformStreamDefaultControllerEnqueue(controller, chunk);
return Promise_resolve();
} catch (resultValue) {
return Promise_reject(resultValue);
}
};
}
const flushAlgorithm = CreateAlgorithmFromUnderlyingMethodPassingController(
transformer, 'flush', 0, controller, 'transformer.flush');
SetUpTransformStreamDefaultController(
stream, controller, transformAlgorithm, flushAlgorithm);
}
function TransformStreamDefaultControllerEnqueue(controller, chunk) {
const stream = controller[_controlledTransformStream];
const readableController =
binding.getReadableStreamController(stream[_readable]);
if (!binding.ReadableStreamDefaultControllerCanCloseOrEnqueue(
readableController)) {
throw binding.getReadableStreamEnqueueError(stream[_readable]);
}
try {
binding.ReadableStreamDefaultControllerEnqueue(readableController, chunk);
} catch (e) {
TransformStreamErrorWritableAndUnblockWrite(stream, e);
throw binding.getReadableStreamStoredError(stream[_readable]);
}
const backpressure = binding.ReadableStreamDefaultControllerHasBackpressure(
readableController);
if (backpressure !== stream[_backpressure]) {
TransformStreamSetBackpressure(stream, true);
}
}
function TransformStreamDefaultControllerError(controller, e) {
TransformStreamError(controller[_controlledTransformStream], e);
}
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
