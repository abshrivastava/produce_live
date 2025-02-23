(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.wpjs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(_dereq_,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":4}],3:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(_dereq_,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = _dereq_('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BufferController = function () {
    function BufferController() {
        _classCallCheck(this, BufferController);

        this._videoTrack = { type: 'video', id: 1, sequenceNumber: 0, samples: [], length: 0 };
        this._audioTrack = { type: 'audio', id: 2, sequenceNumber: 0, samples: [], length: 0 };

        this._emitter = new _events2.default();
    }

    _createClass(BufferController, [{
        key: 'on',
        value: function on(event, listener) {
            this._emitter.addListener(event, listener);
        }

        // prototype: function(type: string, metadata: any): void

    }, {
        key: 'appendVideoSample',


        /* prototype: function _appendVideoBuffer(videoBuffer: sample): void
           sample: {
               units: unit[],
               length: Number,
               isKeyframe: boolean,
               dts: Number,
               cts: Number,
               pts: Number,
               duration: duration
           }
           unit: {
               type: Number,
               data: TypedArray (Uint8Array)
           }
        */
        value: function appendVideoSample(sample) {
            /* Track: {
                   type: string,
                   id: Number,
                   sequenceNumber,
                   samples: sample[],
                   length: Number
               }
            */
            var track = this._videoTrack;
            // console.log(sample);
            track.samples.push(sample);
            track.length += sample.length;

            this._onSample(this._audioTrack, track);
        }
    }, {
        key: 'appendAudioSample',
        value: function appendAudioSample(sample) {
            /* Track: {
                   type: string,
                   id: Number,
                   sequenceNumber,
                   samples: sample[],
                   length: Number
               }
            */
            var track = this._audioTrack;
            // console.log(sample);
            track.samples.push(sample);
            track.length += sample.length;

            this._onSample(track, this._videoTrack);
        }
    }, {
        key: 'onSample',
        get: function get() {
            return this._onSample;
        },
        set: function set(callback) {
            this._onSample = callback;
        }
    }]);

    return BufferController;
}();

exports.default = BufferController;

},{"events":3}],6:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MediaInfo = exports.MediaInfo = function () {
    function MediaInfo() {
        _classCallCheck(this, MediaInfo);

        this.mimeType = null;
        this.duration = null;

        this.hasAudio = null;
        this.hasVideo = null;
        this.audioCodec = null;
        this.videoCodec = null;
        this.audioDataRate = null;
        this.videoDataRate = null;

        this.audioSampleRate = null;
        this.audioChannelCount = null;

        this.width = null;
        this.height = null;
        this.fps = null;
        this.profile = null;
        this.level = null;
        this.chromaFormat = null;
        this.sarNum = null;
        this.sarDen = null;

        this.metadata = null;
        this.segments = null; // MediaInfo[]
        this.segmentCount = null;
        this.hasKeyframesIndex = null;
        this.keyframesIndex = null;
    }

    _createClass(MediaInfo, [{
        key: "isComplete",
        value: function isComplete() {
            var audioInfoComplete = this.hasAudio === false || this.hasAudio === true && this.audioCodec != null && this.audioSampleRate != null && this.audioChannelCount != null;

            var videoInfoComplete = this.hasVideo === false || this.hasVideo === true && this.videoCodec != null && this.width != null && this.height != null && this.fps != null && this.profile != null && this.level != null && this.chromaFormat != null && this.sarNum != null && this.sarDen != null;

            // keyframesIndex may not be present
            return this.mimeType != null && this.duration != null && this.metadata != null && this.hasKeyframesIndex != null && audioInfoComplete && videoInfoComplete;
        }
    }, {
        key: "isSeekable",
        value: function isSeekable() {
            return this.hasKeyframesIndex === true;
        }
    }, {
        key: "getNearestKeyframe",
        value: function getNearestKeyframe(milliseconds) {
            if (this.keyframesIndex == null) {
                return null;
            }

            var table = this.keyframesIndex;
            var keyframeIdx = this._search(table.times, milliseconds);

            return {
                index: keyframeIdx,
                milliseconds: table.times[keyframeIdx],
                fileposition: table.filepositions[keyframeIdx]
            };
        }
    }, {
        key: "_search",
        value: function _search(list, value) {
            var idx = 0;

            var last = list.length - 1;
            var mid = 0;
            var lbound = 0;
            var ubound = last;

            if (value < list[0]) {
                idx = 0;
                lbound = ubound + 1; // skip search
            }

            while (lbound <= ubound) {
                mid = lbound + Math.floor((ubound - lbound) / 2);
                if (mid === last || value >= list[mid] && value < list[mid + 1]) {
                    idx = mid;
                    break;
                } else if (list[mid] < value) {
                    lbound = mid + 1;
                } else {
                    ubound = mid - 1;
                }
            }

            return idx;
        }
    }]);

    return MediaInfo;
}();

// Represents an media sample (audio / video)


var SampleInfo = exports.SampleInfo = function SampleInfo(dts, pts, duration, originalDts, isSync) {
    _classCallCheck(this, SampleInfo);

    this.dts = dts;
    this.pts = pts;
    this.duration = duration;
    this.originalDts = originalDts;
    this.isSyncPoint = isSync;
    this.fileposition = null;
};

// Media Segment concept is defined in Media Source Extensions spec.
// Particularly in ISO BMFF format, an Media Segment contains a moof box followed by a mdat box.


var MediaSegmentInfo = exports.MediaSegmentInfo = function () {
    function MediaSegmentInfo() {
        _classCallCheck(this, MediaSegmentInfo);

        this.beginDts = 0;
        this.endDts = 0;
        this.beginPts = 0;
        this.endPts = 0;
        this.originalBeginDts = 0;
        this.originalEndDts = 0;
        this.syncPoints = []; // SampleInfo[n], for video IDR frames only
        this.firstSample = null; // SampleInfo
        this.lastSample = null; // SampleInfo
    }

    _createClass(MediaSegmentInfo, [{
        key: "appendSyncPoint",
        value: function appendSyncPoint(sampleInfo) {
            // also called Random Access Point
            sampleInfo.isSyncPoint = true;
            this.syncPoints.push(sampleInfo);
        }
    }]);

    return MediaSegmentInfo;
}();

// Ordered list for recording video IDR frames, sorted by originalDts


var IDRSampleList = exports.IDRSampleList = function () {
    function IDRSampleList() {
        _classCallCheck(this, IDRSampleList);

        this._list = [];
    }

    _createClass(IDRSampleList, [{
        key: "clear",
        value: function clear() {
            this._list = [];
        }
    }, {
        key: "appendArray",
        value: function appendArray(syncPoints) {
            var list = this._list;

            if (syncPoints.length === 0) {
                return;
            }

            if (list.length > 0 && syncPoints[0].originalDts < list[list.length - 1].originalDts) {
                this.clear();
            }

            Array.prototype.push.apply(list, syncPoints);
        }
    }, {
        key: "getLastSyncPointBeforeDts",
        value: function getLastSyncPointBeforeDts(dts) {
            if (this._list.length == 0) {
                return null;
            }

            var list = this._list;
            var idx = 0;
            var last = list.length - 1;
            var mid = 0;
            var lbound = 0;
            var ubound = last;

            if (dts < list[0].dts) {
                idx = 0;
                lbound = ubound + 1;
            }

            while (lbound <= ubound) {
                mid = lbound + Math.floor((ubound - lbound) / 2);
                if (mid === last || dts >= list[mid].dts && dts < list[mid + 1].dts) {
                    idx = mid;
                    break;
                } else if (list[mid].dts < dts) {
                    lbound = mid + 1;
                } else {
                    ubound = mid - 1;
                }
            }
            return this._list[idx];
        }
    }]);

    return IDRSampleList;
}();

// Data structure for recording information of media segments in single track.


var MediaSegmentInfoList = exports.MediaSegmentInfoList = function () {
    function MediaSegmentInfoList(type) {
        _classCallCheck(this, MediaSegmentInfoList);

        this._type = type;
        this._list = [];
        this._lastAppendLocation = -1; // cached last insert location
    }

    _createClass(MediaSegmentInfoList, [{
        key: "isEmpty",
        value: function isEmpty() {
            return this._list.length === 0;
        }
    }, {
        key: "clear",
        value: function clear() {
            this._list = [];
            this._lastAppendLocation = -1;
        }
    }, {
        key: "_searchNearestSegmentBefore",
        value: function _searchNearestSegmentBefore(originalBeginDts) {
            var list = this._list;
            if (list.length === 0) {
                return -2;
            }
            var last = list.length - 1;
            var mid = 0;
            var lbound = 0;
            var ubound = last;

            var idx = 0;

            if (originalBeginDts < list[0].originalBeginDts) {
                idx = -1;
                return idx;
            }

            while (lbound <= ubound) {
                mid = lbound + Math.floor((ubound - lbound) / 2);
                if (mid === last || originalBeginDts > list[mid].lastSample.originalDts && originalBeginDts < list[mid + 1].originalBeginDts) {
                    idx = mid;
                    break;
                } else if (list[mid].originalBeginDts < originalBeginDts) {
                    lbound = mid + 1;
                } else {
                    ubound = mid - 1;
                }
            }
            return idx;
        }
    }, {
        key: "_searchNearestSegmentAfter",
        value: function _searchNearestSegmentAfter(originalBeginDts) {
            return this._searchNearestSegmentBefore(originalBeginDts) + 1;
        }
    }, {
        key: "append",
        value: function append(mediaSegmentInfo) {
            var list = this._list;
            var msi = mediaSegmentInfo;
            var lastAppendIdx = this._lastAppendLocation;
            var insertIdx = 0;

            if (lastAppendIdx !== -1 && lastAppendIdx < list.length && msi.originalBeginDts >= list[lastAppendIdx].lastSample.originalDts && (lastAppendIdx === list.length - 1 || lastAppendIdx < list.length - 1 && msi.originalBeginDts < list[lastAppendIdx + 1].originalBeginDts)) {
                insertIdx = lastAppendIdx + 1; // use cached location idx
            } else {
                if (list.length > 0) {
                    insertIdx = this._searchNearestSegmentBefore(msi.originalBeginDts) + 1;
                }
            }

            this._lastAppendLocation = insertIdx;
            this._list.splice(insertIdx, 0, msi);
        }
    }, {
        key: "getLastSegmentBefore",
        value: function getLastSegmentBefore(originalBeginDts) {
            var idx = this._searchNearestSegmentBefore(originalBeginDts);
            if (idx >= 0) {
                return this._list[idx];
            } else {
                // -1
                return null;
            }
        }
    }, {
        key: "getLastSampleBefore",
        value: function getLastSampleBefore(originalBeginDts) {
            var segment = this.getLastSegmentBefore(originalBeginDts);
            if (segment != null) {
                return segment.lastSample;
            } else {
                return null;
            }
        }
    }, {
        key: "getLastSyncPointBefore",
        value: function getLastSyncPointBefore(originalBeginDts) {
            var segmentIdx = this._searchNearestSegmentBefore(originalBeginDts);
            var syncPoints = this._list[segmentIdx].syncPoints;
            while (syncPoints.length === 0 && segmentIdx > 0) {
                segmentIdx--;
                syncPoints = this._list[segmentIdx].syncPoints;
            }
            if (syncPoints.length > 0) {
                return syncPoints[syncPoints.length - 1];
            } else {
                return null;
            }
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "length",
        get: function get() {
            return this._list.length;
        }
    }]);

    return MediaSegmentInfoList;
}();

},{}],7:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = _dereq_('events');

var _events2 = _interopRequireDefault(_events);

var _logger = _dereq_('../../utils/logger');

var _mediaInfo = _dereq_('../media-info');

