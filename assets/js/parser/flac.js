var FLACMetadata = function() {
  function e(e, n) {
    return e.seek(4), new Promise(function(r) {
      function i(e) {
        return e ? (4 === e.block_type ? (a(e.view, n), s = !0) : 6 === e.block_type && ((
          n.picture = VorbisPictureComment.readPicFrame(e.view), n.picture.start += e.view.viewOffset, n.picture.end += e.view.viewOffset
        ), o = !0), !s || !o) : (r(n), !1)
      }
      n.tag_format = "flac";
      var s = !1,
        o = !1;
      t(e, i)
    })
  }

  function t(e, a) {
    n(e).then(function(e) {
      !a(e) || e.last ? a(null) : (e.view.advance(e.length - e.view.index), t(e.view, a))
    }).catch(function(e) {
      console.error("Error finding FLAC metadata:", e), a(null)
    })
  }

  function n(e) {
    return new Promise(function(t, n) {
      var a = e.readUnsignedByte(),
        r = 128 === (128 & a),
        i = 127 & a,
        s = e.readUint24(!1);
      e.getMore(e.viewOffset + e.index, s + 4, function(e, a) {
        return a ? (n(a), void 0) : (t({
          last: r,
          block_type: i,
          length: s,
          view: e
        }), void 0)
      })
    })
  }

  function a(e, t) {
    var n = e.readUnsignedInt(!0);
    e.advance(n);
    for (var a = e.readUnsignedInt(!0), i = {}, s = 0; a > s; s++) try {
      var o = r(e);
      o && (i.hasOwnProperty(o.field) ? t[o.field] += " / " + o.value : (t[o.field] = o.value, i[o.field] = !0))
    } catch (c) {
      console.warn("Error parsing ogg metadata frame", c)
    }
    return t
  }

  function r(e) {
    var t = e.readUnsignedInt(!0),
      n = e.readUTF8Text(t),
      a = n.indexOf("=");
    if (-1 === a) throw new Error("missing delimiter in comment");
    var r = n.substring(0, a).toLowerCase().replace(" ", ""),
      o = s[r];
    if (o) {
      var c = n.substring(a + 1);
      return -1 !== i.indexOf(o) && (c = parseInt(c, 10)), {
        field: o,
        value: c
      }
    }
    return null
  }
  var i = ["tracknum", "trackcount", "discnum", "disccount"],
    s = {
      title: "title",
      artist: "artist",
      album: "album",
      tracknumber: "tracknum",
      tracktotal: "trackcount",
      discnumber: "discnum",
      disctotal: "disccount"
    };
  return {
    parse: e
  }
}();
