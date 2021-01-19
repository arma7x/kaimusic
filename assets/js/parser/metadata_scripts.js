var BlobView = (function() {
  function fail(msg) {
    throw Error(msg);
  }

  function BlobView(blob, sliceOffset, sliceLength, slice, viewOffset, viewLength, littleEndian) {
    this.blob = blob;
    this.sliceOffset = sliceOffset;
    this.sliceLength = sliceLength;
    this.slice = slice;
    this.viewOffset = viewOffset;
    this.viewLength = viewLength;
    this.littleEndian = littleEndian;
    this.view = new DataView(slice, viewOffset, viewLength);
    this.buffer = slice;
    this.byteLength = viewLength;
    this.byteOffset = viewOffset;
    this.index = 0;
  }
  BlobView.get = function(blob, offset, length, callback, littleEndian) {
    if (offset < 0) {
      fail('negative offset');
    }
    if (length < 0) {
      fail('negative length');
    }
    if (offset > blob.size) {
      fail('offset larger than blob size');
    }
    if (offset + length > blob.size) {
      length = blob.size - offset;
    }
    var slice = blob.slice(offset, offset + length);
    var reader = new FileReader();
    reader.readAsArrayBuffer(slice);
    reader.onloadend = function() {
      var result = null;
      if (reader.result) {
        result = new BlobView(blob, offset, length, reader.result, 0, length, littleEndian || false);
      }
      callback(result, reader.error);
    };
  };
  BlobView.getFromArrayBuffer = function(buffer, offset, length, littleEndian) {
    return new BlobView(null, offset, length, buffer, offset, length, littleEndian);
  };
  BlobView.prototype = {
    constructor: BlobView,
    getMore: function(offset, length, callback) {
      if (!this.blob)
        fail('no blob backing this BlobView');
      if (offset >= this.sliceOffset && offset + length <= this.sliceOffset + this.sliceLength) {
        callback(new BlobView(this.blob, this.sliceOffset, this.sliceLength, this.slice, offset - this.sliceOffset, length, this.littleEndian));
      } else {
        BlobView.get(this.blob, offset, length, callback, this.littleEndian);
      }
    },
    littleEndian: function() {
      this.littleEndian = true;
    },
    bigEndian: function() {
      this.littleEndian = false;
    },
    getUint8: function(offset) {
      return this.view.getUint8(offset);
    },
    getInt8: function(offset) {
      return this.view.getInt8(offset);
    },
    getUint16: function(offset, le) {
      return this.view.getUint16(offset, le !== undefined ? le : this.littleEndian);
    },
    getInt16: function(offset, le) {
      return this.view.getInt16(offset, le !== undefined ? le : this.littleEndian);
    },
    getUint32: function(offset, le) {
      return this.view.getUint32(offset, le !== undefined ? le : this.littleEndian);
    },
    getInt32: function(offset, le) {
      return this.view.getInt32(offset, le !== undefined ? le : this.littleEndian);
    },
    getFloat32: function(offset, le) {
      return this.view.getFloat32(offset, le !== undefined ? le : this.littleEndian);
    },
    getFloat64: function(offset, le) {
      return this.view.getFloat64(offset, le !== undefined ? le : this.littleEndian);
    },
    readByte: function() {
      return this.view.getInt8(this.index++);
    },
    readUnsignedByte: function() {
      return this.view.getUint8(this.index++);
    },
    readShort: function(le) {
      var val = this.view.getInt16(this.index, le !== undefined ? le : this.littleEndian);
      this.index += 2;
      return val;
    },
    readUnsignedShort: function(le) {
      var val = this.view.getUint16(this.index, le !== undefined ? le : this.littleEndian);
      this.index += 2;
      return val;
    },
    readInt: function(le) {
      var val = this.view.getInt32(this.index, le !== undefined ? le : this.littleEndian);
      this.index += 4;
      return val;
    },
    readUnsignedInt: function(le) {
      var val = this.view.getUint32(this.index, le !== undefined ? le : this.littleEndian);
      this.index += 4;
      return val;
    },
    readFloat: function(le) {
      var val = this.view.getFloat32(this.index, le !== undefined ? le : this.littleEndian);
      this.index += 4;
      return val;
    },
    readDouble: function(le) {
      var val = this.view.getFloat64(this.index, le !== undefined ? le : this.littleEndian);
      this.index += 8;
      return val;
    },
    tell: function() {
      return this.index;
    },
    remaining: function() {
      return this.byteLength - this.index;
    },
    seek: function(index) {
      if (index < 0) {
        fail('negative index');
      }
      if (index > this.byteLength) {
        fail('index greater than buffer size');
      }
      this.index = index;
    },
    advance: function(n) {
      var index = this.index + n;
      if (index < 0) {
        fail('advance past beginning of buffer');
      }
      if (index > this.byteLength) {
        fail('advance past end of buffer');
      }
      this.index = index;
    },
    getUnsignedByteArray: function(offset, n) {
      return new Uint8Array(this.buffer, offset + this.viewOffset, n);
    },
    readUnsignedByteArray: function(n) {
      var val = new Uint8Array(this.buffer, this.index + this.viewOffset, n);
      this.index += n;
      return val;
    },
    getBit: function(offset, bit) {
      var byte = this.view.getUint8(offset);
      return (byte & (1 << bit)) !== 0;
    },
    getUint24: function(offset, le) {
      var b1, b2, b3;
      if (le !== undefined ? le : this.littleEndian) {
        b1 = this.view.getUint8(offset);
        b2 = this.view.getUint8(offset + 1);
        b3 = this.view.getUint8(offset + 2);
      } else {
        b3 = this.view.getUint8(offset);
        b2 = this.view.getUint8(offset + 1);
        b1 = this.view.getUint8(offset + 2);
      }
      return (b3 << 16) + (b2 << 8) + b1;
    },
    readUint24: function(le) {
      var value = this.getUint24(this.index, le);
      this.index += 3;
      return value;
    },
    getASCIIText: function(offset, len) {
      var bytes = new Uint8Array(this.buffer, offset + this.viewOffset, len);
      return String.fromCharCode.apply(String, bytes);
    },
    readASCIIText: function(len) {
      var bytes = new Uint8Array(this.buffer, this.index + this.viewOffset, len);
      this.index += len;
      return String.fromCharCode.apply(String, bytes);
    },
    getUTF8Text: function(offset, len) {
      function fail() {
        throw new Error('Illegal UTF-8');
      }
      var pos = offset;
      var end = offset + len;
      var charcode;
      var s = '';
      var b1, b2, b3, b4;
      while (pos < end) {
        var b1 = this.view.getUint8(pos);
        if (b1 < 128) {
          s += String.fromCharCode(b1);
          pos += 1;
        } else if (b1 < 194) {
          fail();
        } else if (b1 < 224) {
          if (pos + 1 >= end) {
            fail();
          }
          b2 = this.view.getUint8(pos + 1);
          if (b2 < 128 || b2 > 191) {
            fail();
          }
          charcode = ((b1 & 0x1f) << 6) + (b2 & 0x3f);
          s += String.fromCharCode(charcode);
          pos += 2;
        } else if (b1 < 240) {
          if (pos + 2 >= end) {
            fail();
          }
          b2 = this.view.getUint8(pos + 1);
          if (b2 < 128 || b2 > 191) {
            fail();
          }
          b3 = this.view.getUint8(pos + 2);
          if (b3 < 128 || b3 > 191) {
            fail();
          }
          charcode = ((b1 & 0x0f) << 12) + ((b2 & 0x3f) << 6) + (b3 & 0x3f);
          s += String.fromCharCode(charcode);
          pos += 3;
        } else if (b1 < 245) {
          if (pos + 3 >= end) {
            fail();
          }
          b2 = this.view.getUint8(pos + 1);
          if (b2 < 128 || b2 > 191) {
            fail();
          }
          b3 = this.view.getUint8(pos + 2);
          if (b3 < 128 || b3 > 191) {
            fail();
          }
          b4 = this.view.getUint8(pos + 3);
          if (b4 < 128 || b4 > 191) {
            fail();
          }
          charcode = ((b1 & 0x07) << 18) +
            ((b2 & 0x3f) << 12) +
            ((b3 & 0x3f) << 6) +
            (b4 & 0x3f);
          charcode -= 0x10000;
          s += String.fromCharCode(0xd800 + ((charcode & 0x0FFC00) >>> 10));
          s += String.fromCharCode(0xdc00 + (charcode & 0x0003FF));
          pos += 4;
        } else {
          fail();
        }
      }
      return s;
    },
    readUTF8Text: function(len) {
      try {
        return this.getUTF8Text(this.index, len);
      } finally {
        this.index += len;
      }
    },
    getUTF16Text: function(offset, len, le) {
      if (len % 2) {
        fail('len must be a multiple of two');
      }
      if (le === null || le === undefined) {
        var BOM = this.getUint16(offset);
        if (BOM === 0xFEFF) {
          len -= 2;
          offset += 2;
          le = false;
        } else if (BOM === 0xFFFE) {
          len -= 2;
          offset += 2;
          le = true;
        } else
          le = true;
      }
      var s = '';
      for (var i = 0; i < len; i += 2)
        s += String.fromCharCode(this.getUint16(offset + i, le));
      return s;
    },
    readUTF16Text: function(len, le) {
      var value = this.getUTF16Text(this.index, len, le);
      this.index += len;
      return value;
    },
    getID3Uint28BE: function(offset) {
      var b1 = this.view.getUint8(offset) & 0x7f;
      var b2 = this.view.getUint8(offset + 1) & 0x7f;
      var b3 = this.view.getUint8(offset + 2) & 0x7f;
      var b4 = this.view.getUint8(offset + 3) & 0x7f;
      return (b1 << 21) | (b2 << 14) | (b3 << 7) | b4;
    },
    readID3Uint28BE: function() {
      var value = this.getID3Uint28BE(this.index);
      this.index += 4;
      return value;
    },
    readNullTerminatedLatin1Text: function(size, encoding, origin) {
      var s = '';
      var bytes = [];
      for (var i = 0; i < size; i++) {
        var charcode = this.view.getUint8(this.index + i);
        if (charcode === 0) {
          i++;
          break;
        }
        bytes.push(charcode);
      }
      var decoder = new TextDecoder('windows-1251');
      if (!encoding && origin === 'text') {
        decoder = new TextDecoder('euc-kr');
      }
      s = decoder.decode(new Uint8Array(bytes));
      this.index += i;
      return s;
    },
    readNullTerminatedUTF8Text: function(size) {
      for (var len = 0; len < size; len++) {
        if (this.view.getUint8(this.index + len) === 0) {
          break;
        }
      }
      var s = this.readUTF8Text(len);
      if (len < size) {
        this.advance(1);
      }
      return s;
    },
    readNullTerminatedUTF16Text: function(size, le) {
      if (size % 2) {
        fail('size must be a multiple of two');
      }
      if (le === null || le === undefined) {
        var BOM = this.readUnsignedShort();
        if (BOM === 0xFEFF) {
          size -= 2;
          le = false;
        } else if (BOM === 0xFFFE) {
          size -= 2;
          le = true;
        } else {
          this.index -= 2;
          le = true;
        }
      }
      var s = '';
      for (var i = 0; i < size; i += 2) {
        var charcode = this.getUint16(this.index + i, le);
        if (charcode === 0) {
          i += 2;
          break;
        }
        s += String.fromCharCode(charcode);
      }
      this.index += i;
      return s;
    },
    getGBKText: function(offset, len) {
      if (len % 2) {
        fail('size must be a multiple of two');
      }
      let bytes = [];
      let decoderGBk = new TextDecoder('gbk');
      for (var i = 0; i < len; i++) {
        var charcode = this.getUint8(this.index + offset + i);
        if (charcode === 0) {
          i++;
          break;
        }
        bytes.push(charcode);
      }
      return decoderGBk.decode(new Uint8Array(bytes));
    },
    readGBKText: function(size) {
      if (size % 2) {
        fail('size must be a multiple of two');
      }
      let s = '';
      let bytes = [];
      let decoderGBk = new TextDecoder('gbk');
      for (var i = 0; i < size; i++) {
        var charcode = this.getUint8(this.index + i);
        if (charcode === 0) {
          i++;
          break;
        }
        bytes.push(charcode);
      }
      s = decoderGBk.decode(new Uint8Array(bytes));
      this.index += i;
      return s;
    }
  };
  return {
    get: BlobView.get,
    getFromArrayBuffer: BlobView.getFromArrayBuffer
  };
}());
var MetadataFormats = (function() {
  var formats = [{
    file: 'js/metadata/id3v2.js',
    get module() {
      return ID3v2Metadata;
    },
    match: function(header) {
      return header.getASCIIText(0, 3) === 'ID3';
    }
  }, {
    file: 'js/metadata/ogg.js',
    get module() {
      return OggMetadata;
    },
    match: function(header) {
      return header.getASCIIText(0, 4) === 'OggS';
    }
  }, {
    file: 'js/metadata/flac.js',
    get module() {
      return FLACMetadata;
    },
    match: function(header) {
      return header.getASCIIText(0, 4) === 'fLaC';
    }
  }, {
    file: 'js/metadata/mp4.js',
    get module() {
      return MP4Metadata;
    },
    match: function(header) {
      return header.getASCIIText(4, 4) === 'ftyp';
    }
  }, {
    file: 'js/metadata/id3v1.js',
    get module() {
      return ID3v1Metadata;
    },
    match: function(header) {
      return (header.getUint16(0, false) & 0xFFFE) === 0xFFFA;
    }
  }];

  function findParser(header, metadata) {
    for (var i = 0; i < formats.length; i++) {
      if (formats[i].match(header)) {
        return formats[i].module.parse(header, metadata);
      }
    }
    return null;
  }
  return {
    findParser: findParser
  };
})();
var AudioMetadata = (function() {

  function parse(blob) {
    var filename = blob.name;
    if (filename) {
      if (filename.slice(0, 5) === 'DCIM/' && filename.slice(-4).toLowerCase() === '.3gp') {
        return Promise.reject('skipping 3gp video file');
      }
    }
    if (blob.size < 128) {
      return Promise.reject('file is empty or too small');
    }
    var metadata = {};
    metadata.artist = metadata.album = metadata.title = '';
    metadata.rated = metadata.played = 0;
    if (filename) {
      var p1 = filename.lastIndexOf('/');
      var p2 = filename.lastIndexOf('.');
      if (p2 <= p1) {
        p2 = filename.length;
      }
      metadata.title = filename.substring(p1 + 1, p2);
    }
    return new Promise(function(resolve, reject) {
      var headersize = Math.min(64 * 1024, blob.size);
      BlobView.get(blob, 0, headersize, function(header, error) {
        if (error) {
          reject(error);
          return;
        }
        try {
          var parser = MetadataFormats.findParser(header);
          resolve(parser.parse(header, metadata));
        } catch (e) {
          console.error('AudioMetadata.parse:', e, e.stack);
          reject(e);
        }
      });
    });
  }

  return {
    parse: parse
  };
})();