var _timer = _dereq_('../../utils/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Media Source Extensions controller
var MSEController = function () {
    function MSEController(config) {
        _classCallCheck(this, MSEController);

        this.TAG = 'MSEController';

        this._config = config;
        this._emitter = new _events2.default();

        if (this._config.isLive && this._config.autoCleanupSourceBuffer == undefined) {
            // For live stream, do auto cleanup by default
            this._config.autoCleanupSourceBuffer = true;
        }

        this.e = {
            onSourceOpen: this._onSourceOpen.bind(this),
            onSourceEnded: this._onSourceEnded.bind(this),
            onSourceClose: this._onSourceClose.bind(this),
            onSourceBufferError: this._onSourceBufferError.bind(this),
            onSourceBufferUpdateEnd: this._onSourceBufferUpdateEnd.bind(this)
        };

        this._mediaSource = null;
        this._mediaSourceObjectURL = null;
        this._mediaElement = null;

        this._isBufferFull = false;
        this._hasPendingEos = false;

        this._systemTime = 0;
        this._videoStartTime = 0;
        this._played = false;
        this._autoplayed = false;
        this._delay = this._config.preDelay !== undefined ? Number(this._config.preDelay) : 0;
        this._oldDelay = this._delay;
        this._newDelay = Number.NEGATIVE_INFINITY;
        this._delayIncre = false;
        this._currentTime = 0; // record time when delay increase
        this._bufferEnd = 0; // record buffered end when delay increase
        this._timer = null;
        this._timerAcc = this._config.timerAcc !== undefined ? Number(this._config.timerAcc) : 1;

        this._presetRTO = false;
        this._maxTimestampOffset = 1.5;
        this._minTimestampOffset = 0.7;
        this._origTimestampOffset = 0;
        this._refTimestampOffset = 0;
        this._determinedTO = false;

        this._requireSetMediaDuration = false;
        this._pendingMediaDuration = 0;

        this._pendingSourceBufferInit = [];
        this._mimeTypes = {
            video: null,
            audio: null
        };
        this._sourceBuffers = {
            video: null,
            audio: null
        };
        this._lastInitSegments = {
            video: null,
            audio: null
        };
        this._pendingSegments = {
            video: [],
            audio: []
        };
        this._pendingRemoveRanges = {
            video: [],
            audio: []
        };
        this._idrList = new _mediaInfo.IDRSampleList();
    }

    _createClass(MSEController, [{
        key: 'destroy',
        value: function destroy() {
            if (this._mediaElement || this._mediaSource) {
                this.detachMediaElement();
            }
            this.e = null;
            this._emitter.removeAllListeners();
            this._emitter = null;
        }
    }, {
        key: 'on',
        value: function on(event, listener) {
            this._emitter.addListener(event, listener);
        }
    }, {
        key: 'off',
        value: function off(event, listener) {
            this._emitter.removeListener(event, listener);
        }
    }, {
        key: 'attachMediaElement',
        value: function attachMediaElement(mediaElement) {
            if (this._mediaSource) {
                console.error('IllegalStateException: MSE Controller: MediaSource has been attached to an HTMLMediaElement!');
                return;
            }
            var ms = this._mediaSource = new window.MediaSource();
            ms.addEventListener('sourceopen', this.e.onSourceOpen);
            ms.addEventListener('sourceended', this.e.onSourceEnded);
            ms.addEventListener('sourceclose', this.e.onSourceClose);

            this._mediaElement = mediaElement;
            this._mediaSourceObjectURL = window.URL.createObjectURL(this._mediaSource);
            mediaElement.src = this._mediaSourceObjectURL;
        }
    }, {
        key: 'detachMediaElement',
        value: function detachMediaElement() {
            if (this._mediaSource) {
                var ms = this._mediaSource;
                for (var type in this._sourceBuffers) {
                    // pending segments should be discard
                    var ps = this._pendingSegments[type];
                    ps.splice(0, ps.length);
                    this._pendingSegments[type] = null;
                    this._pendingRemoveRanges[type] = null;
                    this._lastInitSegments[type] = null;

                    // remove all sourcebuffers
                    var sb = this._sourceBuffers[type];
                    if (sb) {
                        if (ms.readyState !== 'closed') {
                            ms.removeSourceBuffer(sb);
                            sb.removeEventListener('error', this.e.onSourceBufferError);
                            sb.removeEventListener('updateend', this.e.onSourceBufferUpdateEnd);
                        }
                        this._mimeTypes[type] = null;
                        this._sourceBuffers[type] = null;
                    }
                }
                if (ms.readyState === 'open') {
                    try {
                        ms.endOfStream();
                    } catch (error) {
                        _logger.Log.e(this.TAG, error.message);
                        // console.error('MSE Controller: ' + error.message);
                    }
                }
                ms.removeEventListener('sourceopen', this.e.onSourceOpen);
                ms.removeEventListener('sourceended', this.e.onSourceEnded);
                ms.removeEventListener('sourceclose', this.e.onSourceClose);
                this._pendingSourceBufferInit = [];
                this._isBufferFull = false;
                this._idrList.clear();
                this._mediaSource = null;
            }

            if (this._mediaElement) {
                this._mediaElement.src = '';
                this._mediaElement.removeAttribute('src');
                this._mediaElement = null;
            }
            if (this._mediaSourceObjectURL) {
                window.URL.revokeObjectURL(this._mediaSourceObjectURL);
                this._mediaSourceObjectURL = null;
            }
        }
    }, {
        key: 'appendInitSegment',
        value: function appendInitSegment(initSegment, deferred) {
            _logger.Log.i(this.TAG, 'Append Initialization segment');
            // console.log('mse controller: append initialization segment');

            if (!this._mediaSource || this._mediaSource.readyState !== 'open') {
                // sourcebuffer creation requires mediaSource.readyState === 'open'
                // so we defer the sourcebuffer creation, until sourceopen event triggered
                this._pendingSourceBufferInit.push(initSegment);
                // make sure that this InitSegment is in the front of pending segments queue
                this._pendingSegments[initSegment.type].push(initSegment);
                return;
            }

            var is = initSegment;
            var mimeType = '' + is.container;
            if (is.codec && is.codec.length > 0) {
                mimeType += ';codecs=' + is.codec;
            }

            var firstInitSegment = false;

            _logger.Log.v(this.TAG, 'Received Initialzation Segment, mimeType: ' + mimeType);
            // console.log('MSE Controller: Received Initialization Segment, mimeType: ' + mimeType);
            this._lastInitSegments[is.type] = is;

            if (mimeType !== this._mimeTypes[is.type]) {
                if (!this._mimeTypes[is.type]) {
                    // empty, first chance create sourcebuffer
                    firstInitSegment = true;
                    try {
                        var sb = this._sourceBuffers[is.type] = this._mediaSource.addSourceBuffer(mimeType);
                        sb.addEventListener('error', this.e.onSourceBufferError);
                        sb.addEventListener('updateend', this.e.onSourceBufferUpdateEnd);
                    } catch (error) {
                        _logger.Log.e(this.TAG, error.message);
                        // console.error('MSE Controller:' + error.message);
                        this._emitter.emit('error', { code: error.code, msg: error.message });
                        return;
                    }
                } else {
                    _logger.Log.v(this.TAG, 'Notice: ' + is.type + ' mimeType changed, origin: ' + this._mimeTypes[is.type] + ', target: ' + mimeType);
                    // console.log(`MSE Controller: Notice: ${is.type} mimeType changed, origin: ${this._mimeTypes[is.type]}, target: ${mimeType}`);
                }
                this._mimeTypes[is.type] = mimeType;
            }

            if (!deferred) {
                // deferred means this InitSegment has been pushed to pendingSegments queue
                this._pendingSegments[is.type].push(is);
            }
            if (!firstInitSegment) {
                // append immediately only if init segment in subsequence
                if (this._sourceBuffers[is.type] && !this._sourceBuffers[is.type].updating) {
                    this._doAppendSegments();
                }
            }
            // if (Browser.safari && is.container === 'audio/mpeg' && is.mediaDuration > 0) {
            //     // 'audio/mpeg' track under Safari may cause MediaElement's duration to be NaN
            //     // Manually correct MediaSource.duration to make progress bar seekable, and report right duration
            //     this._requireSetMediaDuration = true;
            //     this._pendingMediaDuration = is.mediaDuration / 1000;  // in seconds
            //     this._updateMediaSourceDuration();
            // }
        }
    }, {
        key: 'appendMediaSegment',
        value: function appendMediaSegment(mediaSegment) {
            var _this = this;

            // Log.i(this.TAG, 'Append media segment;');
            // console.log('mse controller: append media segment');

            var ms = mediaSegment;
            this._pendingSegments[ms.type].push(ms);

            var currentTime = this._mediaElement.currentTime;
            var currentTimeOffset = 0;
            var systemTime = -1;
            // console.log('current time: ' + currentTime);
            if (this._sourceBuffers[ms.type].buffered.length > 0 && this._config.isLive) {
                if (this._mediaElement.readyState >= 2 && this._mediaElement.paused && this._timer === null && !this._autoplayed) {
                    var playPromise = this._mediaElement.play();
                    if (playPromise !== undefined) {
                        playPromise.then(function (_) {
                            _this._autoplayed = true;
                            console.log('Video start.');
                            // Automatic playback started!
                            // Show playing UI.
                        }).catch(function (error) {
                            console.warn('Try to play later.');
                            // Auto-play was prevented
                            // Show paused UI.
                        });
                    }
                    if (!this._determinedTO && !this._presetRTO) {
                        this._systemTime = Date.now();
                        this._videoStartTime = currentTime;
                        _logger.Log.v(this.TAG, 'Video should start at ' + this._systemTime + ' and current position is ' + this._videoStartTime);
                        this._refTimestampOffset = this._origTimestampOffset;
                        _logger.Log.v(this.TAG, 'The original delay should be ' + this._origTimestampOffset * 1000 + 'ms');
                        if (this._refTimestampOffset < this._minTimestampOffset) {
                            this._refTimestampOffset = this._minTimestampOffset;
                        } else if (this._refTimestampOffset > this._maxTimestampOffset) {
                            this._refTimestampOffset = this._maxTimestampOffset;
                        }
                        this._determinedTO = true;
                        this._refTimestampOffset += this._delay / 1000;
                        _logger.Log.v(this.TAG, 'The reference timeoffset should be ' + this._refTimestampOffset * 1000 + 'ms, preset delay is ' + this._delay + 'ms');
                    }
                }
                if (currentTime === 0 && !this._played) {
                    this._origTimestampOffset = this._sourceBuffers[ms.type].buffered.end(0);
                    // console.log('reference timeoffset: ' + this._origTimestampOffset);
                } else if (!this._determinedTO && !this._presetRTO) {
                    this._systemTime = Date.now();
                    this._videoStartTime = currentTime;
                    _logger.Log.v(this.TAG, 'Video start at ' + this._systemTime + ' and current position is ' + this._videoStartTime);
                    this._refTimestampOffset = this._origTimestampOffset;
                    _logger.Log.v(this.TAG, 'The original delay is ' + this._origTimestampOffset * 1000 + 'ms');
                    if (this._refTimestampOffset < this._minTimestampOffset) {
                        this._refTimestampOffset = this._minTimestampOffset;
                    } else if (this._refTimestampOffset > this._maxTimestampOffset) {
                        this._refTimestampOffset = this._maxTimestampOffset;
                    }
                    this._determinedTO = true;
                    this._refTimestampOffset += this._delay / 1000;
                    _logger.Log.v(this.TAG, 'The reference timeoffset is ' + this._refTimestampOffset * 1000 + 'ms, preset delay is ' + this._delay + 'ms');
                }
                systemTime = Date.now();
                if (this._delay && !this._played && !this._delayIncre) {
                    if (this._sourceBuffers[ms.type].buffered.end(0) < this._refTimestampOffset) {
                        this._mediaElement.pause();
                        this._timer = new _timer2.default(this._delay, this._timerAcc);
                        this._timer.timeup = this._elementResume.bind(this);
                        this._played = true;
                        this._timer.start(systemTime);
                    }
                }

                currentTimeOffset = this._sourceBuffers[ms.type].buffered.end(0) - currentTime;
                // console.log(currentTime);
                if (systemTime - this._systemTime + (this._videoStartTime - this._refTimestampOffset) * 1000 > currentTime * 1000 + 200 && currentTimeOffset > this._refTimestampOffset + 0.1 && this._refTimestampOffset !== 0 && !this._delayIncre) {
                    // this._mediaElement.currentTime = this._sourceBuffers[ms.type].buffered.end(0) - this._refTimestampOffset + 0.1;
                    this._mediaElement.currentTime = (systemTime - this._systemTime - this._delay) / 1000 + this._videoStartTime;
                    // console.warn(`buffer end at ${this._sourceBuffers[ms.type].buffered.end(0)}, ref is ${this._refTimestampOffset}`);
                    // Log.w(this.TAG, `buffer end at ${this._sourceBuffers[ms.type].buffered.end(0)}, ref is ${this._refTimestampOffset}, change current time to ${this._mediaElement.currentTime}`);
                    // Log.w(this.TAG, `Change current time to ${this._mediaElement.currentTime}`);                
                }
                // console.log(ms.type + ': buffered from ' + this._sourceBuffers[ms.type].buffered.start(0) + ' to ' +  this._sourceBuffers[ms.type].buffered.end(0));
            }

            if (this._config.autoCleanupSourceBuffer && this._needCleanupSourceBuffer()) {
                this._doCleanupSourceBuffer();
            }

            var sb = this._sourceBuffers[ms.type];
            if (sb && !sb.updating && !this._hasPendingRemoveRanges()) {
                this._doAppendSegments();
            }
        }
    }, {
        key: 'changeDelay',
        value: function changeDelay(newDelay) {
            var decresent = false;
            var currentTime = this._mediaElement.currentTime;
            var jumpTo = 0;
            var newTimestampOffset = void 0;
            var sb = this._sourceBuffers;
            var systemTime = void 0;

            if (this._delay > newDelay) {
                jumpTo = currentTime + this._delay / 1000 - newDelay / 1000;
                newTimestampOffset = this._refTimestampOffset * 1000 - Number(this._delay) + Number(newDelay);
                _logger.Log.v(this.TAG, 'Change delay from ' + this._delay + 's to ' + newDelay + 's');
                _logger.Log.v(this.TAG, 'Change reference timesoffset from ' + this._refTimestampOffset * 1000 + 'ms to ' + newTimestampOffset + 'ms');
                this._refTimestampOffset = newTimestampOffset / 1000;
                this._mediaElement.currentTime = jumpTo;
                _logger.Log.w(this.TAG, 'Jump from ' + currentTime + 's to ' + jumpTo + 's');
                this._delay = newDelay;
            } else {
                this._delayIncre = true;
                this._mediaElement.pause();
                systemTime = Date.now();
                // console.warn(systemTime);
                this._oldDelay = this._delay;
                this._newDelay = newDelay;
                this._timer = new _timer2.default(this._newDelay - this._oldDelay, this._timerAcc);
                this._timer.timeup = this._elementResume.bind(this);
                _logger.Log.v(this.TAG, 'Change delay from ' + this._delay + 'ms to ' + this._newDelay + 'ms');
                this._delay = newDelay;
                newTimestampOffset = this._refTimestampOffset - this._oldDelay / 1000 + this._newDelay / 1000;
                _logger.Log.w(this.TAG, 'Change reference timeoffset from ' + this._refTimestampOffset * 1000 + 'ms to ' + newTimestampOffset * 1000 + 'ms');
                this._refTimestampOffset = newTimestampOffset;
                this._timer.start(systemTime, currentTime);
            }
        }
    }, {
        key: 'changeRefTSOffset',
        value: function changeRefTSOffset(stuckTimeOffset) {
            this._presetRTO = true;
            if (stuckTimeOffset < this._minTimestampOffset) {
                this._refTimestampOffset = this._delay / 1000 + this._minTimestampOffset;
            } else {
                this._refTimestampOffset = this._delay / 1000 + stuckTimeOffset;
            }
            this._systemTime = Date.now();
            this._videoStartTime = stuckTimeOffset;
            _logger.Log.v(this.TAG, 'Video start at ' + this._systemTime + ' and current position is ' + this._videoStartTime);
            _logger.Log.v(this.TAG, 'The original delay is ' + this._origTimestampOffset * 1000 + 'ms');
            _logger.Log.v(this.TAG, 'The reference timeoffset is ' + this._refTimestampOffset * 1000 + 'ms, preset delay is ' + this._delay + 'ms');
        }
    }, {
        key: 'seek',
        value: function seek(seconds) {
            // remove all appended buffers
            for (var type in this._sourceBuffers) {
                if (!this._sourceBuffers[type]) {
                    continue;
                }

                // abort current buffer append algorithm
                var sb = this._sourceBuffers[type];
                if (this._mediaSource.readyState === 'open') {
                    try {
                        // If range removal algorithm is running, InvalidStateError will be throwed
                        // Ignore it.
                        sb.abort();
                    } catch (error) {
                        _logger.Log.e(this.TAG, error.message);
                        // console.error('MSE Controller: ' + error.message);
                    }
                }

                // IDRList should be clear
                this._idrList.clear();

                // pending segments should be discard
                var ps = this._pendingSegments[type];
                ps.splice(0, ps.length);

                if (this._mediaSource.readyState === 'closed') {
                    // Parent MediaSource object has been detached from HTMLMediaElement
                    continue;
                }

                // record ranges to be remove from SourceBuffer
                for (var i = 0; i < sb.buffered.length; i++) {
                    var start = sb.buffered.start(i);
                    var end = sb.buffered.end(i);
                    this._pendingRemoveRanges[type].push({ start: start, end: end });
                }

                // if sb is not updating, let's remove ranges now!
                if (!sb.updating) {
                    this._doRemoveRanges();
                }

                // Safari 10 may get InvalidStateError in the later appendBuffer() after SourceBuffer.remove() call
                // Internal parser's state may be invalid at this time. Re-append last InitSegment to workaround.
                // Related issue: https://bugs.webkit.org/show_bug.cgi?id=159230
                // if (Browser.safari) {
                //     let lastInitSegment = this._lastInitSegments[type];
                //     if (lastInitSegment) {
                //         this._pendingSegments[type].push(lastInitSegment);
                //         if (!sb.updating) {
                //             this._doAppendSegments();
                //         }
                //     }
                // }
            }
        }
    }, {
        key: 'endOfStream',
        value: function endOfStream() {
            var ms = this._mediaSource;
            var sb = this._sourceBuffers;
            if (!ms || ms.readyState !== 'open') {
                if (ms && ms.readyState === 'closed' && this._hasPendingSegments()) {
                    // If MediaSource hasn't turned into open state, and there're pending segments
                    // Mark pending endOfStream, defer call until all pending segments appended complete
                    this._hasPendingEos = true;
                }
                return;
            }
            if (sb.video && sb.video.updating || sb.audio && sb.audio.updating) {
                // If any sourcebuffer is updating, defer endOfStream operation
                // See _onSourceBufferUpdateEnd()
                this._hasPendingEos = true;
            } else {
                this._hasPendingEos = false;
                // Notify media data loading complete
                // This is helpful for correcting total duration to match last media segment
                // Otherwise MediaElement's ended event may not be triggered
                ms.endOfStream();
            }
        }
    }, {
        key: 'getNearestKeyframe',
        value: function getNearestKeyframe(dts) {
            return this._idrList.getLastSyncPointBeforeDts(dts);
        }
    }, {
        key: '_elementResume',
        value: function _elementResume() {
            // console.warn(this._mediaElement.currentTime);
            // this._mediaElement.currentTime -= error / 1000;
            this._mediaElement.play();
            // Log.w(this.TAG, 'media element resume to play');
            if (this._timer) {
                this._timer.stop();
                // Log.w(this.TAG, `Timer stop at ${Date.now()}`);
                this._timer = null;
            }
            this._delayIncre = false;
        }
    }, {
        key: '_needCleanupSourceBuffer',
        value: function _needCleanupSourceBuffer() {
            if (!this._config.autoCleanupSourceBuffer) {
                return false;
            }

            var currentTime = this._mediaElement.currentTime;

            for (var type in this._sourceBuffers) {
                var sb = this._sourceBuffers[type];
                if (sb) {
                    var buffered = sb.buffered;
                    if (buffered.length >= 1) {
                        if (currentTime - buffered.start(0) >= this._config.autoCleanupMaxBackwardDuration) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }
    }, {
        key: '_doCleanupSourceBuffer',
        value: function _doCleanupSourceBuffer() {
            var currentTime = this._mediaElement.currentTime;

            for (var type in this._sourceBuffers) {
                var sb = this._sourceBuffers[type];
                if (sb) {
                    var buffered = sb.buffered;
                    var doRemove = false;

                    for (var i = 0; i < buffered.length; i++) {
                        var start = buffered.start(i);
                        var end = buffered.end(i);

                        if (start <= currentTime && currentTime < end + 3) {
                            // padding 3 seconds
                            if (currentTime - start >= this._config.autoCleanupMaxBackwardDuration) {
                                doRemove = true;
                                var removeEnd = currentTime - this._config.autoCleanupMinBackwardDuration;
                                this._pendingRemoveRanges[type].push({ start: start, end: removeEnd });
                            }
                        } else if (end < currentTime) {
                            doRemove = true;
                            this._pendingRemoveRanges[type].push({ start: start, end: end });
                        }
                    }

                    if (doRemove && !sb.updating) {
                        this._doRemoveRanges();
                    }
                }
            }
        }
    }, {
        key: '_updateMediaSourceDuration',
        value: function _updateMediaSourceDuration() {
            var sb = this._sourceBuffers;
            if (this._mediaElement.readyState === 0 || this._mediaSource.readyState !== 'open') {
                return;
            }
            if (sb.video && sb.video.updating || sb.audio && sb.audio.updating) {
                return;
            }

            var current = this._mediaSource.duration;
            var target = this._pendingMediaDuration;

            if (target > 0 && (isNaN(current) || target > current)) {
                _logger.Log.v(this.TAG, 'Update MediaSource duration from ' + current + ' to ' + target);
                // console.log(`MSE Controller: Update MediaSource duration from ${current} to ${target}`);
                this._mediaSource.duration = target;
            }

            this._requireSetMediaDuration = false;
            this._pendingMediaDuration = 0;
        }
    }, {
        key: '_doRemoveRanges',
        value: function _doRemoveRanges() {
            for (var type in this._pendingRemoveRanges) {
                if (!this._sourceBuffers[type] || this._sourceBuffers[type].updating) {
                    continue;
                }
                var sb = this._sourceBuffers[type];
                var ranges = this._pendingRemoveRanges[type];
                while (ranges.length && !sb.updating) {
                    var range = ranges.shift();
                    sb.remove(range.start, range.end);
                    // console.log(`Remove range from ${range.start} to ${range.end}`);
                }
            }
        }
    }, {
        key: '_doAppendSegments',
        value: function _doAppendSegments() {
            var pendingSegments = this._pendingSegments;

            for (var type in pendingSegments) {
                if (!this._sourceBuffers[type] || this._sourceBuffers[type].updating) {
                    continue;
                }
                // console.log('mse controller: do append ' + type);

                if (pendingSegments[type].length > 0) {
                    var segment = pendingSegments[type].shift();

                    if (segment.timestampOffset) {
                        // For MPEG audio stream in MSE, if unbuffered-seeking occurred
                        // We need explicitly set timestampOffset to the desired point in timeline for mpeg SourceBuffer.
                        var currentOffset = this._sourceBuffers[type].timestampOffset;
                        var targetOffset = segment.timestampOffset / 1000; // in seconds

                        var delta = Math.abs(currentOffset - targetOffset);
                        if (delta > 0.1) {
                            // If time delta > 100ms
                            _logger.Log.v(this.TAG, 'Update MPEG audio timestampOffset from ' + currentOffset + ' to ' + targetOffset);
                            // console.log(`MSE Controller: Update MPEG audio timestampOffset from ${currentOffset} to ${targetOffset}`);
                            this._sourceBuffers[type].timestampOffset = targetOffset;
                        }
                        delete segment.timestampOffset;
                    }

                    if (!segment.data || segment.data.byteLength === 0) {
                        // Ignore empty buffer
                        continue;
                    }

                    try {
                        this._sourceBuffers[type].appendBuffer(segment.data);

                        this._isBufferFull = false;
                        if (type === 'video' && segment.hasOwnProperty('info')) {
                            this._idrList.appendArray(segment.info.syncPoints);
                        }
                    } catch (error) {
                        this._pendingSegments[type].unshift(segment);
                        if (error.code === 22) {
                            // QuotaExceededError
                            /* Notice that FireFox may not throw QuotaExceededError if SourceBuffer is full
                             * Currently we can only do lazy-load to avoid SourceBuffer become scattered.
                             * SourceBuffer eviction policy may be changed in future version of FireFox.
                             *
                             * Related issues:
                             * https://bugzilla.mozilla.org/show_bug.cgi?id=1279885
                             * https://bugzilla.mozilla.org/show_bug.cgi?id=1280023
                             */

                            // report buffer full, abort network IO
                            if (!this._isBufferFull) {
                                this._emitter.emit('buffer_full');
                            }
                            this._isBufferFull = true;
                        } else {
                            _logger.Log.e(this.TAG, error.message);
                            // console.error('MSE Controller: ' + error.message);
                            this._emitter.emit('error', { code: error.code, msg: error.message });
                        }
                    }
                }
            }
        }
    }, {
        key: '_onSourceOpen',
        value: function _onSourceOpen() {
            _logger.Log.i(this.TAG, 'MediaSource onSourceOpen');
            // console.log('MSE Controller: MediaSource onSourceOpen');
            this._mediaSource.removeEventListener('sourceopen', this.e.onSourceOpen);
            // deferred sourcebuffer creation / initialization
            if (this._pendingSourceBufferInit.length > 0) {
                var pendings = this._pendingSourceBufferInit;
                while (pendings.length) {
                    var segment = pendings.shift();
                    this.appendInitSegment(segment, true);
                }
            }
            // there may be some pending media segments, append them
            if (this._hasPendingSegments()) {
                this._doAppendSegments();
            }
            this._emitter.emit('source_open');
        }
    }, {
        key: '_onSourceEnded',
        value: function _onSourceEnded() {
            // fired on endOfStream
            _logger.Log.v(this.TAG, 'MediaSource onSourceEnded');
            // Do something to restart the MSE
        }
    }, {
        key: '_onSourceClose',
        value: function _onSourceClose() {
            // fired on detaching from media element
            _logger.Log.v(this.TAG, 'MediaSource onSourceClose');
            // console.log('MSE Controller: MediaSource onSourceClose');
            if (this._mediaSource && this.e != null) {
                this._mediaSource.removeEventListener('sourceopen', this.e.onSourceOpen);
                this._mediaSource.removeEventListener('sourceended', this.e.onSourceEnded);
                this._mediaSource.removeEventListener('sourceclose', this.e.onSourceClose);
            }
        }
    }, {
        key: '_hasPendingSegments',
        value: function _hasPendingSegments() {
            var ps = this._pendingSegments;
            return ps.video.length > 0 || ps.audio.length > 0;
        }
    }, {
        key: '_hasPendingRemoveRanges',
        value: function _hasPendingRemoveRanges() {
            var prr = this._pendingRemoveRanges;
            return prr.video.length > 0 || prr.audio.length > 0;
        }
    }, {
        key: '_onSourceBufferUpdateEnd',
        value: function _onSourceBufferUpdateEnd() {
            if (this._requireSetMediaDuration) {
                this._updateMediaSourceDuration();
            } else if (this._hasPendingRemoveRanges()) {
                this._doRemoveRanges();
            } else if (this._hasPendingSegments()) {
                this._doAppendSegments();
            } else if (this._hasPendingEos) {
                this.endOfStream();
            }
            this._emitter.emit('update_end');
        }
    }, {
        key: '_onSourceBufferError',
        value: function _onSourceBufferError(e) {
            _logger.Log.e(this.TAG, 'SourceBuffer Error: ' + e);
            // console.error(`MSE Controller: SourceBuffer Error: ${e}`);
            // this error might not always be fatal, just ignore it
        }
    }]);

    return MSEController;
}();

exports.default = MSEController;

},{"../../utils/logger":23,"../../utils/timer":24,"../media-info":6,"events":3}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = _dereq_('events');

var _events2 = _interopRequireDefault(_events);

var _logger = _dereq_('../utils/logger');

var _mseController = _dereq_('./mse/mse-controller');

var _mseController2 = _interopRequireDefault(_mseController);

var _bufferController = _dereq_('./buffer-controller');

var _bufferController2 = _interopRequireDefault(_bufferController);

var _mp4Muxer = _dereq_('../muxer/mp4-muxer/mp4-muxer');

var _mp4Muxer2 = _interopRequireDefault(_mp4Muxer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import {InvalidArgumentException, IllegalStateException} from '../utils/exception.js';

var WebPlayer = function () {
    function WebPlayer(config) {
        _classCallCheck(this, WebPlayer);

        this.TAG = 'WebPlayer';
        this._type = 'WebPlayer';
        this._emitter = new _events2.default();

        this._config = {
            enableStashBuffer: true,
            stashInitialSize: undefined,

            lazyLoad: true,
            lazyLoadMaxDuration: 60,
            lazyLoadRecoverDuration: 30,
            deferLoadAfterSourceOpen: true,

            // autoCleanupSourceBuffer: default as false, leave unspecified
            autoCleanupMaxBackwardDuration: 3,
            autoCleanupMinBackwardDuration: 1,

            statisticsInfoReportInterval: 600,

            fixAudioTimestampGap: true,

            accurateSeek: false,
            seekType: 'range', // [range, param, custom]
            seekParamStart: 'bstart',
            seekParamEnd: 'bend',
            rangeLoadZeroStart: false,
            customSeekHandler: undefined,
            reuseRedirectedURL: false,
            // referrerPolicy: leave as unspecified
            aacSlient: false
        };

        if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
            Object.assign(this._config, config);
        }

        this.e = {
            onvLoadedMetadata: this._onvLoadedMetadata.bind(this),
            onvSeeking: this._onvSeeking.bind(this),
            onvCanPlay: this._onvCanPlay.bind(this),
            onvStalled: this._onvStalled.bind(this),
            onvProgress: this._onvProgress.bind(this)
        };

        if (self.performance && self.performance.now) {
            this._now = self.performance.now.bind(self.performance);
        } else {
            this._now = Date.now;
        }

        this._pendingSeekTime = null; // in seconds
        this._requestSetTime = false;
        this._seekpointRecord = null;
        this._progressChecker = null;

        this._mediaElement = null;
        // this._ui = null; // new UI component
        this._msectl = null; // MSE engine (controll buffer, bufferlist)
        this._muxer = null; // new muxer
        this._bufferController = null; // new controller

        this._delay = this._config.preDelay !== undefined ? this._config.preDelay : 0;

        this._mseSourceOpened = false;
        this._hasPendingLoad = false;
        this._receivedCanPlay = false;

        this._mediaInfo = null;
        this._statisticsInfo = null;

        this._alwaysSeekKeyframe = false;
    }

    _createClass(WebPlayer, [{
        key: 'destroy',
        value: function destroy() {
            if (this._progressChecker != null) {
                window.clearInterval(this._progressChecker);
                this._progressChecker = null;
            }
            if (this._mediaElement) {
                this.detachMediaElement();
            }
            this.e = null;

            this._emitter.removeAllListeners();
            this._emitter = null;
        }
    }, {
        key: 'appendVideoSample',
        value: function appendVideoSample(sample) {
            this._bufferController.appendVideoSample(sample);
        }
    }, {
        key: 'appendAudioSample',
        value: function appendAudioSample(sample) {
            this._bufferController.appendAudioSample(sample);
        }
    }, {
        key: 'init',
        value: function init(mediaElement) {
            var _this = this;

            this._mediaElement = mediaElement;
            mediaElement.addEventListener('loadedmetadata', this.e.onvLoadedMetadata);
            mediaElement.addEventListener('seeking', this.e.onvSeeking);
            mediaElement.addEventListener('canplay', this.e.onvCanPlay);
            mediaElement.addEventListener('stalled', this.e.onvStalled);
            mediaElement.addEventListener('progress', this.e.onvProgress);

            this._msectl = new _mseController2.default(this._config);

            this._msectl.on('update_end', this._onmseUpdateEnd.bind(this));
            this._msectl.on('buffer_full', this._onmseBufferFull.bind(this));
            this._msectl.on('source_open', function () {
                _this._mseSourceOpened = true;
                if (_this._hasPendingLoad) {
                    _this._hasPendingLoad = false;
                    _this.load();
                }
            });
            this._msectl.on('error', function (info) {
                _this._emitter.emit('error', 'MediaError', 'MediaMSEError', info);
            });

            this._msectl.attachMediaElement(mediaElement);

            if (this._pendingSeekTime != null) {
                try {
                    mediaElement.currentTime = this._pendingSeekTime;
                    this._pendingSeekTime = null;
                } catch (e) {
                    // IE11 may throw InvalidStateError if readyState === 0
                    // We can defer set currentTime operation after loadedmetadata
                }
            }

            if (!this._mediaElement) {
                // throw new IllegalStateException('HTMLMediaElement must be attached before load()!');
            }
            if (this._hasPendingLoad) {
                return;
            }

            this._bufferController = new _bufferController2.default();
            this._muxer = new _mp4Muxer2.default(this._config);

            this._bufferController.on('init_segment', function (type, is) {
                _this._msectl.appendInitSegment(is);
            });
            this._bufferController.on('media_segment', function (type, ms) {
                _this._msectl.appendMediaSegment(ms);
            });
            this._bufferController.onSample = this._muxer.mux.bind(this._muxer);
            this._muxer.onInitSegment = this._onRemuxerInitSegmentArrival.bind(this._bufferController);
            this._muxer.onMediaSegment = this._onRemuxerMediaSegmentArrival.bind(this._bufferController);
        }
    }, {
        key: 'reset',
        value: function reset(mediaElement) {
            this.detachMediaElement();
            this.init(mediaElement);
        }
    }, {
        key: 'detachMediaElement',
        value: function detachMediaElement() {
            if (this._mediaElement) {
                this._msectl.detachMediaElement();
                this._mediaElement.removeEventListener('loadedmetadata', this.e.onvLoadedMetadata);
                this._mediaElement.removeEventListener('seeking', this.e.onvSeeking);
                this._mediaElement.removeEventListener('canplay', this.e.onvCanPlay);
                this._mediaElement.removeEventListener('stalled', this.e.onvStalled);
                this._mediaElement.removeEventListener('progress', this.e.onvProgress);
                this._mediaElement = null;
            }
            if (this._msectl) {
                this._msectl.destroy();
                this._msectl = null;
            }
        }
    }, {
        key: 'load',
        value: function load() {
            var _this2 = this;

            if (!this._mediaElement) {
                // throw new IllegalStateException('HTMLMediaElement must be attached before load()!');
            }
            if (this._hasPendingLoad) {
                return;
            }

            if (this._config.deferLoadAfterSourceOpen && this._mseSourceOpened === false) {
                this._hasPendingLoad = true;
                return;
            }

            if (this._mediaElement.readyState > 0) {
                this._requestSetTime = true;
                // IE11 may throw InvalidStateError if readyState === 0
                this._mediaElement.currentTime = 0;
            }

            this._bufferController = new _bufferController2.default();
            this._muxer = new _mp4Muxer2.default(this._config);

            this._bufferController.on('init_segment', function (type, is) {
                _this2._msectl.appendInitSegment(is);
            });
            this._bufferController.on('media_segment', function (type, ms) {
                _this2._msectl.appendMediaSegment(ms);
            });

            this._bufferController.onSample = this._muxer.remux.bind(this._muxer);
            this._muxer.onInitSegment = this._onRemuxerInitSegmentArrival.bind(this);
            this._muxer.onMediaSegment = this._onRemuxerMediaSegmentArrival.bind(this);
        }
    }, {
        key: 'play',
        value: function play() {
            return this._mediaElement.play();
        }
    }, {
        key: 'pause',
        value: function pause() {
            this._mediaElement.pause();
        }
    }, {
        key: 'changeDelay',
        value: function changeDelay(newDelay) {
            this._msectl.changeDelay(Number(newDelay));
            // if (newDelay < this._delay) {
            // } else {
            //     this._msectl.changeDelay(Number(newDelay), false);
            // }
            // this._delay = newDelay;
        }
    }, {
        key: 'onMetadataReceived',
        value: function onMetadataReceived(type, metadata) {
            this._muxer._onMetadataReceived(type, metadata);
        }
    }, {
        key: '_fillStatisticsInfo',
        value: function _fillStatisticsInfo(statInfo) {
            statInfo.playerType = this._type;

            if (!(this._mediaElement instanceof HTMLVideoElement)) {
                return statInfo;
            }

            var hasQualityInfo = true;
            var decoded = 0;
            var dropped = 0;

            if (this._mediaElement.getVideoPlaybackQuality) {
                var quality = this._mediaElement.getVideoPlaybackQuality();
                decoded = quality.totalVideoFrames;
                dropped = quality.droppedVideoFrames;
            } else if (this._mediaElement.webkitDecodedFrameCount != undefined) {
                decoded = this._mediaElement.webkitDecodedFrameCount;
                dropped = this._mediaElement.webkitDroppedFrameCount;
            } else {
                hasQualityInfo = false;
            }

            if (hasQualityInfo) {
                statInfo.decodedFrames = decoded;
                statInfo.droppedFrames = dropped;
            }

            return statInfo;
        }
    }, {
        key: '_onmseUpdateEnd',
        value: function _onmseUpdateEnd() {
            if (!this._config.lazyLoad || this._config.isLive) {
                return;
            }

            var buffered = this._mediaElement.buffered;
            var currentTime = this._mediaElement.currentTime;
            var currentRangeStart = 0;
            var currentRangeEnd = 0;

            for (var i = 0; i < buffered.length; i++) {
                var start = buffered.start(i);
                var end = buffered.end(i);
                if (start <= currentTime && currentTime < end) {
                    currentRangeStart = start;
                    currentRangeEnd = end;
                    break;
                }
            }

            if (currentRangeEnd >= currentTime + this._config.lazyLoadMaxDuration && this._progressChecker == null) {
                _logger.Log.v(this.TAG, 'Maximum buffering duration exceeded, suspend transmuxing task');
            }
        }
    }, {
        key: '_onmseBufferFull',
        value: function _onmseBufferFull() {
            _logger.Log.v(this.TAG, 'MSE SourceBuffer is full, suspend transmuxing task');
            if (this._progressChecker == null) {
                // do something
                if (this._mediaElement.paused) {
                    this._mediaElement.play();
                }
            }
        }
    }, {
        key: '_checkProgressAndResume',
        value: function _checkProgressAndResume() {
            var currentTime = this._mediaElement.currentTime;
            var buffered = this._mediaElement.buffered;

            var needResume = false;

            for (var i = 0; i < buffered.length; i++) {
                var from = buffered.start(i);
                var to = buffered.end(i);
                if (currentTime >= from && currentTime < to) {
                    if (currentTime >= to - this._config.lazyLoadRecoverDuration) {
                        needResume = true;
                    }
                    break;
                }
            }

            if (needResume) {
                window.clearInterval(this._progressChecker);
                this._progressChecker = null;
                if (needResume) {
                    _logger.Log.v(this.TAG, 'Continue loading from paused position');
                }
            }
        }
    }, {
        key: '_isTimepointBuffered',
        value: function _isTimepointBuffered(seconds) {
            var buffered = this._mediaElement.buffered;

            for (var i = 0; i < buffered.length; i++) {
                var from = buffered.start(i);
                var to = buffered.end(i);
                if (seconds >= from && seconds < to) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: '_internalSeek',
        value: function _internalSeek(seconds) {
            var directSeek = this._isTimepointBuffered(seconds);

            var directSeekBegin = false;
            var directSeekBeginTime = 0;

            if (seconds < 1.0 && this._mediaElement.buffered.length > 0) {
                var videoBeginTime = this._mediaElement.buffered.start(0);
                if (videoBeginTime < 1.0 && seconds < videoBeginTime) {
                    directSeekBegin = true;
                    // also workaround for Safari: Seek to 0 may cause video stuck, use 0.1 to avoid
                    directSeekBeginTime = videoBeginTime;
                }
            }

            if (directSeekBegin) {
                // seek to video begin, set currentTime directly if beginPTS buffered
                this._requestSetTime = true;
                this._mediaElement.currentTime = directSeekBeginTime;
            } else if (directSeek) {
                // buffered position
                if (!this._alwaysSeekKeyframe) {
                    this._requestSetTime = true;
                    this._mediaElement.currentTime = seconds;
                } else {
                    var idr = this._msectl.getNearestKeyframe(Math.floor(seconds * 1000));
                    this._requestSetTime = true;
                    if (idr != null) {
                        this._mediaElement.currentTime = idr.dts / 1000;
                    } else {
                        this._mediaElement.currentTime = seconds;
                    }
                }
                if (this._progressChecker != null) {
                    this._checkProgressAndResume();
                }
            } else {
                if (this._progressChecker != null) {
                    window.clearInterval(this._progressChecker);
                    this._progressChecker = null;
                }
                this._msectl.seek(seconds);
                // no need to set mediaElement.currentTime if non-accurateSeek,
                // just wait for the recommend_seekpoint callback
                if (this._config.accurateSeek) {
                    this._requestSetTime = true;
                    this._mediaElement.currentTime = seconds;
                }
            }
        }
    }, {
        key: '_checkAndApplyUnbufferedSeekpoint',
        value: function _checkAndApplyUnbufferedSeekpoint() {
            if (this._seekpointRecord) {
                if (this._seekpointRecord.recordTime <= this._now() - 100) {
                    var target = this._mediaElement.currentTime;
                    this._seekpointRecord = null;
                    if (!this._isTimepointBuffered(target)) {
                        if (this._progressChecker != null) {
                            window.clearTimeout(this._progressChecker);
                            this._progressChecker = null;
                        }
                        // .currentTime is consists with .buffered timestamp
                        // Chrome/Edge use DTS, while FireFox/Safari use PTS
                        this._msectl.seek(target);
                        // this._transmuxme if accurateSeek, or wait for recommend_seekpoint callback
                        if (this._config.accurateSeek) {
                            this._requestSetTime = true;
                            this._mediaElement.currentTime = target;
                        }
                    }
                } else {
                    window.setTimeout(this._checkAndApplyUnbufferedSeekpoint.bind(this), 50);
                }
            }
        }
    }, {
        key: '_checkAndResumeStuckPlayback',
        value: function _checkAndResumeStuckPlayback(stalled) {
            var media = this._mediaElement;
            if (stalled || !this._receivedCanPlay || media.readyState < 2) {
                // HAVE_CURRENT_DATA
                var buffered = media.buffered;
                if (buffered.length > 0 && media.currentTime < buffered.start(0)) {
                    _logger.Log.w(this.TAG, 'Playback seems stuck at ' + media.currentTime + ', seek to ' + buffered.start(0));
                    this._requestSetTime = true;
                    this._mediaElement.currentTime = buffered.start(0);
                    this._msectl.changeRefTSOffset(buffered.start(0));
                    this._mediaElement.removeEventListener('progress', this.e.onvProgress);
                }
            } else {
                // Playback didn't stuck, remove progress event listener
                this._mediaElement.removeEventListener('progress', this.e.onvProgress);
            }
        }
    }, {
        key: '_onvLoadedMetadata',
        value: function _onvLoadedMetadata(e) {
            if (this._pendingSeekTime != null) {
                this._mediaElement.currentTime = this._pendingSeekTime;
                this._pendingSeekTime = null;
            }
        }
    }, {
        key: '_onvSeeking',
        value: function _onvSeeking(e) {
            // handle seeking request from browser's progress bar
            var target = this._mediaElement.currentTime;
            var buffered = this._mediaElement.buffered;

            if (this._requestSetTime) {
                this._requestSetTime = false;
                return;
            }

            if (target < 1.0 && buffered.length > 0) {
                // seek to video begin, set currentTime directly if beginPTS buffered
                var videoBeginTime = buffered.start(0);
                if (videoBeginTime < 1.0 && target < videoBeginTime) {
                    this._requestSetTime = true;
                    // also workaround for Safari: Seek to 0 may cause video stuck, use 0.1 to avoid
                    this._mediaElement.currentTime = videoBeginTime;
                    return;
                }
            }

            if (this._isTimepointBuffered(target)) {
                if (this._alwaysSeekKeyframe) {
                    var idr = this._msectl.getNearestKeyframe(Math.floor(target * 1000));
                    if (idr != null) {
                        this._requestSetTime = true;
                        this._mediaElement.currentTime = idr.dts / 1000;
                    }
                }
                if (this._progressChecker != null) {
                    this._checkProgressAndResume();
                }
                return;
            }

            this._seekpointRecord = {
                seekPoint: target,
                recordTime: this._now()
            };
            window.setTimeout(this._checkAndApplyUnbufferedSeekpoint.bind(this), 50);
        }
    }, {
        key: '_onvCanPlay',
        value: function _onvCanPlay(e) {
            this._receivedCanPlay = true;
            this._mediaElement.removeEventListener('canplay', this.e.onvCanPlay);
        }
    }, {
        key: '_onvStalled',
        value: function _onvStalled(e) {
            this._checkAndResumeStuckPlayback(true);
        }
    }, {
        key: '_onvProgress',
        value: function _onvProgress(e) {
            this._checkAndResumeStuckPlayback();
        }
    }, {
        key: '_onRemuxerInitSegmentArrival',
        value: function _onRemuxerInitSegmentArrival(type, initSegment) {
            this._emitter.emit('init_segment', type, initSegment);
        }
    }, {
        key: '_onRemuxerMediaSegmentArrival',
        value: function _onRemuxerMediaSegmentArrival(type, mediaSegment) {
            if (this._pendingSeekTime != null) {
                // Media segments after new-segment cross-seeking should be dropped.
                return;
            }
            this._emitter.emit('media_segment', type, mediaSegment);

            // // Resolve pending seekPoint
            // if (this._pendingResolveSeekPoint != null && type === 'video') {
            //     let syncPoints = mediaSegment.info.syncPoints;
            //     let seekpoint = this._pendingResolveSeekPoint;
            //     this._pendingResolveSeekPoint = null;

            //     // Safari: Pass PTS for recommend_seekpoint
            //     // if (Browser.safari && syncPoints.length > 0 && syncPoints[0].originalDts === seekpoint) {
            //     //     seekpoint = syncPoints[0].pts;
            //     // }
            //     // else: use original DTS (keyframe.milliseconds)

            //     this._emitter.emit(TransmuxingEvents.RECOMMEND_SEEKPOINT, seekpoint);
            // }
        }
    }, {
        key: 'dtsBase',
        get: function get() {
            return this._muxer.dtsBase;
        }
    }, {
        key: 'type',
        get: function get() {
            return this._type;
        }
    }, {
        key: 'buffered',
        get: function get() {
            return this._mediaElement.buffered;
        }
    }, {
        key: 'duration',
        get: function get() {
            return this._mediaElement.duration;
        }
    }, {
        key: 'volume',
        get: function get() {
            return this._mediaElement.volume;
        },
        set: function set(value) {
            this._mediaElement.volume = value;
        }
    }, {
        key: 'muted',
        get: function get() {
            return this._mediaElement.muted;
        },
        set: function set(muted) {
            this._mediaElement.muted = muted;
        }
    }, {
        key: 'currentTime',
        get: function get() {
            if (this._mediaElement) {
                return this._mediaElement.currentTime;
            }
            return 0;
        },
        set: function set(seconds) {
            if (this._mediaElement) {
                this._internalSeek(seconds);
            } else {
                this._pendingSeekTime = seconds;
            }
        }
    }, {
        key: 'mediaInfo',
        get: function get() {
            return Object.assign({}, this._mediaInfo);
        }
    }, {
        key: 'statisticsInfo',
        get: function get() {
            if (this._statisticsInfo == null) {
                this._statisticsInfo = {};
            }
            this._statisticsInfo = this._fillStatisticsInfo(this._statisticsInfo);
            return Object.assign({}, this._statisticsInfo);
        }
    }]);

    return WebPlayer;
}();

exports.default = WebPlayer;

},{"../muxer/mp4-muxer/mp4-muxer":18,"../utils/logger":23,"./buffer-controller":5,"./mse/mse-controller":7,"events":3}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import {IllegalStateException, InvalidArgumentException} from '../utils/exception.js';

// Exponential-Golomb buffer decoder
var ExpGolomb = function () {
    function ExpGolomb(uint8array) {
        _classCallCheck(this, ExpGolomb);

        this.TAG = 'ExpGolomb';

        this._buffer = uint8array;
        this._buffer_index = 0;
        this._total_bytes = uint8array.byteLength;
        this._total_bits = uint8array.byteLength * 8;
        this._current_word = 0;
        this._current_word_bits_left = 0;
    }

    _createClass(ExpGolomb, [{
        key: 'destroy',
        value: function destroy() {
            this._buffer = null;
        }
    }, {
        key: '_fillCurrentWord',
        value: function _fillCurrentWord() {
            var buffer_bytes_left = this._total_bytes - this._buffer_index;
            // if (buffer_bytes_left <= 0)
            // throw new IllegalStateException('ExpGolomb: _fillCurrentWord() but no bytes available');

            var bytes_read = Math.min(4, buffer_bytes_left);
            var word = new Uint8Array(4);
            word.set(this._buffer.subarray(this._buffer_index, this._buffer_index + bytes_read));
            this._current_word = new DataView(word.buffer).getUint32(0, false);

            this._buffer_index += bytes_read;
            this._current_word_bits_left = bytes_read * 8;
        }
    }, {
        key: 'readBits',
        value: function readBits(bits) {
            // if (bits > 32)
            // throw new InvalidArgumentException('ExpGolomb: readBits() bits exceeded max 32bits!');

            if (bits <= this._current_word_bits_left) {
                var _result = this._current_word >>> 32 - bits;
                this._current_word <<= bits;
                this._current_word_bits_left -= bits;
                return _result;
            }

            var result = this._current_word_bits_left ? this._current_word : 0;
            result = result >>> 32 - this._current_word_bits_left;
            var bits_need_left = bits - this._current_word_bits_left;

            this._fillCurrentWord();
            var bits_read_next = Math.min(bits_need_left, this._current_word_bits_left);

            var result2 = this._current_word >>> 32 - bits_read_next;
            this._current_word <<= bits_read_next;
            this._current_word_bits_left -= bits_read_next;

            result = result << bits_read_next | result2;
            return result;
        }
    }, {
        key: 'readBool',
        value: function readBool() {
            return this.readBits(1) === 1;
        }
    }, {
        key: 'readByte',
        value: function readByte() {
            return this.readBits(8);
        }
    }, {
        key: '_skipLeadingZero',
        value: function _skipLeadingZero() {
            var zero_count = void 0;
            for (zero_count = 0; zero_count < this._current_word_bits_left; zero_count++) {
                if (0 !== (this._current_word & 0x80000000 >>> zero_count)) {
                    this._current_word <<= zero_count;
                    this._current_word_bits_left -= zero_count;
                    return zero_count;
                }
            }
            this._fillCurrentWord();
            return zero_count + this._skipLeadingZero();
        }
    }, {
        key: 'readUEG',
        value: function readUEG() {
            // unsigned exponential golomb
            var leading_zeros = this._skipLeadingZero();
            return this.readBits(leading_zeros + 1) - 1;
        }
    }, {
        key: 'readSEG',
        value: function readSEG() {
            // signed exponential golomb
            var value = this.readUEG();
            if (value & 0x01) {
                return value + 1 >>> 1;
            } else {
                return -1 * (value >>> 1);
            }
        }
    }]);

    return ExpGolomb;
}();

exports.default = ExpGolomb;

},{}],10:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // import {IllegalStateException} from '../utils/exception.js';


var _logger = _dereq_('../../utils/logger');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var le = function () {
    var buf = new ArrayBuffer(2);
    new DataView(buf).setInt16(0, 256, true); // little-endian write
    return new Int16Array(buf)[0] === 256; // platform-spec read, if equal then LE
}();

function decodeUTF8(dataview, offset, len) {
    var bf = new Buffer(dataview.buffer, offset, len);
    return bf.toString('ascii');
}

var AMF = function () {
    function AMF() {
        _classCallCheck(this, AMF);
    }

    _createClass(AMF, null, [{
        key: 'parseScriptData',
        value: function parseScriptData(arrayBuffer, dataOffset, dataSize) {
            var data = {};

            try {
                var name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);
                var value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);

                data[name.data] = value.data;
            } catch (e) {
                _logger.Log.e('AMF', e.toString());
            }

            return data;
        }
    }, {
        key: 'parseObject',
        value: function parseObject(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 3) {
                _logger.Log.w('AMF', 'Data not enough when parse ScriptDataObject');
            }
            var name = AMF.parseString(arrayBuffer, dataOffset, dataSize);
            var value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);
            var isObjectEnd = value.objectEnd;

            return {
                data: {
                    name: name.data,
                    value: value.data
                },
                size: name.size + value.size,
                objectEnd: isObjectEnd
            };
        }
    }, {
        key: 'parseVariable',
        value: function parseVariable(arrayBuffer, dataOffset, dataSize) {
            return AMF.parseObject(arrayBuffer, dataOffset, dataSize);
        }
    }, {
        key: 'parseString',
        value: function parseString(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 2) {
                _logger.Log.w('AMF', 'Data not enough when parse String');
            }
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var length = v.getUint16(0, !le);

            var str = void 0;
            if (length > 0) {
                str = decodeUTF8(v, dataOffset + 2, length);
            } else {
                str = '';
            }

            return {
                data: str,
                size: 2 + length
            };
        }
    }, {
        key: 'parseLongString',
        value: function parseLongString(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 4) {
                _logger.Log.w('AMF', 'Data not enough when parse LongString');
            }
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var length = v.getUint32(0, !le);

            var str = void 0;
            if (length > 0) {
                str = decodeUTF8(v, dataOffset + 4, length);
            } else {
                str = '';
            }

            return {
                data: str,
                size: 4 + length
            };
        }
    }, {
        key: 'parseDate',
        value: function parseDate(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 10) {
                _logger.Log.w('AMF', 'Data size invalid when parse Date');
            }
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var timestamp = v.getFloat64(0, !le);
            var localTimeOffset = v.getInt16(8, !le);
            timestamp += localTimeOffset * 60 * 1000; // get UTC time

            return {
                data: new Date(timestamp),
                size: 8 + 2
            };
        }
    }, {
        key: 'parseValue',
        value: function parseValue(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 1) {
                _logger.Log.w('AMF', 'Data not enough when parse Value');
            }

            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var offset = 1;
            var type = v.getUint8(0);
            var value = void 0;
            var objectEnd = false;

            try {
                switch (type) {
                    case 0:
                        // Number(Double) type
                        value = v.getFloat64(1, !le);
                        offset += 8;
                        break;
                    case 1:
                        {
                            // Boolean type
                            var b = v.getUint8(1);
                            value = b ? true : false;
                            offset += 1;
                            break;
                        }
                    case 2:
                        {
                            // String type
                            var amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                            value = amfstr.data;
                            offset += amfstr.size;
                            break;
                        }
                    case 3:
                        {
                            // Object(s) type
                            value = {};
                            var terminal = 0; // workaround for malformed Objects which has missing ScriptDataObjectEnd
                            if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                                terminal = 3;
                            }
                            while (offset < dataSize - 4) {
                                // 4 === type(UI8) + ScriptDataObjectEnd(UI24)
                                var amfobj = AMF.parseObject(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
                                if (amfobj.objectEnd) break;
                                value[amfobj.data.name] = amfobj.data.value;
                                offset += amfobj.size;
                            }
                            if (offset <= dataSize - 3) {
                                var marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                                if (marker === 9) {
                                    offset += 3;
                                }
                            }
                            break;
                        }
                    case 8:
                        {
                            // ECMA array type (Mixed array)
                            value = {};
                            offset += 4; // ECMAArrayLength(UI32)
                            var _terminal = 0; // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd
                            if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
                                _terminal = 3;
                            }
                            while (offset < dataSize - 8) {
                                // 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)
                                var amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - _terminal);
                                if (amfvar.objectEnd) break;
                                value[amfvar.data.name] = amfvar.data.value;
                                offset += amfvar.size;
                            }
                            if (offset <= dataSize - 3) {
                                var _marker = v.getUint32(offset - 1, !le) & 0x00FFFFFF;
                                if (_marker === 9) {
                                    offset += 3;
                                }
                            }
                            break;
                        }
                    case 9:
                        // ScriptDataObjectEnd
                        value = undefined;
                        offset = 1;
                        objectEnd = true;
                        break;
                    case 10:
                        {
                            // Strict array type
                            // ScriptDataValue[n]. NOTE: according to video_file_format_spec_v10_1.pdf
                            value = [];
                            var strictArrayLength = v.getUint32(1, !le);
                            offset += 4;
                            for (var i = 0; i < strictArrayLength; i++) {
                                var val = AMF.parseValue(arrayBuffer, dataOffset + offset, dataSize - offset);
                                value.push(val.data);
                                offset += val.size;
                            }
                            break;
                        }
                    case 11:
                        {
                            // Date type
                            var date = AMF.parseDate(arrayBuffer, dataOffset + 1, dataSize - 1);
                            value = date.data;
                            offset += date.size;
                            break;
                        }
                    case 12:
                        {
                            // Long string type
                            var amfLongStr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1);
                            value = amfLongStr.data;
                            offset += amfLongStr.size;
                            break;
                        }
                    default:
                        // ignore and skip
                        offset = dataSize;
                        _logger.Log.w('AMF', 'Unsupported AMF value type ' + type);
                }
            } catch (e) {
                _logger.Log.e('AMF', e.toString());
            }

            return {
                data: value,
                size: offset,
                objectEnd: objectEnd
            };
        }
    }]);

    return AMF;
}();

