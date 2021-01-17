self.importScripts('/assets/js/jsmediatags.min.js');

onmessage = function(e) {
  if (e.data.type === 'PARSE_METADATA') {
    jsmediatags.read(e.data.file.blob, {
      onSuccess: (success) => {
        postMessage({type: 'PARSE_METADATA', result: success, file: e.data.file, error: false});
      },
      onError: (err) => {
        postMessage({type: 'PARSE_METADATA', result: err, file: e.data.file, error: true});
      }
    });
  }
}
