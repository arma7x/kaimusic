self.importScripts('/assets/js/parser/jsmediatags.min.js');
self.importScripts('/assets/js/parser/metadata_scripts.js');
self.importScripts('/assets/js/parser/flac.js');
self.importScripts('/assets/js/parser/id3v1.js');
self.importScripts('/assets/js/parser/id3v2.js');
self.importScripts('/assets/js/parser/mp4.js');
self.importScripts('/assets/js/parser/ogg.js');
self.importScripts('/assets/js/parser/vorbis_picture.js');
self.importScripts('/assets/js/parser/metadata-audio-parser.js');

onmessage = function(e) {
  if (e.data.type === 'PARSE_METADATA' || e.data.type === 'PARSE_METADATA_FULL' || e.data.type === 'PARSE_METADATA_UPDATE') {
    const FILE = e.data.file;

    const metadata_scripts = () => {
      const headersize = Math.min(64 * 1024, FILE.size);
      BlobView.get(FILE, 0, headersize, (header, bad) => {
        if (bad) {
          metadata_audio_parser();
        } else {
          try {
            const parser = MetadataFormats.findParser(header, {});
            if (parser === null) {
              metadata_audio_parser();
            } else {
              parser.then((result) => {
                postMessage({type: e.data.type, result: {tags: result}, file: e.data.file, error: false});
              })
              .catch((_err) => {
                metadata_audio_parser();
              });
            }
          } catch(err) {
            metadata_audio_parser();
          }
        }
      });
    }

    const metadata_audio_parser = () => {
      parse_audio_metadata(FILE, (tags) => {
        postMessage({type: e.data.type, result: {tags: tags}, file: e.data.file, error: false});
      }, (__err) => {
        postMessage({type: e.data.type, result: {err: __err.toString()}, file: e.data.file, error: true});
      });
    }

    var _blob;
    if (e.data.type === 'PARSE_METADATA') {
      const start = FILE.slice(0, 300000, FILE.type);
      const end = FILE.slice(FILE.size - 128, FILE.size, FILE.type);
      _blob = new Blob([start, end], {type: FILE.type});
    } else {
      _blob = FILE;
    }
  
    jsmediatags.read(_blob, {
      onSuccess: (success) => {
        if (e.data.file.type === 'audio/flac') { // each success attrb is undefined
          if (success.tags.album == null && success.tags.artist == null && success.tags.picture == null && success.tags.title == null && success.tags.genre == null) {
            metadata_scripts();
          } else {
            postMessage({type: e.data.type, result: success, file: e.data.file, error: false});
          }
        } else {
          postMessage({type: e.data.type, result: success, file: e.data.file, error: false});
        }
      },
      onError: (err) => {
        metadata_scripts();
      }
    });
  }
}