exports.default = AMF;

}).call(this,_dereq_("buffer").Buffer)

},{"../../utils/logger":23,"buffer":2}],11:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = _dereq_('events');

var _events2 = _interopRequireDefault(_events);

var _logger = _dereq_('../../utils/logger');

var _amfParser = _dereq_('./amf-parser.js');

var _amfParser2 = _interopRequireDefault(_amfParser);

var _spsParser = _dereq_('../sps-parser.js');

var _spsParser2 = _interopRequireDefault(_spsParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import DemuxErrors from './demux-errors.js';

function ReadBig32(array, index) {
    return array[index] << 24 | array[index + 1] << 16 | array[index + 2] << 8 | array[index + 3];
}

function Read24n8(arraybuffer, dataOffset, extraFlag) {
    var v = void 0,
        num0 = void 0,
        num1 = void 0,
        num2 = void 0,
        num3 = void 0;
    if (extraFlag === undefined) {
        v = new DataView(arraybuffer, dataOffset, 4);
        num2 = v.getUint8(0);
        num1 = v.getUint8(1);
        num0 = v.getUint8(2);
        num3 = v.getUint8(3);
    } else {
        v = new DataView(arraybuffer, dataOffset, 6);
        num2 = v.getUint8(0);
        num1 = v.getUint8(1);
        num0 = v.getUint8(3);
        num3 = v.getUint8(4);
    }
    return num0 | num1 << 8 | num2 << 16 | num3 << 24;
}

var FLVDemuxer = function () {
    function FLVDemuxer(probeData) {
        _classCallCheck(this, FLVDemuxer);

        this.TAG = 'FLVDemuxer';
        this._emitter = new _events2.default();

        this._onError = null;
        this._onMetadataArrived = null;
        this._onVideoSampleArrived = null;
        this._onAudioSampleArrived = null;
        this._onReplayData = null;

        this._firstParse = true;
        this._dispatch = false;
        this._firstIframe = false;

        this._hasAudio = probeData.dataOffset;
        this._hasVideo = probeData.dataOffset;

        this._dataOffset = probeData.dataOffset;

        this._audioMetadata = null;
        this._videoMetadata = null;

        this._stashedAudioSample = null;
        this._stashedVideoSample = null;
        this._lastValidAudioDts = null;
        this._lastValidVideoDts = null;

        this._timestampBase = 0; // int32, in milliseconds
        this._timescale = 1000;
        this._duration = 0; // int32, in milliseconds
        this._durationOverrided = false;
        this._naluLengthSize = 4;
        this._referenceFrameRate = {
            fixed: true,
            fps: 23.976,
            fps_num: 23976,
            fps_den: 1000
        };

        this._seiCount = 0;
        this._seiMiss = -1;
        this._replayPts = -1;

        this._flvSoundRateTable = [5500, 11025, 22050, 44100, 48000];

        this._mpegSamplingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

        this._mpegAudioV10SampleRateTable = [44100, 48000, 32000, 0];
        this._mpegAudioV20SampleRateTable = [22050, 24000, 16000, 0];
        this._mpegAudioV25SampleRateTable = [11025, 12000, 8000, 0];

        this._mpegAudioL1BitRateTable = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1];
        this._mpegAudioL2BitRateTable = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1];
        this._mpegAudioL3BitRateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];

        this._videoTrack = { type: 'video', id: 1, sequenceNumber: 0, samples: [], length: 0 };
        this._audioTrack = { type: 'audio', id: 2, sequenceNumber: 0, samples: [], length: 0 };

        this._littleEndian = function () {
            var buf = new ArrayBuffer(2);
            new DataView(buf).setInt16(0, 256, true); // little-endian write
            return new Int16Array(buf)[0] === 256; // platform-spec read, if equal then LE
        }();
    }

    _createClass(FLVDemuxer, [{
        key: 'destroy',
        value: function destroy() {
            this._audioMetadata = null;
            this._videoMetadata = null;
            this._videoTrack = null;
            this._audioTrack = null;
            this._onReplayData = null;

            this._onError = null;
            this._onMetadataArrived = null;
            this._onVideoSampleArrived = null;
            this._onAudioSampleArrived = null;
        }

        // prototype: function onMetadataArrived(type: string, metadata: any): void

    }, {
        key: 'parseChunks',


        // function parseChunks(chunk: ArrayBuffer, chunklength: number): number;
        value: function parseChunks(chunk, chunklength) {
            // console.log('demuxer: parse chunks');
            var offset = 0;
            var le = this._littleEndian;

            if (this._firstParse) {
                // handle PreviousTagSize0 before Tag1
                this._firstParse = false;

                offset = this._dataOffset;
                var v = new DataView(chunk, offset);
                var prevTagSize0 = v.getUint32(0, !le);
                if (prevTagSize0 !== 0) {
                    _logger.Log.e(this.TAG, 'PrevTagSize0 !== 0 !!!');
                }
                offset += 4;
            }

            if (chunk.byteLength !== chunklength) {
                _logger.Log.e(this.TAG, 'Invalid chunk length');
                return;
            }

            while (offset < chunklength) {
                this._dispatch = true;

                var _v = new DataView(chunk, offset);

                if (offset + 11 + 4 > chunklength) {
                    // data not enough for parsing an flv tag
                    break;
                }

                var tagType = _v.getUint8(0);
                var dataSize = _v.getUint32(0, !le) & 0x00FFFFFF;

                if (offset + 11 + dataSize + 4 > chunklength) {
                    // data not enough for parsing actual data body
                    break;
                }

                if (tagType !== 8 && tagType !== 9 && tagType !== 18) {
                    _logger.Log.e(this.TAG, 'Unsupported tag type ' + tagType + ', skipped');
                    // consume the whole tag (skip it)
                    offset += 11 + dataSize + 4;
                    continue;
                }

                var timestamp = Read24n8(chunk, offset + 4);
                var streamId = _v.getUint32(7, !le) & 0x00FFFFFF;
                if (streamId !== 0) {
                    _logger.Log.w(this.TAG, 'Meet tag which has StreamID != 0!');
                }

                var dataOffset = offset + 11;

                switch (tagType) {
                    case 8:
                        // Audio
                        this._parseAudioData(chunk, dataOffset, dataSize, timestamp);
                        break;
                    case 9:
                        // Video
                        this._parseVideoData(chunk, dataOffset, dataSize, timestamp, 0);
                        break;
                    case 18:
                        // ScriptDataObject
                        this._parseScriptData(chunk, dataOffset, dataSize);
                        break;
                }

                var prevTagSize = _v.getUint32(11 + dataSize, !le);
                if (prevTagSize !== 11 + dataSize) {
                    _logger.Log.w(this.TAG, 'Invalid PrevTagSize ' + prevTagSize);
                }

                offset += 11 + dataSize + 4; // tagBody + dataSize + prevTagSize
            }

            return offset; // consumed bytes, just equals latest offset index
        }
    }, {
        key: '_parseScriptData',
        value: function _parseScriptData(arrayBuffer, dataOffset, dataSize) {
            var scriptData = _amfParser2.default.parseScriptData(arrayBuffer, dataOffset, dataSize);

            if (scriptData.hasOwnProperty('onMetaData')) {
                if (scriptData.onMetaData == null || _typeof(scriptData.onMetaData) !== 'object') {
                    // Log.w(this.TAG, 'Invalid onMetaData structure!');
                    return;
                }
                if (this._metadata) {
                    // Log.w(this.TAG, 'Found another onMetaData tag!');
                }
                this._metadata = scriptData;
                var onMetaData = this._metadata.onMetaData;

                if (typeof onMetaData.hasAudio === 'boolean') {
                    // hasAudio
                    if (this._hasAudioFlagOverrided === false) {
                        this._hasAudio = onMetaData.hasAudio;
                    }
                }
                if (typeof onMetaData.hasVideo === 'boolean') {
                    // hasVideo
                    if (this._hasVideoFlagOverrided === false) {
                        this._hasVideo = onMetaData.hasVideo;
                    }
                }

                if (typeof onMetaData.duration === 'number') {
                    // duration
                    if (!this._durationOverrided) {
                        var duration = Math.floor(onMetaData.duration * this._timescale);
                        this._duration = duration;
                    }
                }
                if (typeof onMetaData.framerate === 'number') {
                    // framerate
                    var fps_num = Math.floor(onMetaData.framerate * 1000);
                    if (fps_num > 0) {
                        var fps = fps_num / 1000;
                        this._referenceFrameRate.fixed = true;
                        this._referenceFrameRate.fps = fps;
                        this._referenceFrameRate.fps_num = fps_num;
                        this._referenceFrameRate.fps_den = 1000;
                    }
                }
                if (_typeof(onMetaData.keyframes) === 'object') {
                    // keyframes
                    var keyframes = onMetaData.keyframes;
                    onMetaData.keyframes = null; // keyframes has been extracted, remove it
                }
                this._dispatch = false;
                _logger.Log.v(this.TAG, 'Parsed onMetaData');
            }
        }
    }, {
        key: '_parseKeyframesIndex',
        value: function _parseKeyframesIndex(keyframes) {
            var times = [];
            var filepositions = [];

            // ignore first keyframe which is actually AVC Sequence Header (AVCDecoderConfigurationRecord)
            for (var i = 1; i < keyframes.times.length; i++) {
                var time = this._timestampBase + Math.floor(keyframes.times[i] * 1000);
                times.push(time);
                filepositions.push(keyframes.filepositions[i]);
            }

            return {
                times: times,
                filepositions: filepositions
            };
        }
    }, {
        key: '_parseAudioData',
        value: function _parseAudioData(arrayBuffer, dataOffset, dataSize, tagTimestamp) {
            if (dataSize <= 1) {
                _logger.Log.w(this.TAG, 'Invalid audio packet, missing SoundData payload!');
                return;
            }

            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var soundSpec = v.getUint8(0);

            var soundFormat = soundSpec >>> 4;
            if (soundFormat !== 2 && soundFormat !== 10) {
                // MP3 or AAC
                console.error('CODEC_UNSUPPORTED: Flv: Unsupported audio codec idx: ' + soundFormat);
                return;
            }

            var soundRate = 0;
            var soundRateIndex = (soundSpec & 12) >>> 2;
            if (soundRateIndex >= 0 && soundRateIndex <= 4) {
                soundRate = this._flvSoundRateTable[soundRateIndex];
            } else {
                console.error('FORMAT_ERROR: Flv: Invalid audio sample rate idx: ' + soundRateIndex);
                return;
            }

            var soundSize = (soundSpec & 2) >>> 1; // unused
            var soundType = soundSpec & 1;

            var meta = this._audioMetadata;
            var track = this._audioTrack;

            if (!meta) {
                // initial metadata
                meta = this._audioMetadata = {};
                meta.type = 'audio';
                meta.id = track.id;
                meta.timescale = this._timescale;
                meta.duration = this._duration;
                meta.audioSampleRate = soundRate;
                meta.channelCount = soundType === 0 ? 1 : 2;
            }

            if (soundFormat === 10) {
                // AAC
                var aacData = this._parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1);
                if (aacData == undefined) {
                    return;
                }

                // console.log(aacData);
                if (aacData.packetType === 0) {
                    // AAC sequence header (AudioSpecificConfig)
                    if (meta.config) {
                        _logger.Log.w(this.TAG, 'Found another AudioSpecificConfig!');
                    }
                    var misc = aacData.data;
                    meta.audioSampleRate = misc.samplingRate;
                    meta.channelCount = misc.channelCount;
                    meta.codec = misc.codec;
                    meta.originalCodec = misc.originalCodec;
                    meta.config = misc.config;
                    // The decode result of an aac sample is 1024 PCM samples
                    meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;
                    _logger.Log.v(this.TAG, 'Parsed AudioSpecificConfig');

                    // then notify new metadata
                    this._dispatch = false;
                    // console.log(meta);
                    this._onMetadataArrived('audio', meta);
                } else if (aacData.packetType === 1) {
                    // AAC raw frame data
                    var dts = this._timestampBase + tagTimestamp;
                    var aacSample = { unit: aacData.data, dts: dts, pts: dts, length: aacData.data.length };
                    // console.log(aacSample);
                    this._stashAudioSample(aacSample);
                } else {
                    _logger.Log.e(this.TAG, 'Unsupported AAC data type ' + aacData.packetType);
                }
            } else if (soundFormat === 2) {
                // MP3
                if (!meta.codec) {
                    // We need metadata for mp3 audio track, extract info from frame header
                    var _misc = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, true);
                    if (_misc == undefined) {
                        return;
                    }
                    meta.audioSampleRate = _misc.samplingRate;
                    meta.channelCount = _misc.channelCount;
                    meta.codec = _misc.codec;
                    meta.originalCodec = _misc.originalCodec;
                    // The decode result of an mp3 sample is 1152 PCM samples
                    meta.refSampleDuration = 1152 / meta.audioSampleRate * meta.timescale;
                    console.log('Parsed MPEG Audio Frame Header');

                    // console.log(meta);
                    this._onMetadataArrived('audio', meta);
                }

                // This packet is always a valid audio packet, extract it
                var data = this._parseMP3AudioData(arrayBuffer, dataOffset + 1, dataSize - 1, false);
                if (data == undefined) {
                    return;
                }
                var _dts = this._timestampBase + tagTimestamp;
                var mp3Sample = { unit: data, dts: _dts, pts: _dts, length: data.length };

                // console.log(mp3Sample);
                this._stashAudioSample(mp3Sample);
            }
        }
    }, {
        key: '_stashAudioSample',
        value: function _stashAudioSample(sample) {
            if (this._stashedAudioSample === null) {
                this._stashedAudioSample = sample;
                return;
            } else {
                var stashedSample = this._stashedAudioSample;
                var duration = sample.dts - stashedSample.dts;
                if (duration > 0) {
                    stashedSample.duration = duration;
                }
                // console.log('FLVDemuxer: audio dts: ' + stashedSample.dts + ', duration: ' + stashedSample.duration);
                if (this._firstIframe) {
                    this._onAudioSampleArrived(stashedSample);
                }
                this._stashedAudioSample = sample;
            }
        }
    }, {
        key: '_parseAACAudioData',
        value: function _parseAACAudioData(arrayBuffer, dataOffset, dataSize) {
            if (dataSize <= 1) {
                _logger.Log.w(this.TAG, 'Invalid AAC packet, missing AACPacketType or/and Data!');
                return;
            }

            var result = {};
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);

            result.packetType = array[0];

            if (array[0] === 0) {
                result.data = this._parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1);
            } else {
                result.data = array.subarray(1);
            }

            return result;
        }
    }, {
        key: '_parseAACAudioSpecificConfig',
        value: function _parseAACAudioSpecificConfig(arrayBuffer, dataOffset, dataSize) {
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
            var config = null;

            /* Audio Object Type:
               0: Null
               1: AAC Main
               2: AAC LC
               3: AAC SSR (Scalable Sample Rate)
               4: AAC LTP (Long Term Prediction)
               5: HE-AAC / SBR (Spectral Band Replication)
               6: AAC Scalable
            */

            var audioObjectType = 0;
            var originalAudioObjectType = 0;
            var audioExtensionObjectType = null;
            var samplingIndex = 0;
            var extensionSamplingIndex = null;

            // console.log(array);
            // 5 bits
            audioObjectType = originalAudioObjectType = array[0] >>> 3;
            // 4 bits
            samplingIndex = (array[0] & 0x07) << 1 | array[1] >>> 7;
            if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {
                console.error('FORMAT_ERROR: Flv: AAC invalid sampling frequency index!');
                return;
            }

            var samplingFrequence = this._mpegSamplingRates[samplingIndex];

            // 4 bits
            var channelConfig = (array[1] & 0x78) >>> 3;
            if (channelConfig < 0 || channelConfig >= 8) {
                console.error('FORMAT_ERROR: Flv: AAC invalid channel configuration');
                return;
            }

            if (audioObjectType === 5) {
                // HE-AAC?
                // 4 bits
                extensionSamplingIndex = (array[1] & 0x07) << 1 | array[2] >>> 7;
                // 5 bits
                audioExtensionObjectType = (array[2] & 0x7C) >>> 2;
            }

            // for other browsers, e.g. chrome...
            // Always use HE-AAC to make it easier to switch aac codec profile
            audioObjectType = 5;
            extensionSamplingIndex = samplingIndex;
            config = new Array(4);

            if (samplingIndex >= 6) {
                extensionSamplingIndex = samplingIndex - 3;
            } else if (channelConfig === 1) {
                // Mono channel
                audioObjectType = 2;
                config = new Array(2);
                extensionSamplingIndex = samplingIndex;
            }

            config[0] = audioObjectType << 3;
            config[0] |= (samplingIndex & 0x0F) >>> 1;
            config[1] = (samplingIndex & 0x0F) << 7;
            config[1] |= (channelConfig & 0x0F) << 3;
            if (audioObjectType === 5) {
                config[1] |= (extensionSamplingIndex & 0x0F) >>> 1;
                config[2] = (extensionSamplingIndex & 0x01) << 7;
                // extended audio object type: force to 2 (LC-AAC)
                config[2] |= 2 << 2;
                config[3] = 0;
            }

            // console.log(config);
            return {
                config: config,
                samplingRate: samplingFrequence,
                channelCount: channelConfig,
                codec: 'mp4a.40.' + audioObjectType,
                originalCodec: 'mp4a.40.' + originalAudioObjectType
            };
        }
    }, {
        key: '_parseMP3AudioData',
        value: function _parseMP3AudioData(arrayBuffer, dataOffset, dataSize, requestHeader) {
            if (dataSize < 4) {
                _logger.Log.w(this.TAG, 'Invalid MP3 packet, header missing!');
                return;
            }

            var le = this._littleEndian;
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
            var result = null;

            if (requestHeader) {
                if (array[0] !== 0xFF) {
                    return;
                }
                var ver = array[1] >>> 3 & 0x03;
                var layer = (array[1] & 0x06) >> 1;

                var bitrate_index = (array[2] & 0xF0) >>> 4;
                var sampling_freq_index = (array[2] & 0x0C) >>> 2;

                var channel_mode = array[3] >>> 6 & 0x03;
                var channel_count = channel_mode !== 3 ? 2 : 1;

                var sample_rate = 0;
                var bit_rate = 0;
                var object_type = 34; // Layer-3, listed in MPEG-4 Audio Object Types

                var codec = 'mp3';

                switch (ver) {
                    case 0:
                        // MPEG 2.5
                        sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];
                        break;
                    case 2:
                        // MPEG 2
                        sample_rate = this._mpegAudioV20SampleRateTable[sampling_freq_index];
                        break;
                    case 3:
                        // MPEG 1
                        sample_rate = this._mpegAudioV10SampleRateTable[sampling_freq_index];
                        break;
                }

                switch (layer) {
                    case 1:
                        // Layer 3
                        object_type = 34;
                        if (bitrate_index < this._mpegAudioL3BitRateTable.length) {
                            bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];
                        }
                        break;
                    case 2:
                        // Layer 2
                        object_type = 33;
                        if (bitrate_index < this._mpegAudioL2BitRateTable.length) {
                            bit_rate = this._mpegAudioL2BitRateTable[bitrate_index];
                        }
                        break;
                    case 3:
                        // Layer 1
                        object_type = 32;
                        if (bitrate_index < this._mpegAudioL1BitRateTable.length) {
                            bit_rate = this._mpegAudioL1BitRateTable[bitrate_index];
                        }
                        break;
                }

                result = {
                    bitRate: bit_rate,
                    samplingRate: sample_rate,
                    channelCount: channel_count,
                    codec: codec,
                    originalCodec: codec
                };
            } else {
                result = array;
            }

            return result;
        }
    }, {
        key: '_parseVideoData',
        value: function _parseVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition) {
            if (dataSize <= 1) {
                _logger.Log.w(this.TAG, 'Invalid video packet, missing VideoData payload!');
                return;
            }

            if (this._hasVideoFlagOverrided === true && this._hasVideo === false) {
                // If hasVideo: false indicated explicitly in MediaDataSource,
                // Ignore all the video packets
                return;
            }

            var spec = new Uint8Array(arrayBuffer, dataOffset, dataSize)[0];

            var frameType = (spec & 240) >>> 4;
            var codecId = spec & 15;

            if (codecId !== 7) {
                console.error('CODEC_UNSUPPORTED: Flv: Unsupported codec in video frame: ' + codecId);
                return;
            }

            this._parseAVCVideoPacket(arrayBuffer, dataOffset + 1, dataSize - 1, tagTimestamp, tagPosition, frameType);
        }
    }, {
        key: '_parseAVCVideoPacket',
        value: function _parseAVCVideoPacket(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType) {
            if (dataSize < 4) {
                _logger.Log.w(this.TAG, 'Invalid AVC packet, missing AVCPacketType or/and CompositionTime');
                return;
            }

            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var packetType = v.getUint8(0);
            var cts_unsigned = v.getUint32(0, !le) & 0x00FFFFFF;
            var cts = cts_unsigned << 8 >> 8;

            if (packetType === 0) {
                // AVCDecoderConfigurationRecord
                this._parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset + 4, dataSize - 4);
            } else if (packetType === 1) {
                // One or more Nalus
                this._parseAVCVideoData(arrayBuffer, dataOffset + 4, dataSize - 4, tagTimestamp, tagPosition, frameType, cts);
            } else if (packetType === 2) {
                // empty, AVC end of sequence
            } else {
                console.warn('FORMAT_ERROR: Flv: Invalid video packet type ' + packetType);
                return;
            }
        }
    }, {
        key: '_parseAVCDecoderConfigurationRecord',
        value: function _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {
            if (dataSize < 7) {
                _logger.Log.w(this.TAG, 'Invalid AVCDecoderConfigurationRecord, lack of data!');
                return;
            }

            var meta = this._videoMetadata;
            var track = this._videoTrack;
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            if (!meta) {
                meta = this._videoMetadata = {};
                meta.type = 'video';
                meta.id = track.id;
                meta.timescale = this._timescale;
                meta.duration = this._duration;
            } else {
                if (typeof meta.avcc !== 'undefined') {
                    _logger.Log.w(this.TAG, 'Found another AVCDecoderConfigurationRecord!');
                }
            }

            var version = v.getUint8(0); // configurationVersion
            var avcProfile = v.getUint8(1); // avcProfileIndication
            var profileCompatibility = v.getUint8(2); // profile_compatibility
            var avcLevel = v.getUint8(3); // AVCLevelIndication

            if (version !== 1 || avcProfile === 0) {
                console.error('FORMAT_ERROR: Flv: Invalid AVCDecoderConfigurationRecord');
                return;
            }

            this._naluLengthSize = (v.getUint8(4) & 3) + 1; // lengthSizeMinusOne
            if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {
                // holy shit!!!
                console.error('FORMAT_ERROR: Flv: Strange NaluLengthSizeMinusOne: ' + (this._naluLengthSize - 1));
                return;
            }

            var spsCount = v.getUint8(5) & 31; // numOfSequenceParameterSets
            if (spsCount === 0) {
                console.error('FORMAT_ERROR: Flv: Invalid AVCDecoderConfigurationRecord: No SPS');
                return;
            } else if (spsCount > 1) {
                _logger.Log.w(this.TAG, 'Strange AVCDecoderConfigurationRecord: SPS Count = ' + spsCount);
            }

            var offset = 6;

            for (var i = 0; i < spsCount; i++) {
                var len = v.getUint16(offset, !le); // sequenceParameterSetLength
                offset += 2;

                if (len === 0) {
                    continue;
                }

                // Notice: Nalu without startcode header (00 00 00 01)
                var sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);
                offset += len;

                var config = _spsParser2.default.parseSPS(sps);
                if (i !== 0) {
                    // ignore other sps's config
                    continue;
                }

                meta.codecWidth = config.codec_size.width;
                meta.codecHeight = config.codec_size.height;
                meta.presentWidth = config.present_size.width;
                meta.presentHeight = config.present_size.height;

                meta.profile = config.profile_string;
                meta.level = config.level_string;
                meta.bitDepth = config.bit_depth;
                meta.chromaFormat = config.chroma_format;
                meta.sarRatio = config.sar_ratio;
                meta.frameRate = config.frame_rate;

                if (config.frame_rate.fixed === false || config.frame_rate.fps_num === 0 || config.frame_rate.fps_den === 0) {
                    meta.frameRate = this._referenceFrameRate;
                }

                var fps_den = meta.frameRate.fps_den;
                var fps_num = meta.frameRate.fps_num;
                meta.refSampleDuration = meta.timescale * (fps_den / fps_num);

                var codecArray = sps.subarray(1, 4);
                var codecString = 'avc1.';
                for (var j = 0; j < 3; j++) {
                    var h = codecArray[j].toString(16);
                    if (h.length < 2) {
                        h = '0' + h;
                    }
                    codecString += h;
                }
                meta.codec = codecString;
            }

            var ppsCount = v.getUint8(offset++); // numOfPictureParameterSets
            if (ppsCount === 0) {
                console.error('FORMAT_ERROR: Flv: Invalid AVCDecoderConfigurationRecord: No PPS');
                return;
            } else if (ppsCount > 1) {
                _logger.Log.w(this.TAG, 'Strange AVCDecoderConfigurationRecord: PPS Count = ' + ppsCount);
            }

            for (var _i = 0; _i < ppsCount; _i++) {
                var _len = v.getUint16(offset, !le); // pictureParameterSetLength
                offset += 2;

                if (_len === 0) {
                    continue;
                }

                // pps is useless for extracting video information
                offset += _len;
            }

            meta.avcc = new Uint8Array(dataSize);
            meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset, dataSize), 0);
            _logger.Log.v(this.TAG, 'Parsed AVCDecoderConfigurationRecord');

            // notify new metadata
            this._dispatch = false;
            // console.log(meta);
            this._onMetadataArrived('video', meta);
        }
    }, {
        key: '_parseAVCVideoData',
        value: function _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, tagTimestamp, tagPosition, frameType, cts) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var units = [],
                length = 0;

            var offset = 0;
            var lengthSize = this._naluLengthSize;
            var dts = this._timestampBase + tagTimestamp;
            var keyframe = frameType === 1; // from FLV Frame Type constants
            var hasTVUSEI = false;
            var tvuSEIData = {};
            var reData = {};
            var hasReplaySEI = false;

            while (offset < dataSize) {
                if (offset + 4 >= dataSize) {
                    _logger.Log.w(this.TAG, 'Malformed Nalu near timestamp ' + dts + ', offset = ' + offset + ', dataSize = ' + dataSize);
                    break; // data not enough for next Nalu
                }
                // Nalu with length-header (AVC1)
                var naluSize = v.getUint32(offset, !le); // Big-Endian read
                if (lengthSize === 3) {
                    naluSize >>>= 8;
                }
                if (naluSize > dataSize - lengthSize) {
                    _logger.Log.w(this.TAG, 'Malformed Nalus near timestamp ' + dts + ', NaluSize > DataSize!');
                    return;
                }

                var unitType = v.getUint8(offset + lengthSize) & 0x1F;

                if (unitType === 5) {
                    // IDR
                    keyframe = true;
                }
                if (unitType === 6) {
                    // SEI
                    var seiOffset = offset + lengthSize + 1;
                    if (v.getUint8(seiOffset++) === 100) {
                        hasTVUSEI = true;
                        tvuSEIData.len1 = v.getUint8(seiOffset);
                        seiOffset += 2; // tvu sei type, version
                        tvuSEIData.subCount = v.getUint8(seiOffset++);
                        var ID = tvuSEIData.subID = [];
                        var subLen = tvuSEIData.subLen = [];
                        for (var i = 0; i < tvuSEIData.subCount; i++) {
                            ID.push(v.getUint8(seiOffset++));
                            var len = v.getUint8(seiOffset++);
                            subLen.push(len);
                            if (ID[i] === 8) {
                                hasReplaySEI = true;
                                this._seiCount++;
                                this._parseReplayData(arrayBuffer, seiOffset + dataOffset, len, dts + cts);
                            } else {
                                // do nothing
                            }
                        }
                    }
                }

                var data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);
                if (!hasTVUSEI) {
                    var unit = { type: unitType, data: data };
                    units.push(unit);
                    length += data.byteLength;
                } else {
                    hasTVUSEI = false;
                }

                if (this._seiCount && !hasReplaySEI && this._seiMiss <= 1) {
                    this._seiMiss++;
                    if (this._seiMiss > 0) {
                        this._seiCount = 0;
                        reData.replayStatus = false;
                        // console.log(reData);
                        this._onReplayData(reData);
                        this._seiMiss = -1;
                    }
                }
                offset += lengthSize + naluSize;
            }

            if (units.length) {
                // let track = this._videoTrack;
                var avcSample = {
                    units: units,
                    length: length,
                    isKeyframe: keyframe,
                    dts: dts,
                    cts: cts,
                    pts: dts + cts
                };
                if (keyframe) {
                    avcSample.fileposition = tagPosition;
                    if (!this._firstIframe) {
                        this._firstIframe = true;
                    }
                }
                // for (let i = 0; i < units.length; i++) {
                //     console.log(units[i]);
                // }

                // this._onVideoSampleArrived(avcSample);
                if (this._stashedVideoSample === null) {
                    this._stashedVideoSample = avcSample;
                    return;
                } else {
                    var stashedSample = this._stashedVideoSample;
                    var duration = avcSample.dts - stashedSample.dts;
                    if (duration > 0) {
                        stashedSample.duration = duration;
                    }
                    // console.log('FLVDemuxer: video dts: ' + stashedSample.dts + ', duration: ' + stashedSample.duration);
                    if (this._firstIframe) {
                        this._onVideoSampleArrived(stashedSample);
                    }
                    this._stashedVideoSample = avcSample;
                }
            }
        }
    }, {
        key: '_parseReplayData',
        value: function _parseReplayData(arrayBuffer, dataOffset, dataSize, pts) {
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            var reData = {};
            var offset = 4;

            var status = v.getUint8(offset++);
            console.log('replay status is ' + status);
            switch (status) {
                case 128:
                    reData.replayStatus = true;
                    this._replayPts = pts;
                    break;
                case 129:
                    if (this._seiCount === 1) {
                        this._replayPts = pts;
                    }
                    reData.replayStatus = true;
                    break;
                default:
                    reData.replayStatus = false;
            }

            reData.replayPosition = Read24n8(arrayBuffer, offset + dataOffset, 0xFF);
            offset += 6;

            reData.replayPts = Read24n8(arrayBuffer, offset + dataOffset, 0xFF);
            offset += 6;

            reData.replayDuration = Read24n8(arrayBuffer, offset + dataOffset, 0xFF);
            offset += 6;

            reData.firstPts = this._replayPts;
            reData.refFps = this._referenceFrameRate.fps;
            console.log(reData);
            this._onReplayData(reData);
        }
    }, {
        key: 'onMetadataArrived',
        get: function get() {
            return this._onMetadataArrived;
        },
        set: function set(callback) {
            this._onMetadataArrived = callback;
        }

        // prototype: function onVideoSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onVideoSampleArrived',
        get: function get() {
            return this._onVideoSampleArrived;
        },
        set: function set(callback) {
            this._onVideoSampleArrived = callback;
        }

        // prototype: function onAudioSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onAudioSampleArrived',
        get: function get() {
            return this._onAudioSampleArrived;
        },
        set: function set(callback) {
            this._onAudioSampleArrived = callback;
        }

        // timestamp base for output samples, must be in milliseconds

    }, {
        key: 'timestampBase',
        get: function get() {
            return this._timestampBase;
        },
        set: function set(base) {
            this._timestampBase = base;
        }

        // prototype: function onReplay(data: tvuSEIData)

    }, {
        key: 'reqReplay',
        get: function get() {
            return this._onReplayData;
        },
        set: function set(callback) {
            this._onReplayData = callback;
        }
    }]);

    return FLVDemuxer;
}();

