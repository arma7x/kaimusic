var OggMetadata = function() {
  function e() {}

  function t(e, t) {
    return n(e), a(e, t)
  }

  function n(e) {
    var t = r(e);
    if (1 !== t.segment_table.length) throw new Error("ogg identification header expected as only packet of first page");
    e.advance(t.segment_table[0])
  }

  function a(e, t) {
    var n = r(e),
      a = function(e, t) {
        return e + t
      },
      s = Array.reduce(n.segment_table, a, 0);
    return new Promise(function(n, a) {
      e.getMore(e.index, s, function(e, r) {
        if (r) return a(r), void 0;
        try {
          var s = e.readByte(),
            o = !1;
          switch (s) {
            case 3:
              o = "vorbis" === e.readASCIIText(6), t.tag_format = "vorbis";
              break;
            case 79:
              o = "pusTags" === e.readASCIIText(7), t.tag_format = "opus"
          }
          if (!o) return a("malformed ogg comment packet"), void 0;
          i(e, t), (VorbisPictureComment.parsePictureComment(t).then(n))
        } catch (c) {
          a(c)
        }
      })
    })
  }

  function r(e) {
    var t = e.readASCIIText(4);
    if ("OggS" !== t) throw new Error("malformed ogg page header");
    e.advance(22);
    var n = e.readUnsignedByte(),
      a = e.readUnsignedByteArray(n);
    return {
      segment_table: a
    }
  }

  function i(t, n) {
    var a = t.readUnsignedInt(!0);
    t.advance(a);
    for (var r = t.readUnsignedInt(!0), i = {}, o = 0; r > o; o++) try {
      var c = s(t);
      c && ("picture" !== c.field || i.hasOwnProperty(c.field) ? i.hasOwnProperty(c.field) ? n[c.field] += " / " + c.value : (n[c.field] = c.value, i[c.field] = !0) : (n[c.field] = c.value, i[c.field] = !0))
    } catch (u) {
      if (u instanceof e) return;
      console.warn("Error parsing ogg metadata frame", u)
    }
  }

  function s(t) {
    if (t.remaining() < 4) throw new e;
    var n = t.readUnsignedInt(!0);
    if (n > t.remaining()) throw new e;
    var a = t.readUTF8Text(n),
      r = a.indexOf("=");
    if (-1 === r) throw new Error("missing delimiter in comment");
    var i = a.substring(0, r).toLowerCase().replace(" ", ""),
      s = c[i];
    if (s) {
      var u = a.substring(r + 1);
      return -1 !== o.indexOf(s) && (u = parseInt(u, 10)), {
        field: s,
        value: u
      }
    }
  }
  var o = ["tracknum", "trackcount", "discnum", "disccount"],
    c = {
      title: "title",
      artist: "artist",
      album: "album",
      tracknumber: "tracknum",
      tracktotal: "trackcount",
      discnumber: "discnum",
      disctotal: "disccount",
      metadata_block_picture: "picture"
    };
  return {
    parse: t
  }
}();
