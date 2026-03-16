function(global, binding, v8) {
'use strict';
const _backpressure = v8.createPrivateSymbol('[[backpressure]]');
const _backpressureChangePromise =
v8.createPrivateSymbol('[[backpressureChangePromise]]');
const _readable = v8.createPrivateSymbol('[[readable]]');
const _transformStreamController =
v8.createPrivateSymbol('[[transformStreamController]]');
const _writable = v8.createPrivateSymbol('[[writable]]');
const _controlledTransformStream =
v8.createPrivateSymbol('[[controlledTransformStream]]');
const _flushAlgorithm = v8.createPrivateSymbol('[[flushAlgorithm]]');
const _transformAlgorithm = v8.createPrivateSymbol('[[transformAlgorithm]]');
const defineProperty = global.Object.defineProperty;
const ObjectCreate = global.Object.create;
const TypeError = global.TypeError;
const RangeError = global.RangeError;
const Promise = global.Promise;
const thenPromise = v8.uncurryThis(Promise.prototype.then);
const Promise_resolve = Promise.resolve.bind(Promise);
const Promise_reject = Promise.reject.bind(Promise);
const {
hasOwnPropertyNoThrow,
resolvePromise,
CreateAlgorithmFromUnderlyingMethodPassingController,
CallOrNoop1,
MakeSizeAlgorithmFromSizeFunction,
PromiseCall2,
ValidateAndNormalizeHighWaterMark
} = binding.streamOperations;
const streamErrors = binding.streamErrors;
const errStreamTerminated = 'The transform stream has been terminated';
let useCounted = false;
class TransformStream {
constructor(transformer = {},
writableStrategy = {}, readableStrategy = {}) {
if (!useCounted) {
binding.countUse('TransformStreamConstructor');
useCounted = true;
}
const readableType = transformer.readableType;
if (readableType !== undefined) {
throw new RangeError(streamErrors.invalidType);
}
const writableType = transformer.writableType;
if (writableType !== undefined) {
throw new RangeError(streamErrors.invalidType);
}
const writableSizeFunction = writableStrategy.size;
const writableSizeAlgorithm =
MakeSizeAlgorithmFromSizeFunction(writableSizeFunction);
let writableHighWaterMark = writableStrategy.highWaterMark;
if (writableHighWaterMark === undefined) {
writableHighWaterMark = 1;
}
writableHighWaterMark =
ValidateAndNormalizeHighWaterMark(writableHighWaterMark);
const readableSizeFunction = readableStrategy.size;
const readableSizeAlgorithm =
MakeSizeAlgorithmFromSizeFunction(readableSizeFunction);
let readableHighWaterMark = readableStrategy.highWaterMark;
if (readableHighWaterMark === undefined) {
readableHighWaterMark = 0;
}
readableHighWaterMark =
ValidateAndNormalizeHighWaterMark(readableHighWaterMark);
const startPromise = v8.createPromise();
InitializeTransformStream(
this, startPromise, writableHighWaterMark, writableSizeAlgorithm,
readableHighWaterMark, readableSizeAlgorithm);
SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
const startResult = CallOrNoop1(
transformer, 'start', this[_transformStreamController],
'transformer.start');
resolvePromise(startPromise, startResult);
}
get readable() {
if (!IsTransformStream(this)) {
throw new TypeError(streamErrors.illegalInvocation);
}
return this[_readable];
}
get writable() {
if (!IsTransformStream(this)) {
throw new TypeError(streamErrors.illegalInvocation);
}
return this[_writable];
}
}
const TransformStream_prototype = TransformStream.prototype;
function CreateTransformStream(
startAlgorithm, transformAlgorithm, flushAlgorithm, writableHighWaterMark,
writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
if (writableHighWaterMark === undefined) {
writableHighWaterMark = 1;
}
if (writableSizeAlgorithm === undefined) {
writableSizeAlgorithm = () => 1;
}
if (readableHighWaterMark === undefined) {
readableHighWaterMark = 0;
}
if (readableSizeAlgorithm === undefined) {
readableSizeAlgorithm = () => 1;
}
const stream = ObjectCreate(TransformStream_prototype);
const startPromise = v8.createPromise();
InitializeTransformStream(
stream, startPromise, writableHighWaterMark, writableSizeAlgorithm,
readableHighWaterMark, readableSizeAlgorithm);
const controller = ObjectCreate(TransformStreamDefaultController_prototype);
SetUpTransformStreamDefaultController(
stream, controller, transformAlgorithm, flushAlgorithm);
const startResult = startAlgorithm();
resolvePromise(startPromise, startResult);
return stream;
}
function InitializeTransformStream(
stream, startPromise, writableHighWaterMark, writableSizeAlgorithm,
readableHighWaterMark, readableSizeAlgorithm) {
const startAlgorithm = () => startPromise;
const writeAlgorithm = chunk =>
TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
const abortAlgorithm = reason =>
TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
const closeAlgorithm = () =>
TransformStreamDefaultSinkCloseAlgorithm(stream);
stream[_writable] = binding.CreateWritableStream(
startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm,
writableHighWaterMark, writableSizeAlgorithm);
const pullAlgorithm = () =>
TransformStreamDefaultSourcePullAlgorithm(stream);
const cancelAlgorithm = reason => {
TransformStreamErrorWritableAndUnblockWrite(stream, reason);
return Promise_resolve(undefined);
};
stream[_readable] = binding.CreateReadableStream(
startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark,
readableSizeAlgorithm, false);
stream[_backpressure] = undefined;
stream[_backpressureChangePromise] = undefined;
TransformStreamSetBackpressure(stream, true);
stream[_transformStreamController] = undefined;
}
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