exports.default = FLVDemuxer;

},{"../../utils/logger":23,"../sps-parser.js":13,"./amf-parser.js":10,"events":3}],12:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _spsParser = _dereq_('../sps-parser.js');

var _spsParser2 = _interopRequireDefault(_spsParser);

var _mediaInfo = _dereq_('../../core/media-info');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ReadBoxName(dataview, offset) {
    var bf = new Buffer(dataview.buffer, offset, 4);
    return bf.toString('ascii');
}

var MP4Demuxer = function () {
    function MP4Demuxer() {
        _classCallCheck(this, MP4Demuxer);

        // {track_id: type}
        this._trackDetail = {};
        this._currentTrackType = null;
        this._currentTrackId = 0;
        this._currentTrackSize = 0;

        this._hasVideo = false;
        this._hasAudio = false;

        this._elst = {};
        this._mdhd = {};
        this._stsc = {};
        this._stsz = {};
        this._stco = {};
        this._stts = {};

        this._metadata = null;
        this._videoMetadata = null;
        this._audioMetadata = null;

        this._timestampBase = 0; // int32
        this._timescale = 0; // int32
        this._duration = 0; // int32
        this._referenceFrameRate = {
            fixed: true,
            fps: 23.976,
            fps_num: 23976,
            fps_den: 1000
        };

        this._mediaInfo = new _mediaInfo.MediaInfo();
        this._types = {
            avc1: 'avc1', ctts: 'ctts', edts: 'edts', elst: 'elst',
            esds: 'esds', ftyp: 'ftyp', mdat: 'mdat', mdhd: 'mdhd',
            mdia: 'mdia', minf: 'minf', mp4a: 'mp4a', moof: 'moof',
            moov: 'moov', mvhd: 'mvhd', stbl: 'stbl',
            stco: 'stco', stsc: 'stsc', stsd: 'stsd', stsz: 'stsz',
            stts: 'stts', trak: 'trak', tkhd: 'tkhd'
        };

        this._trackTypes = { audio: 'audio', video: 'video' };

        this._mpegSamplingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

        this._littleEndian = function () {
            var buf = new ArrayBuffer(2);
            new DataView(buf).setInt16(0, 256, true); // little-endian write
            return new Int16Array(buf)[0] === 256; // platform-spec read, if equal then LE
        }();
    }

    _createClass(MP4Demuxer, [{
        key: 'destroy',
        value: function destroy() {
            this._mediaInfo = null;
            this._metadata = null;
            this._audioMetadata = null;
            this._videoMetadata = null;

            this._currentTrackType = null;

            this._onMetadataArrived = null;
            this._onVideoSampleArrived = null;
            this._onAudioSampleArrived = null;

            this._elst = null;
            this._mdhd = null;
            this._stsc = null;
            this._stsz = null;
            this._stco = null;
            this._stts = null;
        }

        // prototype: function onMetadataArrived(type: string, metadata: any): void

    }, {
        key: 'parseChunks',
        value: function parseChunks(chunk) {
            var ftyp = null;
            var stsd = null;
            var ctts = null;

            var id = void 0;
            var offset = 0;
            var le = this._littleEndian;

            var v = new DataView(chunk, offset);
            var box_n = ReadBoxName(v, offset + 4);
            // let meta = this._videoMetadata;

            if (box_n === this._types.ftyp) {
                var dataSize = v.getUint32(offset, !le);
                ftyp = this._parseFtyp(chunk, offset, dataSize);
                offset += dataSize;
            } else {
                console.warn('MP4Demuxer: Input file is not mp4 format!');
                return;
            }

            while (offset < chunk.byteLength) {
                var _dataSize = v.getUint32(offset, !le);
                box_n = ReadBoxName(v, offset + 4);

                switch (box_n) {
                    case this._types.moov:
                    case this._types.mdia:
                    case this._types.minf:
                    case this._types.stbl:
                        offset += 8;
                        break;
                    case this._types.trak:
                        this._currentTrackSize = _dataSize;
                        offset += 8;
                        break;
                    case this._types.mvhd:
                        this._parseMvhd(chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    case this._types.tkhd:
                        {
                            var trackType = this._parseTkhd(chunk, offset, _dataSize);
                            this._currentTrackType = Object.keys(trackType)[0];
                            this._currentTrackId = Object.values(trackType)[0];
                            // Need to Modify: how to detect if the trak is video or audio
                            Object.assign(this._trackDetail, trackType);
                            // if (this._currentTrackType === this._trackTypes.audio) {
                            //     console.warn('MP4Demuxer: Meet audio trak or other!');                
                            //     offset = offset - 8 + this._currentTrackSize;
                            //     break;
                            // }
                            offset += _dataSize;
                            break;
                        }
                    case this._types.edts:
                        offset += 8;
                        _dataSize = v.getUint32(offset, !le);
                        box_n = ReadBoxName(v, offset + 4);
                        if (box_n === this._types.elst) {
                            this._elst[this._currentTrackId] = this._parseElst(chunk, offset, _dataSize);
                        }
                        offset += _dataSize;
                        break;
                    case this._types.mdhd:
                        this._parseMdhd(this._currentTrackType, chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    case this._types.stsd:
                        stsd = this._parseStsd(chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    case this._types.stsc:
                        this._stsc[this._currentTrackId] = this._parseStsc(chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    case this._types.stsz:
                        this._stsz[this._currentTrackId] = this._parseStsz(chunk, offset, _dataSize);
                        offset += _dataSize;
                        // this._parseScriptData(chunk.byteLength, ftyp, stsd, this._stsz[this._currentTrackId]);
                        break;
                    case this._types.stco:
                        this._stco[this._currentTrackId] = this._parseStco(chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    case this._types.stts:
                        this._stts[this._currentTrackId] = this._parseStts(chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    case this._types.ctts:
                        ctts = this._parseCtts(chunk, offset, _dataSize);
                        offset += _dataSize;
                        break;
                    default:
                        offset += _dataSize;
                }
            }

            // video samples details
            if (this._hasVideo) {
                var sam2chk = this._samDetails(this._stsc[this._trackDetail.video], this._stsz[this._trackDetail.video], this._stco[this._trackDetail.video]);
                this._timeDetials(sam2chk, this._videoMetadata.timescale_mdhd, this._timescale, this._stts[this._trackDetail.video], this._elst[this._trackDetail.video], ctts);

                for (var i = 0; i < sam2chk.length; i++) {
                    this._onVideoSampleArrived(this._parseAVCVideoData(chunk, sam2chk[i].offset, sam2chk[i].size, sam2chk[i].dts, sam2chk[i].offset, sam2chk[i].duration, sam2chk[i].cts));
                }
            }

            // audio samples detials
            if (this._hasAudio) {
                var _sam2chk = this._samDetails(this._stsc[this._trackDetail.audio], this._stsz[this._trackDetail.audio], this._stco[this._trackDetail.audio]);
                this._timeDetials(_sam2chk, this._audioMetadata.timescale_mdhd, this._timescale, this._stts[this._trackDetail.audio], this._elst[this._trackDetail.audio], null);

                for (var _i = 0; _i < _sam2chk.length; _i++) {
                    this._onAudioSampleArrived(this._parseAACAudioData(chunk, _sam2chk[_i].offset, _sam2chk[_i].size, _sam2chk[_i].dts, _sam2chk[_i].duration));
                }
            }

            // this._dispatch = true;
            // // dispatch parsed frames to consumer (typically, the remuxer)
            // if (this._isInitialMetadataDispatched()) {
            //     if (this._dispatch && (this._audioTrack.length || this._videoTrack.length)) {
            //         this._onDataAvailable(this._audioTrack, this._videoTrack);
            //     }
            // }
            // return offset;  // consumed bytes, just equals latest offset index
        }
    }, {
        key: '_parseFtyp',
        value: function _parseFtyp(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var offset = 8;
            var ftypDetail = {};

            ftypDetail.major_brand = ReadBoxName(v, dataOffset + offset);
            offset += 4;
            ftypDetail.minor_version = v.getUint32(offset, !le).toString();
            offset += 4;
            var compatBrands = [];
            while (offset + 4 < dataSize) {
                compatBrands.push(ReadBoxName(v, dataOffset + offset));
                offset += 4;
            }
            ftypDetail.compatible_brands = compatBrands;
            return ftypDetail;
        }
    }, {
        key: '_parseMvhd',
        value: function _parseMvhd(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var offset = 20;

            this._timescale = v.getUint32(offset, !le);
            offset += 4;
            this._duration = v.getUint32(offset, !le);
            offset += 4;

            this._audioMetadata = {};
            this._audioMetadata.type = 'audio';
            this._audioMetadata.timescale = this._timescale;
            this._audioMetadata.duration = this._duration;

            this._videoMetadata = {};
            this._videoMetadata.type = 'video';
            this._videoMetadata.timescale = this._timescale;
            this._videoMetadata.duration = this._duration;

            // if (!meta) {
            //     if (this._hasVideo === false) {
            //         this._hasVideo = true;
            //         this._mediaInfo.hasVideo = true;
            //     }

            //     // meta = this._videoMetadata = {};
            //     // meta.type = 'video';

            //     // meta.id = 1;
            // } else {
            //     if (typeof meta.avcc !== 'undefined') {
            //         console.warn('MP4Demuxer: Found another AVCDecoderConfigurationRecord!');
            //     }
            // }
        }
    }, {
        key: '_parseTkhd',
        value: function _parseTkhd(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            // let meta = this._videoMetadata;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var offset = 8;
            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var trackId = 0;
            // let result = {};

            if (version === 0) {
                offset += 8;
                trackId = v.getUint32(offset, !le);
                offset += 4;
                offset += 8; // reserved 4 bytes + duration 4 bytes
            } else if (version === 1) {
                // offset += 16;
                // trackId = v.getUint32(offset, !le);
            }

            offset += 8; // reserved 4x2 bytes
            offset += 4; // layer 2 bytes + alter group 2 bytes
            var volume = v.getUint16(offset, !le);
            offset += 4; // volume 2 bytes + reserved 2 bytes
            if (volume === 0x100) {
                this._hasAudio = true;
                return { audio: trackId };
            }

            offset += 36; // reserved 36 bytes
            var width = v.getUint16(offset, !le);
            offset += 4; // width 2 bytes + reserved 2
            var height = v.getUint16(offset, !le);
            offset += 4; // height 2 bytes + reserved 2

            if (width !== 0 && height !== 0) {
                this._hasVideo = true;
                return { video: trackId };
            }

            return {};
        }
    }, {
        key: '_parseElst',
        value: function _parseElst(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var elstDetail = {};

            var offset = 8;
            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;

            var entryCount = v.getUint32(offset, !le);
            offset += 4;
            elstDetail.entries = [];
            for (var i = 0; i < entryCount; i++) {
                if (version === 0) {
                    var segDuration = v.getInt32(offset, !le);
                    offset += 4;
                    var mediaTime = v.getInt32(offset, !le);
                    offset += 4;
                    if (mediaTime < 0) {
                        // console.log(mediaTime);
                        this._timestampBase = segDuration;
                    } else {
                        var entry = {};
                        entry.segDuration = segDuration;
                        entry.mediaTime = mediaTime;
                        elstDetail.entries.push(entry);
                    }
                } // else if (version === 1)
                // entry.mediaRateInt = v.getUint16(offset, !le);
                // entry.mediaRateFrac = v.getUint16(offset + 2, !le);
                offset += 4;
            }
            return elstDetail;
        }
    }, {
        key: '_parseMdhd',
        value: function _parseMdhd(type, arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var mdhdDetail = {};
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            // let track = this._videoTrack;
            var offset = 8;
            var meta = void 0;

            if (type === this._trackTypes.audio) {
                meta = this._audioMetadata;
            } else if (type === this._trackTypes.video) {
                meta = this._videoMetadata;
            }

            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;

            if (version === 0) {
                offset += 8;
                meta.timescale_mdhd = v.getUint32(offset, !le);
                offset += 4;
                meta.duration_mdhd = v.getUint32(offset, !le);
                // meta.duration = meta.duration_mdhd / meta.timescale_mdhd * this._timescale;
                offset += 4;
            } else if (version === 1) {
                offset += 16;
                // meta.timescale_mdhd = v.getUint32(offset, !le);
                offset += 4;
                //meta.duration_mdhd = v.getUint64
                offset += 8;
            }
            offset += 4; //language + predefined
        }
    }, {
        key: '_parseStsd',
        value: function _parseStsd(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var stsdDetail = {};
            var offset = 8;

            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var entryCount = v.getUint32(offset, !le);
            offset += 4;
            var box_n = ReadBoxName(v, dataOffset + offset + 4);

            if (box_n === this._types.mp4a) {
                stsdDetail.mp4a = {};
                var meta = this._audioMetadata;
                offset += 14;
                stsdDetail.mp4a.dataRefIndex = v.getUint16(offset, !le);
                offset += 10;
                stsdDetail.mp4a.channelCount = v.getUint16(offset, !le);
                offset += 2;
                stsdDetail.mp4a.sampleSize = v.getUint16(offset, !le);
                offset += 2;
                offset += 4; // pre-define 2 + reserved 2;
                stsdDetail.mp4a.sampleRate = v.getUint16(offset, !le);
                offset += 4; // sampleRate = timescale << 16, int32
                stsdDetail.mp4a.esdsSize = v.getUint32(offset, !le);
                stsdDetail.mp4a.esdsData = this._parseEsds(arrayBuffer, dataOffset + offset, stsdDetail.mp4a.esdsSize);

                var misc = stsdDetail.mp4a.esdsData;
                meta.audioSampleRate = misc.samplingRate;
                meta.channelCount = misc.channelCount;
                meta.codec = misc.codec;
                meta.originalCodec = misc.originalCodec;
                meta.config = misc.config;
                // The decode result of an aac sample is 1024 PCM samples
                meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale;
                meta.id = this._trackDetail.audio;
                // console.log('Parsed AudioSpecificConfig');

                // then notify new metadata
                // console.log(meta);
                this._onMetadataArrived('audio', meta);
            } else if (box_n === this._types.avc1) {
                var _meta = this._videoMetadata;
                stsdDetail.avc1 = {};
                stsdDetail.avc1.size = v.getUint32(offset, !le);
                offset += 14;
                stsdDetail.avc1.dataRefIndex = v.getUint16(offset, !le);
                offset += 18;
                stsdDetail.avc1.width = v.getUint16(offset, !le);
                offset += 2;
                stsdDetail.avc1.height = v.getUint16(offset, !le);
                offset += 14;

                stsdDetail.avc1.frameCount = v.getUint16(offset, !le);
                offset += 2;
                // stsdDetail.avc1.strlen = v.getUint8(offset);
                // let bf = new Buffer(v.buffer, dataOffset + offset + 1, stsdDetail.avc1.strlen);
                // stsdDetail.avc1.compreName = bf.toString('ascii');
                offset += 32;

                stsdDetail.avc1.depth = v.getUint16(offset, !le);
                offset += 4;

                var avcC = {};
                avcC.size = v.getUint32(offset, !le);
                var avcCData = new Uint8Array(avcC.size - 8);
                offset += 8;
                avcCData.set(new Uint8Array(arrayBuffer, dataOffset + offset, avcC.size - 8), 0);
                console.log('MP4Demuxer: Copied AVCDecoderConfigurationRecord!');
                _meta.avcc = avcCData;
                var confVer = v.getUint8(offset++); // configurationVersion
                var avcProfile = v.getUint8(offset++); // avcProfileIndication
                var profileCompatibility = v.getUint8(offset++); // profile_compatibility
                var avcLevel = v.getUint8(offset++); // AVCLevelIndication

                if (confVer !== 1 || avcProfile === 0) {
                    // this._onError(DemuxErrors.FORMAT_ERROR, 'MP4: Invalid AVCDecoderConfigurationRecord');
                    return;
                }

                this._naluLengthSize = (v.getUint8(offset++) & 3 & 3) + 1;
                if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {
                    // holy shit!!!
                    // this._onError(DemuxErrors.FORMAT_ERROR, `MP4: Strange NaluLengthSizeMinusOne: ${this._naluLengthSize - 1}`);
                    return;
                }

                var spsNum = v.getUint8(offset++) & 0x1f & 0x1f; // numOfSequenceParameterSets
                if (spsNum === 0) {
                    // this._onError(DemuxErrors.FORMAT_ERROR, 'MP4: Invalid AVCDecoderConfigurationRecord: No SPS');
                    return;
                } else if (spsNum > 1) {
                    console.info('MP4Demuxer: MP4: Strange AVCDecoderConfigurationRecord: SPS Count = ' + spsNum);
                }

                for (var i = 0; i < spsNum; i++) {
                    var len = v.getUint16(offset, !le); // sequenceParameterSetLength
                    // spsLen = [];
                    // let spsLen = spsLen[i] = ReadBig16(stsd, offset);
                    offset += 2;
                    if (len === 0) {
                        continue;
                    }

                    var sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);
                    offset += len;

                    var config = _spsParser2.default.parseSPS(sps);
                    if (i !== 0) {
                        // ignore other sps's config
                        continue;
                    }

                    _meta.codecWidth = config.codec_size.width;
                    _meta.codecHeight = config.codec_size.height;
                    _meta.presentWidth = config.present_size.width;
                    _meta.presentHeight = config.present_size.height;

                    _meta.profile = config.profile_string;
                    _meta.level = config.level_string;
                    _meta.bitDepth = config.bit_depth;
                    _meta.chromaFormat = config.chroma_format;
                    _meta.sarRatio = config.sar_ratio;
                    _meta.frameRate = config.frame_rate;

                    if (config.frame_rate.fixed === false || config.frame_rate.fps_num === 0 || config.frame_rate.fps_den === 0) {
                        _meta.frameRate = this._referenceFrameRate;
                    }

                    var fps_den = _meta.frameRate.fps_den;
                    var fps_num = _meta.frameRate.fps_num;
                    _meta.refSampleDuration = _meta.timescale * (fps_den / fps_num);

                    var codecArray = sps.subarray(1, 4);
                    var codecString = 'avc1.';
                    for (var j = 0; j < 3; j++) {
                        var h = codecArray[j].toString(16);
                        if (h.length < 2) {
                            h = '0' + h;
                        }
                        codecString += h;
                    }
                    _meta.codec = codecString;

                    // let mi = this._mediaInfo;
                    // mi.width = meta.codecWidth;
                    // mi.height = meta.codecHeight;
                    // mi.fps = meta.frameRate.fps;
                    // mi.profile = meta.profile;
                    // mi.level = meta.level;
                    // mi.chromaFormat = config.chroma_format_string;
                    // mi.sarNum = meta.sarRatio.width;
                    // mi.sarDen = meta.sarRatio.height;
                    // mi.videoCodec = codecString;

                    // if (mi.hasAudio) {
                    //     if (mi.audioCodec != null) {
                    //         mi.mimeType = 'video/mp4; codecs="' + mi.videoCodec + ',' + mi.audioCodec + '"';
                    //     }
                    // } else {
                    //     mi.mimeType = 'video/mp4; codecs="' + mi.videoCodec + '"';
                    // }
                    // if (mi.isComplete()) {
                    //     this._onMediaInfo(mi);
                    // }
                }

                var ppsNum = v.getUint8(offset++); // numOfPictureParameterSets
                if (ppsNum === 0) {
                    // this._onError(DemuxErrors.FORMAT_ERROR, 'MP4: Invalid AVCDecoderConfigurationRecord: No PPS');
                    return;
                } else if (ppsNum > 1) {
                    console.info('MP4Demuxer: MP4: Strange AVCDecoderConfigurationRecord: PPS Count = ' + ppsNum);
                }

                for (var _i2 = 0; _i2 < ppsNum; _i2++) {
                    var _len = v.getUint16(offset, !le); // pictureParameterSetLength
                    offset += 2;

                    if (_len === 0) {
                        continue;
                    }

                    // pps is useless for extracting video information
                    offset += _len;
                }

                _meta.id = this._trackDetail.video;
                // console.log(meta);
                this._onMetadataArrived('video', _meta);
            } else {
                console.warn('MP4Demuxer: Input file\'s video is not encoded as expect!');
                return;
            }
            return stsdDetail;
        }
    }, {
        key: '_parseStsc',
        value: function _parseStsc(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var stscDetail = {};
            var offset = 8;

            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var entryCount = v.getUint32(offset, !le);
            stscDetail.entryCount = entryCount;
            offset += 4;

            stscDetail.entries = [];
            for (var i = 0; i < entryCount; i++) {
                var entry = {};
                entry.firstChk = v.getUint32(offset, !le);
                offset += 4;
                entry.samPerChk = v.getUint32(offset, !le);
                offset += 4;
                entry.samDesIndex = v.getUint32(offset, !le);
                offset += 4;
                stscDetail.entries.push(entry);
            }
            return stscDetail;
        }
    }, {
        key: '_parseStsz',
        value: function _parseStsz(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var stszDetail = {};
            var offset = 8;

            var filesize = 0;
            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            stszDetail.sampleSize = v.getUint32(offset, !le);
            offset += 4;
            var sampleCount = v.getUint32(offset, !le);
            stszDetail.sampleCount = sampleCount;
            offset += 4;

            stszDetail.samples = [];
            for (var i = 0; i < sampleCount; i++) {
                var sampleSize = v.getUint32(offset, !le);
                filesize += sampleSize;
                stszDetail.samples.push(v.getUint32(offset, !le));
                offset += 4;
            }
            stszDetail.total = filesize;
            return stszDetail;
        }
    }, {
        key: '_parseStco',
        value: function _parseStco(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var stcoDetail = {};
            var offset = 8;

            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var entryCount = v.getUint32(offset, !le);
            stcoDetail.entryCount = entryCount;
            offset += 4;

            stcoDetail.entries = [];
            for (var i = 0; i < entryCount; i++) {
                stcoDetail.entries.push(v.getUint32(offset, !le));
                offset += 4;
            }
            return stcoDetail;
        }
    }, {
        key: '_parseStts',
        value: function _parseStts(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var sttsDetail = {};
            var offset = 8;

            var version = v.getUint8(offset);
            var flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var entrycount = v.getUint32(offset, !le);
            sttsDetail.entryCount = entrycount;
            offset += 4;

            sttsDetail.entries = [];
            for (var i = 0; i < entrycount; i++) {
                var entry = {};
                entry.samCount = v.getUint32(offset, !le);
                offset += 4;
                entry.samDelta = v.getUint32(offset, !le);
                offset += 4;
                sttsDetail.entries.push(entry);
            }
            return sttsDetail;
        }
    }, {
        key: '_parseCtts',
        value: function _parseCtts(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var cttsDetail = {};
            var offset = 8;

            // let version = v.getUint8(offset);
            // let flag = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var entrycount = v.getUint32(offset, !le);
            cttsDetail.entryCount = entrycount;
            offset += 4;

            cttsDetail.entries = [];
            for (var i = 0; i < entrycount; i++) {
                var entry = {};
                entry.samCount = v.getUint32(offset, !le);
                offset += 4;
                entry.offset = v.getUint32(offset, !le);
                offset += 4;
                cttsDetail.entries.push(entry);
            }
            return cttsDetail;
        }
    }, {
        key: '_parseEsds',
        value: function _parseEsds(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var esdsDetail = {};
            var offset = 12;

            var MP4ESDescrTag = v.getUint8(offset);
            if (MP4ESDescrTag !== 3) {
                console.error('Mp4 element stream description error');
                return;
            }
            var ex3 = v.getUint32(offset, !le) & 0x00FFFFFF;
            if (ex3 === 0x808080) {
                offset += 3;
            }
            offset++;
            var sizeESDescr = v.getUint8(offset++);
            var es_id = v.getUint16(offset, !le);
            offset += 3;

            var MP4DecConfigDescrTag = v.getUint8(offset);
            if (MP4DecConfigDescrTag !== 4) {
                console.error('Mp4 decode config description error');
                return;
            }
            var ex4 = v.getUint32(offset, !le) & 0x00FFFFFF;
            if (ex4 === 0x808080) {
                offset += 3;
            }
            offset++;
            var sizeDecConfigDescr = v.getUint8(offset++);
            var codec_id = v.getUint8(offset++);
            var codec = '';
            var stream_type = v.getUint8(offset);
            var bufferSize = v.getUint32(offset, !le) & 0x00FFFFFF;
            offset += 4;
            var maxBitrate = v.getUint32(offset, !le); // unuse
            offset += 4;
            var avgBitrate = v.getUint32(offset, !le); // unuse
            offset += 4;

            var MP4DecSpecificDescrTag = v.getUint8(offset);
            if (MP4DecSpecificDescrTag !== 5) {
                console.error('Mp4 decode config description error');
                return;
            }
            var ex5 = v.getUint32(offset, !le) & 0x00FFFFFF;
            if (ex5 === 0x808080) {
                offset += 3;
            }
            offset++;
            var sizeDecSpecificDescr = v.getUint8(offset++);

            if (codec_id === 0x40) {
                var array = new Uint8Array(arrayBuffer, dataOffset + offset, sizeDecSpecificDescr);
                var config = null;
                // /* Copy from flv.js/flv-demuxer
                //    Audio Object Type:
                //    0: Null
                //    1: AAC Main
                //    2: AAC LC
                //    3: AAC SSR (Scalable Sample Rate)
                //    4: AAC LTP (Long Term Prediction)
                //    5: HE-AAC / SBR (Spectral Band Replication)
                //    6: AAC Scalable
                // */
                var originalAudioObjectType = 0;

                // 5 bits
                var audioObjectType = originalAudioObjectType = array[0] >>> 3;
                // 4 bits
                var samplingIndex = (array[0] & 0x07) << 1 | array[1] >>> 7;
                // if (samplingIndex < 0 || samplingIndex >= this._mpegSamplingRates.length) {
                //     // error
                // }
                // 4 bits
                var channelarray = (array[1] & 0x78) >>> 3;
                // if (channelarray < 0 || channelarray >= 8) {
                //     // error
                // }

                var audioExtensionObjectType = null;
                var extensionSamplingIndex = null;

                var samplingFrequence = this._mpegSamplingRates[samplingIndex];

                if (audioObjectType === 5) {
                    // HE-AAC
                    // 4 bits
                    extensionSamplingIndex = (array[1] & 0x07) << 1 | array[2] >>> 7;
                    // 5 bits
                    audioExtensionObjectType = (array[2] & 0x7C) >>> 2;
                }

                audioObjectType = 5;
                extensionSamplingIndex = samplingIndex;
                config = new Array(4);

                if (samplingIndex >= 6) {
                    extensionSamplingIndex = samplingIndex - 3;
                } else if (channelarray === 1) {
                    // Mono channel
                    audioObjectType = 2;
                    config = new Array(2);
                    extensionSamplingIndex = samplingIndex;
                }

                config[0] = audioObjectType << 3;
                config[0] |= (samplingIndex & 0x0F) >>> 1;
                config[1] = (samplingIndex & 0x0F) << 7;
                config[1] |= (channelarray & 0x0F) << 3;
                if (audioObjectType === 5) {
                    config[1] |= (extensionSamplingIndex & 0x0F) >>> 1;
                    config[2] = (extensionSamplingIndex & 0x01) << 7;
                    // extended audio object type: force to 2 (LC-AAC)
                    config[2] |= 2 << 2;
                    config[3] = 0;
                }

                return {
                    config: config,
                    samplingRate: samplingFrequence,
                    channelCount: channelarray,
                    codec: 'mp4a.40.' + audioObjectType,
                    originalCodec: 'mp4a.40.' + originalAudioObjectType
                };
            } else {
                console.warn('MP4Demuxer: Input file\'s audio is not encoded as expect!');
                return;
            }
        }
    }, {
        key: '_parseScriptData',
        value: function _parseScriptData(filesize, ftyp, stsd, stsz) {
            var scriptData = {};
            scriptData.onMetaData = {};
            scriptData.onMetaData = Object.assign(scriptData.onMetaData, ftyp);
            if (scriptData.onMetaData == null || _typeof(scriptData.onMetaData) !== 'object') {
                console.warn('MP4Demuxer: Invalid onMetaData structure!');
                return;
            }
            if (this._metadata) {
                console.warn('MP4Demuxer: Found another onMetaData tag!');
            }
            this._metadata = scriptData;
            var onMetaData = this._metadata.onMetaData;

            if (typeof onMetaData.hasVideo === 'boolean') {
                // hasVideo
                if (this._hasVideoFlagOverrided === false) {
                    this._hasVideo = onMetaData.hasVideo;
                    this._mediaInfo.hasVideo = this._hasVideo;
                }
            }

            if (typeof stsd.avc1.width === 'number') {
                // width
                onMetaData.width = stsd.avc1.width;
                this._mediaInfo.width = onMetaData.width;
            }
            if (typeof stsd.avc1.height === 'number') {
                // height
                onMetaData.height = stsd.avc1.height;
                this._mediaInfo.height = onMetaData.height;
            }

            var duration = this._videoMetadata.duration;
            this._duration = duration;
            onMetaData.duration = duration / this._timescale;
            this._mediaInfo.duration = duration;

            onMetaData.videocodecid = 7;

            onMetaData.filesize = filesize;

            onMetaData.videodatarate = stsz.total * 8 / onMetaData.duration / 1000;
            this._mediaInfo.videoDataRate = onMetaData.videodatarate;

            onMetaData.framerate = stsz.sampleCount * this._timescale / this._duration;
            var fps_num = Math.floor(onMetaData.framerate * 1000);
            if (fps_num > 0) {
                var fps = fps_num / 1000;
                this._referenceFrameRate.fixed = true;
                this._referenceFrameRate.fps = fps;
                this._referenceFrameRate.fps_num = fps_num;
                this._referenceFrameRate.fps_den = 1000;
                this._mediaInfo.fps = fps;
            }

            this._mediaInfo.hasKeyframesIndex = false;
            this._dispatch = false;
            this._mediaInfo.metadata = onMetaData;
            // console.log('MP4Demuxer: Parsed onMetaData');                    
            if (this._mediaInfo.isComplete()) {
                this._onMediaInfo(this._mediaInfo);
            }
        }
    }, {
        key: '_samDetails',
        value: function _samDetails(stsc, stsz, stco) {
            var count = stco.entryCount;
            var chkEntris = new Array(count);
            var sam2chk = [];
            var sampleIndex = 0;
            var lastChkCount = count + 1;

            for (var i = stsc.entryCount - 1; i >= 0; i--) {
                var beginChkCount = stsc.entries[i].firstChk;
                for (var j = beginChkCount - 1; j < lastChkCount - 1; j++) {
                    var chkEntry = {};
                    chkEntry.samCount = stsc.entries[i].samPerChk;
                    chkEntry.sdi = stsc.entries[i].samDesIndex;
                    chkEntris[j] = chkEntry;
                }
                lastChkCount = beginChkCount;
            }

            for (var k = 0; k < chkEntris.length; k++) {
                chkEntris[k].firstSamIndex = sampleIndex;

                var indexInChk = 0;
                var samOffset = stco.entries[k];
                for (var l = 0; l < chkEntris[k].samCount; l++) {
                    var stscSamEntry = {};
                    stscSamEntry.chkIndex = k;
                    stscSamEntry.indexInChk = indexInChk;
                    stscSamEntry.offset = samOffset;
                    stscSamEntry.size = stsz.samples[sampleIndex];
                    samOffset += stscSamEntry.size;
                    sam2chk.push(stscSamEntry);

                    sampleIndex++;
                    indexInChk++;
                }
            }
            if (sampleIndex == sam2chk.length) {
                return sam2chk;
            } else {
                console.warn('MP4Demuxer: Map samples to chunk!! Wrong sample count!!');
            }
        }
    }, {
        key: '_timeDetials',
        value: function _timeDetials(sam, mdhdts, mvhdts, stts, elst, ctts) {
            var sampleIndex = 0;
            var startTime = elst !== null && elst !== undefined ? elst.entries[0].mediaTime : 0;
            var dtsSum = 0;

            for (var i = 0; i < stts.entryCount; i++) {
                for (var j = 0; j < stts.entries[i].samCount; j++) {
                    var timeEntry = {};
                    timeEntry.dts = Math.round(dtsSum + stts.entries[i].samDelta / mdhdts * mvhdts * j - startTime / mdhdts * mvhdts);
                    if (j == stts.entries[i].samCount - 1) {
                        dtsSum += stts.entries[i].samDelta / mdhdts * mvhdts * (j + 1);
                    }
                    timeEntry.cts = 0;
                    // timeEntry.pts = timeEntry.dts;
                    timeEntry.duration = stts.entries[i].samDelta / mdhdts * mvhdts;
                    sam[sampleIndex] = Object.assign(sam[sampleIndex], timeEntry);
                    sampleIndex++;
                }
            }

            if (ctts !== null) {
                var index = 0;
                for (var k = 0; k < ctts.entryCount; k++) {
                    for (var l = 0; l < ctts.entries[k].samCount; l++) {
                        var cts = Math.round(ctts.entries[k].offset / mdhdts * mvhdts);
                        sam[index].cts = cts;
                        index++;
                    }
                    // sampleIndex += ctts.entries[k].samCount
                }
            }
        }
    }, {
        key: '_parseAVCVideoData',
        value: function _parseAVCVideoData(arrayBuffer, dataOffset, dataSize, timestamp, tagPosition, duration, cts) {
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var keyframe = false;
            var units = [],
                length = 0;

            var offset = 0;
            var lengthSize = this._naluLengthSize;
            var dts = timestamp + this._timestampBase;

            while (offset < dataSize) {
                if (offset + 4 >= dataSize) {
                    console.warn('MP4Demuxer: Malformed Nalu near timestamp ' + dts + ', offset = ' + offset + ', dataSize = ' + dataSize);
                    break; // data not enough for next Nalu
                }
                // Nalu with length-header (AVC1)
                var naluSize = v.getUint32(offset, !le); // Big-Endian read
                if (lengthSize === 3) {
                    naluSize >>>= 8;
                }
                if (naluSize > dataSize - lengthSize) {
                    console.warn('MP4Demuxer: Malformed Nalus near timestamp ' + dts + ', NaluSize > DataSize!');
                    return;
                }

                var unitType = v.getUint8(offset + lengthSize) & 0x1F;

                if (unitType === 5) {
                    // IDR
                    keyframe = true;
                }

                var data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);
                var unit = { type: unitType, data: data };
                units.push(unit);
                length += data.byteLength;

                offset += lengthSize + naluSize;
            }

            if (units.length) {
                var avcSample = {
                    units: units,
                    length: length,
                    isKeyframe: keyframe,
                    dts: dts,
                    cts: cts,
                    pts: dts + cts,
                    duration: duration
                };
                if (keyframe) {
                    avcSample.fileposition = tagPosition;
                }
                // for (let i = 0; i < units.length; i++) {
                //     console.log(units[i]);
                // }
                return avcSample;
                // track.samples.push(avcSample);
                // track.length += length;
            }
        }
    }, {
        key: '_parseAACAudioData',
        value: function _parseAACAudioData(arrayBuffer, dataOffset, dataSize, dts, duration) {
            var array = new Uint8Array(arrayBuffer, dataOffset, dataSize);
            var length = 0;
            var aacSample = { unit: array, dts: dts, pts: dts, duration: duration };
            aacSample.length = array.length;
            return aacSample;
        }
    }, {
        key: 'onMetadataArrived',
        get: function get() {
            return this._onMetadataArrived;
        },
        set: function set(callback) {
            this._onMetadataArrived = callback;
        }

        // prototype: function onVideoSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onVideoSampleArrived',
        get: function get() {
            return this._onVideoSampleArrived;
        },
        set: function set(callback) {
            this._onVideoSampleArrived = callback;
        }

        // prototype: function onAudioSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onAudioSampleArrived',
        get: function get() {
            return this._onAudioSampleArrived;
        },
        set: function set(callback) {
            this._onAudioSampleArrived = callback;
        }
    }]);

    return MP4Demuxer;
}();

exports.default = MP4Demuxer;

}).call(this,_dereq_("buffer").Buffer)

},{"../../core/media-info":6,"../sps-parser.js":13,"buffer":2}],13:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _expGolomb = _dereq_('./exp-golomb.js');

