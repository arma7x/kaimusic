self.importScripts('/assets/js/jsmediatags.min.js');
self.importScripts('/assets/js/parser/metadata_scripts.js');
self.importScripts('/assets/js/parser/flac.js');
self.importScripts('/assets/js/parser/id3v1.js');
self.importScripts('/assets/js/parser/id3v2.js');
self.importScripts('/assets/js/parser/mp4.js');
self.importScripts('/assets/js/parser/ogg.js');
self.importScripts('/assets/js/parser/vorbis_picture.js');
self.importScripts('/assets/js/parser/metadata-audio-parser.js');

onmessage = function(e) {
  if (e.data.type === 'PARSE_METADATA' || e.data.type === 'PARSE_METADATA_FULL') {
    const FILE = e.data.file;

    const metadata_scripts = () => {
      const headersize = Math.min(64 * 1024, FILE.size);
      BlobView.get(FILE, 0, headersize, (header, bad) => {
        if (bad) {
          metadata_audio_parser();
        } else {
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

    jsmediatags.read(e.data.type === 'PARSE_METADATA' ? FILE.slice(FILE.size - 128, FILE.size, FILE.type) : FILE, {
      onSuccess: (success) => {
        if (e.data.file.type === 'audio/flac') { // each success attrb is undefined
          metadata_scripts();
        } else {
          postMessage({type: e.data.type, result: success, file: e.data.file, error: false});
        }
      },
      onError: (err) => {
        const headersize = Math.min(64 * 1024, FILE.size);
        metadata_scripts();
      }
    });
  }
}
