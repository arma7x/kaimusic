var VorbisPictureComment = function() {
  function t(t) {
    var e = t.readUnsignedInt();
    if (3 != e) return null;
    var n = t.readUnsignedInt(),
      a = t.readASCIIText(n);
    if ("-->" == a) return console.error("URL for cover art is not supported from Vorbis comment."), null;
    n = t.readUnsignedInt(), t.readNullTerminatedUTF8Text(n), t.advance(16);
    var i = t.readUnsignedInt(),
      s = t.index;
    return {
      flavor: "embedded",
      start: s,
      end: s + i,
      type: a
    }
  }

  function e(t, e) {
    function n(t) {
      return t > 64 && 91 > t ? t - 65 : t > 96 && 123 > t ? t - 71 : t > 47 && 58 > t ? t + 4 : 43 === t ? 62 : 47 === t ? 63 : 0
    }
    for (var a, i, s = t.replace(/[^A-Za-z0-9\+\/]/g, ""), r = s.length, o = e ? Math.ceil((3 * r + 1 >> 2) / e) * e : 3 * r + 1 >> 2, c = new Uint8Array(o), u = 0, l = 0, d = 0; r > d; d++)
      if (i = 3 & d, u |= n(s.charCodeAt(d)) << 18 - 6 * i, 3 === i || 1 === r - d) {
        for (a = 0; 3 > a && o > l; a++, l++) c[l] = 255 & u >>> (24 & 16 >>> a);
        u = 0
      } return c
  }

  function n(n) {
    return new Promise(function(a) {
      if (!n.picture) return a(n), void 0;
      var i = n.picture;
      try {
        var s = e(i),
          r = new Blob([s]);
        BlobView.get(r, 0, r.size, function(e) {
          var i = t(e);
          i && (n.picture = {
            flavor: "unsynced",
            blob: r.slice(i.start, i.end, i.type)
          }), a(n)
        }, BlobView.bigEndian)
      } catch (o) {
        console.warn("Error parsing picture comment", o.message), a(n)
      }
    })
  }
  return {
    readPicFrame: t,
    parsePictureComment: n
  }
}();