var _expGolomb2 = _interopRequireDefault(_expGolomb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SPSParser = function () {
    function SPSParser() {
        _classCallCheck(this, SPSParser);
    }

    _createClass(SPSParser, null, [{
        key: '_ebsp2rbsp',
        value: function _ebsp2rbsp(uint8array) {
            var src = uint8array;
            var src_length = src.byteLength;
            var dst = new Uint8Array(src_length);
            var dst_idx = 0;

            for (var i = 0; i < src_length; i++) {
                if (i >= 2) {
                    // Unescape: Skip 0x03 after 00 00
                    if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {
                        continue;
                    }
                }
                dst[dst_idx] = src[i];
                dst_idx++;
            }

            return new Uint8Array(dst.buffer, 0, dst_idx);
        }
    }, {
        key: 'parseSPS',
        value: function parseSPS(uint8array) {
            var rbsp = SPSParser._ebsp2rbsp(uint8array);
            var gb = new _expGolomb2.default(rbsp);

            gb.readByte();
            var profile_idc = gb.readByte(); // profile_idc
            gb.readByte(); // constraint_set_flags[5] + reserved_zero[3]
            var level_idc = gb.readByte(); // level_idc
            gb.readUEG(); // seq_parameter_set_id

            var profile_string = SPSParser.getProfileString(profile_idc);
            var level_string = SPSParser.getLevelString(level_idc);
            var chroma_format_idc = 1;
            var chroma_format = 420;
            var chroma_format_table = [0, 420, 422, 444];
            var bit_depth = 8;

            if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 || profile_idc === 244 || profile_idc === 44 || profile_idc === 83 || profile_idc === 86 || profile_idc === 118 || profile_idc === 128 || profile_idc === 138 || profile_idc === 144) {

                chroma_format_idc = gb.readUEG();
                if (chroma_format_idc === 3) {
                    gb.readBits(1); // separate_colour_plane_flag
                }
                if (chroma_format_idc <= 3) {
                    chroma_format = chroma_format_table[chroma_format_idc];
                }

                bit_depth = gb.readUEG() + 8; // bit_depth_luma_minus8
                gb.readUEG(); // bit_depth_chroma_minus8
                gb.readBits(1); // qpprime_y_zero_transform_bypass_flag
                if (gb.readBool()) {
                    // seq_scaling_matrix_present_flag
                    var scaling_list_count = chroma_format_idc !== 3 ? 8 : 12;
                    for (var i = 0; i < scaling_list_count; i++) {
                        if (gb.readBool()) {
                            // seq_scaling_list_present_flag
                            if (i < 6) {
                                SPSParser._skipScalingList(gb, 16);
                            } else {
                                SPSParser._skipScalingList(gb, 64);
                            }
                        }
                    }
                }
            }
            gb.readUEG(); // log2_max_frame_num_minus4
            var pic_order_cnt_type = gb.readUEG();
            if (pic_order_cnt_type === 0) {
                gb.readUEG(); // log2_max_pic_order_cnt_lsb_minus_4
            } else if (pic_order_cnt_type === 1) {
                gb.readBits(1); // delta_pic_order_always_zero_flag
                gb.readSEG(); // offset_for_non_ref_pic
                gb.readSEG(); // offset_for_top_to_bottom_field
                var num_ref_frames_in_pic_order_cnt_cycle = gb.readUEG();
                for (var _i = 0; _i < num_ref_frames_in_pic_order_cnt_cycle; _i++) {
                    gb.readSEG(); // offset_for_ref_frame
                }
            }
            gb.readUEG(); // max_num_ref_frames
            gb.readBits(1); // gaps_in_frame_num_value_allowed_flag

            var pic_width_in_mbs_minus1 = gb.readUEG();
            var pic_height_in_map_units_minus1 = gb.readUEG();

            var frame_mbs_only_flag = gb.readBits(1);
            if (frame_mbs_only_flag === 0) {
                gb.readBits(1); // mb_adaptive_frame_field_flag
            }
            gb.readBits(1); // direct_8x8_inference_flag

            var frame_crop_left_offset = 0;
            var frame_crop_right_offset = 0;
            var frame_crop_top_offset = 0;
            var frame_crop_bottom_offset = 0;

            var frame_cropping_flag = gb.readBool();
            if (frame_cropping_flag) {
                frame_crop_left_offset = gb.readUEG();
                frame_crop_right_offset = gb.readUEG();
                frame_crop_top_offset = gb.readUEG();
                frame_crop_bottom_offset = gb.readUEG();
            }

            var sar_width = 1,
                sar_height = 1;
            var fps = 0,
                fps_fixed = true,
                fps_num = 0,
                fps_den = 0;

            var vui_parameters_present_flag = gb.readBool();
            if (vui_parameters_present_flag) {
                if (gb.readBool()) {
                    // aspect_ratio_info_present_flag
                    var aspect_ratio_idc = gb.readByte();
                    var sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];
                    var sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1];

                    if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {
                        sar_width = sar_w_table[aspect_ratio_idc - 1];
                        sar_height = sar_h_table[aspect_ratio_idc - 1];
                    } else if (aspect_ratio_idc === 255) {
                        sar_width = gb.readByte() << 8 | gb.readByte();
                        sar_height = gb.readByte() << 8 | gb.readByte();
                    }
                }

                if (gb.readBool()) {
                    // overscan_info_present_flag
                    gb.readBool(); // overscan_appropriate_flag
                }
                if (gb.readBool()) {
                    // video_signal_type_present_flag
                    gb.readBits(4); // video_format & video_full_range_flag
                    if (gb.readBool()) {
                        // colour_description_present_flag
                        gb.readBits(24); // colour_primaries & transfer_characteristics & matrix_coefficients
                    }
                }
                if (gb.readBool()) {
                    // chroma_loc_info_present_flag
                    gb.readUEG(); // chroma_sample_loc_type_top_field
                    gb.readUEG(); // chroma_sample_loc_type_bottom_field
                }
                if (gb.readBool()) {
                    // timing_info_present_flag
                    var num_units_in_tick = gb.readBits(32);
                    var time_scale = gb.readBits(32);
                    fps_fixed = gb.readBool(); // fixed_frame_rate_flag

                    fps_num = time_scale;
                    fps_den = num_units_in_tick * 2;
                    fps = fps_num / fps_den;
                }
            }

            var sarScale = 1;
            if (sar_width !== 1 || sar_height !== 1) {
                sarScale = sar_width / sar_height;
            }

            var crop_unit_x = 0,
                crop_unit_y = 0;
            if (chroma_format_idc === 0) {
                crop_unit_x = 1;
                crop_unit_y = 2 - frame_mbs_only_flag;
            } else {
                var sub_wc = chroma_format_idc === 3 ? 1 : 2;
                var sub_hc = chroma_format_idc === 1 ? 2 : 1;
                crop_unit_x = sub_wc;
                crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);
            }

            var codec_width = (pic_width_in_mbs_minus1 + 1) * 16;
            var codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);

            codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;
            codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;

            var present_width = Math.ceil(codec_width * sarScale);

            gb.destroy();
            gb = null;

            return {
                profile_string: profile_string, // baseline, high, high10, ...
                level_string: level_string, // 3, 3.1, 4, 4.1, 5, 5.1, ...
                bit_depth: bit_depth, // 8bit, 10bit, ...
                chroma_format: chroma_format, // 4:2:0, 4:2:2, ...
                chroma_format_string: SPSParser.getChromaFormatString(chroma_format),

                frame_rate: {
                    fixed: fps_fixed,
                    fps: fps,
                    fps_den: fps_den,
                    fps_num: fps_num
                },

                sar_ratio: {
                    width: sar_width,
                    height: sar_height
                },

                codec_size: {
                    width: codec_width,
                    height: codec_height
                },

                present_size: {
                    width: present_width,
                    height: codec_height
                }
            };
        }
    }, {
        key: '_skipScalingList',
        value: function _skipScalingList(gb, count) {
            var last_scale = 8,
                next_scale = 8;
            var delta_scale = 0;
            for (var i = 0; i < count; i++) {
                if (next_scale !== 0) {
                    delta_scale = gb.readSEG();
                    next_scale = (last_scale + delta_scale + 256) % 256;
                }
                last_scale = next_scale === 0 ? last_scale : next_scale;
            }
        }
    }, {
        key: 'getProfileString',
        value: function getProfileString(profile_idc) {
            switch (profile_idc) {
                case 66:
                    return 'Baseline';
                case 77:
                    return 'Main';
                case 88:
                    return 'Extended';
                case 100:
                    return 'High';
                case 110:
                    return 'High10';
                case 122:
                    return 'High422';
                case 244:
                    return 'High444';
                default:
                    return 'Unknown';
            }
        }
    }, {
        key: 'getLevelString',
        value: function getLevelString(level_idc) {
            return (level_idc / 10).toFixed(1);
        }
    }, {
        key: 'getChromaFormatString',
        value: function getChromaFormatString(chroma) {
            switch (chroma) {
                case 420:
                    return '4:2:0';
                case 422:
                    return '4:2:2';
                case 444:
                    return '4:4:4';
                default:
                    return 'Unknown';
            }
        }
    }]);

    return SPSParser;
}();

