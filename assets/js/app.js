window.addEventListener("load", function() {

  navigator.mozSetMessageHandler('headset-button', function(evt) {
    console.log('headset-button', evt);
  });

  localforage.setDriver(localforage.LOCALSTORAGE);

  var EQL_PRESENT={},sample={Flat:[12,0,0,0,0,0,0,0,0,0,0],Classical:[12,-1.11022e-15,-1.11022e-15,-1.11022e-15,-1.11022e-15,-1.11022e-15,-1.11022e-15,-7.2,-7.2,-7.2,-9.6],Club:[6,-1.11022e-15,-1.11022e-15,8,5.6,5.6,5.6,3.2,-1.11022e-15,-1.11022e-15,-1.11022e-15],Dance:[5,9.6,7.2,2.4,-1.11022e-15,-1.11022e-15,-5.6,-7.2,-7.2,-1.11022e-15,-1.11022e-15],"Full bass":[5,-8,9.6,9.6,5.6,1.6,-4,-8,-10.4,-11.2,-11.2],"Full bass & treble":[4,7.2,5.6,-1.11022e-15,-7.2,-4.8,1.6,8,11.2,12,12],"Full treble":[3,-9.6,-9.6,-9.6,-4,2.4,11.2,16,16,16,16.8],Headphones:[4,4.8,11.2,5.6,-3.2,-2.4,1.6,4.8,9.6,12.8,14.4],Largehall:[5,10.4,10.4,5.6,5.6,-1.11022e-15,-4.8,-4.8,-4.8,-1.11022e-15,-1.11022e-15],Live:[7,-4.8,-1.11022e-15,4,5.6,5.6,5.6,4,2.4,2.4,2.4],Party:[6,7.2,7.2,-1.11022e-15,-1.11022e-15,-1.11022e-15,-1.11022e-15,-1.11022e-15,-1.11022e-15,7.2,7.2],Pop:[6,-1.6,4.8,7.2,8,5.6,-1.11022e-15,-2.4,-2.4,-1.6,-1.6],Reggae:[8,-1.11022e-15,-1.11022e-15,-1.11022e-15,-5.6,-1.11022e-15,6.4,6.4,-1.11022e-15,-1.11022e-15,-1.11022e-15],Rock:[5,8,4.8,-5.6,-8,-3.2,4,8.8,11.2,11.2,11.2],Ska:[6,-2.4,-4.8,-4,-1.11022e-15,4,5.6,8.8,9.6,11.2,9.6],Soft:[5,4.8,1.6,-1.11022e-15,-2.4,-1.11022e-15,4,8,9.6,11.2,12],Softrock:[7,4,4,2.4,-1.11022e-15,-4,-5.6,-3.2,-1.11022e-15,2.4,8.8],Techno:[5,8,5.6,-1.11022e-15,-5.6,-4.8,-1.11022e-15,8,9.6,9.6,8.8]},c=["preamp","channel31","channel63","channel125","channel250","channel500","channel1k","channel2k","channel4k","channel8k","channel16k"];for(var x in sample){EQL_PRESENT[x]={};for(var i=0;i<sample[x].length;i++)if(0===i)EQL_PRESENT[x][c[i]]=1;else if(0!==parseInt(sample[x][i])){var v=parseInt(sample[x][i])-2;v<=-12&&(EQL_PRESENT[x][c[i]]=parseInt(sample[x][i])),EQL_PRESENT[x][c[i]]=v>=12?v-9:v}else EQL_PRESENT[x][c[i]]=0}

  const SDCARD = navigator.getDeviceStorage('sdcard');

  const CUTTER = new mp3cutter(null, false);
  const CUTTER_PLAYER = new Audio();
  var CUTTER_BLOB = null;
  var CUTTER_START_DURATION = 0;
  var CUTTER_END_DURATION = 0;
  CUTTER_PLAYER.addEventListener('loadedmetadata', (evt) => {
    CUTTER_START_DURATION = 0;
    CUTTER_END_DURATION = CUTTER_PLAYER.duration;
    CUTTER_DURATION.innerHTML = convertTime(CUTTER_PLAYER.duration);
    CUTTER_START_TIME.innerHTML = convertTime(CUTTER_START_DURATION);
    CUTTER_END_TIME.innerHTML = convertTime(CUTTER_END_DURATION);
    DIRECTORY_MODAL.hide();
    TRIM_MODAL.show();
    if (window['__AURORA__']) {
      if (window['__AURORA__'].playing) {
        togglePlay();
      }
    } else if (PLAYER.duration > 0 && !PLAYER.paused) {
      togglePlay();
    }
  });

  CUTTER_PLAYER.ontimeupdate = function(e) {
    var currentTime = e.target.currentTime;
    var duration = e.target.duration;
    CUTTER_CURRENT_TIME.innerHTML = convertTime(e.target.currentTime);
    CUTTER_DURATION.innerHTML = convertTime(e.target.duration);
    if (isNaN(duration)) {
      CUTTER_DURATION_SLIDER.value = 0;
    } else {
      CUTTER_DURATION_SLIDER.value = (currentTime + .75) / duration * 100;
    }
    if (currentTime > CUTTER_END_DURATION) {
      CUTTER_PLAYER.pause();
      CUTTER_PLAYER.currentTime = CUTTER_START_DURATION;
      CUTTER_TOGGLE_PLAY.innerHTML = 'Play';
    }
  }
  
  var RESUME = true;
  var RESUME_DURATION = null;
  var REPEAT = -1;
  var SHUFFLE = false;
  var SNACKBAR_STATUS = undefined;
  var READY_STATE = true;
  var SEQUENCE_INDEX = 0;
  var DOCUMENT_TREE = {};
  var FILES = [];
  var FILE_BY_GROUPS = {};
  var CURRENT_SCREEN = 'HOME';
  var CURRENT_PLAYLIST = 'DEFAULT';
  var SEQUENCE = [];
  var FOLDERS = {};
  var ALBUMS = {};
  var ARTISTS = {};
  var TRACK = [];
  var GLOBAL_TRACK = '';
  var GLOBAL_BLOB = {}
  var GLOBAL_AUDIO_BLOB = [];
  var GLOBAL_AUDIO_BLOB_INDEX = 0;
  var EDITOR_MODE = false;
  var PLAYLIST_MODAL = {};
  var MENU_MODAL = {};
  var PLAYLIST_MANAGER_MODAL = {};
  var PLAYLIST_EDITOR_MODAL = {};
  var CONFIRM_MODAL = {};
  var ABOUT_MODAL = {};
  var FOLDERS_MODAL = {};
  var ALBUMS_MODAL = {};
  var ARTISTS_MODAL = {};
  var EQUALIZER_MODAL = {};
  var DIRECTORY_MODAL = {};
  var TRIM_MODAL = {};
  var EQL_MODAL = {};

  var PLAYLIST_MANAGER_MODAL_INDEX = -1;
  var LFT_DBL_CLICK_TH = 0;
  var LFT_DBL_CLICK_TIMER = undefined;
  var RGT_DBL_CLICK_TH = 0;
  var RGT_DBL_CLICK_TIMER = undefined;

  const LOW = [0.92, 0.84, 0.76, 0.68, 0.60, 0.52, 0.44, 0.36, 0.28, 0.20, 0.12, 0.04];
  const CONTEXT = new AudioContext('content');
  const PLAYER = document.createElement("audio");
  const SOURCE = CONTEXT.createMediaElementSource(PLAYER);

  var staticSource = CONTEXT.createGain();
  var balance = new StereoBalanceNode(CONTEXT);
  window['preamp'] = CONTEXT.createGain();
  var gainNode = CONTEXT.createGain();

  window['channel31'] = CONTEXT.createBiquadFilter();
  window['channel63'] = CONTEXT.createBiquadFilter();
  window['channel125'] = CONTEXT.createBiquadFilter();
  window['channel250'] = CONTEXT.createBiquadFilter();
  window['channel500'] = CONTEXT.createBiquadFilter();
  window['channel1k'] = CONTEXT.createBiquadFilter();
  window['channel2k'] = CONTEXT.createBiquadFilter();
  window['channel4k'] = CONTEXT.createBiquadFilter();
  window['channel8k'] = CONTEXT.createBiquadFilter();
  window['channel16k'] = CONTEXT.createBiquadFilter();

  SOURCE.connect(staticSource);
  staticSource.connect(window['preamp']);
  window['preamp'].connect(window['channel31']);
  window['channel31'].connect(window['channel63']);
  window['channel63'].connect(window['channel125']);
  window['channel125'].connect(window['channel250']);
  window['channel250'].connect(window['channel500']);
  window['channel500'].connect(window['channel1k']);
  window['channel1k'].connect(window['channel2k']);
  window['channel2k'].connect(window['channel4k']);
  window['channel4k'].connect(window['channel8k']);
  window['channel8k'].connect(window['channel16k']);
  window['channel16k'].connect(balance);
  balance.connect(gainNode);
  gainNode.connect(CONTEXT.destination);

  window['preamp'].gain.value = 1;

  window['channel31'].type = "lowshelf";
  window['channel31'].frequency.value = 31;
  window['channel31'].gain.value = 0;

  window['channel63'].type = "peaking";
  window['channel63'].frequency.value = 63;
  window['channel63'].gain.value = 0;

  window['channel125'].type = "peaking";
  window['channel125'].frequency.value = 125;
  window['channel125'].gain.value = 0;

  window['channel250'].type = "peaking";
  window['channel250'].frequency.value = 250;
  window['channel250'].gain.value = 0;

  window['channel500'].type = "peaking";
  window['channel500'].frequency.value = 500;
  window['channel500'].gain.value = 0;

  window['channel1k'].type = "peaking";
  window['channel1k'].frequency.value = 1000;
  window['channel1k'].gain.value = 0;

  window['channel2k'].type = "peaking";
  window['channel2k'].frequency.value = 2000;
  window['channel2k'].gain.value = 0;

  window['channel4k'].type = "peaking";
  window['channel4k'].frequency.value = 4000;
  window['channel4k'].gain.value = 0;

  window['channel8k'].type = "peaking";
  window['channel8k'].frequency.value = 8000;
  window['channel8k'].gain.value = 0;

  window['channel16k'].type = "highshelf";
  window['channel16k'].frequency.value = 16000;
  window['channel16k'].gain.value = 0;

  const channelRange = document.querySelectorAll('input[type=range]');

  for (var x in channelRange) {
    try {
      channelRange[JSON.parse(x)].addEventListener('input', function() {
        if (this.dataset.filter) {
          var dbVal = 0;
          // console.log(this.dataset.filter, this.dataset.param, window[this.dataset.filter][this.dataset.param].value);
          if (this.dataset.filter === 'preamp') {
            // window[this.dataset.filter][this.dataset.param].value = this.value == 0 ? 1 : this.value; // Math.pow(10, ((this.value / 100) * 24 - 12) / 20);
            var i = this.value;
            if (this.value < 1) {
              if (this.value == 0) {
                i = LOW[this.value];
              } else {
                i = LOW[(-(this.value))];
              }
            }
            dbVal = i;
            window[this.dataset.filter][this.dataset.param].value = i; //Math.pow(10, ((this.value / 100) * 24 - 12) / 20);
          } else {
            dbVal = this.value;
            window[this.dataset.filter][this.dataset.param].value = this.value; //(this.value / 100) * 24 - 12;
          }
          localforage.getItem('__EQUALIZER__')
          .then((eql) => {
            if (eql) {
              eql[this.dataset.filter] = dbVal;
              localforage.setItem('__EQUALIZER__', eql);
            }
          });
        }
      });
    } catch (e){}
  }

  const DEFAULT_VOLUME = 0.02;
  
  const CUTTER_CURRENT_TIME = document.getElementById('cutter_current_time');
  const CUTTER_DURATION = document.getElementById('cutter_duration');
  const CUTTER_DURATION_SLIDER = document.getElementById('cutter_duration_slider');
  const CUTTER_DURATION_SLIDER_START = document.getElementById('cutter_duration_slider_start');
  const CUTTER_DURATION_SLIDER_END = document.getElementById('cutter_duration_slider_end');
  const CUTTER_TOGGLE_PLAY = document.getElementById('cutter_toggle_play');
  const CUTTER_START_TIME = document.getElementById('cutter_start_time');
  const CUTTER_END_TIME = document.getElementById('cutter_end_time');

  const TRACK_TITLE = document.getElementById('track_title');
  const CURRENT_TIME = document.getElementById('current_time');
  const DURATION = document.getElementById('duration');
  const DURATION_SLIDER = document.getElementById("duration_slider");
  const PLAY_BTN = document.getElementById('play_btn');
  const SHUFFLE_BTN = document.getElementById('shuffle_btn');
  const REPEAT_BTN = document.getElementById('repeat_btn');
  const VOLUME_BTN = document.getElementById('volume_btn');
  const VOLUME_LEVEL = document.getElementById('volume_level');
  const VOLUME_STATUS = document.getElementById('volume_status');
  const ALBUM_COVER = document.getElementById('album_cover');
  const LOADING = document.getElementById('loading');
  const MENU_SK = document.getElementById('menu_software_key');
  const OFFMENU_SK = document.getElementById('offmenu_software_key');
  const PM_SK = document.getElementById('pm_software_key');
  const PM_SK_LEFT = document.getElementById('pm_sk_left');
  const PM_SK_CENTER = document.getElementById('pm_sk_center');
  const PM_SK_RIGHT = document.getElementById('pm_sk_right');
  const PE_SK = document.getElementById('pe_software_key');
  const CM_SK = document.getElementById('confirm_software_key');
  const SNACKBAR = document.getElementById("snackbar");
  const ARTIS_LBL = document.getElementById("artis_label");
  const ALBUM_LBL = document.getElementById("album_label");
  const GENRE_LBL = document.getElementById("genre_label");
  const PLAYLIST_NAME = document.getElementById("playlist_name");
  const PLAYLIST_LABEL = document.getElementById("playlist_label");
  const PLAYLIST_TRACK_UL = document.getElementById("playlist_track_ul");
  const CURRENT_TRACK = document.getElementById("current_track");
  const PLAYLIST_LENGTH = document.getElementById("playlist_length");
  const PLAYLISTS_UL = document.getElementById("playlists_ul");
  const TRACK_EDITOR_UL = document.getElementById("track_editor_ul");
  const PLAYLIST_NAME_INPUT = document.getElementById("playlist_name_input");
  const EDITOR_MODE_LABEL = document.getElementById("editor_mode_label");
  const CONFIRM_LABEL = document.getElementById("confirm_label");
  const ABOUT_CONTENT = document.getElementById("about_content");
  const FOLDERS_UL = document.getElementById("folders_ul");
  const ALBUMS_UL = document.getElementById("albums_ul");
  const ARTISTS_UL = document.getElementById("artists_ul");
  const DIRECTORY_UL = document.getElementById("directory_ul");
  const EQL_UL = document.getElementById("eql_ul");
  const ALB_ART_SK = document.getElementById('albums_or_artists_software_key');
  const EQUALIZER_SK = document.getElementById('equalizer_software_key');
  const DIRECTORY_SK = document.getElementById('directory_software_key');
  const TRIM_SK = document.getElementById('trim_software_key');
  const EQL_SK = document.getElementById('eql_software_key');

  var WORKER = new Worker('/assets/js/worker.js');

  WORKER.onmessage = (e) => {
    // console.log(e.data.type)
    if (e.data.type === 'PARSE_METADATA') {
      const media = e.data.result;
      if (!e.data.error && media.tags.artist) {
        if (ARTISTS[media.tags.artist] == null) {
          ARTISTS[media.tags.artist] = [];
        }
        ARTISTS[media.tags.artist].push({name: e.data.file.name, selected: true})
      } else {
        if (ARTISTS['UNKNOWN'] == null) {
          ARTISTS['UNKNOWN'] = [];
        }
        ARTISTS['UNKNOWN'].push({name: e.data.file.name, selected: true})
      }
      if (!e.data.error && media.tags.album) {
        if (ALBUMS[media.tags.album] == null) {
          ALBUMS[media.tags.album] = [];
        }
        ALBUMS[media.tags.album].push({name: e.data.file.name, selected: true})
      } else {
        if (ALBUMS['UNKNOWN'] == null) {
          ALBUMS['UNKNOWN'] = [];
        }
        ALBUMS['UNKNOWN'].push({name: e.data.file.name, selected: true})
      }
      GLOBAL_AUDIO_BLOB_INDEX += 1;
      if (GLOBAL_AUDIO_BLOB_INDEX < GLOBAL_AUDIO_BLOB.length) {
        showSnackbar('Only Run Once | ' + (GLOBAL_AUDIO_BLOB_INDEX + 1).toString() + '/' + GLOBAL_AUDIO_BLOB.length.toString());
        parseMetadata(GLOBAL_AUDIO_BLOB[GLOBAL_AUDIO_BLOB_INDEX]);
      } else {
        localforage.setItem('ARTISTS', ARTISTS)
        .then(() => {
          return localforage.setItem('ALBUMS', ALBUMS);
        })
        .finally(() => {
          setReadyState(false);
          indexingPlaylist();
        });
        if (window['__POWER__']) {
          window['__POWER__'].unlock();
          window['__POWER__'] = null;
          // console.timeEnd('BENCHMARK');
        }
      }
    } else if (e.data.type === 'PARSE_METADATA_FULL') {
      const media = e.data.result;
      if (!e.data.error && media.tags.title) {
        TRACK_TITLE.innerHTML = media.tags.title;
      } else {
        var name = e.data.file.name.split('/');
        TRACK_TITLE.innerHTML = name[name.length - 1];
      }
      if (!e.data.error && media.tags.artist) {
        ARTIS_LBL.innerHTML = media.tags.artist;
      } else {
        ARTIS_LBL.innerHTML = 'Unknown';
      }
      if (!e.data.error && media.tags.album) {
        ALBUM_LBL.innerHTML = media.tags.album;
      } else {
        ALBUM_LBL.innerHTML = 'Unknown';
      }
      if (!e.data.error && media.tags.genre) {
        GENRE_LBL.innerHTML = media.tags.genre;
      } else {
        GENRE_LBL.innerHTML = 'Unknown';
      }
      if (media.tags.picture) {
        if (media.tags.picture.data) {
          const data = media.tags.picture.data;
          const type = media.tags.picture.type ;
          const byteArray = new Uint8Array(data);
          const blob = new Blob([byteArray], { type });
          ALBUM_COVER.src = URL.createObjectURL(blob);
        } else if (media.tags.picture.blob) {
          ALBUM_COVER.src = URL.createObjectURL(media.tags.picture.blob);
        }
      } else {
        ALBUM_COVER.src = '/assets/img/baseline_album_white_48.png';
      }
    }
  }

  function parseMetadata(audio) {
    getFile(audio.name, (file) => {
      WORKER.postMessage({file: file, type: 'PARSE_METADATA'});
    });
  }

  localforage.getItem('SHUFFLE')
  .then((val) => {
    if (val != null) {
      if (val === 1) {
        SHUFFLE = false;
      } else {
        SHUFFLE = true;
      }
      toggleShuffle(true);
    }
  });

  localforage.getItem('REPEAT')
  .then((val) => {
    if (val != null) {
      REPEAT = val - 1;
      toggleRepeat();
    }
  });

  PLAYLIST_MODAL = new Modalise('playlist_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'PLAYLIST_MODAL';
    document.activeElement.tabIndex = (SEQUENCE[SEQUENCE_INDEX] - 1);
    setTimeout(function() {
      nav(1, '.nav_track');
    }, 200);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
  });

  MENU_MODAL = new Modalise('menu_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'MENU_MODAL';
    document.activeElement.tabIndex = -1;
    setTimeout(function() {
      nav(1, '.nav_menu');
    }, 200);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
  });

  PLAYLIST_MANAGER_MODAL = new Modalise('playlist_manager_modal')
  .attach()
  .on('onShow', function() {
    const childNodes = PLAYLISTS_UL.childNodes;
    document.activeElement.tabIndex = -1;
    PLAYLIST_MANAGER_MODAL_INDEX = -1;
    for (var x=0;x<childNodes.length;x++) {
      if (childNodes[x].textContent === CURRENT_PLAYLIST) {
        document.activeElement.tabIndex = x - 1;
        PLAYLIST_MANAGER_MODAL_INDEX = x - 1;
        break;
      }
    }
    CURRENT_SCREEN = 'PLAYLIST_MANAGER_MODAL';
    setTimeout(function() {
      nav(1, '.nav_man_pl');
    }, 200);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PM_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    PLAYLIST_MANAGER_MODAL_INDEX = -1;
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
  });

  PLAYLIST_EDITOR_MODAL = new Modalise('playlist_editor_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'PLAYLIST_EDITOR_MODAL';
    document.activeElement.tabIndex = -1;
    setTimeout(function() {
     nav(1, '.nav_track_editor');
    }, 200);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
    PE_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PE_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
  });

  CONFIRM_MODAL = new Modalise('confirm_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'CONFIRM_MODAL';
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
    PE_SK.classList.add('sr-only');
    CM_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PE_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
    CM_SK.classList.add('sr-only');
  });

  ABOUT_MODAL = new Modalise('about_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'ABOUT_MODAL';
    MENU_SK.classList.add('sr-only');
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    MENU_SK.classList.remove('sr-only');
  });

  EQUALIZER_MODAL = new Modalise('equalizer_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'EQUALIZER_MODAL';
    MENU_SK.classList.add('sr-only');
    EQUALIZER_SK.classList.remove('sr-only');
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    EQUALIZER_SK.classList.add('sr-only');
    MENU_SK.classList.remove('sr-only');
  });

  EQL_MODAL = new Modalise('eql_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'EQL_MODAL';
    while(EQL_UL.firstChild) {
      EQL_UL.removeChild(EQL_UL.firstChild);
    }
    var i = 0;
    for (var name in EQL_PRESENT) {
      const li = document.createElement("LI");
      const pr = document.createElement("pre");
      pr.innerHTML = name;
      li.appendChild(pr);
      li.setAttribute("class", "nav_eql");
      li.setAttribute("tabIndex", i);
      EQL_UL.appendChild(li);
      i++;
    }
    setTimeout(function() {
      nav(1, '.nav_eql');
    }, 200);
    MENU_SK.classList.add('sr-only');
    EQL_SK.classList.remove('sr-only');
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    EQL_SK.classList.add('sr-only');
    MENU_SK.classList.remove('sr-only');
  });

  FOLDERS_MODAL = new Modalise('folders_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'FOLDERS_MODAL';
    MENU_SK.classList.add('sr-only');
    while(FOLDERS_UL.firstChild) {
      FOLDERS_UL.removeChild(FOLDERS_UL.firstChild);
    }
    var i = 0;
    for (var name in FOLDERS) {
      const li = document.createElement("LI");
      const pr = document.createElement("pre");
      pr.innerHTML = name;
      li.appendChild(pr);
      li.setAttribute("class", "nav_folder");
      li.setAttribute("tabIndex", i);
      FOLDERS_UL.appendChild(li);
      i++;
    }
    setTimeout(function() {
      nav(1, '.nav_folder');
    }, 200);
    ALB_ART_SK.classList.remove('sr-only');
  })
  .on('onConfirm', function() {SS
    
  })
  .on('onHide', function() {
    MENU_SK.classList.remove('sr-only');
    ALB_ART_SK.classList.add('sr-only');
  });


  ALBUMS_MODAL = new Modalise('albums_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'ALBUMS_MODAL';
    MENU_SK.classList.add('sr-only');
    while(ALBUMS_UL.firstChild) {
      ALBUMS_UL.removeChild(ALBUMS_UL.firstChild);
    }
    localforage.getItem('ALBUMS')
    .then((_ALBUMS_) => {
      if (_ALBUMS_) {
        var i = 0;
        for (var name in _ALBUMS_) {
          const li = document.createElement("LI");
          const pr = document.createElement("pre");
          pr.innerHTML = name;
          li.appendChild(pr);
          li.setAttribute("class", "nav_album");
          li.setAttribute("tabIndex", i);
          ALBUMS_UL.appendChild(li);
          i++;
        }
      }
    })
    .finally(() => {
      setTimeout(function() {
        nav(1, '.nav_album');
      }, 200);
      ALB_ART_SK.classList.remove('sr-only');
    })
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    MENU_SK.classList.remove('sr-only');
    ALB_ART_SK.classList.add('sr-only');
  });
  ARTISTS_MODAL = new Modalise('artists_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'ARTISTS_MODAL';
    MENU_SK.classList.add('sr-only');
    while(ARTISTS_UL.firstChild) {
      ARTISTS_UL.removeChild(ARTISTS_UL.firstChild);
    }
    localforage.getItem('ARTISTS')
    .then((_ARTISTS_) => {
      if (_ARTISTS_) {
        var i = 0;
        for (var name in _ARTISTS_) {
          const li = document.createElement("LI");
          const pr = document.createElement("pre");
        pr.innerHTML = name;
        li.appendChild(pr);
          li.setAttribute("class", "nav_artist");
          li.setAttribute("tabIndex", i);
          ARTISTS_UL.appendChild(li);
          i++;
        }
      }
    })
    .finally(() => {
      setTimeout(function() {
      nav(1, '.nav_artist');
      }, 200);
      ALB_ART_SK.classList.remove('sr-only');
    })
  })
  .on('onConfirm', function() {SS
    
  })
  .on('onHide', function() {
    MENU_SK.classList.remove('sr-only');
    ALB_ART_SK.classList.add('sr-only');
  });

  DIRECTORY_MODAL = new Modalise('directory_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'DIRECTORY_MODAL';
    MENU_SK.classList.add('sr-only');
    DIRECTORY_SK.classList.remove('sr-only');
    enterDir(null);
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    DIRECTORY_SK.classList.add('sr-only');
    MENU_SK.classList.remove('sr-only');
  });

  TRIM_MODAL = new Modalise('trim_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'TRIM_MODAL';
    MENU_SK.classList.add('sr-only');
    //DIRECTORY_SK.classList.add('sr-only');
    TRIM_SK.classList.remove('sr-only');
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    CUTTER_DURATION_SLIDER_START.value = 0;
    CUTTER_DURATION_SLIDER_END.value = 0
    CUTTER_PLAYER.pause();
    CUTTER_TOGGLE_PLAY.innerHTML = 'Play';
    CUTTER_BLOB = null;
    CUTTER_START_DURATION = 0;
    CUTTER_END_DURATION = 0;
    TRIM_SK.classList.add('sr-only');
    MENU_SK.classList.remove('sr-only');
  });

  PLAYER.ontimeupdate = function(e) {
    localforage.setItem('PLAY_DURATION', e.target.currentTime);
    var currentTime = e.target.currentTime;
    var duration = e.target.duration;
    CURRENT_TIME.innerHTML = convertTime(e.target.currentTime);
    DURATION.innerHTML = convertTime(e.target.duration);
    if (isNaN(duration)) {
      DURATION_SLIDER.value = 0;
    } else {
      DURATION_SLIDER.value = (currentTime + .75) / duration * 100;
    }
  }

  PLAYER.onpause = function(e) {
    PLAY_BTN.src = '/assets/img/baseline_play_circle_filled_white_36dp.png';
  }
  
  PLAYER.onplay = function(e) {
    PLAY_BTN.src = '/assets/img/baseline_pause_circle_filled_white_36dp.png';
    if (RESUME_DURATION != null && !Number.isInteger(RESUME_DURATION)) {
      PLAYER.currentTime = RESUME_DURATION;
      RESUME_DURATION = null;
    }
  }

  PLAYER.onloadeddata = function(e) {
    if (window['__AURORA__']) {
      window['__AURORA__'].stop();
      window['__AURORA__'] = null;
    }
  }

  PLAYER.onerror = function(e) {
    if (window['__AURORA__']) {
      window['__AURORA__'].stop();
    }
    window['__AURORA__'] = AV.Player.fromFile(window['__FILE__']);
    window['__AURORA__'].on('ready', () => {
      if (RESUME_DURATION != null && Number.isInteger(RESUME_DURATION)) {
        if (RESUME_DURATION < 1000) {
          RESUME_DURATION = 1000;
        }
        var _temp_ = RESUME_DURATION;
        RESUME_DURATION = null;
        window['__AURORA__'].seek(_temp_);
      }
    });
    window['__AURORA__'].on('progress', (e) => {
      localforage.setItem('PLAY_DURATION', e);
      DURATION.innerHTML = convertTime(window['__AURORA__'].asset.duration/1000);
      CURRENT_TIME.innerHTML = convertTime(e / 1000);
      DURATION_SLIDER.value = ((e / 1000) + .75) / (window['__AURORA__'].asset.duration/1000) * 100;
    });
    window['__AURORA__'].on('end', (e) => {
      if (REPEAT === 1) {
        togglePlay();
      } else if (REPEAT === 0) {
        nextTrack();
      } else if (REPEAT === -1 && (SEQUENCE_INDEX !== (SEQUENCE.length - 1))){
        nextTrack();
      }
    });
    window['__AURORA__'].on('error', (e) => {
      PLAY_BTN.src = '/assets/img/baseline_play_circle_filled_white_36dp.png';
      window['__AURORA__'].pause();
    });
    window['__AURORA__'].play();
  }

  PLAYER.onended = function(e) {
    if (REPEAT === 1) {
      togglePlay();
    } else if (REPEAT === 0) {
      nextTrack();
    } else if (REPEAT === -1 && (SEQUENCE_INDEX !== (SEQUENCE.length - 1))){
      nextTrack();
    }
  }

  function getChild(segments, tree, parent, root) {
    if (segments.length === 1) {
      tree[parent] = root
      return tree;
    } else {
      if (tree[parent] === undefined) {
        tree[parent] = {}
      }
      tree[parent] = getChild(segments.slice(1, segments.length), tree[parent], segments.slice(1, segments.length)[0], root)
      return tree;
    }
  }

  function indexingDocuments(_files) {
    var _DOCUMENT_TREE = {}
    _files.forEach(function(element) {
      _DOCUMENT_TREE = getChild(element.split('/'), _DOCUMENT_TREE, element.split('/')[0], element);
    })
    return _DOCUMENT_TREE;
  }

  function groupByType(_files, cb) {
    var _taskLength = _files.length;
    var _taskDone = 0;
    setReadyState(false);
    if (_files.length === 0) {
      setReadyState(true);
    }
    _files.forEach((element) => {
      getFile(element, (file) => {
        var mime = file.type.split('/');
        if (FILE_BY_GROUPS[mime[0]] == undefined) {
          FILE_BY_GROUPS[mime[0]] = []
        }
        FILE_BY_GROUPS[mime[0]].push(file.name);
        GLOBAL_BLOB[file.name] = file.name; // file; //file.slice(file.size - 128, file.size, file.type);
        _taskDone++;
        if (_taskDone === _taskLength) {
          GLOBAL_TRACK = '';
          if (FILE_BY_GROUPS.hasOwnProperty('audio')) {
            FILE_BY_GROUPS['audio'].forEach((n) => {
              TRACK.push({name: n, selected: true});
              GLOBAL_AUDIO_BLOB.push({name: n});
            });
          }
          if (FILE_BY_GROUPS.hasOwnProperty('video')) {
            FILE_BY_GROUPS['video'].forEach((n) => {
              const split = n.split('.');
              if (split[split.length - 1] === 'ogg') {
                TRACK.push({name: n, selected: true});
                GLOBAL_AUDIO_BLOB.push({name: n});
              }
            });
          }
          TRACK.sort((a, b) => {
            if (a['name'] > b['name'])
              return 1;
            else if (a['name'] < b['name'])
              return -1;
            return 0;
          });
          GLOBAL_AUDIO_BLOB.sort((a, b) => {
            if (a['name'] > b['name'])
              return 1;
            else if (a['name'] < b['name'])
              return -1;
            return 0;
          });
          GLOBAL_TRACK = JSON.stringify(TRACK);
          var DONE = 0;
          if (TRACK.length == 0) {
            setReadyState(true);
            if (cb !== undefined) {
              cb();
            }
          }
          TRACK.forEach((n, i) => {
            name_parts = n.name.split("/");
            var playlist = [];
            name_parts.pop();
            name_parts.forEach((val, idx) => {
              if (val !== '') {
                playlist.push(val);
              }
            });
            playlist.forEach((p) => {
              if (FOLDERS[p] == null) {
                FOLDERS[p] = [];
              }
              var f = JSON.parse(JSON.stringify(n));
              FOLDERS[p].push(f);
            });
            DONE++;
            if (TRACK.length === DONE) {
              setReadyState(true);
              if (cb !== undefined) {
                var LOCAL_GLOBAL_AUDIO = []
                GLOBAL_AUDIO_BLOB.forEach((f) => {
                  LOCAL_GLOBAL_AUDIO.push(f.name);
                });
                localforage.getItem('DATABASE_GLOBAL_AUDIO')
                .then((DATABASE_GLOBAL_AUDIO) => {
                  if (DATABASE_GLOBAL_AUDIO == null) {
                    localforage.setItem('DATABASE_GLOBAL_AUDIO', LOCAL_GLOBAL_AUDIO)
                    setReadyState(false);
                    parseMetadata(GLOBAL_AUDIO_BLOB[0]);
                    window['__POWER__'] = navigator.requestWakeLock('cpu');
                  } else {
                    setReadyState(true);
                    indexingPlaylist();
                    var missing_files = []
                    var new_files = []
                    LOCAL_GLOBAL_AUDIO.forEach((n) => {
                      if (DATABASE_GLOBAL_AUDIO.indexOf(n) === -1) {
                        new_files.push(n);
                      }
                    });
                    DATABASE_GLOBAL_AUDIO.forEach((n) => {
                      if (LOCAL_GLOBAL_AUDIO.indexOf(n) === -1) {
                        missing_files.push(n);
                      }
                    });
                    localforage.setItem('DATABASE_GLOBAL_AUDIO', LOCAL_GLOBAL_AUDIO)
                    .then(() => {
                      localforage.getItem('ARTISTS')
                      .then((_ARTISTS_) => {
                        var UPDATE_ARTISTS = {}
                        for (var _a in _ARTISTS_) {
                          _ARTISTS_[_a].forEach((t, ti) => {
                            if (missing_files.indexOf(t.name) > -1) {
                              // console.log(t.name)
                            } else {
                              if (UPDATE_ARTISTS[_a] == null) {
                                UPDATE_ARTISTS[_a] = [];
                              }
                              UPDATE_ARTISTS[_a].push(t);
                            }
                          });
                        }
                        // console.log(UPDATE_ARTISTS);
                        return localforage.setItem('ARTISTS', UPDATE_ARTISTS)
                      })
                      .then((_ARTISTS_) => {
                        return localforage.getItem('ALBUMS')
                        .then((_ALBUMS_) => {
                          var UPDATE_ALBUMS = {}
                          for (var _a in _ALBUMS_) {
                            _ALBUMS_[_a].forEach((t, ti) => {
                              if (missing_files.indexOf(t.name) > -1) {
                                console.log(t.name)
                              } else {
                                if (UPDATE_ALBUMS[_a] == null) {
                                  UPDATE_ALBUMS[_a] = [];
                                }
                                UPDATE_ALBUMS[_a].push(t);
                              }
                            });
                          }
                          // console.log(UPDATE_ALBUMS);
                          return localforage.setItem('ALBUMS', UPDATE_ALBUMS)
                          .then(() => {
                            return localforage.getItem('ALBUMS')
                            .then((_ALBUMS_) => {
                              // console.log({ _ARTISTS_: _ARTISTS_, _ALBUMS_: _ALBUMS_ });
                              return Promise.resolve({ _ARTISTS_: _ARTISTS_, _ALBUMS_: _ALBUMS_ });
                            })
                          });
                        })
                      })
                      .then((_LATEST_) => {
                        var updated = 0;
                        var SUB_WORKER = new Worker('/assets/js/worker.js');
                        SUB_WORKER.onmessage = (e) => {
                          if (e.data.type === 'PARSE_METADATA_UPDATE') {
                            const media = e.data.result;
                            if (!e.data.error && media.tags.artist) {
                              if (_LATEST_['_ARTISTS_'][media.tags.artist] == null) {
                                _LATEST_['_ARTISTS_'][media.tags.artist] = [];
                              }
                              _LATEST_['_ARTISTS_'][media.tags.artist].push({name: e.data.file.name, selected: true})
                            } else {
                              if (_LATEST_['_ARTISTS_']['UNKNOWN'] == null) {
                                _LATEST_['_ARTISTS_']['UNKNOWN'] = [];
                              }
                              _LATEST_['_ARTISTS_']['UNKNOWN'].push({name: e.data.file.name, selected: true})
                            }
                            if (!e.data.error && media.tags.album) {
                              if (_LATEST_['_ALBUMS_'][media.tags.album] == null) {
                                _LATEST_['_ALBUMS_'][media.tags.album] = [];
                              }
                              _LATEST_['_ALBUMS_'][media.tags.album].push({name: e.data.file.name, selected: true})
                            } else {
                              if (_LATEST_['_ALBUMS_']['UNKNOWN'] == null) {
                                _LATEST_['_ALBUMS_']['UNKNOWN'] = [];
                              }
                              _LATEST_['_ALBUMS_']['UNKNOWN'].push({name: e.data.file.name, selected: true})
                            }
                            updated += 1
                            if (updated === new_files.length) {
                              localforage.setItem('ARTISTS', _LATEST_['_ARTISTS_'])
                              .then(() => {
                                return localforage.setItem('ALBUMS', _LATEST_['_ALBUMS_'])
                              })
                              .finally(() => {
                                
                              });
                            }
                          }
                        }
                        if (new_files.length === 0) {
                          localforage.setItem('ARTISTS', _LATEST_['_ARTISTS_'])
                          .then(() => {
                            return localforage.setItem('ALBUMS', _LATEST_['_ALBUMS_'])
                          })
                          .finally(() => {
                            
                          });
                        } else {
                          new_files.forEach((n) => {
                            getFile(GLOBAL_BLOB[n], (file) => {
                              SUB_WORKER.postMessage({file: file, type: 'PARSE_METADATA_UPDATE'});
                            });
                          });
                        }
                      })
                    })
                  }
                });
              }
            }
          });
        }
      });
    })
  }

  function groupByTypeLocal(_files, cb) {
    var _taskLength = _files.length;
    var _taskDone = 0;
    setReadyState(false);
    if (_files.length === 0) {
      setReadyState(true);
    }
    _files.forEach((element) => {
      if (FILE_BY_GROUPS['audio'] == undefined) {
        FILE_BY_GROUPS['audio'] = []
      }
      FILE_BY_GROUPS['audio'].push(element);
      GLOBAL_BLOB[element] = element; // file; //file.slice(file.size - 128, file.size, file.type);
      _taskDone++;
      if (_taskDone === _taskLength) {
        GLOBAL_TRACK = '';
        if (FILE_BY_GROUPS.hasOwnProperty('audio')) {
          FILE_BY_GROUPS['audio'].forEach((n) => {
            TRACK.push({name: n, selected: true});
            GLOBAL_AUDIO_BLOB.push({name: n});
          });
        }
        if (FILE_BY_GROUPS.hasOwnProperty('video')) {
          FILE_BY_GROUPS['video'].forEach((n) => {
            const split = n.split('.');
            if (split[split.length - 1] === 'ogg') {
              TRACK.push({name: n, selected: true});
              GLOBAL_AUDIO_BLOB.push({name: n});
            }
          });
        }
        TRACK.sort((a, b) => {
          if (a['name'] > b['name'])
            return 1;
          else if (a['name'] < b['name'])
            return -1;
          return 0;
        });
        GLOBAL_AUDIO_BLOB.sort((a, b) => {
          if (a['name'] > b['name'])
            return 1;
          else if (a['name'] < b['name'])
            return -1;
          return 0;
        });
        GLOBAL_TRACK = JSON.stringify(TRACK);
        var DONE = 0;
        if (TRACK.length == 0) {
          setReadyState(true);
          if (cb !== undefined) {
            cb();
          }
        }
        TRACK.forEach((n, i) => {
          name_parts = n.name.split("/");
          var playlist = [];
          name_parts.pop();
          name_parts.forEach((val, idx) => {
            if (val !== '') {
              playlist.push(val);
            }
          });
          playlist.forEach((p) => {
            if (FOLDERS[p] == null) {
              FOLDERS[p] = [];
            }
            var f = JSON.parse(JSON.stringify(n));
            FOLDERS[p].push(f);
          });
          DONE++;
          if (TRACK.length === DONE) {
            setReadyState(true);
            if (cb !== undefined) {
              var LOCAL_GLOBAL_AUDIO = []
              GLOBAL_AUDIO_BLOB.forEach((f) => {
                LOCAL_GLOBAL_AUDIO.push(f.name);
              });
              localforage.getItem('DATABASE_GLOBAL_AUDIO')
              .then((DATABASE_GLOBAL_AUDIO) => {
                if (DATABASE_GLOBAL_AUDIO == null) {
                  localforage.setItem('DATABASE_GLOBAL_AUDIO', LOCAL_GLOBAL_AUDIO)
                  setReadyState(false);
                  parseMetadata(GLOBAL_AUDIO_BLOB[0]);
                  window['__POWER__'] = navigator.requestWakeLock('cpu');
                } else {
                  setReadyState(true);
                  indexingPlaylist();
                  var missing_files = []
                  var new_files = []
                  LOCAL_GLOBAL_AUDIO.forEach((n) => {
                    if (DATABASE_GLOBAL_AUDIO.indexOf(n) === -1) {
                      new_files.push(n);
                    }
                  });
                  DATABASE_GLOBAL_AUDIO.forEach((n) => {
                    if (LOCAL_GLOBAL_AUDIO.indexOf(n) === -1) {
                      missing_files.push(n);
                    }
                  });
                  localforage.setItem('DATABASE_GLOBAL_AUDIO', LOCAL_GLOBAL_AUDIO)
                  .then(() => {
                    localforage.getItem('ARTISTS')
                    .then((_ARTISTS_) => {
                      var UPDATE_ARTISTS = {}
                      for (var _a in _ARTISTS_) {
                        _ARTISTS_[_a].forEach((t, ti) => {
                          if (missing_files.indexOf(t.name) > -1) {
                            // console.log(t.name)
                          } else {
                            if (UPDATE_ARTISTS[_a] == null) {
                              UPDATE_ARTISTS[_a] = [];
                            }
                            UPDATE_ARTISTS[_a].push(t);
                          }
                        });
                      }
                      // console.log(UPDATE_ARTISTS);
                      return localforage.setItem('ARTISTS', UPDATE_ARTISTS)
                    })
                    .then((_ARTISTS_) => {
                      return localforage.getItem('ALBUMS')
                      .then((_ALBUMS_) => {
                        var UPDATE_ALBUMS = {}
                        for (var _a in _ALBUMS_) {
                          _ALBUMS_[_a].forEach((t, ti) => {
                            if (missing_files.indexOf(t.name) > -1) {
                              console.log(t.name)
                            } else {
                              if (UPDATE_ALBUMS[_a] == null) {
                                UPDATE_ALBUMS[_a] = [];
                              }
                              UPDATE_ALBUMS[_a].push(t);
                            }
                          });
                        }
                        // console.log(UPDATE_ALBUMS);
                        return localforage.setItem('ALBUMS', UPDATE_ALBUMS)
                        .then(() => {
                          return localforage.getItem('ALBUMS')
                          .then((_ALBUMS_) => {
                            // console.log({ _ARTISTS_: _ARTISTS_, _ALBUMS_: _ALBUMS_ });
                            return Promise.resolve({ _ARTISTS_: _ARTISTS_, _ALBUMS_: _ALBUMS_ });
                          })
                        });
                      })
                    })
                    .then((_LATEST_) => {
                      var updated = 0;
                      var SUB_WORKER = new Worker('/assets/js/worker.js');
                      SUB_WORKER.onmessage = (e) => {
                        if (e.data.type === 'PARSE_METADATA_UPDATE') {
                          const media = e.data.result;
                          if (!e.data.error && media.tags.artist) {
                            if (_LATEST_['_ARTISTS_'][media.tags.artist] == null) {
                              _LATEST_['_ARTISTS_'][media.tags.artist] = [];
                            }
                            _LATEST_['_ARTISTS_'][media.tags.artist].push({name: e.data.file.name, selected: true})
                          } else {
                            if (_LATEST_['_ARTISTS_']['UNKNOWN'] == null) {
                              _LATEST_['_ARTISTS_']['UNKNOWN'] = [];
                            }
                            _LATEST_['_ARTISTS_']['UNKNOWN'].push({name: e.data.file.name, selected: true})
                          }
                          if (!e.data.error && media.tags.album) {
                            if (_LATEST_['_ALBUMS_'][media.tags.album] == null) {
                              _LATEST_['_ALBUMS_'][media.tags.album] = [];
                            }
                            _LATEST_['_ALBUMS_'][media.tags.album].push({name: e.data.file.name, selected: true})
                          } else {
                            if (_LATEST_['_ALBUMS_']['UNKNOWN'] == null) {
                              _LATEST_['_ALBUMS_']['UNKNOWN'] = [];
                            }
                            _LATEST_['_ALBUMS_']['UNKNOWN'].push({name: e.data.file.name, selected: true})
                          }
                          updated += 1
                          if (updated === new_files.length) {
                            localforage.setItem('ARTISTS', _LATEST_['_ARTISTS_'])
                            .then(() => {
                              return localforage.setItem('ALBUMS', _LATEST_['_ALBUMS_'])
                            })
                            .finally(() => {
                              
                            });
                          }
                        }
                      }
                      if (new_files.length === 0) {
                        localforage.setItem('ARTISTS', _LATEST_['_ARTISTS_'])
                        .then(() => {
                          return localforage.setItem('ALBUMS', _LATEST_['_ALBUMS_'])
                        })
                        .finally(() => {
                          
                        });
                      } else {
                        new_files.forEach((n) => {
                          getFile(GLOBAL_BLOB[n], (file) => {
                            SUB_WORKER.postMessage({file: file, type: 'PARSE_METADATA_UPDATE'});
                          });
                        });
                      }
                    })
                  })
                }
              });
            }
          }
        });
      }
    })
  }

  function getFile(name, handler) {
    var request = SDCARD.get(name);
    request.onsuccess = function () {
      const file = this.result;
      if (handler !== undefined) {
        handler(file);
      }
    }
    request.onerror = function () {
      console.warn("Unable to get the file: " + this.error);
    }
  }

  function getMetadata(file){
    WORKER.postMessage({file: file, type: 'PARSE_METADATA_FULL'});
  }

  function saveRingtone(blob, des) {
    setReadyState(false);
    var request = SDCARD.addNamed(blob, des);
    request.onsuccess = function (evt) {
      setReadyState(true);
      showSnackbar('Saved to folder Ringtones');
    }
    request.onerror = function (err) {
      setReadyState(true);
      showSnackbar('Error');
      console.log(err);
    }
  }

  function mp3Trimmer(file, start, end, cb) {
    var savedPath = 'Ringtones';
    const path = file.name.split('/');
    const name = new Date().getTime().toString() + '_' + path[path.length - 1];
    if (path[0] === '') {
      savedPath = '/' + path[1] + '/' + savedPath + '/' + name + '.wav';
    } else {
      savedPath = savedPath + '/' + name + '.wav';
    }
    if (end <= start || start < 0 || end < 0) {
      return;
    }
    if ((end - start) >= 31) {
      showSnackbar('Maximum 30s');
      return;
    }
    setReadyState(false);
    try {
      CUTTER.cut(file, start, end, function(cuttedBlob) {
        setReadyState(true);
        cb(cuttedBlob, savedPath);
      });
    } catch(e) {
      setReadyState(true);
      showSnackbar(e.toString());
    }
  }

  function playAudio(file) {
    if (file.type.split('/').length === 2) {
      var name = file.name.split('/');
      getMetadata(file);
      TRACK_TITLE.innerHTML = name[name.length - 1];
      PLAYER.mozAudioChannelType = 'content';
      PLAYER.src = URL.createObjectURL(file);
      PLAYER.play();
      window['__FILE__'] = file;
    }
  }

  function indexingStorage(F) {
    RESUME = true;
    FILES = [];
    FILE_BY_GROUPS = {};
    TRACK = [];
    ALBUMS = {};
    FOLDERS = {};
    ARTISTS = {};
    GLOBAL_BLOB = {};
    GLOBAL_AUDIO_BLOB = [];
    GLOBAL_AUDIO_BLOB_INDEX = 0;
    if (F) {
      console.log('LOCAL');
      setReadyState(false);
      DOCUMENT_TREE = {};
      DOCUMENT_TREE = indexingDocuments(F);
      FILE_BY_GROUPS = {};
      setReadyState(true);
      groupByTypeLocal(F, indexingPlaylist);
      return
    }
    console.log('REFRESH');
    const cursor = SDCARD.enumerate('');
    setReadyState(false);
    cursor.onsuccess = function () {
      if (!this.done) {
        if(cursor.result.name !== null) {
          FILES.push(cursor.result.name);
          this.continue();
        }
      } else {
        DOCUMENT_TREE = {};
        DOCUMENT_TREE = indexingDocuments(FILES);
        FILE_BY_GROUPS = {};
        setReadyState(true);
        groupByType(FILES, indexingPlaylist);
      }
    }
    cursor.onerror = function () { 
      setReadyState(true);
      console.warn("No file found: " + this.error); 
    }
  }

  function resumeApp() {
    localforage.getItem('SEQUENCE')
    .then((SEQUENCE_DB) => {
      // console.log(SEQUENCE_DB.length, TRACK.length);
      if (SEQUENCE_DB == null) {
        processPlaylist();
      } else {
        localforage.getItem('SEQUENCE_INDEX')
        .then((SEQUENCE_INDEX_DB) => {
          if (SEQUENCE_INDEX_DB == null) {
            processPlaylist();
          } else {
            var NEW_SEQUENCE = [];
            SEQUENCE_INDEX = SEQUENCE_INDEX_DB;
            if (SEQUENCE_DB.length > TRACK.length) {
              var max = TRACK.length - 1;
              SEQUENCE_DB.forEach((v, e) => {
                if (!(v > max)) {
                  NEW_SEQUENCE.push(v);
                }
              });
              if (SEQUENCE_INDEX > max) {
                SEQUENCE_INDEX = max;
              }
              SEQUENCE = JSON.parse(JSON.stringify(NEW_SEQUENCE));
            } else if (SEQUENCE_DB.length < TRACK.length) {
              NEW_SEQUENCE = JSON.parse(JSON.stringify(SEQUENCE_DB));
              var plus = TRACK.length - SEQUENCE_DB.length
              for(var e=0;e<plus;e++) {
                NEW_SEQUENCE.push((NEW_SEQUENCE.length - 1) + 1);
              }
              SEQUENCE = JSON.parse(JSON.stringify(NEW_SEQUENCE));
            } else {
              SEQUENCE = JSON.parse(JSON.stringify(SEQUENCE_DB));
            }
            // console.log(NEW_SEQUENCE.length, SEQUENCE.length);
            processPlaylist(false, SEQUENCE_INDEX);
          }
        })
        .finally(() => {
          RESUME = false;
        });
      }
    })
    .finally(() => {
      RESUME = false;
    });
  }

  function indexingPlaylist(current, playable = true, cb) {

    var running = (_skip = true) => {
      CURRENT_PLAYLIST = current || CURRENT_PLAYLIST;
      PLAYLIST_NAME.innerHTML = CURRENT_PLAYLIST;
      PLAYLIST_LABEL.innerHTML = CURRENT_PLAYLIST;
      showSnackbar('Playing ' + PLAYLIST_NAME.innerHTML);

      var _playlistUlIndex = 0;
      var _playlistLength = 0;
      var _playlistDone = 0;
      
      while(PLAYLISTS_UL.firstChild) {
        PLAYLISTS_UL.removeChild(PLAYLISTS_UL.firstChild);
      }

      const create_playlist_li = document.createElement("LI");
      var pr = document.createElement("pre");
      pr.innerHTML = '+ Create Playlist';
      create_playlist_li.appendChild(pr);
      create_playlist_li.setAttribute("class", "nav_man_pl");
      create_playlist_li.setAttribute("tabIndex", _playlistUlIndex);
      PLAYLISTS_UL.appendChild(create_playlist_li);
      _playlistUlIndex++;

      const default_playlist_li = document.createElement("LI");
      var pr = document.createElement("pre");
      pr.innerHTML = 'DEFAULT';
      default_playlist_li.appendChild(pr);
      default_playlist_li.setAttribute("class", "nav_man_pl");
      default_playlist_li.setAttribute("tabIndex", _playlistUlIndex);
      default_playlist_li.setAttribute("value", 'DEFAULT');
      PLAYLISTS_UL.appendChild(default_playlist_li);
      _playlistUlIndex++;

      if ((CURRENT_PLAYLIST === undefined || CURRENT_PLAYLIST === 'DEFAULT') && playable) {
        TRACK = JSON.parse(GLOBAL_TRACK);
        localforage.setItem('PLAY_TYPE', 'PLAYLIST')
        .then(() => {
          localforage.setItem('PLAY_NAME', CURRENT_PLAYLIST)
        });
        processPlaylist();
      } else if (playable) {
        setReadyState(false);
      } else if (RESUME && CURRENT_PLAYLIST === 'DEFAULT') {
        TRACK = JSON.parse(GLOBAL_TRACK);
        resumeApp();
      }

      localforage.getItem('__PLAYLISTS__')
      .then((PLAYLISTS) => {
        if (PLAYLISTS === null) {
          setReadyState(true);
          if (cb !== undefined) {
            cb();
          }
          if (playable) {
            processPlaylist();
          }
        } else if (PLAYLISTS.length === 0) {
          setReadyState(true);
          if (cb !== undefined) {
            cb();
          }
        } else {
          _playlistLength = PLAYLISTS.length;
          const _playlistCollections = [];
          PLAYLISTS.forEach((playlistName) => {
            localforage.getItem(playlistName)
            .then((oldTracks) => {
              const newTracks = [];
              Object.assign(newTracks, JSON.parse(GLOBAL_TRACK));
              const hiddenTracks = [];
              if (oldTracks !== null) {
                oldTracks.forEach((track) => {
                  if (track.selected === false) {
                    hiddenTracks.push(track);
                  }
                });
                newTracks.forEach((newTrack, i) => {
                    hiddenTracks.forEach((hiddenTrack) => {
                    if (newTrack.name === hiddenTrack.name) {
                      newTracks[i].selected = hiddenTrack.selected;
                    } else {
                      newTracks[i].selected = false;
                    }
                  });
                });
              }

              const exec = (_newTracks) => {
                const store = localforage.setItem(playlistName, _newTracks);
                store.then((savedTracks) => {
                  const custom_playlist_li = document.createElement("LI");
                  const pr = document.createElement("pre");
                  pr.innerHTML = playlistName;
                  custom_playlist_li.appendChild(pr);
                  custom_playlist_li.setAttribute("class", "nav_man_pl");
                  custom_playlist_li.setAttribute("tabIndex", _playlistUlIndex);
                  custom_playlist_li.setAttribute("value", playlistName);
                  PLAYLISTS_UL.appendChild(custom_playlist_li);
                  _playlistUlIndex++;
                });
                store.finally(() => {
                  _playlistDone++;
                  if (_playlistDone === _playlistLength) {
                    setReadyState(true);
                    if (cb !== undefined) {
                      cb();
                    }
                  }
                  _playlistCollections.push(playlistName);
                  if (_playlistDone === _playlistLength && _playlistCollections.indexOf(CURRENT_PLAYLIST) !== -1) {
                    localforage.getItem(CURRENT_PLAYLIST)
                    .then((raw) => {
                      TRACK = [];
                      const filtered = [];
                      raw.forEach((t) => {
                        if (t.selected === true) {
                          filtered.push(t);
                        }
                      });
                      Object.assign(TRACK, filtered);
                      if (playable) {
                        localforage.setItem('PLAY_TYPE', 'PLAYLIST')
                        .then(() => {
                          localforage.setItem('PLAY_NAME', CURRENT_PLAYLIST)
                        });
                        processPlaylist();
                      }
                      if (RESUME) {
                        resumeApp();
                      }
                    });
                  } else if (_playlistDone === _playlistLength && _playlistCollections.indexOf(CURRENT_PLAYLIST) === -1 && CURRENT_PLAYLIST !== 'DEFAULT') {
                    processPlaylist(_skip, SEQUENCE_INDEX);
                  }
                });
              }

              exec(newTracks);
            });
          });
        }
      })
    }

    if (RESUME) {
      playable = false;
      localforage.getItem('PLAY_TYPE')
      .then((PLAY_TYPE) => {
        if (PLAY_TYPE == null) {
          playable = true;
          running();
        } else {
          playable = false;
          localforage.getItem('PLAY_NAME')
          .then((PLAY_NAME) => {
            if (PLAY_NAME == null) {
              playable = true;
              running();
            } else {
              if (PLAY_TYPE == 'ALBUMS') {
                localforage.getItem('ALBUMS')
                .then((_ALBUMS_) => {
                  if (_ALBUMS_) {
                    if (_ALBUMS_[PLAY_NAME]) {
                      localforage.setItem('PLAY_TYPE', 'ALBUMS')
                      .then(() => {
                        localforage.setItem('PLAY_NAME', PLAY_NAME)
                      });
                      TRACK = [];
                      const filtered = [];
                      PLAYLIST_LABEL.innerHTML = 'ALBUM';
                      PLAYLIST_NAME.innerHTML = PLAY_NAME;
                      _ALBUMS_[PLAY_NAME].forEach((t) => {
                        if (t.selected === true) {
                          filtered.push(t);
                        }
                      });
                      Object.assign(TRACK, filtered);
                      CURRENT_PLAYLIST = PLAY_NAME;
                      running(false);
                      resumeApp();
                    } else {
                      playable = true;
                      running();
                    }
                  } else {
                    playable = true;
                    running();
                  }
                })
              } else if (PLAY_TYPE == 'ARTISTS') {
                localforage.getItem('ARTISTS')
                .then((_ARTISTS_) => {
                  if (_ARTISTS_) {
                    if (_ARTISTS_[PLAY_NAME]) {
                      localforage.setItem('PLAY_TYPE', 'ARTISTS')
                      .then(() => {
                        localforage.setItem('PLAY_NAME', PLAY_NAME)
                      });
                      TRACK = [];
                      const filtered = [];
                      PLAYLIST_LABEL.innerHTML = 'ARTIST';
                      PLAYLIST_NAME.innerHTML = PLAY_NAME;
                      _ARTISTS_[PLAY_NAME].forEach((t) => {
                        if (t.selected === true) {
                          filtered.push(t);
                        }
                      });
                      Object.assign(TRACK, filtered);
                      CURRENT_PLAYLIST = PLAY_NAME;
                      running(false);
                      resumeApp();
                    } else {
                      playable = true;
                      running();
                    }
                  } else {
                    playable = true;
                    running();
                  }
                })
              } else if (PLAY_TYPE == 'FOLDERS') {
                if (FOLDERS[PLAY_NAME]) {
                  localforage.setItem('PLAY_TYPE', 'FOLDERS')
                  .then(() => {
                    localforage.setItem('PLAY_NAME', PLAY_NAME)
                  });
                  TRACK = [];
                  const filtered = [];
                  PLAYLIST_LABEL.innerHTML = 'FOLDER';
                  PLAYLIST_NAME.innerHTML = PLAY_NAME;
                  Object.assign(TRACK, FOLDERS[PLAY_NAME]);
                  CURRENT_PLAYLIST = PLAY_NAME;
                  running(false);
                  resumeApp();
                } else {
                  playable = true;
                  running();
                }
              } else if (PLAY_TYPE == 'PLAYLIST') {
                current = PLAY_NAME;
                running();
              } else {
                playable = true;
                running();
              }
            }
          });
        }
      });
    } else {
      running();
    }
  }

  function processFolder(name) {
    if (FOLDERS[name]) {
      localforage.setItem('PLAY_TYPE', 'FOLDERS')
      .then(() => {
        localforage.setItem('PLAY_NAME', name)
      });
      TRACK = [];
      const filtered = [];
      PLAYLIST_LABEL.innerHTML = 'FOLDER';
      PLAYLIST_NAME.innerHTML = name;
      Object.assign(TRACK, FOLDERS[name]);
      processPlaylist();
    }
  }

  function processAlbum(name) {
    localforage.getItem('ALBUMS')
    .then((_ALBUMS_) => {
      if (_ALBUMS_) {
        if (_ALBUMS_[name]) {
          localforage.setItem('PLAY_TYPE', 'ALBUMS')
          .then(() => {
            localforage.setItem('PLAY_NAME', name)
          });
          CURRENT_PLAYLIST = name;
          TRACK = [];
          const filtered = [];
          PLAYLIST_LABEL.innerHTML = 'ALBUM';
          PLAYLIST_NAME.innerHTML = name;
          _ALBUMS_[name].forEach((t) => {
            if (t.selected === true) {
              filtered.push(t);
            }
          });
          Object.assign(TRACK, filtered);
          processPlaylist();
        }
      }
    })
  }

  function processArtist(name) {
    localforage.getItem('ARTISTS')
    .then((_ARTISTS_) => {
      if (_ARTISTS_) {
        if (_ARTISTS_[name]) {
          localforage.setItem('PLAY_TYPE', 'ARTISTS')
          .then(() => {
            localforage.setItem('PLAY_NAME', name)
          });
          CURRENT_PLAYLIST = name;
          TRACK = [];
          const filtered = [];
          PLAYLIST_LABEL.innerHTML = 'ARTIST';
          PLAYLIST_NAME.innerHTML = name;
          _ARTISTS_[name].forEach((t) => {
            if (t.selected === true) {
              filtered.push(t);
            }
          });
          Object.assign(TRACK, filtered);
          processPlaylist();
        }
      }
    })
  }

  function processPlaylist(isShuffling = true, idx = null) {
    if (isShuffling) {
      SEQUENCE = [];
    }
    while(PLAYLIST_TRACK_UL.firstChild) {
      PLAYLIST_TRACK_UL.removeChild(PLAYLIST_TRACK_UL.firstChild);
    }
    var i = 0;
    TRACK.forEach(function(k) {
      if (k.selected === true) {
        if (isShuffling) {
          SEQUENCE.push(i);
        }
        const li = document.createElement("LI");
        const name = k.name.split('/');
        const pr = document.createElement("pre");
        pr.innerHTML = (i + 1).toString() + ' - ' + name[name.length - 1];
        li.appendChild(pr);
        li.setAttribute("class", "nav_track");
        li.setAttribute("tabIndex", i);
        PLAYLIST_TRACK_UL.appendChild(li);
        i++;
      }
    });
    if (isShuffling) {
      shuffling();
    }
    CURRENT_TRACK.innerHTML = SEQUENCE.length > 0 ? SEQUENCE_INDEX + 1 : 0;
    PLAYLIST_LENGTH.innerHTML = SEQUENCE.length;
    playCurrentPlaylist(idx || 0);
  }

  function playCurrentPlaylist(idx) {
    if (idx != null) {
      SEQUENCE_INDEX = idx;
      localforage.setItem('SEQUENCE_INDEX', SEQUENCE_INDEX);
    }
    if (SEQUENCE.length > 0) {
      getFile(TRACK[SEQUENCE[SEQUENCE_INDEX]].name, function(file) {
        if (idx !== undefined) {
          playAudio(file);
        }
        CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
      });
    }
  }

  function playlistEditor(name, trackList, overwrite) {
    if (overwrite) {
      EDITOR_MODE = overwrite;
      //PLAYLIST_NAME_INPUT.disabled = true;
      EDITOR_MODE_LABEL.innerHTML = 'Edit Playlist';
    } else {
      EDITOR_MODE = false;
      //PLAYLIST_NAME_INPUT.disabled = false;
      EDITOR_MODE_LABEL.innerHTML = 'Create Playlist';
    }
    if (name !== undefined) {
      PLAYLIST_NAME_INPUT.value = name;
    } else {
      PLAYLIST_NAME_INPUT.value = '';
    }
    if (trackList.length === 0) {
      showSnackbar('No audio files');
    } else {
      const temp = [];
      Object.assign(temp, trackList);
      PLAYLIST_EDITOR_MODAL.show();
      while(TRACK_EDITOR_UL.firstChild) {
        TRACK_EDITOR_UL.removeChild(TRACK_EDITOR_UL.firstChild);
      }
      temp.forEach(function(k, i) {
        const name = k.name.split('/');
        const li = document.createElement("LI");
        const div = document.createElement("DIV");
        const chkbx = document.createElement("INPUT");
        const text = document.createElement("SPAN");
        div.setAttribute("class", "row");
        div.setAttribute("style", "text-align:left;");
        chkbx.setAttribute("type", "checkbox");
        chkbx.setAttribute("id", 'track_' + i.toString());
        chkbx.name = 'track_' + i.toString();
        chkbx.value = k.name;
        chkbx.checked = k.selected;
        div.appendChild(chkbx);
        text.setAttribute("style", "padding:0px 5px;width:92%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
        text.appendChild(document.createTextNode((i + 1).toString() + ' - ' + name[name.length - 1]));
        div.appendChild(text);
        li.appendChild(div);
        li.setAttribute("class", "nav_track_editor");
        li.setAttribute("tabIndex", i);
        TRACK_EDITOR_UL.appendChild(li);
      });
    }
  }

  function addPlaylist(overwrite) {
    const trackList = [];
    for (var i=0;i<(TRACK_EDITOR_UL.childElementCount);i++) {
      const chkbx = document.getElementById("track_" + i);
      trackList.push({name: chkbx.value, selected: chkbx.checked});
    }
    createPlaylist(PLAYLIST_NAME_INPUT.value, trackList, overwrite);
  }

  function editPlaylist(name) {
    localforage.getItem(name)
    .then(function(tracks) {
      if (tracks !== null) {
        playlistEditor(name, tracks, true);
      }
    })
    .catch(function(err) {
      showSnackbar(err.toString());
    })
  }

  function createPlaylist(name, trackList, overwrite) {
    var operation = '';
    if (trackList.length === 0) {
      showSnackbar('No audio files');
    } else if (name === 'DEFAULT' || name === '__PLAYLISTS__') {
      showSnackbar('DEFAULT is reserved name');
    } else if (name.length === 0) {
      showSnackbar('Playlist name is required');
    } else {
      PLAYLIST_NAME_INPUT.value = "";
      localforage.getItem('__PLAYLISTS__')
      .then(function(PLAYLISTS) {
        var temp = [];
        if (PLAYLISTS === null) {
          temp = [name];
          operation = 'added';
        } else if (PLAYLISTS.indexOf(name) === -1) {
          temp = PLAYLISTS;
          temp.push(name);
          operation = !overwrite ? 'added' : 'duplicated';
        } else if (PLAYLISTS.indexOf(name) !== -1 && !overwrite){
          return Promise.reject('Playlist name already exist!');
        } else {
          operation = 'updated';
          temp = PLAYLISTS;
        }
        return localforage.setItem('__PLAYLISTS__', temp);
      })
      .then(function(PLAYLISTS) {
        return localforage.setItem(name, trackList);
      })
      .then(function(savedTracks) {
        indexingPlaylist(CURRENT_PLAYLIST, (operation === 'updated' ? false : false), PLAYLIST_MANAGER_MODAL.show);
        showSnackbar('Playlist ' + name + ' was ' + operation);
        PLAYLIST_EDITOR_MODAL.hide();
        //PLAYLIST_MANAGER_MODAL.show();
      })
      .catch(function(err) {
        showSnackbar(err.toString());
      })
    }
  }

  function removePlaylist(name) {
    if (CURRENT_PLAYLIST === name) {
      showSnackbar('This playlist being play');
      CURRENT_SCREEN = 'HOME';
      CONFIRM_MODAL.hide();
      PLAYLIST_MANAGER_MODAL.show();
    } else {
      localforage.getItem('__PLAYLISTS__')
      .then(function(PLAYLISTS) {
        var temp = [];
        if (PLAYLISTS === null) {
          return localforage.setItem('__PLAYLISTS__', []);
        } else if (PLAYLISTS.indexOf(name) !== -1) {
          temp = PLAYLISTS;
          temp.splice(PLAYLISTS.indexOf(name), 1);
        }
        return localforage.setItem('__PLAYLISTS__', temp);
      })
      .then(function(PLAYLISTS) {
        return localforage.removeItem(name);
      })
      .then(function() {
        indexingPlaylist(CURRENT_PLAYLIST, false, PLAYLIST_MANAGER_MODAL.show);
        showSnackbar('Playlist ' + name + ' was removed');
        CONFIRM_MODAL.hide();
        //PLAYLIST_MANAGER_MODAL.show();
      })
      .catch(function(err) {
        showSnackbar(err.toString());
      })
    }
  }

  function nextTrack() {
    if (SEQUENCE.length > 0) {
      SEQUENCE_INDEX += 1;
      if (SEQUENCE_INDEX >= SEQUENCE.length) {
        SEQUENCE_INDEX = 0;
      }
      localforage.setItem('SEQUENCE_INDEX', SEQUENCE_INDEX);
      getFile(TRACK[SEQUENCE[SEQUENCE_INDEX]].name, playAudio);
      CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
    }
  }

  function previousTrack() {
    if (SEQUENCE.length > 0) {
      SEQUENCE_INDEX -= 1;
      if (SEQUENCE_INDEX < 0) {
        SEQUENCE_INDEX = (SEQUENCE.length - 1);
      }
      localforage.setItem('SEQUENCE_INDEX', SEQUENCE_INDEX);
      getFile(TRACK[SEQUENCE[SEQUENCE_INDEX]].name, playAudio);
      CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
    }
  }

  function fastForward() {
    if (window['__AURORA__']) {
      window['__AURORA__'].seek(window['__AURORA__'].currentTime + (10 * 1000));
    } else {
      PLAYER.currentTime += 10;
    }
  }

  function rewind() {
    if (window['__AURORA__']) {
      window['__AURORA__'].seek(window['__AURORA__'].currentTime - (10 * 1000));
    } else {
      PLAYER.currentTime -= 10;
    }
  }

  function toggleShuffle(skip = false) {
    SHUFFLE = !SHUFFLE;
    if (!skip) {
      shuffling();
    }
    if (SHUFFLE) {
      SHUFFLE_BTN.classList.remove('inactive');
      showSnackbar('Shuffle On');
      localforage.setItem('SHUFFLE', 1);
    } else {
      SHUFFLE_BTN.classList.add('inactive');
      showSnackbar('Shuffle Off');
      localforage.setItem('SHUFFLE', 0);
    }
    
  }

  function toggleRepeat() {
    REPEAT++;
    if (REPEAT === 0) {
      REPEAT_BTN.src = '/assets/img/baseline_repeat_white_18dp.png';
      REPEAT_BTN.classList.remove('inactive');
      showSnackbar('Repeat On');
    } else if (REPEAT === 1) {
      REPEAT_BTN.src = '/assets/img/baseline_repeat_one_white_18dp.png';
      REPEAT_BTN.classList.remove('inactive');
      showSnackbar('Repeat One');
    } else {
      REPEAT = -1;
      REPEAT_BTN.src = '/assets/img/baseline_repeat_white_18dp.png';
      REPEAT_BTN.classList.add('inactive');
      showSnackbar('Repeat Off');
    }
    localforage.setItem('REPEAT', REPEAT);
  }

  function togglePlay() {
    if (window['__AURORA__']) {
      if (window['__AURORA__'].playing) {
        PLAY_BTN.src = '/assets/img/baseline_play_circle_filled_white_36dp.png';
        window['__AURORA__'].pause();
      } else {
        PLAY_BTN.src = '/assets/img/baseline_pause_circle_filled_white_36dp.png';
        window['__AURORA__'].play();
      }
    } else {
      if (PLAYER.duration > 0 && !PLAYER.paused) {
        PLAYER.pause();
      } else {
        PLAYER.play();
      }
    }
  }

  function toggleVolume(volume) {
    if (navigator.mozAudioChannelManager) {
      navigator.volumeManager.requestShow();
      VOLUME_LEVEL.innerHTML = '-';
    } else {
      VOLUME_LEVEL.innerHTML = (volume * 100).toFixed(0);
      if (volume > 0) {
        VOLUME_BTN.src = '/assets/img/baseline_volume_up_white_18dp.png';
      } else {
        VOLUME_BTN.src = '/assets/img/baseline_volume_off_white_18dp.png';
      }
    }
  }

  function volumeDown() {
    if (navigator.mozAudioChannelManager) {
      navigator.volumeManager.requestDown();
    } else {
      if (PLAYER.volume > 0) {
        PLAYER.volume = parseFloat((PLAYER.volume - DEFAULT_VOLUME).toFixed(2));
        CUTTER_PLAYER.volume = PLAYER.volume;
        toggleVolume(PLAYER.volume);
        showSnackbar('Volume ' + (PLAYER.volume * 100).toFixed(0).toString() + '%');
      }
    }
  }

  function volumeUp() {
    if (navigator.mozAudioChannelManager) {
      navigator.volumeManager.requestUp();
    } else {
      if (PLAYER.volume < 1) {
        PLAYER.volume = parseFloat((PLAYER.volume + DEFAULT_VOLUME).toFixed(2));
        CUTTER_PLAYER.volume = PLAYER.volume;
        toggleVolume(PLAYER.volume);
        showSnackbar('Volume ' + (PLAYER.volume * 100).toFixed(0).toString() + '%');
      }
    }
  }

  function togglePlaylistModalSKButton() {
    if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
      if (document.activeElement.tagName === 'LI') {
        if (PLAYLIST_MANAGER_MODAL_INDEX === 0) {
          PM_SK_LEFT.innerHTML = '';
          PM_SK_CENTER.innerHTML = 'SELECT';
          PM_SK_RIGHT.innerHTML = '';
        } else if (PLAYLIST_MANAGER_MODAL_INDEX === 1) {
          PM_SK_LEFT.innerHTML = '';
          PM_SK_CENTER.innerHTML = 'PLAY';
          PM_SK_RIGHT.innerHTML = '';
        } else {
          PM_SK_LEFT.innerHTML = 'Edit';
          PM_SK_CENTER.innerHTML = 'PLAY';
          PM_SK_RIGHT.innerHTML = 'Delete';
        }
      }
    }
  }

  function nav(next, selector) {
    var currentIndex = document.activeElement.tabIndex;
    if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
      currentIndex = PLAYLIST_MANAGER_MODAL_INDEX;
    }
    var move = currentIndex + next;
    const nav = document.querySelectorAll(selector);
    var targetElement = nav[move]
    if (targetElement !== undefined) {
      targetElement.focus();
      if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
        PLAYLIST_MANAGER_MODAL_INDEX = move;
      } else {
        document.activeElement.tabIndex = move;
      }
    } else {
      if (move < 0) {
        move = nav.length - 1;
      } else if (move >= nav.length) {
        move = 0;
      }
      targetElement = nav[move];
      targetElement.focus();
      if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
        PLAYLIST_MANAGER_MODAL_INDEX = move;
      } else {
        document.activeElement.tabIndex = move;
      }
    }
    togglePlaylistModalSKButton();
  }

  function showSnackbar(text) {
    if (SNACKBAR_STATUS !== undefined) {
      clearTimeout(SNACKBAR_STATUS);
      SNACKBAR_STATUS = undefined;
    }
    SNACKBAR.className = "show";
    SNACKBAR.innerHTML = text;
    SNACKBAR_STATUS = setTimeout(function() {
      SNACKBAR.className = SNACKBAR.className.replace("show", "hide");
    }, 2000);
  }

  function convertTime(time) {
    if (isNaN(time)) {
      return '00:00';
    }
    var mins = Math.floor(time / 60);
    if (mins < 10) {
      mins = '0' + String(mins);
    }
    var secs = Math.floor(time % 60);
    if (secs < 10) {
      secs = '0' + String(secs);
    }
    return mins + ':' + secs;
  }

  function setReadyState(state) {
    READY_STATE = state;
    if (READY_STATE) {
      LOADING.classList.add('sr-only');
    } else {
      LOADING.classList.remove('sr-only');
    }
  }

  function shuffling() {
    var _old = SEQUENCE[SEQUENCE_INDEX];
    if (SHUFFLE) {
      for (let i = SEQUENCE.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [SEQUENCE[i], SEQUENCE[j]] = [SEQUENCE[j], SEQUENCE[i]];
      }
      var _idx = SEQUENCE.indexOf(_old);
      var _a = SEQUENCE[0];
      var _b = SEQUENCE[_idx];
      SEQUENCE[0] = _b;
      SEQUENCE[_idx] = _a;
      SEQUENCE_INDEX = 0;
    } else {
      SEQUENCE.sort((a, b) => a - b);
      var _idx = SEQUENCE.indexOf(_old);
      SEQUENCE_INDEX = _idx;
    }
    localforage.setItem('SEQUENCE_INDEX', SEQUENCE_INDEX);
    localforage.setItem('SEQUENCE', SEQUENCE);
    CURRENT_TRACK.innerHTML = SEQUENCE.length > 0 ? SEQUENCE_INDEX + 1 : 0;
  }

  function handleKeydown(e) {
    switch(e.key) {
      case 'Call':
        if (CURRENT_SCREEN === 'HOME') {
          toggleShuffle();
        }
        break
      case '*':
      case 'Alt':
        if (CURRENT_SCREEN === 'HOME') {
          toggleRepeat();
        }
        break
      case 'SoftLeft':
        if (CURRENT_SCREEN === 'HOME' && CURRENT_SCREEN !== 'PLAYLIST_MODAL') {
          PLAYLIST_MODAL.show();
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            if (PLAYLIST_MANAGER_MODAL_INDEX > 1) {
              editPlaylist(PLAYLISTS_UL.childNodes[PLAYLIST_MANAGER_MODAL_INDEX].textContent);
            }
          }
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          addPlaylist(EDITOR_MODE);
        } else if (CURRENT_SCREEN === 'CONFIRM_MODAL') {
          CURRENT_SCREEN = 'HOME';
          CONFIRM_MODAL.hide();
          PLAYLIST_MANAGER_MODAL.show();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'DIRECTORY_MODAL') {
          const nav = document.querySelectorAll('.nav_dir');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            processDirOrFile(nav[document.activeElement.tabIndex].innerText);
          }
          CURRENT_SCREEN = 'HOME';
          DIRECTORY_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'TRIM_MODAL') {
          if (CUTTER_PLAYER.duration > 0 && !CUTTER_PLAYER.paused) {
            CUTTER_PLAYER.currentTime = CUTTER_START_DURATION;
            CUTTER_PLAYER.pause();
            CUTTER_TOGGLE_PLAY.innerHTML = 'Play';
          } else {
            CUTTER_PLAYER.play();
            CUTTER_TOGGLE_PLAY.innerHTML = 'Stop';
          }
          e.preventDefault();
          e.stopPropagation();
        }
        break
      case 'SoftRight':
        if (CURRENT_SCREEN === 'HOME' && CURRENT_SCREEN !== 'MENU_MODAL') {
          MENU_MODAL.show();
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            if (PLAYLIST_MANAGER_MODAL_INDEX > 1) {
              CONFIRM_LABEL.innerHTML = 'Are you sure to remove ' + PLAYLISTS_UL.childNodes[PLAYLIST_MANAGER_MODAL_INDEX].textContent + ' ?';
              CONFIRM_MODAL.show();
            }
          }
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          if (document.activeElement.tagName === 'INPUT') {
            document.activeElement.blur();
            nav(1, '.nav_track_editor');
          } else {
            PLAYLIST_NAME_INPUT.focus();
          }
        } else if (CURRENT_SCREEN === 'CONFIRM_MODAL') {
          removePlaylist(PLAYLISTS_UL.childNodes[PLAYLIST_MANAGER_MODAL_INDEX].textContent);
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'EQUALIZER_MODAL') {
          var eql = {}
          for (var x in channelRange) {
            try {
              if (channelRange[JSON.parse(x)].dataset.filter) {
                var n = channelRange[JSON.parse(x)].dataset.filter;
                if (channelRange[JSON.parse(x)].dataset.filter === 'preamp') {
                  channelRange[JSON.parse(x)].value = 1;
                  eql[n] = 1;
                  window[n].gain.value = 1;
                } else {
                  channelRange[JSON.parse(x)].value = 0;
                  eql[n] = 0;
                  window[n].gain.value = 0;
                }
              }
            } catch (e){}
          }
          localforage.setItem('__EQUALIZER__', eql);
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'DIRECTORY_MODAL') {
          const nav = document.querySelectorAll('.nav_dir');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            const path = getDir(nav[document.activeElement.tabIndex].innerText, true);
            if (typeof path === 'string') {
              getFile(path, (file) => {
                CUTTER_BLOB = file;
                CUTTER_PLAYER.src = URL.createObjectURL(file);
              });
            } else {
              showSnackbar('Please select a file');
            }
          }
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'TRIM_MODAL') {
          if (!CUTTER_PLAYER.paused) {
            showSnackbar('Stop the music');
            return;
          }
          mp3Trimmer(CUTTER_BLOB, CUTTER_START_DURATION, CUTTER_END_DURATION, saveRingtone);
          e.preventDefault();
          e.stopPropagation();
        }
        break
      case 'ArrowUp':
        if (CURRENT_SCREEN === 'HOME' || CURRENT_SCREEN === 'TRIM_MODAL') {
          volumeUp();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          nav(-1, '.nav_menu');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          nav(-1, '.nav_track');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          nav(-1, '.nav_man_pl');
        } else if (CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          nav(-1, '.nav_track_editor');
        } else if (CURRENT_SCREEN === 'ABOUT_MODAL') {
          ABOUT_CONTENT.scrollTop -= 20;
        } else if (CURRENT_SCREEN === 'ARTISTS_MODAL') {
          nav(-1, '.nav_artist');
        } else if (CURRENT_SCREEN === 'FOLDERS_MODAL') {
          nav(-1, '.nav_folder');
        } else if (CURRENT_SCREEN === 'ALBUMS_MODAL') {
          nav(-1, '.nav_album');
        } else if (CURRENT_SCREEN === 'EQUALIZER_MODAL') {
          nav(-1, '.nav_equal');
        } else if (CURRENT_SCREEN === 'DIRECTORY_MODAL') {
          nav(-1, '.nav_dir');
        } else if (CURRENT_SCREEN === 'EQL_MODAL') {
          nav(-1, '.nav_eql');
        }
        break
      case 'ArrowDown':
        if (CURRENT_SCREEN === 'HOME' || CURRENT_SCREEN === 'TRIM_MODAL') {
          volumeDown();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          nav(1, '.nav_menu');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          nav(1, '.nav_track');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          nav(1, '.nav_man_pl');
        } else if (CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          nav(1, '.nav_track_editor');
        } else if (CURRENT_SCREEN === 'ABOUT_MODAL') {
          ABOUT_CONTENT.scrollTop += 20;
        } else if (CURRENT_SCREEN === 'ARTISTS_MODAL') {
          nav(1, '.nav_artist');
        } else if (CURRENT_SCREEN === 'FOLDERS_MODAL') {
          nav(1, '.nav_folder');
        } else if (CURRENT_SCREEN === 'ALBUMS_MODAL') {
          nav(1, '.nav_album');
        } else if (CURRENT_SCREEN === 'EQUALIZER_MODAL') {
          nav(1, '.nav_equal');
        } else if (CURRENT_SCREEN === 'DIRECTORY_MODAL') {
          nav(1, '.nav_dir');
        } else if (CURRENT_SCREEN === 'EQL_MODAL') {
          nav(1, '.nav_eql');
        }
        break
      case 'ArrowRight':
        if (CURRENT_SCREEN === 'HOME') {
          var threshold = new Date().getTime() - RGT_DBL_CLICK_TH;
          if (threshold > 0 && threshold <= 300) {
            clearTimeout(RGT_DBL_CLICK_TIMER);
            RGT_DBL_CLICK_TH = 0;
            fastForward();
          } else {
            RGT_DBL_CLICK_TH = new Date().getTime();
            RGT_DBL_CLICK_TIMER = setTimeout(() => {
              if (RGT_DBL_CLICK_TH !== 0) {
                nextTrack();
                RGT_DBL_CLICK_TH = 0;
              }
            }, 500);
          }
        } else if (CURRENT_SCREEN === 'EQUALIZER_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            if (document.activeElement.children[1]) {
              if (document.activeElement.children[1].children[1]) {
                document.activeElement.children[1].children[1].focus();
              }
            }
          }
        }
        break
      case 'ArrowLeft':
        if (CURRENT_SCREEN === 'HOME') {
          var threshold = new Date().getTime() - LFT_DBL_CLICK_TH;
          if (threshold > 0 && threshold <= 300) {
            clearTimeout(LFT_DBL_CLICK_TIMER);
            LFT_DBL_CLICK_TH = 0;
            rewind();
          } else {
            LFT_DBL_CLICK_TH = new Date().getTime();
            LFT_DBL_CLICK_TIMER = setTimeout(() => {
              if (LFT_DBL_CLICK_TH !== 0) {
                previousTrack();
                LFT_DBL_CLICK_TH = 0;
              }
            }, 500);
          }
        } else if (CURRENT_SCREEN === 'EQUALIZER_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            if (document.activeElement.children[1]) {
              if (document.activeElement.children[1].children[1]) {
                document.activeElement.children[1].children[1].focus();
              }
            }
          }
        }
        break
      case 'Enter':
        if (CURRENT_SCREEN === 'HOME') {
          if (!PLAYER.src) {
            break
          }
          togglePlay();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          if (document.activeElement.tabIndex === 0) {
            MENU_MODAL.hide();
            PLAYLIST_MANAGER_MODAL.show();
          } else if (document.activeElement.tabIndex === 1) {
            MENU_MODAL.hide();
            ARTISTS_MODAL.show();
          } else if (document.activeElement.tabIndex === 2) {
            MENU_MODAL.hide();
            ALBUMS_MODAL.show();
          } else if (document.activeElement.tabIndex === 3) {
            MENU_MODAL.hide();
            FOLDERS_MODAL.show();
          } else if (document.activeElement.tabIndex === 4) {
            MENU_MODAL.hide();
            DIRECTORY_MODAL.show();
          } else if (document.activeElement.tabIndex === 5) {
            MENU_MODAL.hide();
            EQUALIZER_MODAL.show();
          } else if (document.activeElement.tabIndex === 6) {
            MENU_MODAL.hide();
            EQL_MODAL.show();
          } else if (document.activeElement.tabIndex === 7) {
            localforage.getItem('PLAY_DURATION')
            .then(function(PLAY_DURATION) {
              RESUME_DURATION = PLAY_DURATION;
            })
            .catch(function(err) {
              RESUME_DURATION = null;
            })
            .finally(() => {
              indexingStorage();
              CURRENT_SCREEN = 'HOME';
              MENU_MODAL.hide();
            });
          } else if (document.activeElement.tabIndex === 8) {
            MENU_MODAL.hide();
            ABOUT_MODAL.show();
          } else if (document.activeElement.tabIndex === 9) {
            window.close();
          }
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          playCurrentPlaylist(SEQUENCE.indexOf(document.activeElement.tabIndex));
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          if (PLAYLIST_MANAGER_MODAL_INDEX === 0) {
            playlistEditor(undefined, JSON.parse(GLOBAL_TRACK), false);
          } else {
            const nav = document.querySelectorAll('.nav_man_pl');
            indexingPlaylist(nav[PLAYLIST_MANAGER_MODAL_INDEX].attributes.value.value, true);
            CURRENT_SCREEN = 'HOME';
            PLAYLIST_MANAGER_MODAL.hide();
          }
        } else if (CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            const chkbx = document.getElementById("track_" + document.activeElement.tabIndex);
            if (chkbx !== undefined) {
              chkbx.checked = !chkbx.checked;
            }
          }
        } else if (CURRENT_SCREEN === 'ARTISTS_MODAL') {
          const nav = document.querySelectorAll('.nav_artist');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            processArtist(nav[document.activeElement.tabIndex].innerText);
            CURRENT_SCREEN = 'HOME';
            ARTISTS_MODAL.hide();
          }
        } else if (CURRENT_SCREEN === 'FOLDERS_MODAL') {
          const nav = document.querySelectorAll('.nav_folder');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            processFolder(nav[document.activeElement.tabIndex].innerText);
            CURRENT_SCREEN = 'HOME';
            FOLDERS_MODAL.hide();
          }
        } else if (CURRENT_SCREEN === 'ALBUMS_MODAL') {
          const nav = document.querySelectorAll('.nav_album');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            processAlbum(nav[document.activeElement.tabIndex].innerText);
            CURRENT_SCREEN = 'HOME';
            ALBUMS_MODAL.hide();
          }
        } else if (CURRENT_SCREEN === 'DIRECTORY_MODAL') {
          const nav = document.querySelectorAll('.nav_dir');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            enterDir(nav[document.activeElement.tabIndex].innerText);
          }
        } else if (CURRENT_SCREEN === 'EQL_MODAL') {
          const nav = document.querySelectorAll('.nav_eql');
          if (nav.length > 0 && nav[document.activeElement.tabIndex]) {
            var eql = EQL_PRESENT[nav[document.activeElement.tabIndex].innerText];
            for (var x in channelRange) {
              try {
                if (channelRange[JSON.parse(x)].dataset.filter) {
                  var n = channelRange[JSON.parse(x)].dataset.filter;
                  if (n === 'preamp') {
                    const idx = LOW.indexOf(parseFloat(eql[n]));
                    channelRange[JSON.parse(x)].value = idx === -1 ? parseFloat(eql[n]) : (idx > 0 ? -idx : idx);
                  } else {
                    channelRange[JSON.parse(x)].value = parseFloat(eql[n]);
                  }
                  window[n].gain.value = parseFloat(eql[n]);
                }
              } catch (e){}
            }
          }
        }
        break
      case 'Backspace':
      case 'EndCall':
        if (CURRENT_SCREEN === 'MENU_MODAL') {
          CURRENT_SCREEN = 'HOME';
          MENU_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
          break
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          CURRENT_SCREEN = 'HOME';
          PLAYLIST_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          CURRENT_SCREEN = 'HOME';
          PLAYLIST_MANAGER_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          if (document.activeElement.tagName === 'INPUT') {
            if (document.activeElement.value.length === 0) {
              document.activeElement.blur();
              nav(1, '.nav_track_editor');
            }
          } else {
            CURRENT_SCREEN = 'HOME';
            PLAYLIST_EDITOR_MODAL.hide();
            PLAYLIST_MANAGER_MODAL.show();
          }
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'CONFIRM_MODAL') {
          CURRENT_SCREEN = 'HOME';
          CONFIRM_MODAL.hide();
          PLAYLIST_MANAGER_MODAL.show();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'ABOUT_MODAL') {
          CURRENT_SCREEN = 'HOME';
          ABOUT_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'ARTISTS_MODAL') {
          CURRENT_SCREEN = 'HOME';
          ARTISTS_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'FOLDERS_MODAL') {
          CURRENT_SCREEN = 'HOME';
          FOLDERS_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'ALBUMS_MODAL') {
          CURRENT_SCREEN = 'HOME';
          ALBUMS_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'EQUALIZER_MODAL') {
          CURRENT_SCREEN = 'HOME';
          EQUALIZER_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'DIRECTORY_MODAL') {
          if (isCanGoBack()) {
            goBack();
          } else {
            CURRENT_SCREEN = 'HOME';
            DIRECTORY_MODAL.hide();
          }
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'TRIM_MODAL') {
          CURRENT_SCREEN = 'HOME';
          TRIM_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } else if (CURRENT_SCREEN === 'EQL_MODAL') {
          CURRENT_SCREEN = 'HOME';
          EQL_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        } 
        break
      case '1':
        if (CUTTER_PLAYER.paused && CUTTER_START_DURATION < CUTTER_PLAYER.duration && CUTTER_START_DURATION < CUTTER_END_DURATION && CURRENT_SCREEN === 'TRIM_MODAL') {
          CUTTER_START_DURATION += 1;
          CUTTER_START_TIME.innerHTML = convertTime(CUTTER_START_DURATION);
          CUTTER_DURATION_SLIDER_START.value = (CUTTER_START_DURATION + .75) / CUTTER_PLAYER.duration * 100;
          CUTTER_PLAYER.currentTime = CUTTER_START_DURATION;
        }
        break
      case '4':
        CUTTER_START_DURATION -= 1;
        if (CUTTER_PLAYER.paused && CUTTER_START_DURATION >= 0 && CURRENT_SCREEN === 'TRIM_MODAL') {
          CUTTER_START_TIME.innerHTML = convertTime(CUTTER_START_DURATION);
          CUTTER_DURATION_SLIDER_START.value = (CUTTER_START_DURATION + .75) / CUTTER_PLAYER.duration * 100;
          CUTTER_PLAYER.currentTime = CUTTER_START_DURATION;
        } else {
          CUTTER_START_DURATION = 0;
        }
        break
      case '3':
        CUTTER_END_DURATION += 1;
        if (CUTTER_PLAYER.paused && CUTTER_END_DURATION <= CUTTER_PLAYER.duration && CURRENT_SCREEN === 'TRIM_MODAL') {
          CUTTER_END_TIME.innerHTML = convertTime(CUTTER_END_DURATION);
          CUTTER_DURATION_SLIDER_END.value = (CUTTER_END_DURATION + .75) / CUTTER_PLAYER.duration * 100;
        } else {
          CUTTER_END_DURATION = CUTTER_PLAYER.duration;
        }
        break
      case '6':
        if (CUTTER_PLAYER.paused && CUTTER_END_DURATION > 0 && CUTTER_END_DURATION > CUTTER_START_DURATION && CURRENT_SCREEN === 'TRIM_MODAL') {
          CUTTER_END_DURATION -= 1;
          CUTTER_END_TIME.innerHTML = convertTime(CUTTER_END_DURATION);
          CUTTER_DURATION_SLIDER_END.value = (CUTTER_END_DURATION + .75) / CUTTER_PLAYER.duration * 100;
        }
        break
    }
  }

  if (navigator.mozAudioChannelManager) {
    navigator.mozAudioChannelManager.volumeControlChannel = 'content';
    VOLUME_LEVEL.innerHTML = '000';
    VOLUME_STATUS.classList.add('sr-only');
  } else {
    VOLUME_STATUS.classList.remove('sr-only');
    toggleVolume(PLAYER.volume);
  }

  document.activeElement.addEventListener('keydown', handleKeydown);

  localforage.getItem('PLAY_DURATION')
  .then(function(PLAY_DURATION) {
    RESUME_DURATION = PLAY_DURATION;
  })
  .catch(function(err) {
    RESUME_DURATION = null;
  })
  .finally(() => {
    localforage.getItem('DATABASE_GLOBAL_AUDIO')
    .then(function(f) {
      indexingStorage(f);
    })
    .catch(function(err) {
      indexingStorage();
    })
    // indexingStorage();
    CURRENT_SCREEN = 'HOME';
    MENU_MODAL.hide();
  });

  localforage.getItem('__EQUALIZER__')
  .then((eql) => {
    if (eql) {
      for (var x in channelRange) {
        try {
          if (channelRange[JSON.parse(x)].dataset.filter) {
            var n = channelRange[JSON.parse(x)].dataset.filter;
            if (n === 'preamp') {
              const idx = LOW.indexOf(parseFloat(eql[n]));
              channelRange[JSON.parse(x)].value = idx === -1 ? parseFloat(eql[n]) : (idx > 0 ? -idx : idx);
            } else {
              channelRange[JSON.parse(x)].value = parseFloat(eql[n]);
            }
            window[n].gain.value = parseFloat(eql[n]);
          }
        } catch (e){}
      }
    } else {
      const sample = { 'preamp': 1, 'channel31': 0, 'channel63': 0, 'channel125': 0, 'channel250': 0, 'channel500': 0, 'channel1k': 0, 'channel2k': 0, 'channel4k': 0, 'channel8k': 0, 'channel16k': 0 };
      localforage.setItem('__EQUALIZER__', sample);
    }
  });

  function displayKaiAds() {
    var display = true;
    if (window['kaiadstimer'] == null) {
      window['kaiadstimer'] = new Date();
    } else {
      var now = new Date();
      if ((now - window['kaiadstimer']) < 300000) {
        display = false;
      } else {
        window['kaiadstimer'] = now;
      }
    }
    console.log('Display Ads:', display);
    if (!display)
      return;
    getKaiAd({
      publisher: 'ac3140f7-08d6-46d9-aa6f-d861720fba66',
      app: 'k-music',
      slot: 'kaios',
      onerror: err => console.error(err),
      onready: ad => {
        ad.call('display')
        setTimeout(() => {
          document.body.style.position = '';
        }, 1000);
      }
    })
  }

  displayKaiAds();

  document.addEventListener('visibilitychange', function(ev) {
    if (document.visibilityState === 'visible') {
      displayKaiAds();
    }
  });

  var dir_paths = [];

  function isCanGoBack() {
    if (dir_paths.length === 0) {
      return false;
    }
    if (dir_paths.length === 1 && dir_paths[0] === '') {
      return false;
    }
    return true;
  }

  function goBack() {
    if (dir_paths.length > 0) {
      dir_paths.pop();
      enterDir(null);
    }
  }

  function getDir(path, scan = false) {
    var files = [];
    var tree = {}
    GLOBAL_AUDIO_BLOB.forEach((f) => {
      files.push(f.name);
    });
    tree = indexingDocuments(files);
    if (files.length > 0 && dir_paths.length === 0) {
      var i = files[0];
      var i2 = i.split('/')[0];
      if (i2 === '') {
        dir_paths.push(i2);
      }
    }
    if (path != null) {
      [...dir_paths, path].forEach((N) => {
        tree = tree[N];
      });
      if (typeof tree === 'string') {
        // showSnackbar(path);
        return tree;
      } else if (typeof tree === 'object') {
        if (!scan) {
          dir_paths.push(path);
        }
      }
    } else {
      dir_paths.forEach((n) => {
        tree = tree[n];
      });
    }
    return tree;
  }

  function getDirContent(tree, _track) {
    for (var x in tree) {
      if (typeof tree[x] === 'string') {
        _track.push({name: tree[x], selected:true});
      } else {
        getDirContent(tree[x], _track);
      }
    }
  }

  function processDirOrFile(path) {
    var _track = [];
    var tree = getDir(path);
    if (typeof tree === 'string') {
      _track.push({name: tree, selected:true});
    } else {
      for (var x in tree) {
        if (typeof tree[x] === 'string') {
          _track.push({name: tree[x], selected:true});
        } else {
          getDirContent(tree[x], _track);
        }
      }
    }
    CURRENT_PLAYLIST = 'Directory';
    TRACK = [];
    const filtered = [];
    PLAYLIST_LABEL.innerHTML = 'Directory';
    PLAYLIST_NAME.innerHTML = 'Directory';
    _track.forEach((t) => {
      if (t.selected === true) {
        filtered.push(t);
      }
    });
    Object.assign(TRACK, filtered);
    processPlaylist();
  }

  

  function enterDir(path) {
    var tree = getDir(path);
    if (typeof tree === 'string')
      return
    while(DIRECTORY_UL.firstChild) {
      DIRECTORY_UL.removeChild(DIRECTORY_UL.firstChild);
    }
    var i = 0;
    for (var name in tree) {
      const li = document.createElement("LI");
      const pr = document.createElement("pre");
      pr.innerHTML = name;
      li.appendChild(pr);
      li.setAttribute("class", "nav_dir");
      li.setAttribute("tabIndex", i);
      if (i > 0) {
        li.setAttribute("style", 'border-top: 1px solid #320374;');
      }
      DIRECTORY_UL.appendChild(li);
      i++;
    }
    document.activeElement.tabIndex = 0;
    setTimeout(() => {
      nav(0, '.nav_dir');
    }, 200);
  }
});
