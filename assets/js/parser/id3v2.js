var ID3v2Metadata = function() {
  function e(e, a) {
    var r = t(e);
    return r.version > 4 ? (console.warn("mp3 file with unknown metadata version"), Promise.resolve(a)) : (a.tag_format = r.versionString, new Promise(function(t, i) {
      e.getMore(e.index, r.length, function(e, s) {
        if (s) return i(s), void 0;
        try {
          n(r, e, a), t(a)
        } catch (o) {
          i(o)
        }
      })
    }))
  }

  function t(e) {
    e.seek(3);
    var t = {
      get versionString() {
        return "id3v2." + this.version + "." + this.revision
      },
      get tag_unsynchronized() {
        return 0 !== (128 & this.flags)
      },
      get has_extended_header() {
        return 0 !== (64 & this.flags)
      }
    };
    return t.version = e.readUnsignedByte(), t.revision = e.readUnsignedByte(), t.flags = e.readUnsignedByte(), t.length = e.readID3Uint28BE(), t
  }

  function n(e, t, n) {
    if (e.tag_unsynchronized && 3 === e.version && (t = r(t, e.length)), e.has_extended_header) {
      var i;
      i = 4 === e.version ? t.readID3Uint28BE() - 4 : t.readUnsignedInt(), t.advance(i)
    }
    for (; t.index < t.byteLength && 0 !== t.getUint8(t.index);) a(e, t, n)
  }

  function a(e, t, n) {
    var a, c, u, m = !1;
    switch (e.version) {
      case 2:
        a = t.readASCIIText(3), c = t.readUint24(), u = 0;
        break;
      case 3:
        a = t.readASCIIText(4), c = t.readUnsignedInt(), u = t.readUnsignedShort();
        break;
      case 4:
        a = t.readASCIIText(4), c = t.readID3Uint28BE(), u = t.readUnsignedShort(), m = 0 !== (2 & u)
    }
    var f = t.index + c,
      p = l[a];
    if (!p) return t.seek(f), void 0;
    if (0 !== (253 & u)) return console.warn("Skipping", a, "frame with flags", u), t.seek(f), void 0;
    try {
      var h, g;
      switch (m ? (h = r(t, c), c = h.sliceLength) : h = t, a) {
        case "TPE1":
        case "TP1":
        case "TALB":
        case "TAL":
        case "TIT2":
        case "TT2":
          g = i(e, h, c);
          break;
        case "TRCK":
        case "TRK":
        case "TPOS":
        case "TPA":
          g = s(e, h, c), null !== g[1] && (n[d[a]] = g[1]), g = g[0];
          break;
        case "APIC":
        case "PIC":
          g = o(e, h, c);
          break;
        default:
          console.error("Should not have gotten here")
      }
      null !== g && (n[p] = g)
    } catch (E) {
      console.warn("Error parsing mp3 metadata frame", a, ":", E)
    }
    t.seek(f)
  }

  function r(e, t) {
    for (var n = new Uint8Array(t), a = !1, r = 0, i = 0; t > i; i++) {
      var s = e.readUnsignedByte();
      a && 0 === s || (a = 255 === s, n[r++] = s)
    }
    var o = new BlobView.getFromArrayBuffer(n.buffer, 0, r, e.littleEndian);
    return o.deunsynced = !0, o
  }

  function i(e, t, n, a) {
    return void 0 === a && (a = t.readUnsignedByte(), n -= 1), 0 === a && t.getUint8(t.index) > 128 ? t.readGBKText(n) : 4 === e.version ? c(t, n, a) : "ko-KR" !== navigator.language ? u(t, n, a) : u(t, n, a, "text")
  }

  function s(e, t, n, a) {
    var r = i(e, t, n, a),
      s = r.split("/", 2).map(function(e) {
        var t = parseInt(e, 10);
        return isNaN(t) || !isFinite(t) ? null : t
      });
    return 1 === s.length && s.push(null), s
  }

  function o(e, t, n) {
    var a, r = t.index,
      i = t.readUnsignedByte();
    2 === e.version ? (a = t.readASCIIText(3), "JPG" === a ? a = "image/jpeg" : "PNG" === a && (a = "image/png")) : a = t.readNullTerminatedLatin1Text(n - 1), t.readUnsignedByte(), u(t, n - (t.index - r), i);
    var s = t.sliceOffset + t.viewOffset + t.index,
      o = n - (t.index - r),
      c = s + o;
    return t.deunsynced ? {
      flavor: "unsynced",
      blob: new Blob([t.buffer.slice(s, c)], {
        type: a
      })
    } : {
      flavor: "embedded",
      start: s,
      end: c,
      type: a
    }
  }

  function c(e, t, n) {
    var a;
    switch (n) {
      case 0:
        a = e.readASCIIText(t);
        break;
      case 1:
        a = e.readUTF16Text(t, void 0);
        break;
      case 2:
        a = e.readUTF16Text(t, !1);
        break;
      case 3:
        a = e.readUTF8Text(t);
        break;
      default:
        throw Error("unknown text encoding")
    }
    return a.replace(/\0+$/, "").replace("\0", " / ")
  }

  function u(e, t, n, a) {
    switch (n) {
      case 0:
        return e.readNullTerminatedLatin1Text(t, n, a);
      case 1:
        return e.readNullTerminatedUTF16Text(t, void 0);
      case 2:
        return e.readNullTerminatedUTF16Text(t, !1);
      case 3:
        return e.readNullTerminatedUTF8Text(t);
      default:
        throw Error("unknown text encoding")
    }
  }
  var l = {
      TPE1: "artist",
      TP1: "artist",
      TALB: "album",
      TAL: "album",
      TIT2: "title",
      TT2: "title",
      TRCK: "tracknum",
      TRK: "tracknum",
      TPOS: "discnum",
      TPA: "discnum",
      APIC: "picture",
      PIC: "picture"
    },
    d = {
      TRCK: "trackcount",
      TRK: "trackcount",
      TPOS: "disccount",
      TPA: "disccount"
    };
  return {
    parse: e
  }
}();