exports.default = SPSParser;

},{"./exp-golomb.js":9}],14:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _spsParser = _dereq_('../sps-parser.js');

var _spsParser2 = _interopRequireDefault(_spsParser);

var _mediaInfo = _dereq_('../../core/media-info');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WSDemuxer = function () {
    function WSDemuxer() {
        _classCallCheck(this, WSDemuxer);

        this._metadata = null;
        this._videoMetadata = null;

        this._referenceFrameRate = {
            fixed: true,
            fps: 23.976,
            fps_num: 23976,
            fps_den: 1000
        };

        this._mediaInfo = new _mediaInfo.MediaInfo();

        this._littleEndian = function () {
            var buf = new ArrayBuffer(2);
            new DataView(buf).setInt16(0, 256, true); // little-endian write
            return new Int16Array(buf)[0] === 256; // platform-spec read, if equal then LE
        }();
    }

    // prototype: function onMetadataArrived(type: string, metadata: any): void


    _createClass(WSDemuxer, [{
        key: 'parseChunks',
        value: function parseChunks(chunk) {
            var v = new DataView(chunk, 0);
            var le = this._littleEndian;
            var dataSize = v.getUint32(0, !le);
            var tagType = v.getUint16(4, !le);

            switch (tagType) {
                case 1:
                    // Video
                    this._parseVideoData(chunk, 6, dataSize - 6);
                    break;
                case 2: // Audio
                case 11:
                    // AVCDecoderConfigurationRecord
                    this._parseAVCDecoderConfigurationRecord(chunk, 6, dataSize - 6);
                    break;
                default:
                    break;
            }
        }
    }, {
        key: '_parseVideoData',
        value: function _parseVideoData(arrayBuffer, dataOffset, dataSize) {
            var offset = 0;
            var le = this._littleEndian;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);
            var keyframe = false;
            var units = [],
                length = 0;
            var lengthSize = this._naluLengthSize;

            var duration = v.getUint16(offset, !le);
            offset += 2;
            var dts = v.getUint32(offset, !le);
            offset += 4;
            var cts = v.getUint32(offset, !le);
            offset += 4;
            var tagPosition = v.getUint32(offset, !le);
            offset += 4;
            var unitNum = v.getUint32(offset, !le);
            offset += 4;

            for (var i = 0; i < unitNum; i++) {
                // if (offset + 4 >= dataSize) {
                //     console.warn(`MP4Demuxer: Malformed Nalu near timestamp ${dts}, offset = ${offset}, dataSize = ${dataSize}`);
                //     break;  // data not enough for next Nalu
                // }
                // if (naluSize > dataSize - lengthSize) {
                //     console.warn(`MP4Demuxer: Malformed Nalus near timestamp ${dts}, NaluSize > DataSize!`);
                //     return;
                // }
                var naluSize = v.getUint32(offset, !le);
                var unitType = v.getUint8(offset + lengthSize) & 0x1F;

                if (unitType === 5) {
                    // IDR
                    keyframe = true;
                }

                // console.log(lengthSize + naluSize);
                var data = new Uint8Array(arrayBuffer, dataOffset + offset, lengthSize + naluSize);
                var unit = { type: unitType, data: data };
                units.push(unit);
                length += data.byteLength;

                offset += lengthSize + naluSize;
            }

            if (units.length) {
                var avcSample = {
                    units: units,
                    length: length,
                    isKeyframe: keyframe,
                    dts: dts,
                    cts: cts,
                    pts: dts + cts,
                    duration: duration
                };
                if (keyframe) {
                    avcSample.fileposition = tagPosition;
                }
                this._onVideoSampleArrived(avcSample);
            }
        }
    }, {
        key: '_parseAVCDecoderConfigurationRecord',
        value: function _parseAVCDecoderConfigurationRecord(arrayBuffer, dataOffset, dataSize) {
            var le = this._littleEndian;
            var meta = this._videoMetadata;
            var offset = 0;
            var v = new DataView(arrayBuffer, dataOffset, dataSize);

            if (!meta) {
                if (this._hasVideo === false && this._hasVideoFlagOverrided === false) {
                    this._hasVideo = true;
                    this._mediaInfo.hasVideo = true;
                }

                meta = this._videoMetadata = {};
                meta.type = 'video';
                meta.id = 1;
            } else {
                if (typeof meta.avcc !== 'undefined') {
                    // Log.w(this.TAG, 'Found another AVCDecoderConfigurationRecord!');
                }
            }

            meta.duration = v.getUint32(offset, !le);
            offset += 4;
            meta.timescale = v.getUint32(offset, !le);
            offset += 4;

            var confVer = v.getUint8(offset++); // configurationVersion
            var avcProfile = v.getUint8(offset++); // avcProfileIndication
            var profileCompatibility = v.getUint8(offset++); // profile_compatibility
            var avcLevel = v.getUint8(offset++); // AVCLevelIndication

            if (confVer !== 1 || avcProfile === 0) {
                // this._onError(DemuxErrors.FORMAT_ERROR, 'MP4: Invalid AVCDecoderConfigurationRecord');
                return;
            }

            this._naluLengthSize = (v.getUint8(offset++) & 3 & 3) + 1;
            if (this._naluLengthSize !== 3 && this._naluLengthSize !== 4) {
                // holy shit!!!
                // this._onError(DemuxErrors.FORMAT_ERROR, `MP4: Strange NaluLengthSizeMinusOne: ${this._naluLengthSize - 1}`);
                return;
            }

            var spsNum = v.getUint8(offset++) & 0x1f & 0x1f; // numOfSequenceParameterSets
            if (spsNum === 0) {
                // this._onError(DemuxErrors.FORMAT_ERROR, 'MP4: Invalid AVCDecoderConfigurationRecord: No SPS');
                return;
            } else if (spsNum > 1) {
                console.info('MP4Demuxer: MP4: Strange AVCDecoderConfigurationRecord: SPS Count = ' + spsNum);
            }

            for (var i = 0; i < spsNum; i++) {
                var len = v.getUint16(offset, !le); // sequenceParameterSetLength
                // spsLen = [];
                // let spsLen = spsLen[i] = ReadBig16(stsd, offset);
                offset += 2;
                if (len === 0) {
                    continue;
                }

                var sps = new Uint8Array(arrayBuffer, dataOffset + offset, len);
                offset += len;

                var config = _spsParser2.default.parseSPS(sps);
                if (i !== 0) {
                    // ignore other sps's config
                    continue;
                }

                meta.codecWidth = config.codec_size.width;
                meta.codecHeight = config.codec_size.height;
                meta.presentWidth = config.present_size.width;
                meta.presentHeight = config.present_size.height;

                meta.profile = config.profile_string;
                meta.level = config.level_string;
                meta.bitDepth = config.bit_depth;
                meta.chromaFormat = config.chroma_format;
                meta.sarRatio = config.sar_ratio;
                meta.frameRate = config.frame_rate;

                if (config.frame_rate.fixed === false || config.frame_rate.fps_num === 0 || config.frame_rate.fps_den === 0) {
                    meta.frameRate = this._referenceFrameRate;
                }

                var fps_den = meta.frameRate.fps_den;
                var fps_num = meta.frameRate.fps_num;
                meta.refSampleDuration = meta.timescale * (fps_den / fps_num);

                var codecArray = sps.subarray(1, 4);
                var codecString = 'avc1.';
                for (var j = 0; j < 3; j++) {
                    var h = codecArray[j].toString(16);
                    if (h.length < 2) {
                        h = '0' + h;
                    }
                    codecString += h;
                }
                meta.codec = codecString;
            }

            var ppsNum = v.getUint8(offset++); // numOfPictureParameterSets
            if (ppsNum === 0) {
                // this._onError(DemuxErrors.FORMAT_ERROR, 'MP4: Invalid AVCDecoderConfigurationRecord: No PPS');
                return;
            } else if (ppsNum > 1) {
                console.info('MP4Demuxer: MP4: Strange AVCDecoderConfigurationRecord: PPS Count = ' + ppsNum);
            }

            for (var _i = 0; _i < ppsNum; _i++) {
                var _len = v.getUint16(offset, !le); // pictureParameterSetLength
                offset += 2;

                if (_len === 0) {
                    continue;
                }

                // pps is useless for extracting video information
                offset += _len;
            }
            meta.avcc = new Uint8Array(dataSize - 8);
            meta.avcc.set(new Uint8Array(arrayBuffer, dataOffset + 8, dataSize - 8), 0);
            console.log('Parsed AVCDecoderConfigurationRecord');

            this._onMetadataArrived('video', meta);
        }
    }, {
        key: 'onMetadataArrived',
        get: function get() {
            return this._onMetadataArrived;
        },
        set: function set(callback) {
            this._onMetadataArrived = callback;
        }

        // prototype: function onVideoSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onVideoSampleArrived',
        get: function get() {
            return this._onVideoSampleArrived;
        },
        set: function set(callback) {
            this._onVideoSampleArrived = callback;
        }

        // prototype: function onAudioSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onAudioSampleArrived',
        get: function get() {
            return this._onAudioSampleArrived;
        },
        set: function set(callback) {
            this._onAudioSampleArrived = callback;
        }
    }]);

    return WSDemuxer;
}();

exports.default = WSDemuxer;

},{"../../core/media-info":6,"../sps-parser.js":13}],15:[function(_dereq_,module,exports){
'use strict';

// entry/index file

// make it compatible with browserify's umd wrapper
module.exports = _dereq_('./wp.js').default;

},{"./wp.js":25}],16:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AAC = function () {
    function AAC() {
        _classCallCheck(this, AAC);
    }

    _createClass(AAC, null, [{
        key: 'getSilentFrame',
        value: function getSilentFrame(codec, channelCount) {
            if (codec === 'mp4a.40.2') {
                // handle LC-AAC
                if (channelCount === 1) {
                    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x23, 0x80]);
                } else if (channelCount === 2) {
                    return new Uint8Array([0x21, 0x00, 0x49, 0x90, 0x02, 0x19, 0x00, 0x23, 0x80]);
                } else if (channelCount === 3) {
                    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x8e]);
                } else if (channelCount === 4) {
                    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x80, 0x2c, 0x80, 0x08, 0x02, 0x38]);
                } else if (channelCount === 5) {
                    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x82, 0x30, 0x04, 0x99, 0x00, 0x21, 0x90, 0x02, 0x38]);
                } else if (channelCount === 6) {
                    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x82, 0x30, 0x04, 0x99, 0x00, 0x21, 0x90, 0x02, 0x00, 0xb2, 0x00, 0x20, 0x08, 0xe0]);
                }
            } else {
                // handle HE-AAC (mp4a.40.5 / mp4a.40.29)
                if (channelCount === 1) {
                    // ffmpeg -y -f lavfi -i "aevalsrc=0:d=0.05" -c:a libfdk_aac -profile:a aac_he -b:a 4k output.aac && hexdump -v -e '16/1 "0x%x," "\n"' -v output.aac
                    return new Uint8Array([0x1, 0x40, 0x22, 0x80, 0xa3, 0x4e, 0xe6, 0x80, 0xba, 0x8, 0x0, 0x0, 0x0, 0x1c, 0x6, 0xf1, 0xc1, 0xa, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5e]);
                } else if (channelCount === 2) {
                    // ffmpeg -y -f lavfi -i "aevalsrc=0|0:d=0.05" -c:a libfdk_aac -profile:a aac_he_v2 -b:a 4k output.aac && hexdump -v -e '16/1 "0x%x," "\n"' -v output.aac
                    return new Uint8Array([0x1, 0x40, 0x22, 0x80, 0xa3, 0x5e, 0xe6, 0x80, 0xba, 0x8, 0x0, 0x0, 0x0, 0x0, 0x95, 0x0, 0x6, 0xf1, 0xa1, 0xa, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5e]);
                } else if (channelCount === 3) {
                    // ffmpeg -y -f lavfi -i "aevalsrc=0|0|0:d=0.05" -c:a libfdk_aac -profile:a aac_he_v2 -b:a 4k output.aac && hexdump -v -e '16/1 "0x%x," "\n"' -v output.aac
                    return new Uint8Array([0x1, 0x40, 0x22, 0x80, 0xa3, 0x5e, 0xe6, 0x80, 0xba, 0x8, 0x0, 0x0, 0x0, 0x0, 0x95, 0x0, 0x6, 0xf1, 0xa1, 0xa, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5a, 0x5e]);
                }
            }
            return null;
        }
    }]);

    return AAC;
}();

exports.default = AAC;

},{}],17:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * This file is derived from dailymotion's hls.js library (hls.js/src/remux/mp4-generator.js)
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//  MP4 boxes generator for ISO BMFF (ISO Base Media File Format, defined in ISO/IEC 14496-12)
var MP4 = function () {
    function MP4() {
        _classCallCheck(this, MP4);
    }

    _createClass(MP4, null, [{
        key: 'init',
        value: function init() {
            MP4.types = {
                avc1: [], avcC: [], btrt: [], dinf: [],
                dref: [], esds: [], ftyp: [], hdlr: [],
                mdat: [], mdhd: [], mdia: [], mfhd: [],
                minf: [], moof: [], moov: [], mp4a: [],
                mvex: [], mvhd: [], sdtp: [], stbl: [],
                stco: [], stsc: [], stsd: [], stsz: [],
                stts: [], tfdt: [], tfhd: [], traf: [],
                trak: [], trun: [], trex: [], tkhd: [],
                vmhd: [], smhd: [], '.mp3': []
            };

            for (var name in MP4.types) {
                if (MP4.types.hasOwnProperty(name)) {
                    MP4.types[name] = [name.charCodeAt(0), name.charCodeAt(1), name.charCodeAt(2), name.charCodeAt(3)];
                }
            }

            var constants = MP4.constants = {};

            constants.FTYP = new Uint8Array([0x69, 0x73, 0x6F, 0x6D, // major_brand: isom
            0x0, 0x0, 0x0, 0x1, // minor_version: 0x01
            0x69, 0x73, 0x6F, 0x6D, // isom
            0x61, 0x76, 0x63, 0x31 // avc1
            ]);

            constants.STSD_PREFIX = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x01 // entry_count
            ]);

            constants.STTS = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00 // entry_count
            ]);

            constants.STSC = constants.STCO = constants.STTS;

            constants.STSZ = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00, // sample_size
            0x00, 0x00, 0x00, 0x00 // sample_count
            ]);

            constants.HDLR_VIDEO = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00, // pre_defined
            0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
            0x00, 0x00, 0x00, 0x00, // reserved: 3 * 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x56, 0x69, 0x64, 0x65, 0x6F, 0x48, 0x61, 0x6E, 0x64, 0x6C, 0x65, 0x72, 0x00 // name: VideoHandler
            ]);

            constants.HDLR_AUDIO = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00, // pre_defined
            0x73, 0x6F, 0x75, 0x6E, // handler_type: 'soun'
            0x00, 0x00, 0x00, 0x00, // reserved: 3 * 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x53, 0x6F, 0x75, 0x6E, 0x64, 0x48, 0x61, 0x6E, 0x64, 0x6C, 0x65, 0x72, 0x00 // name: SoundHandler
            ]);

            constants.DREF = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x01, // entry_count
            0x00, 0x00, 0x00, 0x0C, // entry_size
            0x75, 0x72, 0x6C, 0x20, // type 'url '
            0x00, 0x00, 0x00, 0x01 // version(0) + flags
            ]);

            // Sound media header
            constants.SMHD = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00 // balance(2) + reserved(2)
            ]);

            // video media header
            constants.VMHD = new Uint8Array([0x00, 0x00, 0x00, 0x01, // version(0) + flags
            0x00, 0x00, // graphicsmode: 2 bytes
            0x00, 0x00, 0x00, 0x00, // opcolor: 3 * 2 bytes
            0x00, 0x00]);
        }

        // Generate a box

    }, {
        key: 'box',
        value: function box(type) {
            var size = 8;
            var result = null;
            var datas = Array.prototype.slice.call(arguments, 1);
            var arrayCount = datas.length;

            for (var i = 0; i < arrayCount; i++) {
                size += datas[i].byteLength;
            }

            result = new Uint8Array(size);
            result[0] = size >>> 24 & 0xFF; // size
            result[1] = size >>> 16 & 0xFF;
            result[2] = size >>> 8 & 0xFF;
            result[3] = size & 0xFF;

            result.set(type, 4); // type

            var offset = 8;
            for (var _i = 0; _i < arrayCount; _i++) {
                // data body
                result.set(datas[_i], offset);
                offset += datas[_i].byteLength;
            }

            return result;
        }

        // emit ftyp & moov

    }, {
        key: 'generateInitSegment',
        value: function generateInitSegment(meta) {
            var ftyp = MP4.box(MP4.types.ftyp, MP4.constants.FTYP);
            var moov = MP4.moov(meta);

            var result = new Uint8Array(ftyp.byteLength + moov.byteLength);
            result.set(ftyp, 0);
            result.set(moov, ftyp.byteLength);
            return result;
        }

        // Movie metadata box

    }, {
        key: 'moov',
        value: function moov(meta) {
            var mvhd = MP4.mvhd(meta.timescale, meta.duration);
            var trak = MP4.trak(meta);
            var mvex = MP4.mvex(meta);
            return MP4.box(MP4.types.moov, mvhd, trak, mvex);
        }

        // Movie header box

    }, {
        key: 'mvhd',
        value: function mvhd(timescale, duration) {
            return MP4.box(MP4.types.mvhd, new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00, // creation_time
            0x00, 0x00, 0x00, 0x00, // modification_time
            timescale >>> 24 & 0xFF, // timescale: 4 bytes
            timescale >>> 16 & 0xFF, timescale >>> 8 & 0xFF, timescale & 0xFF, duration >>> 24 & 0xFF, // duration: 4 bytes
            duration >>> 16 & 0xFF, duration >>> 8 & 0xFF, duration & 0xFF, 0x00, 0x01, 0x00, 0x00, // Preferred rate: 1.0
            0x01, 0x00, 0x00, 0x00, // PreferredVolume(1.0, 2bytes) + reserved(2bytes)
            0x00, 0x00, 0x00, 0x00, // reserved: 4 + 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, // ----begin composition matrix----
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // ----end composition matrix----
            0x00, 0x00, 0x00, 0x00, // ----begin pre_defined 6 * 4 bytes----
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ----end pre_defined 6 * 4 bytes----
            0xFF, 0xFF, 0xFF, 0xFF // next_track_ID
            ]));
        }

        // Track box

    }, {
        key: 'trak',
        value: function trak(meta) {
            return MP4.box(MP4.types.trak, MP4.tkhd(meta), MP4.mdia(meta));
        }

        // Track header box

    }, {
        key: 'tkhd',
        value: function tkhd(meta) {
            var trackId = meta.id,
                duration = meta.duration;
            var width = meta.presentWidth,
                height = meta.presentHeight;

            return MP4.box(MP4.types.tkhd, new Uint8Array([0x00, 0x00, 0x00, 0x07, // version(0) + flags
            0x00, 0x00, 0x00, 0x00, // creation_time
            0x00, 0x00, 0x00, 0x00, // modification_time
            trackId >>> 24 & 0xFF, // track_ID: 4 bytes
            trackId >>> 16 & 0xFF, trackId >>> 8 & 0xFF, trackId & 0xFF, 0x00, 0x00, 0x00, 0x00, // reserved: 4 bytes
            duration >>> 24 & 0xFF, // duration: 4 bytes
            duration >>> 16 & 0xFF, duration >>> 8 & 0xFF, duration & 0xFF, 0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // layer(2bytes) + alternate_group(2bytes)
            0x00, 0x00, 0x00, 0x00, // volume(2bytes) + reserved(2bytes)
            0x00, 0x01, 0x00, 0x00, // ----begin composition matrix----
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // ----end composition matrix----
            width >>> 8 & 0xFF, // width and height
            width & 0xFF, 0x00, 0x00, height >>> 8 & 0xFF, height & 0xFF, 0x00, 0x00]));
        }

        // Media Box

    }, {
        key: 'mdia',
        value: function mdia(meta) {
            return MP4.box(MP4.types.mdia, MP4.mdhd(meta), MP4.hdlr(meta), MP4.minf(meta));
        }

        // Media header box

    }, {
        key: 'mdhd',
        value: function mdhd(meta) {
            var timescale = meta.timescale;
            var duration = meta.duration;
            return MP4.box(MP4.types.mdhd, new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            0x00, 0x00, 0x00, 0x00, // creation_time
            0x00, 0x00, 0x00, 0x00, // modification_time
            timescale >>> 24 & 0xFF, // timescale: 4 bytes
            timescale >>> 16 & 0xFF, timescale >>> 8 & 0xFF, timescale & 0xFF, duration >>> 24 & 0xFF, // duration: 4 bytes
            duration >>> 16 & 0xFF, duration >>> 8 & 0xFF, duration & 0xFF, 0x55, 0xC4, // language: und (undetermined)
            0x00, 0x00 // pre_defined = 0
            ]));
        }

        // Media handler reference box

    }, {
        key: 'hdlr',
        value: function hdlr(meta) {
            var data = null;
            if (meta.type === 'audio') {
                data = MP4.constants.HDLR_AUDIO;
            } else {
                data = MP4.constants.HDLR_VIDEO;
            }
            return MP4.box(MP4.types.hdlr, data);
        }

        // Media infomation box

    }, {
        key: 'minf',
        value: function minf(meta) {
            var xmhd = null;
            if (meta.type === 'audio') {
                xmhd = MP4.box(MP4.types.smhd, MP4.constants.SMHD);
            } else {
                xmhd = MP4.box(MP4.types.vmhd, MP4.constants.VMHD);
            }
            return MP4.box(MP4.types.minf, xmhd, MP4.dinf(), MP4.stbl(meta));
        }

        // Data infomation box

    }, {
        key: 'dinf',
        value: function dinf() {
            var result = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, MP4.constants.DREF));
            return result;
        }

        // Sample table box

    }, {
        key: 'stbl',
        value: function stbl(meta) {
            var result = MP4.box(MP4.types.stbl, // type: stbl
            MP4.stsd(meta), // Sample Description Table
            MP4.box(MP4.types.stts, MP4.constants.STTS), // Time-To-Sample
            MP4.box(MP4.types.stsc, MP4.constants.STSC), // Sample-To-Chunk
            MP4.box(MP4.types.stsz, MP4.constants.STSZ), // Sample size
            MP4.box(MP4.types.stco, MP4.constants.STCO) // Chunk offset
            );
            return result;
        }

        // Sample description box

    }, {
        key: 'stsd',
        value: function stsd(meta) {
            if (meta.type === 'audio') {
                if (meta.codec === 'mp3') {
                    return MP4.box(MP4.types.stsd, MP4.constants.STSD_PREFIX, MP4.mp3(meta));
                }
                // else: aac -> mp4a
                return MP4.box(MP4.types.stsd, MP4.constants.STSD_PREFIX, MP4.mp4a(meta));
            } else {
                return MP4.box(MP4.types.stsd, MP4.constants.STSD_PREFIX, MP4.avc1(meta));
            }
        }
    }, {
        key: 'mp3',
        value: function mp3(meta) {
            var channelCount = meta.channelCount;
            var sampleRate = meta.audioSampleRate;

            var data = new Uint8Array([0x00, 0x00, 0x00, 0x00, // reserved(4)
            0x00, 0x00, 0x00, 0x01, // reserved(2) + data_reference_index(2)
            0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, channelCount, // channelCount(2)
            0x00, 0x10, // sampleSize(2)
            0x00, 0x00, 0x00, 0x00, // reserved(4)
            sampleRate >>> 8 & 0xFF, // Audio sample rate
            sampleRate & 0xFF, 0x00, 0x00]);

            return MP4.box(MP4.types['.mp3'], data);
        }
    }, {
        key: 'mp4a',
        value: function mp4a(meta) {
            var channelCount = meta.channelCount;
            var sampleRate = meta.audioSampleRate;

            var data = new Uint8Array([0x00, 0x00, 0x00, 0x00, // reserved(4)
            0x00, 0x00, 0x00, 0x01, // reserved(2) + data_reference_index(2)
            0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, channelCount, // channelCount(2)
            0x00, 0x10, // sampleSize(2)
            0x00, 0x00, 0x00, 0x00, // reserved(4)
            sampleRate >>> 8 & 0xFF, // Audio sample rate
            sampleRate & 0xFF, 0x00, 0x00]);

            return MP4.box(MP4.types.mp4a, data, MP4.esds(meta));
        }
    }, {
        key: 'esds',
        value: function esds(meta) {
            var config = meta.config || [];
            var configSize = config.length;
            var data = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version 0 + flags

            0x03, // descriptor_type
            0x17 + configSize, // length3
            0x00, 0x01, // es_id
            0x00, // stream_priority

            0x04, // descriptor_type
            0x0F + configSize, // length
            0x40, // codec: mpeg4_audio
            0x15, // stream_type: Audio
            0x00, 0x00, 0x00, // buffer_size
            0x00, 0x00, 0x00, 0x00, // maxBitrate
            0x00, 0x00, 0x00, 0x00, // avgBitrate

            0x05 // descriptor_type
            ].concat([configSize]).concat(config).concat([0x06, 0x01, 0x02 // GASpecificConfig
            ]));
            return MP4.box(MP4.types.esds, data);
        }
    }, {
        key: 'avc1',
        value: function avc1(meta) {
            var avcc = meta.avcc;
            var width = meta.codecWidth,
                height = meta.codecHeight;

            var data = new Uint8Array([0x00, 0x00, 0x00, 0x00, // reserved(4)
            0x00, 0x00, 0x00, 0x01, // reserved(2) + data_reference_index(2)
            0x00, 0x00, 0x00, 0x00, // pre_defined(2) + reserved(2)
            0x00, 0x00, 0x00, 0x00, // pre_defined: 3 * 4 bytes
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, width >>> 8 & 0xFF, // width: 2 bytes
            width & 0xFF, height >>> 8 & 0xFF, // height: 2 bytes
            height & 0xFF, 0x00, 0x48, 0x00, 0x00, // horizresolution: 4 bytes
            0x00, 0x48, 0x00, 0x00, // vertresolution: 4 bytes
            0x00, 0x00, 0x00, 0x00, // reserved: 4 bytes
            0x00, 0x01, // frame_count
            0x05, // strlen
            0x74, 0x72, 0x61, 0x63, // compressorname: 32 bytes
            0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, // depth
            0xFF, 0xFF // pre_defined = -1
            ]);
            return MP4.box(MP4.types.avc1, data, MP4.box(MP4.types.avcC, avcc));
        }

        // Movie Extends box

    }, {
        key: 'mvex',
        value: function mvex(meta) {
            return MP4.box(MP4.types.mvex, MP4.trex(meta));
        }

        // Track Extends box

    }, {
        key: 'trex',
        value: function trex(meta) {
            var trackId = meta.id;
            var data = new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) + flags
            trackId >>> 24 & 0xFF, // track_ID
            trackId >>> 16 & 0xFF, trackId >>> 8 & 0xFF, trackId & 0xFF, 0x00, 0x00, 0x00, 0x01, // default_sample_description_index
            0x00, 0x00, 0x00, 0x00, // default_sample_duration
            0x00, 0x00, 0x00, 0x00, // default_sample_size
            0x00, 0x01, 0x00, 0x01 // default_sample_flags
            ]);
            return MP4.box(MP4.types.trex, data);
        }

        // Movie fragment box

    }, {
        key: 'moof',
        value: function moof(track, baseMediaDecodeTime) {
            return MP4.box(MP4.types.moof, MP4.mfhd(track.sequenceNumber), MP4.traf(track, baseMediaDecodeTime));
        }
    }, {
        key: 'mfhd',
        value: function mfhd(sequenceNumber) {
            var data = new Uint8Array([0x00, 0x00, 0x00, 0x00, sequenceNumber >>> 24 & 0xFF, // sequence_number: int32
            sequenceNumber >>> 16 & 0xFF, sequenceNumber >>> 8 & 0xFF, sequenceNumber & 0xFF]);
            return MP4.box(MP4.types.mfhd, data);
        }

        // Track fragment box

    }, {
        key: 'traf',
        value: function traf(track, baseMediaDecodeTime) {
            var trackId = track.id;

            // Track fragment header box
            var tfhd = MP4.box(MP4.types.tfhd, new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) & flags
            trackId >>> 24 & 0xFF, // track_ID
            trackId >>> 16 & 0xFF, trackId >>> 8 & 0xFF, trackId & 0xFF]));
            // Track Fragment Decode Time
            var tfdt = MP4.box(MP4.types.tfdt, new Uint8Array([0x00, 0x00, 0x00, 0x00, // version(0) & flags
            baseMediaDecodeTime >>> 24 & 0xFF, // baseMediaDecodeTime: int32
            baseMediaDecodeTime >>> 16 & 0xFF, baseMediaDecodeTime >>> 8 & 0xFF, baseMediaDecodeTime & 0xFF]));
            var sdtp = MP4.sdtp(track);
            var trun = MP4.trun(track, sdtp.byteLength + 16 + 16 + 8 + 16 + 8 + 8);

            return MP4.box(MP4.types.traf, tfhd, tfdt, trun, sdtp);
        }

        // Sample Dependency Type box

    }, {
        key: 'sdtp',
        value: function sdtp(track) {
            var samples = track.samples || [];
            var sampleCount = samples.length;
            var data = new Uint8Array(4 + sampleCount);
            // 0~4 bytes: version(0) & flags
            for (var i = 0; i < sampleCount; i++) {
                var flags = samples[i].flags;
                data[i + 4] = flags.isLeading << 6 | // is_leading: 2 (bit)
                flags.dependsOn << 4 // sample_depends_on
                | flags.isDependedOn << 2 // sample_is_depended_on
                | flags.hasRedundancy; // sample_has_redundancy
            }
            return MP4.box(MP4.types.sdtp, data);
        }

        // Track fragment run box

    }, {
        key: 'trun',
        value: function trun(track, offset) {
            var samples = track.samples || [];
            var sampleCount = samples.length;
            var dataSize = 12 + 16 * sampleCount;
            var data = new Uint8Array(dataSize);
            offset += 8 + dataSize;

            data.set([0x00, 0x00, 0x0F, 0x01, // version(0) & flags
            sampleCount >>> 24 & 0xFF, // sample_count
            sampleCount >>> 16 & 0xFF, sampleCount >>> 8 & 0xFF, sampleCount & 0xFF, offset >>> 24 & 0xFF, // data_offset
            offset >>> 16 & 0xFF, offset >>> 8 & 0xFF, offset & 0xFF], 0);

            for (var i = 0; i < sampleCount; i++) {
                var duration = samples[i].duration;
                var size = samples[i].size;
                var flags = samples[i].flags;
                var cts = samples[i].cts;
                data.set([duration >>> 24 & 0xFF, // sample_duration
                duration >>> 16 & 0xFF, duration >>> 8 & 0xFF, duration & 0xFF, size >>> 24 & 0xFF, // sample_size
                size >>> 16 & 0xFF, size >>> 8 & 0xFF, size & 0xFF, flags.isLeading << 2 | flags.dependsOn, // sample_flags
                flags.isDependedOn << 6 | flags.hasRedundancy << 4 | flags.isNonSync, 0x00, 0x00, // sample_degradation_priority
                cts >>> 24 & 0xFF, // sample_composition_time_offset
                cts >>> 16 & 0xFF, cts >>> 8 & 0xFF, cts & 0xFF], 12 + 16 * i);
            }
            return MP4.box(MP4.types.trun, data);
        }
    }, {
        key: 'mdat',
        value: function mdat(data) {
            return MP4.box(MP4.types.mdat, data);
        }
    }]);

    return MP4;
}();

