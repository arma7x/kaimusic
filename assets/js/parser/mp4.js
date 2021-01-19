var MP4Metadata = function() {
  function e(e, r) {
    return t(e, f) ? (r.tag_format = "mp4", n(e, r).then(function(e) {
      if (!e) throw Error("No playable streams.");
      return a(e.atom, e.size, r)
    })) : Promise.reject(new Error("Unknown MP4 file type"))
  }

  function t(e, t) {
    var n = e.getASCIIText(8, 4);
    if (n in t) return !0;
    for (var a = 16, r = e.getUint32(0); r > a;) {
      var i = e.getASCIIText(a, 4);
      if (a += 4, i in t) return !0
    }
    return !1
  }

  function n(e) {
    return new Promise(function(t, a) {
      var r = e.sliceOffset + e.viewOffset,
        i = e.readUnsignedInt(),
        s = e.readASCIIText(4);
      0 === i ? i = e.blob.size - r : 1 === i && (i = 4294967296 * e.readUnsignedInt() + e.readUnsignedInt()), "moov" === s ? e.getMore(r, i, function(e) {
        t({
          atom: e,
          size: i
        })
      }) : r + i + 16 <= e.blob.size ? e.getMore(r + i, 16, function(e) {
        try {
          n(e).then(function(e) {
            t(e)
          })
        } catch (r) {
          a(r)
        }
      }) : t(null)
    })
  }

  function a(e, t, n) {
    for (e.advance(8); e.index < t;) {
      var a = e.readUnsignedInt(),
        i = e.readASCIIText(4),
        c = e.index + a - 8;
      if ("udta" === i) o(e, t, n);
      else if ("trak" === i) {
        if (e.advance(-8), !r(e, ["mdia", "minf"])) throw Error("Not enough metadata in MP4 container!");
        if (s(e, "vmhd")) throw Error("Found video track in MP4 container");
        if (s(e, "smhd") && r(e, ["stbl", "stsd"])) {
          e.advance(20);
          var u = e.readASCIIText(4);
          if (!(u in p)) throw Error("Unsupported format in MP4 container: " + u)
        }
      }
      e.seek(c)
    }
    return n
  }

  function r(e, t) {
    return t.every(function(t) {
      return i(e, t)
    })
  }

  function i(e, t) {
    var n = e.index,
      a = e.readUnsignedInt();
    for (e.advance(4); e.index < n + a;) {
      var r = e.readUnsignedInt(),
        i = e.readASCIIText(4);
      if (i === t) return e.advance(-8), !0;
      e.advance(r - 8)
    }
    return !1
  }

  function s(e, t) {
    var n = e.index,
      a = i(e, t);
    return e.seek(n), a
  }

  function o(e, t, n) {
    for (; e.index < t;) {
      var a = e.readUnsignedInt(),
        r = e.readASCIIText(4);
      if ("meta" === r) return c(e, e.index + a - 8, n), e.seek(t), void 0;
      e.advance(a - 8)
    }
  }

  function c(e, t, n) {
    for (e.advance(4); e.index < t;) {
      var a = e.readUnsignedInt(),
        r = e.readASCIIText(4);
      if ("ilst" === r) return u(e, e.index + a - 8, n), e.seek(t), void 0;
      e.advance(a - 8)
    }
  }

  function u(e, t, n) {
    for (; e.index < t;) {
      var a = e.readUnsignedInt(),
        r = e.readASCIIText(4),
        i = e.index + a - 8,
        s = d[r];
      if (s) try {
        var o = l(e, i, r);
        r in m ? (n[s] = o.number, o.count && (n[m[r]] = o.count)) : n[s] = o
      } catch (c) {
        console.warn("skipping", r, ":", c)
      }
      e.seek(i)
    }
  }

  function l(e, t, n) {
    for (; e.index < t;) {
      var a = e.readUnsignedInt(),
        r = e.readASCIIText(4);
      if ("data" === r) {
        var i = 16777215 & e.readUnsignedInt();
        e.advance(4);
        var s = a - 16;
        if (n in m) {
          e.advance(2);
          var o = e.readUnsignedShort(),
            c = e.readUnsignedShort();
          return {
            number: o,
            count: c
          }
        }
        switch (i) {
          case 1:
            return e.readUTF8Text(s);
          case 13:
            return {
              flavor: "embedded", start: e.sliceOffset + e.viewOffset + e.index, end: e.sliceOffset + e.viewOffset + e.index + s, type: "image/jpeg"
            };
          case 14:
            return {
              flavor: "embedded", start: e.sliceOffset + e.viewOffset + e.index, end: e.sliceOffset + e.viewOffset + e.index + s, type: "image/png"
            };
          default:
            throw Error("unexpected type in data atom")
        }
      } else e.advance(a - 8)
    }
    throw Error("no data atom found")
  }
  var d = {
      "©alb": "album",
      "©art": "artist",
      "©ART": "artist",
      aART: "artist",
      "©nam": "title",
      trkn: "tracknum",
      disk: "discnum",
      covr: "picture"
    },
    m = {
      trkn: "trackcount",
      disk: "disccount"
    },
    f = {
      "M4A ": !0,
      "M4B ": !0,
      mp41: !0,
      mp42: !0,
      isom: !0,
      iso2: !0
    },
    p = {
      mp4a: !0,
      samr: !0,
      sawb: !0,
      sawp: !0
    };
  return {
    parse: e
  }
}();