MP4.init();

exports.default = MP4;

},{}],18:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = _dereq_('../../utils/logger');

var _mp4Generator = _dereq_('./mp4-generator');

var _mp4Generator2 = _interopRequireDefault(_mp4Generator);

var _aacSilent = _dereq_('./aac-silent');

var _aacSilent2 = _interopRequireDefault(_aacSilent);

var _mediaInfo = _dereq_('../../core/media-info.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Fragmented mp4 muxer
var MP4Muxer = function () {
    function MP4Muxer(config) {
        _classCallCheck(this, MP4Muxer);

        this.TAG = 'MP4Muxer';
        this._config = config;

        this._dtsBase = -1;
        this._dtsBaseInited = false;
        this._audioDtsBase = Infinity;
        this._videoDtsBase = Infinity;
        this._audioNextDts = undefined;
        this._videoNextDts = undefined;

        this._audioStashedSample = null;
        this._videoStashedSample = null;

        this._audioMeta = null;
        this._videoMeta = null;

        this._audioSegmentInfoList = new _mediaInfo.MediaSegmentInfoList('audio');
        this._videoSegmentInfoList = new _mediaInfo.MediaSegmentInfoList('video');

        this._onInitSegment = null;
        this._onMediaSegment = null;

        this._fillAudioTimestampGap = this._config.fixAudioTimestampGap;
        this._isLive = config.isLive;
        this._aacSlient = config.aacSlient;
    }

    _createClass(MP4Muxer, [{
        key: 'destroy',
        value: function destroy() {
            this._dtsBase = -1;
            this._dtsBaseInited = false;
            this._audioMeta = null;
            this._videoMeta = null;
            this._audioSegmentInfoList.clear();
            this._audioSegmentInfoList = null;
            this._videoSegmentInfoList.clear();
            this._videoSegmentInfoList = null;
            this._onInitSegment = null;
            this._onMediaSegment = null;
            this._audioStashedSample = null;
            this._videoStashedSample = null;
        }

        /* prototype: function onInitSegment(type: string, initSegment: ArrayBuffer): void
           InitSegment: {
               type: string,
               data: ArrayBuffer,
               codec: string,
               container: string
           }
        */

    }, {
        key: 'insertDiscontinuity',
        value: function insertDiscontinuity() {
            this._audioNextDts = this._videoNextDts = undefined;
        }
    }, {
        key: 'seek',
        value: function seek(originalDts) {
            this._videoSegmentInfoList.clear();
            this._audioSegmentInfoList.clear();
        }
    }, {
        key: 'mux',
        value: function mux(audioTrack, videoTrack) {
            if (!this._onMediaSegment) {
                console.error('IllegalStateException: MP4Muxer: onMediaSegment callback must be specificed!');
                return;
            }
            if (!this._dtsBaseInited) {
                this._calculateDtsBase(audioTrack, videoTrack);
            }

            if (videoTrack.length !== 0) {
                this._muxVideo(videoTrack);
            }

            if (audioTrack.length !== 0) {
                this._muxAudio(audioTrack);
            }
        }
    }, {
        key: '_onMetadataReceived',
        value: function _onMetadataReceived(type, metadata) {
            var metabox = null;

            var container = 'mp4';
            // console.log(metadata);
            var codec = metadata.codec;

            if (type === 'audio') {
                this._audioMeta = metadata;
                if (metadata.codec === 'mp3') {
                    // 'audio/mpeg' for MP3 audio track
                    container = 'mpeg';
                    codec = '';
                    metabox = new Uint8Array();
                } else {
                    // 'audio/mp4, codecs="codec"'
                    metabox = _mp4Generator2.default.generateInitSegment(metadata);
                }
            } else if (type === 'video') {
                this._videoMeta = metadata;
                var date = new Date();
                var hour = date.getHours();
                var minute = date.getMinutes();
                var second = date.getSeconds();
                var ms = date.getMilliseconds();
                var time = hour + ':' + minute + ':' + second + ':' + ms;
                // console.info('MP4Muxer: ' + time);
                metabox = _mp4Generator2.default.generateInitSegment(metadata);
                _logger.Log.v(this.TAG, 'Generate Init Segment at ' + time);
            } else {
                return;
            }

            // dispatch metabox (Initialization Segment)
            if (!this._onInitSegment) {
                console.error('IllegalStateException: MP4Muxer: onInitSegment callback must be specified!');
                return;
            }
            this._onInitSegment(type, {
                type: type,
                data: metabox.buffer,
                codec: codec,
                container: type + '/' + container,
                mediaDuration: metadata.duration // in timescale 1000 (milliseconds)
            });
        }
    }, {
        key: '_calculateDtsBase',
        value: function _calculateDtsBase(audioTrack, videoTrack) {
            if (this._dtsBaseInited) {
                return;
            }

            if (audioTrack.samples && audioTrack.samples.length) {
                this._audioDtsBase = audioTrack.samples[0].dts;
            }
            if (videoTrack.samples && videoTrack.samples.length) {
                this._videoDtsBase = videoTrack.samples[0].dts;
            }

            this._dtsBase = Math.min(this._audioDtsBase, this._videoDtsBase);
            this._dtsBaseInited = true;
        }
    }, {
        key: '_muxAudio',
        value: function _muxAudio(audioTrack) {
            if (this._audioMeta == null) {
                return;
            }

            var track = audioTrack;
            var samples = track.samples;
            var firstDts = -1,
                lastDts = -1,
                lastPts = -1;
            var refSampleDuration = this._audioMeta.refSampleDuration;

            var mpegRawTrack = this._audioMeta.codec === 'mp3';

            if (!samples || samples.length === 0) {
                return;
            }

            var offset = 0;
            var mdatbox = null;
            var mdatBytes = 0;

            // calculate initial mdat size
            if (mpegRawTrack) {
                // for raw mpeg buffer
                offset = 0;
                mdatBytes = track.length;
            } else {
                // for fmp4 mdat box
                offset = 8; // size + type
                mdatBytes = 8 + track.length;
            }

            var mp4Samples = [];

            var sample = samples[0];
            var unit = sample.unit;
            var originalDts = sample.dts - this._dtsBase;
            var dts = originalDts;
            var sampleDuration = void 0;
            if (sample.duration !== undefined) {
                sampleDuration = sample.duration;
                // console.log(sampleDuration);
            } else {
                sampleDuration = Math.floor(refSampleDuration);
            }

            if (firstDts === -1) {
                firstDts = dts;
            }

            var needFillSilentFrames = false;
            var silentFrames = null;
            if (this._aacSlient) {
                // Silent frame generation, if large timestamp gap detected && config.fixAudioTimestampGap
                if (sampleDuration > refSampleDuration * 1.5 && this._audioMeta.codec !== 'mp3' && this._fillAudioTimestampGap) {
                    // We need to insert silent frames to fill timestamp gap
                    needFillSilentFrames = true;
                    var delta = Math.abs(sampleDuration - refSampleDuration);
                    var frameCount = Math.ceil(delta / refSampleDuration);
                    var currentDts = dts + refSampleDuration; // Notice: in float

                    _logger.Log.w(this.TAG, 'Large audio timestamp gap detected, may cause AV sync to drift. ' + 'Silent frames will be generated to avoid unsync.\n' + ('dts: ' + (dts + sampleDuration) + ' ms, expected: ' + (dts + Math.round(refSampleDuration)) + ' ms, ') + ('delta: ' + Math.round(delta) + ' ms, generate: ' + frameCount + ' frames'));

                    var silentUnit = _aacSilent2.default.getSilentFrame(this._audioMeta.originalCodec, this._audioMeta.channelCount);
                    if (silentUnit == null) {
                        _logger.Log.w(this.TAG, 'Unable to generate silent frame for ' + (this._audioMeta.originalCodec + ' with ' + this._audioMeta.channelCount + ' channels, repeat last frame'));
                        // Repeat last frame
                        silentUnit = unit;
                    }
                    silentFrames = [];

                    for (var j = 0; j < frameCount; j++) {
                        var intDts = Math.round(currentDts); // round to integer
                        if (silentFrames.length > 0) {
                            // Set previous frame sample duration
                            var previousFrame = silentFrames[silentFrames.length - 1];
                            previousFrame.duration = intDts - previousFrame.dts;
                            // console.log('silentframe duration ' + previousFrame.duration);
                        }
                        var frame = {
                            dts: intDts,
                            pts: intDts,
                            cts: 0,
                            unit: silentUnit,
                            size: silentUnit.byteLength,
                            duration: 0, // wait for next sample
                            originalDts: originalDts,
                            flags: {
                                isLeading: 0,
                                dependsOn: 1,
                                isDependedOn: 0,
                                hasRedundancy: 0
                            }
                        };
                        silentFrames.push(frame);
                        mdatBytes += silentUnit.byteLength;
                        currentDts += refSampleDuration;
                    }

                    // last frame: align end time to next frame dts
                    var lastFrame = silentFrames[silentFrames.length - 1];
                    lastFrame.duration = dts + sampleDuration - lastFrame.dts;
                    // console.log('silentframe duration ' + lastFrame.duration);

                    // silentFrames.forEach((frame) => {
                    //     Log.w(this.TAG, `SilentAudio: dts: ${frame.dts}, duration: ${frame.duration}`);
                    // });

                    // Set correct sample duration for current frame
                    sampleDuration = Math.round(refSampleDuration);
                }
            }

            mp4Samples.push({
                dts: dts,
                pts: dts,
                cts: 0,
                unit: sample.unit,
                size: sample.unit.byteLength,
                duration: sampleDuration,
                originalDts: originalDts,
                flags: {
                    isLeading: 0,
                    dependsOn: 1,
                    isDependedOn: 0,
                    hasRedundancy: 0
                }
            });

            if (needFillSilentFrames) {
                // Silent frames should be inserted after wrong-duration frame
                mp4Samples.push.apply(mp4Samples, silentFrames);
            }

            // let subtime = Date.now() - this._sysTimeBase;
            // console.log('system time: ' + subtime);
            // for (let i = 0; i < mp4Samples.length; i++) {
            //     console.log('MP4Muxer: audio dts: ' + mp4Samples[i].dts + ', duration: ' + mp4Samples[i].duration);
            // }

            // allocate mdatbox
            if (mpegRawTrack) {
                // allocate for raw mpeg buffer
                mdatbox = new Uint8Array(mdatBytes);
            } else {
                // allocate for fmp4 mdat box
                mdatbox = new Uint8Array(mdatBytes);
                // size field
                mdatbox[0] = mdatBytes >>> 24 & 0xFF;
                mdatbox[1] = mdatBytes >>> 16 & 0xFF;
                mdatbox[2] = mdatBytes >>> 8 & 0xFF;
                mdatbox[3] = mdatBytes & 0xFF;
                // type field (fourCC)
                mdatbox.set(_mp4Generator2.default.types.mdat, 4);
            }

            // Write samples into mdatbox
            for (var i = 0; i < mp4Samples.length; i++) {
                var _unit = mp4Samples[i].unit;
                mdatbox.set(_unit, offset);
                offset += _unit.byteLength;
            }

            var latest = mp4Samples[mp4Samples.length - 1];
            lastDts = latest.dts + latest.duration;
            // this._audioNextDts = lastDts;

            // fill media segment info & add to info list
            var info = new _mediaInfo.MediaSegmentInfo();
            info.beginDts = firstDts;
            info.endDts = lastDts;
            info.beginPts = firstDts;
            info.endPts = lastDts;
            info.originalBeginDts = mp4Samples[0].originalDts;
            info.originalEndDts = latest.originalDts + latest.duration;
            info.firstSample = new _mediaInfo.SampleInfo(mp4Samples[0].dts, mp4Samples[0].pts, mp4Samples[0].duration, mp4Samples[0].originalDts, false);
            info.lastSample = new _mediaInfo.SampleInfo(latest.dts, latest.pts, latest.duration, latest.originalDts, false);
            // if (!this._isLive) {
            //     this._audioSegmentInfoList.append(info);
            // }

            track.samples = mp4Samples;
            track.sequenceNumber++;

            var moofbox = null;

            if (mpegRawTrack) {
                // Generate empty buffer, because useless for raw mpeg
                moofbox = new Uint8Array();
            } else {
                // Generate moof for fmp4 segment
                moofbox = _mp4Generator2.default.moof(track, firstDts);
            }

            track.samples = [];
            track.length = 0;

            var segment = {
                type: 'audio',
                data: this._mergeBoxes(moofbox, mdatbox).buffer,
                sampleCount: mp4Samples.length,
                info: info
            };

            // console.info('MP4Muxer: muxed audio.');        
            this._onMediaSegment('audio', segment);
        }
    }, {
        key: '_muxVideo',
        value: function _muxVideo(videoTrack) {
            if (this._videoMeta == null) {
                return;
            }

            var track = videoTrack;
            var samples = track.samples;
            var firstDts = -1,
                lastDts = -1;
            var firstPts = -1,
                lastPts = -1;
            var offset = 8;
            var mdatBytes = 8 + videoTrack.length;

            if (!samples || samples.length === 0) {
                return;
            }

            var info = new _mediaInfo.MediaSegmentInfo();
            var mp4Samples = [];

            var sample = samples[0];
            var originalDts = sample.dts - this._dtsBase;
            var isKeyframe = sample.isKeyframe;
            var dts = originalDts;
            var cts = sample.cts;
            var pts = dts + cts;
            var sampleDuration = void 0;
            if (sample.duration !== undefined) {
                sampleDuration = sample.duration;
                // console.log(sampleDuration);
            } else {
                sampleDuration = 1000;
            }

            if (firstDts === -1) {
                firstDts = dts;
                firstPts = pts;
            }

            if (isKeyframe) {
                var syncPoint = new _mediaInfo.SampleInfo(dts, pts, sampleDuration, sample.dts, true);
                syncPoint.fileposition = sample.fileposition;
                info.appendSyncPoint(syncPoint);
            }

            mp4Samples.push({
                dts: dts,
                pts: pts,
                cts: cts,
                units: sample.units,
                size: sample.length,
                isKeyframe: isKeyframe,
                duration: sampleDuration,
                originalDts: originalDts,
                flags: {
                    isLeading: 0,
                    dependsOn: isKeyframe ? 2 : 1,
                    isDependedOn: isKeyframe ? 1 : 0,
                    hasRedundancy: 0,
                    isNonSync: isKeyframe ? 0 : 1
                }
            });

            // let subtime = Date.now() - this._sysTimeBase;
            // console.log('system time: ' + subtime);
            // for (let i = 0; i < mp4Samples.length; i++) {
            //     console.log('MP4Muxer: video dts: ' + mp4Samples[i].dts + ', duration:' + mp4Samples[i].duration);
            // }

            // allocate mdatbox
            var mdatbox = new Uint8Array(mdatBytes);
            mdatbox[0] = mdatBytes >>> 24 & 0xFF;
            mdatbox[1] = mdatBytes >>> 16 & 0xFF;
            mdatbox[2] = mdatBytes >>> 8 & 0xFF;
            mdatbox[3] = mdatBytes & 0xFF;
            mdatbox.set(_mp4Generator2.default.types.mdat, 4);

            // Write samples into mdatbox
            for (var i = 0; i < mp4Samples.length; i++) {
                var units = mp4Samples[i].units;
                while (units.length) {
                    var unit = units.shift();
                    var data = unit.data;
                    mdatbox.set(data, offset);
                    offset += data.byteLength;
                }
            }

            var latest = mp4Samples[mp4Samples.length - 1];
            lastDts = latest.dts + latest.duration;
            lastPts = latest.pts + latest.duration;
            // this._videoNextDts = lastDts;

            // fill media segment info & add to info list
            info.beginDts = firstDts;
            info.endDts = lastDts;
            info.beginPts = firstPts;
            info.endPts = lastPts;
            info.originalBeginDts = mp4Samples[0].originalDts;
            info.originalEndDts = latest.originalDts + latest.duration;
            info.firstSample = new _mediaInfo.SampleInfo(mp4Samples[0].dts, mp4Samples[0].pts, mp4Samples[0].duration, mp4Samples[0].originalDts, mp4Samples[0].isKeyframe);
            info.lastSample = new _mediaInfo.SampleInfo(latest.dts, latest.pts, latest.duration, latest.originalDts, latest.isKeyframe);
            // if (!this._isLive) {
            //     this._videoSegmentInfoList.append(info);
            // }

            track.samples = mp4Samples;
            track.sequenceNumber++;

            var moofbox = _mp4Generator2.default.moof(track, firstDts);
            track.samples = [];
            track.length = 0;

            // this._videoLastTrack = Object.assign({}, videoTrack);        

            // console.info('MP4Muxer: muxed video.');
            this._onMediaSegment('video', {
                type: 'video',
                data: this._mergeBoxes(moofbox, mdatbox).buffer,
                sampleCount: mp4Samples.length,
                info: info
            });
        }
    }, {
        key: '_mergeBoxes',
        value: function _mergeBoxes(moof, mdat) {
            var result = new Uint8Array(moof.byteLength + mdat.byteLength);
            result.set(moof, 0);
            result.set(mdat, moof.byteLength);
            // console.log(result);
            return result;
        }
    }, {
        key: 'onInitSegment',
        get: function get() {
            return this._onInitSegment;
        },
        set: function set(callback) {
            this._onInitSegment = callback;
        }

        /* prototype: function onMediaSegment(type: string, mediaSegment: MediaSegment): void
           MediaSegment: {
               type: string,
               data: ArrayBuffer,
               sampleCount: int32
               info: MediaSegmentInfo
           }
        */

    }, {
        key: 'onMediaSegment',
        get: function get() {
            return this._onMediaSegment;
        },
        set: function set(callback) {
            this._onMediaSegment = callback;
        }
    }, {
        key: 'dtsBase',
        get: function get() {
            return this._dtsBase;
        }
    }]);

    return MP4Muxer;
}();

exports.default = MP4Muxer;

},{"../../core/media-info.js":6,"../../utils/logger":23,"./aac-silent":16,"./mp4-generator":17}],19:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _reader = _dereq_('../reader.js');

var _mp4Demuxer = _dereq_('../../demuxer/mp4-demuxer/mp4-demuxer');

var _mp4Demuxer2 = _interopRequireDefault(_mp4Demuxer);

var _flvDemuxer = _dereq_('../../demuxer/flv-demuxer/flv-demuxer');

var _flvDemuxer2 = _interopRequireDefault(_flvDemuxer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function ReadBig32(array, index) {
    return array[index] << 24 | array[index + 1] << 16 | array[index + 2] << 8 | array[index + 3];
}

var FReader = function (_Reader) {
    _inherits(FReader, _Reader);

    function FReader(files) {
        _classCallCheck(this, FReader);

        var _this = _possibleConstructorReturn(this, (FReader.__proto__ || Object.getPrototypeOf(FReader)).call(this));

        _this._files = files;
        _this._fileReader = new FileReader();
        // this._demuxer = new MP4Demuxer();
        return _this;
    }

    _createClass(FReader, [{
        key: 'destroy',
        value: function destroy() {
            if (this._fileReader) {
                this._fileReader = null;
            }
            _get(FReader.prototype.__proto__ || Object.getPrototypeOf(FReader.prototype), 'destroy', this).call(this);
        }
    }, {
        key: 'open',
        value: function open() {
            var _this2 = this;

            var probeData = null;
            var files = this._files;
            var reader = this._fileReader;
            var demuxer = this._demuxer;
            reader.onload = function () {
                var data = reader.result;

                if (null === demuxer) {
                    // recoginize the format
                    if ((probeData = FReader.probeflv(data)).match) {
                        demuxer = new _flvDemuxer2.default(probeData);
                    } else if ((probeData = FReader.probemp4(data)).match) {
                        demuxer = new _mp4Demuxer2.default();
                    }
                    // bind demux.event this.eventhandler
                    demuxer.onMetadataArrived = _this2._onDemuxMetadataReceived.bind(_this2);
                    demuxer.onVideoSampleArrived = _this2._onDemuxVideoSampleReceived.bind(_this2);
                    demuxer.onAudioSampleArrived = _this2._onDemuxAudioSampleReceived.bind(_this2);
                }

                demuxer.parseChunks(data, data.byteLength);
            };

            reader.readAsArrayBuffer(files[0]);
        }
    }]);

    return FReader;
}(_reader.Reader);

exports.default = FReader;

},{"../../demuxer/flv-demuxer/flv-demuxer":11,"../../demuxer/mp4-demuxer/mp4-demuxer":12,"../reader.js":21}],20:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _logger = _dereq_('../../utils/logger');

var _reader = _dereq_('../reader.js');

var _flvDemuxer = _dereq_('../../demuxer/flv-demuxer/flv-demuxer');

var _flvDemuxer2 = _interopRequireDefault(_flvDemuxer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

var HTTPReader = function (_Reader) {
    _inherits(HTTPReader, _Reader);

    function HTTPReader(mediaElement) {
        _classCallCheck(this, HTTPReader);

        var _this = _possibleConstructorReturn(this, (HTTPReader.__proto__ || Object.getPrototypeOf(HTTPReader)).call(this));

        _this.TAG = 'HTTPReader';
        _this._mediaElement = mediaElement;

        _this._url = null;
        _this._requestAbort = false;
        _this._contentLength = null;
        _this._receivedLength = 0;
        _this._reconnect = false;

        _this._stashUsed = 0;
        _this._stashBufferSize = 1024 * 1024 * 3; // initial size: 3MB
        _this._stashBuffer = new ArrayBuffer(_this._stashBufferSize);
        _this._stashByteOffset = 0;
        return _this;
    }

    _createClass(HTTPReader, [{
        key: 'destroy',
        value: function destroy() {
            // if (this.isWorking) {
            //     this._requestAbort = true;
            // }
            this._contentLength = null;
            this._receivedLength = 0;
            this._stashByteOffset = 0;
            if (!this._reconnect) {
                this._requestAbort = true;
                this._onAudioSampleArrived = null;
                this._onVideoSampleArrived = null;
                this._onMetadataArrived = null;
                this._onReconnect = null;
            }
            _get(HTTPReader.prototype.__proto__ || Object.getPrototypeOf(HTTPReader.prototype), 'destroy', this).call(this);
            console.warn('HTTP reader was destroyed!');
        }
    }, {
        key: 'reconnect',
        value: function reconnect() {
            this._reconnect = true;
            this.destroy();

            this._onReconnect(this._mediaElement);
            _logger.Log.w(this.TAG, 'Try to reconnect to http.');
            this.open(this._url);
        }
    }, {
        key: 'open',
        value: function open(url) {
            var _this2 = this;

            this._url = url;
            this._destroyed = false;
            var headers = new self.Headers();
            // set headers

            var params = {
                method: 'GET',
                headers: headers,
                mode: 'cors',
                cache: 'default',
                // The default policy of Fetch API in the whatwg standard
                // Safari incorrectly indicates 'no-referrer' as default policy, fuck it
                referrerPolicy: 'no-referrer-when-downgrade'
            };

            // modify params.mode/params.credentials/params.referrerPolicy

            this._status = _reader.LoaderStatus.kConnecting;
            self.fetch(url, params).then(function (res) {
                if (_this2._requestAbort) {
                    _this2._requestAbort = false;
                    _this2._status = _reader.LoaderStatus.kIdle;
                    return;
                }
                if (res.ok && res.status >= 200 && res.status <= 299) {
                    // if (res.url !== seekConfig.url) {
                    //     if (this._onURLRedirect) {
                    //         let redirectedURL = this._seekHandler.removeURLParameters(res.url);
                    //         this._onURLRedirect(redirectedURL);
                    //     }
                    // }

                    var lengthHeader = res.headers.get('Content-Length');
                    if (lengthHeader != null) {
                        _this2._contentLength = parseInt(lengthHeader);
                        // if (this._contentLength !== 0) {
                        //     if (this._onContentLengthKnown) {
                        //         this._onContentLengthKnown(this._contentLength);
                        //     }
                        // }
                    }

                    return _this2._pump.call(_this2, res.body.getReader());
                } else {
                    _this2._status = _reader.LoaderStatus.kError;
                    // if (this._onError) {
                    //     this._onError(LoaderErrors.HTTP_STATUS_CODE_INVALID, {code: res.status, msg: res.statusText});
                    // } else {
                    //     // throw new RuntimeException('FetchStreamLoader: Http code invalid, ' + res.status + ' ' + res.statusText);
                    // }
                    _logger.Log.e(_this2.TAG, 'http status code: ' + res.status);
                    setTimeout(function () {
                        _this2.reconnect();
                    }, 1000);
                }
            }).catch(function (e) {
                _this2._status = _reader.LoaderStatus.kError;
                // if (this._onError) {
                //     this._onError(LoaderErrors.EXCEPTION, {code: -1, msg: e.message});
                // } else {
                //     throw e;
                // }
                _logger.Log.e(_this2.TAG, 'Loader error: ' + e.message);
                setTimeout(function () {
                    _this2.reconnect();
                }, 1000);
            });
        }
    }, {
        key: '_pump',
        value: function _pump(reader) {
            var _this3 = this;

            // ReadableStreamReader
            return reader.read().then(function (result) {
                if (result.done) {
                    _this3._status = _reader.LoaderStatus.kComplete;
                    // if (this._onComplete) {
                    //     this._onComplete(this._range.from, this._range.from + this._receivedLength - 1);
                    // }
                } else {
                    if (_this3._requestAbort === true) {
                        _this3._requestAbort = false;
                        _this3._status = _reader.LoaderStatus.kComplete;
                        return reader.cancel();
                    }

                    _this3._status = _reader.LoaderStatus.kBuffering;

                    var chunk = result.value.buffer;
                    _this3._receivedLength += chunk.byteLength;
                    // console.log(toBuffer(chunk));
                    _this3._handleArrayBuffer(chunk);

                    _this3._pump(reader);
                }
            }).catch(function (e) {
                _this3._status = _reader.LoaderStatus.kError;
                var type = 0;
                var info = null;

                if ((e.code === 19 || e.message === 'network error') && ( // NETWORK_ERR
                _this3._contentLength === null || _this3._contentLength !== null && _this3._receivedLength < _this3._contentLength)) {
                    type = _reader.LoaderErrors.EARLY_EOF;
                    info = { code: e.code, msg: 'Fetch stream meet Early-EOF' };
                    _logger.Log.w(_this3.TAG, e.code + ': ' + e.message);
                } else {
                    type = _reader.LoaderErrors.EXCEPTION;
                    info = { code: e.code, msg: e.message };
                    _logger.Log.w(_this3.TAG, e.code + ': ' + e.message);
                }

                // if (this._onError) {
                //     this._onError(type, info);
                // } else {
                //     throw new RuntimeException(info.msg);
                // }
                setTimeout(function () {
                    _this3.reconnect();
                }, 1000);
            });
        }

        // prototype: function _handleArrayBuffer(data: ArrayBuffer): void

    }, {
        key: '_handleArrayBuffer',
        value: function _handleArrayBuffer(receivedData) {
            if (this._destroyed) {
                return;
            }
            // console.log('reader: heandle arraybuffer');
            var probeData = null;

            // console.log(toBuffer(receivedData));
            var stashArray = new Uint8Array(this._stashBuffer, 0, this._stashBufferSize);
            stashArray.set(new Uint8Array(receivedData), this._stashByteOffset);
            this._stashByteOffset += receivedData.byteLength;

            if (null === this._demuxer) {
                if (this._stashByteOffset > 9) {
                    // recoginize the format
                    if ((probeData = HTTPReader.probeflv(receivedData)).match) {
                        this._demuxer = new _flvDemuxer2.default(probeData);
                        // bind demuxer's event to this.eventhandler
                        this._demuxer.onMetadataArrived = this._onDemuxMetadataReceived.bind(this);
                        this._demuxer.onVideoSampleArrived = this._onDemuxVideoSampleReceived.bind(this);
                        this._demuxer.onAudioSampleArrived = this._onDemuxAudioSampleReceived.bind(this);
                        this._demuxer.reqReplay = this._onReplay.bind(this);
                    }
                }
            }

            var consumed = this._demuxer.parseChunks(this._stashBuffer.slice(0, this._stashByteOffset), this._stashByteOffset);
            if (consumed > 0) {
                //todo optimize
                var remainArray = new Uint8Array(this._stashBuffer, consumed, this._stashByteOffset - consumed);
                stashArray.set(remainArray, 0);
                this._stashByteOffset -= consumed;
            } else if (consumed === 0) {
                // Keep data in buffer
            } else {// consumed < 0
                    // error
                }
        }
    }]);

    return HTTPReader;
}(_reader.Reader);

exports.default = HTTPReader;

}).call(this,_dereq_("buffer").Buffer)

},{"../../demuxer/flv-demuxer/flv-demuxer":11,"../../utils/logger":23,"../reader.js":21,"buffer":2}],21:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoaderStatus = exports.LoaderStatus = {
    kIdle: 0,
    kConnecting: 1,
    kBuffering: 2,
    kError: 3,
    kComplete: 4
};

var LoaderErrors = exports.LoaderErrors = {
    OK: 'OK',
    EXCEPTION: 'Exception',
    HTTP_STATUS_CODE_INVALID: 'HttpStatusCodeInvalid',
    CONNECTING_TIMEOUT: 'ConnectingTimeout',
    EARLY_EOF: 'EarlyEof',
    UNRECOVERABLE_EARLY_EOF: 'UnrecoverableEarlyEof'
};

function ReadBig32(array, index) {
    return array[index] << 24 | array[index + 1] << 16 | array[index + 2] << 8 | array[index + 3];
}

var Reader = exports.Reader = function () {
    function Reader() {
        _classCallCheck(this, Reader);

        this._demuxer = null;
        this._onMetadataArrived = null;
        this._onVideoSampleArrived = null;
        this._onAudioSampleArrived = null;
        this._onReconnect = null;
        this._onReplayData = null;
        this._status = LoaderStatus.kIdle;
        this._destroyed = false;
        // this._seekable = true;
    }

    _createClass(Reader, [{
        key: 'destroy',
        value: function destroy() {
            this._destroyed = true;

            if (this._demuxer) {
                this._demuxer.destroy();
                this._demuxer = null;
            }
            this._status = LoaderStatus.kIdle;
            // this._onMetadataArrived = null;
            // this._onVideoSampleArrived = null;
            // this._onAudioSampleArrived = null;
        }
    }, {
        key: 'isWorking',
        value: function isWorking() {
            return this._status === LoaderStatus.kConnecting || this._status === LoaderStatus.kBuffering;
        }

        // prototype: function onMetadataArrived(type: string, metadata: any): void

    }, {
        key: '_onDemuxMetadataReceived',


        // get onComplete() {
        //     return this._onComplete;
        // }

        // set onComplete(callback) {
        //     this._onComplete = callback;
        // }

        value: function _onDemuxMetadataReceived(type, meta) {
            if (null !== this._onMetadataArrived) this._onMetadataArrived(type, meta);else {
                // error with register event
            }
        }
    }, {
        key: '_onDemuxVideoSampleReceived',
        value: function _onDemuxVideoSampleReceived(sample) {
            if (null !== this._onVideoSampleArrived) this._onVideoSampleArrived(sample);else {
                // error with register event
            }
        }
    }, {
        key: '_onDemuxAudioSampleReceived',
        value: function _onDemuxAudioSampleReceived(sample) {
            if (null !== this._onAudioSampleArrived) this._onAudioSampleArrived(sample);else {
                // error with register event
            }
        }
    }, {
        key: '_onReplay',
        value: function _onReplay(reData) {
            if (null !== this._onReplayData) this._onReplayData(reData);else {
                // error with register event
            }
        }
    }, {
        key: 'open',
        value: function open() {
            // throw new NotImplementedException('Unimplemented abstract function!');
        }
    }, {
        key: 'onMetadataArrived',
        get: function get() {
            return this._onMetadataArrived;
        },
        set: function set(callback) {
            this._onMetadataArrived = callback;
        }

        // prototype: function onVideoSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onVideoSampleArrived',
        get: function get() {
            return this._onVideoSampleArrived;
        },
        set: function set(callback) {
            this._onVideoSampleArrived = callback;
        }

        // prototype: function onAudioSampleArrived(data: ArrayBuffer): sample

    }, {
        key: 'onAudioSampleArrived',
        get: function get() {
            return this._onAudioSampleArrived;
        },
        set: function set(callback) {
            this._onAudioSampleArrived = callback;
        }

        // prototype: function onReconnect(type: string, metadata: any): void

    }, {
        key: 'onReconnect',
        get: function get() {
            return this._onReconnect;
        },
        set: function set(callback) {
            this._onReconnect = callback;
        }

        // prototype: function onError(type: String, data: ArrayBuffer): void

    }, {
        key: 'onError',
        get: function get() {
            return this._onError;
        },
        set: function set(callback) {
            this._onError = callback;
        }

        // prototype: function replayData(data: reData): void

    }, {
        key: 'onReplay',
        get: function get() {
            return this._onReplayData;
        },
        set: function set(callback) {
            this._onReplayData = callback;
        }
    }], [{
        key: 'probeflv',
        value: function probeflv(buffer) {
            var data = new Uint8Array(buffer);

            if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {
                console.warn('The file is not invalid flv.');
                return { match: false };
            }

            // let hasAudio = false;
            var hasAudio = (data[4] & 4) >>> 2 !== 0;
            var hasVideo = (data[4] & 1) !== 0;

            var offset = ReadBig32(data, 5);

            if (offset < 9) {
                console.warn('The file is not invalid flv.');
                return { match: false };
            }

            return {
                match: true,
                dataOffset: offset,
                hasAudioTrack: hasAudio,
                hasVideoTrack: hasVideo
            };
        }
    }, {
        key: 'probemp4',
        value: function probemp4(buffer) {
            var data = new Uint8Array(buffer);

            var offset1 = ReadBig32(data, 0);
            if (data[4] !== 0x66 || data[5] !== 0x74 || data[6] !== 0x79 || data[7] !== 0x70) {
                console.warn('The file is not invalid mp4.');
                return { match: false };
            }

            var offset2 = ReadBig32(data, offset1);
            var dataOffset = offset1 + offset2;
            var size = ReadBig32(data, dataOffset);

            return {
                match: true,
                dataOffset: dataOffset,
                rawDataSize: size,
                infoOffset: dataOffset + size
            };
        }
    }]);

    return Reader;
}();

},{}],22:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _logger = _dereq_('../../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _reader = _dereq_('../reader.js');

var _wsDemuxer = _dereq_('../../demuxer/ws-demuxer/ws-demuxer');

var _wsDemuxer2 = _interopRequireDefault(_wsDemuxer);

var _flvDemuxer = _dereq_('../../demuxer/flv-demuxer/flv-demuxer');

var _flvDemuxer2 = _interopRequireDefault(_flvDemuxer);

var _timer = _dereq_('../../utils/timer');

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

var WSReader = function (_Reader) {
    _inherits(WSReader, _Reader);

    function WSReader(mediaElement) {
        _classCallCheck(this, WSReader);

        var _this = _possibleConstructorReturn(this, (WSReader.__proto__ || Object.getPrototypeOf(WSReader)).call(this));

        _this._mediaElement = mediaElement;
        _this._url = null;
        _this._protocols = null;

        _this._wsClient = null;

        _this._stashBufferSize = 1024 * 1024 * 3; // initial size: 3MB
        _this._stashBuffer = new ArrayBuffer(_this._stashBufferSize);
        _this._stashByteOffset = 0; // stash position in original file

        _this._destroyWS = false;

        _this._timer = null;
        _this._wsOpen = false;
        _this._getMessage = false;
        //this._seekable = true;
        return _this;
    }

    // prototype: function WSDestroy(boolean): void    


    _createClass(WSReader, [{
        key: 'destroy',
        value: function destroy() {
            this._destroyWS = true;
            if (this._wsClient) {
                this._wsClient.close();

                this._wsClient = null;
                this._status = _reader.LoaderStatus.kComplete;
            }
            this._stashByteOffset = 0;
            _get(WSReader.prototype.__proto__ || Object.getPrototypeOf(WSReader.prototype), 'destroy', this).call(this);
            console.warn('WebSocket Client was destroyed!');
        }
    }, {
        key: '_onWebSocketMessage',
        value: function _onWebSocketMessage(e) {
            var _this2 = this;

            if (!this._getMessage) {
                this._getMessage = true;
            }
            // console.log('Websocket get message.');
            if (e.data instanceof ArrayBuffer) {
                // console.log(e.data.byteLength);
                // console.log(toBuffer(e.data));
                this._handleArrayBuffer(e.data);
            } else if (e.data instanceof Blob) {
                var reader = new FileReader();
                reader.onload = function () {
                    // scope has changed
                    _this2._handleArrayBuffer(reader.result);
                };
                reader.readAsArrayBuffer(e.data);
            }
            // console.log('Gotcha.');
        }
    }, {
        key: 'open',
        value: function open(url, protocols) {
            this._destroyed = false;
            this._url = url;
            this._protocols = protocols;
            this._destroyWS = false;
            this._getMessage = false;
            var systemTime = Date.now();

            this._timer = new _timer2.default(5000, 1);
            this._timer.timeup = this._timeOut.bind(this);
            this._timer.start(systemTime);

            try {
                console.log(url.slice(-10), 'attemp to open');
                var wsClient = this._wsClient = new WebSocket(url, protocols);
                // console.log(url.slice(-4), 'have new ws');
                wsClient.binaryType = 'arraybuffer';
                wsClient.onopen = this._onWebSocketOpen.bind(this);
                wsClient.onmessage = this._onWebSocketMessage.bind(this);
                wsClient.onclose = this._onWebSocketClose.bind(this);
                wsClient.onerror = this._onWebSocketError.bind(this);

                this._status = _reader.LoaderStatus.kConnecting;
            } catch (e) {
                this._status = _reader.LoaderStatus.kError;

                var info = { code: e.code, msg: e.message };

                // if (this._onError) {
                //     this._onError(LoaderErrors.EXCEPTION, info);
                // } else {
                //     throw new RuntimeException(info.msg);
                // }
            }
        }
    }, {
        key: 'reconnect',
        value: function reconnect() {
            this._onReconnect(this._mediaElement);
            this._wsOpen = false;

            console.warn('Websocket Client try to connect again.');
            this.open(this._url, this._protocols);
        }
    }, {
        key: '_onWebSocketOpen',
        value: function _onWebSocketOpen(e) {
            this._wsOpen = true;

            this._status = _reader.LoaderStatus.kBuffering;
            console.log('WSReader: WebSocket connected.');
        }
    }, {
        key: '_onWebSocketClose',
        value: function _onWebSocketClose(e) {
            var _this3 = this;

            this._status = _reader.LoaderStatus.kComplete;
            console.warn(e.code + ' ' + e.reason);
            console.log('WSReader: WebSocket close.');

            // destroy websocket, clean buffer and try reconnect
            if (!this._destroyWS) {
                // destroy websocket
                this.destroy();
                console.warn('WebSocket was closed, WebSocket will reconnect later.');
                setTimeout(function () {
                    _this3.reconnect();
                }, 1000);
            }
        }
    }, {
        key: '_onWebSocketError',
        value: function _onWebSocketError(e) {
            this._status = _reader.LoaderStatus.kError;

            var info = {
                code: e.code,
                msg: e.message
            };
            console.error('WSReader: ' + e.code + ': ' + e.message);

            // if (this._onError) {
            //     this._onError(LoaderErrors.EXCEPTION, info);
            // } else {
            //     throw new RuntimeException(info.msg);
            // }
            // this.reconnect();
        }

        // prototype: function _handleArrayBuffer(data: ArrayBuffer): void

    }, {
        key: '_handleArrayBuffer',
        value: function _handleArrayBuffer(receivedData) {
            if (this._destroyed) {
                return;
            }
            var probeData = null;

            var stashArray = new Uint8Array(this._stashBuffer, 0, this._stashBufferSize);
            stashArray.set(new Uint8Array(receivedData), this._stashByteOffset);
            this._stashByteOffset += receivedData.byteLength;

            // console.log(this._url.slice(-5), toBuffer(receivedData));
            if (null === this._demuxer) {
                if (this._stashByteOffset > 9) {
                    // recoginize the format
                    if ((probeData = WSReader.probeflv(receivedData)).match) {
                        this._demuxer = new _flvDemuxer2.default(probeData);
                        // bind demuxer's event to this.eventhandler
                        this._demuxer.onMetadataArrived = this._onDemuxMetadataReceived.bind(this);
                        this._demuxer.onVideoSampleArrived = this._onDemuxVideoSampleReceived.bind(this);
                        this._demuxer.onAudioSampleArrived = this._onDemuxAudioSampleReceived.bind(this);
                        this._demuxer.reqReplay = this._onReplay.bind(this);
                    }
                }
            }

            var consumed = this._demuxer.parseChunks(this._stashBuffer.slice(0, this._stashByteOffset), this._stashByteOffset);
            if (consumed > 0) {
                //todo optimize
                var remainArray = new Uint8Array(this._stashBuffer, consumed, this._stashByteOffset - consumed);
                stashArray.set(remainArray, 0);
                this._stashByteOffset -= consumed;
            } else if (consumed === 0) {
                // Keep data in buffer
            } else {// consumed < 0
                    // error
                }
        }
    }, {
        key: '_timeOut',
        value: function _timeOut() {
            if (!this._wsOpen || !this._getMessage) {
                if (!this._destroyWS) {
                    console.warn('Haven\'t got any data, WebSocket will reconnect.');
                    // destroy websocket
                    this.destroy();
                    this.reconnect();
                }
            }
        }
    }, {
        key: 'WSDestroy',
        get: function get() {
            return this._destroyWS;
        },
        set: function set(callback) {
            this._destroyWS = callback;
        }
    }]);

    return WSReader;
}(_reader.Reader);

exports.default = WSReader;

}).call(this,_dereq_("buffer").Buffer)

},{"../../demuxer/flv-demuxer/flv-demuxer":11,"../../demuxer/ws-demuxer/ws-demuxer":14,"../../utils/logger":23,"../../utils/timer":24,"../reader.js":21,"buffer":2}],23:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LoggingControl = exports.Log = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = _dereq_('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = exports.Log = function () {
    function Log() {
        _classCallCheck(this, Log);
    }

    _createClass(Log, null, [{
        key: 'e',
        value: function e(tag, msg) {
            if (!tag || Log.FORCE_GLOBAL_TAG) tag = Log.GLOBAL_TAG;

            var str = '[' + tag + '] > ' + msg;

            if (Log.ENABLE_CALLBACK) {
                Log.emitter.emit('log', 'error', str);
            }

            if (!Log.ENABLE_ERROR) {
                return;
            }

            if (console.error) {
                console.error(str);
            } else if (console.warn) {
                console.warn(str);
            } else {
                console.log(str);
            }
        }
    }, {
        key: 'i',
        value: function i(tag, msg) {
            if (!tag || Log.FORCE_GLOBAL_TAG) tag = Log.GLOBAL_TAG;

            var str = '[' + tag + '] > ' + msg;

            if (Log.ENABLE_CALLBACK) {
                Log.emitter.emit('log', 'info', str);
            }

            if (!Log.ENABLE_INFO) {
                return;
            }

            if (console.info) {
                console.info(str);
            } else {
                console.log(str);
            }
        }
    }, {
        key: 'w',
        value: function w(tag, msg) {
            if (!tag || Log.FORCE_GLOBAL_TAG) tag = Log.GLOBAL_TAG;

            var str = '[' + tag + '] > ' + msg;

            if (Log.ENABLE_CALLBACK) {
                Log.emitter.emit('log', 'warn', str);
            }

            if (!Log.ENABLE_WARN) {
                return;
            }

            if (console.warn) {
                console.warn(str);
            } else {
                console.log(str);
            }
        }
    }, {
        key: 'd',
        value: function d(tag, msg) {
            if (!tag || Log.FORCE_GLOBAL_TAG) tag = Log.GLOBAL_TAG;

            var str = '[' + tag + '] > ' + msg;

            if (Log.ENABLE_CALLBACK) {
                Log.emitter.emit('log', 'debug', str);
            }

            if (!Log.ENABLE_DEBUG) {
                return;
            }

            if (console.debug) {
                console.debug(str);
            } else {
                console.log(str);
            }
        }
    }, {
        key: 'v',
        value: function v(tag, msg) {
            if (!tag || Log.FORCE_GLOBAL_TAG) tag = Log.GLOBAL_TAG;

            var str = '[' + tag + '] > ' + msg;

            if (Log.ENABLE_CALLBACK) {
                Log.emitter.emit('log', 'verbose', str);
            }

            if (!Log.ENABLE_VERBOSE) {
                return;
            }

            console.log(str);
        }
    }]);

    return Log;
}();

Log.GLOBAL_TAG = 'flv.js';
Log.FORCE_GLOBAL_TAG = false;
Log.ENABLE_ERROR = true;
Log.ENABLE_INFO = true;
Log.ENABLE_WARN = true;
Log.ENABLE_DEBUG = true;
Log.ENABLE_VERBOSE = true;

Log.ENABLE_CALLBACK = false;

Log.emitter = new _events2.default();

var LoggingControl = exports.LoggingControl = function () {
    function LoggingControl() {
        _classCallCheck(this, LoggingControl);
    }

    _createClass(LoggingControl, null, [{
        key: 'getConfig',
        value: function getConfig() {
            return {
                globalTag: Log.GLOBAL_TAG,
                forceGlobalTag: Log.FORCE_GLOBAL_TAG,
                enableVerbose: Log.ENABLE_VERBOSE,
                enableDebug: Log.ENABLE_DEBUG,
                enableInfo: Log.ENABLE_INFO,
                enableWarn: Log.ENABLE_WARN,
                enableError: Log.ENABLE_ERROR,
                enableCallback: Log.ENABLE_CALLBACK
            };
        }
    }, {
        key: 'applyConfig',
        value: function applyConfig(config) {
            Log.GLOBAL_TAG = config.globalTag;
            Log.FORCE_GLOBAL_TAG = config.forceGlobalTag;
            Log.ENABLE_VERBOSE = config.enableVerbose;
            Log.ENABLE_DEBUG = config.enableDebug;
            Log.ENABLE_INFO = config.enableInfo;
            Log.ENABLE_WARN = config.enableWarn;
            Log.ENABLE_ERROR = config.enableError;
            Log.ENABLE_CALLBACK = config.enableCallback;
        }
    }, {
        key: '_notifyChange',
        value: function _notifyChange() {
            var emitter = LoggingControl.emitter;

            if (emitter.listenerCount('change') > 0) {
                var config = LoggingControl.getConfig();
                emitter.emit('change', config);
            }
        }
    }, {
        key: 'registerListener',
        value: function registerListener(listener) {
            LoggingControl.emitter.addListener('change', listener);
        }
    }, {
        key: 'removeListener',
        value: function removeListener(listener) {
            LoggingControl.emitter.removeListener('change', listener);
        }
    }, {
        key: 'addLogListener',
        value: function addLogListener(listener) {
            Log.emitter.addListener('log', listener);
            if (Log.emitter.listenerCount('log') > 0) {
                Log.ENABLE_CALLBACK = true;
                LoggingControl._notifyChange();
            }
        }
    }, {
        key: 'removeLogListener',
        value: function removeLogListener(listener) {
            Log.emitter.removeListener('log', listener);
            if (Log.emitter.listenerCount('log') === 0) {
                Log.ENABLE_CALLBACK = false;
                LoggingControl._notifyChange();
            }
        }
    }, {
        key: 'forceGlobalTag',
        get: function get() {
            return Log.FORCE_GLOBAL_TAG;
        },
        set: function set(enable) {
            Log.FORCE_GLOBAL_TAG = enable;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'globalTag',
        get: function get() {
            return Log.GLOBAL_TAG;
        },
        set: function set(tag) {
            Log.GLOBAL_TAG = tag;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'enableAll',
        get: function get() {
            return Log.ENABLE_VERBOSE && Log.ENABLE_DEBUG && Log.ENABLE_INFO && Log.ENABLE_WARN && Log.ENABLE_ERROR;
        },
        set: function set(enable) {
            Log.ENABLE_VERBOSE = enable;
            Log.ENABLE_DEBUG = enable;
            Log.ENABLE_INFO = enable;
            Log.ENABLE_WARN = enable;
            Log.ENABLE_ERROR = enable;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'enableDebug',
        get: function get() {
            return Log.ENABLE_DEBUG;
        },
        set: function set(enable) {
            Log.ENABLE_DEBUG = enable;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'enableVerbose',
        get: function get() {
            return Log.ENABLE_VERBOSE;
        },
        set: function set(enable) {
            Log.ENABLE_VERBOSE = enable;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'enableInfo',
        get: function get() {
            return Log.ENABLE_INFO;
        },
        set: function set(enable) {
            Log.ENABLE_INFO = enable;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'enableWarn',
        get: function get() {
            return Log.ENABLE_WARN;
        },
        set: function set(enable) {
            Log.ENABLE_WARN = enable;
            LoggingControl._notifyChange();
        }
    }, {
        key: 'enableError',
        get: function get() {
            return Log.ENABLE_ERROR;
        },
        set: function set(enable) {
            Log.ENABLE_ERROR = enable;
            LoggingControl._notifyChange();
        }
    }]);

    return LoggingControl;
}();

LoggingControl.emitter = new _events2.default();

},{"events":3}],24:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = _dereq_('events');

var _events2 = _interopRequireDefault(_events);

var _logger = _dereq_('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Timer = function () {
    function Timer(delay, accuracy) {
        _classCallCheck(this, Timer);

        this.TAG = 'Timer';

        this._delay = delay - 5;
        this._expected = 0;
        this._timeout = 0;
        this._interval = accuracy;

        this._timeup = null;
    }

    _createClass(Timer, [{
        key: 'start',
        value: function start(begin) {
            // Log.v(this.TAG, `Timer begin at ${begin}`);
            this._expected = begin + this._interval;
            this._timeout = setTimeout(this.step.bind(this), this._interval);
        }
    }, {
        key: 'stop',
        value: function stop() {
            clearTimeout(this._timeout);
        }
    }, {
        key: 'step',
        value: function step() {
            var drift = Date.now() - this._expected;
            var interval = this._interval;
            // console.warn('drift: ' + drift);

            if (drift > 0) {
                this._delay -= drift;
                this._expected += drift;
                interval = this._interval - drift > 0 ? this._interval - drift : 0;
            }
            this._expected += this._interval;
            this._delay -= this._interval;
            // console.warn('delay: ' + this._delay);

            if (this._delay <= 0) {
                if (this._delay !== 0) {
                    // Log.w(this.TAG, `Accuracy is ${this._interval}, error is ${Math.abs(this._delay)}`);
                }
                this._timeup();
            } else {
                // console.warn('expected:' + this._expected);
                this._timeout = setTimeout(this.step.bind(this), this._interval);
            }
        }
    }, {
        key: 'timeup',
        get: function get() {
            return this._timeup;
        },
        set: function set(callback) {
            this._timeup = callback;
        }
    }]);

    return Timer;
}();

exports.default = Timer;

},{"./logger":23,"events":3}],25:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _webplayer = _dereq_('./core/webplayer');

var _webplayer2 = _interopRequireDefault(_webplayer);

var _freader = _dereq_('./reader/filereader/freader');

var _freader2 = _interopRequireDefault(_freader);

var _wsreader = _dereq_('./reader/wsreader/wsreader');

var _wsreader2 = _interopRequireDefault(_wsreader);

var _httpreader = _dereq_('./reader/httpreader/httpreader');

var _httpreader2 = _interopRequireDefault(_httpreader);

var _logger = _dereq_('./utils/logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createReader(fileDir) {
    return new _freader2.default(fileDir);
}

function createWSReader(element) {
    return new _wsreader2.default(element);
}

function createHTTPReader(element) {
    return new _httpreader2.default(element);
}

function createPlayer(config) {
    return new _webplayer2.default(config);
}

var wpjs = {};

wpjs.createPlayer = createPlayer;
wpjs.createReader = createReader;
wpjs.createWSReader = createWSReader;
wpjs.createHTTPReader = createHTTPReader;

wpjs.LoggingControl = _logger.LoggingControl;

Object.defineProperty(wpjs, 'version', {
    enumerable: true,
    get: function get() {
        // replaced by browserify-versionify transform
        return '1.0.0';
    }
});

exports.default = wpjs;

},{"./core/webplayer":8,"./reader/filereader/freader":19,"./reader/httpreader/httpreader":20,"./reader/wsreader/wsreader":22,"./utils/logger":23}]},{},[15])(15)
});

//# sourceMappingURL=wp.js.map
