window.addEventListener("load", function() {

  const SDCARD = navigator.getDeviceStorage('sdcard');

  var REPEAT = -1;
  var SHUFFLE = false;
  var SNACKBAR_STATUS = undefined;
  var READY_STATE = false;
  var SEQUENCE_INDEX = 0;
  var DOCUMENT_TREE = {};
  var FILES = [];
  var FILE_BY_GROUPS = {};
  var CURRENT_SCREEN = 'HOME';
  var CURRENT_PLAYLIST = 'DEFAULT';
  var SEQUENCE = []; //[[SEQUENCE_PLAYLIST[random]]
  var SEQUENCE_PLAYLIST = []; // [{name: string, status: true}]
  var PLAYLIST = {}; //PLAYLIST_NAME => [{name: string, status: bool}]
  var PLAYLIST_MODAL = {};
  var MENU_MODAL = {};

  const PLAYER = new Audio();
  const DEFAULT_VOLUME = 0.02;
  const SCREENS = ['HOME', 'MENU_MODAL', 'PLAYLIST', 'CREATE_PLAYLIST'];
  const CLOCK = document.getElementById('clock');
  const TRACK_TITLE = document.getElementById('track_title');
  const CURRENT_TIME = document.getElementById('current_time');
  const DURATION = document.getElementById('duration');
  const DURATION_SLIDER = document.getElementById("duration_slider");
  const PLAY_BTN = document.getElementById('play_btn');
  const SHUFFLE_BTN = document.getElementById('shuffle_btn');
  const REPEAT_BTN = document.getElementById('repeat_btn');
  const VOLUME_BTN = document.getElementById('volume_btn');
  const ALBUM_COVER = document.getElementById('album_cover');
  const LOADING = document.getElementById('loading');
  const MENU_SK = document.getElementById('menu_software_key');
  const OFFMENU_SK = document.getElementById('offmenu_software_key');
  const SNACKBAR = document.getElementById("snackbar");
  const ARTIS_LBL = document.getElementById("artis_label");
  const ALBUM_LBL = document.getElementById("album_label");
  const GENRE_LBL = document.getElementById("genre_label");
  const PLAYLIST_NAME = document.getElementById("playlist_name");
  const PLAYLIST_TRACK = document.getElementById("playlist_track");
  const CURRENT_TRACK = document.getElementById("current_track");
  const PLAYLIST_LENGTH = document.getElementById("playlist_length");

  PLAYLIST_MODAL = new Modalise('playlist_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'PLAYLIST_MODAL';
    document.activeElement.tabIndex = (SEQUENCE[SEQUENCE_INDEX] - 1);
    setTimeout(function() {
      nav(1, '.nav_track');
    }, 300);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    CURRENT_SCREEN = 'HOME';
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
    }, 300);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    CURRENT_SCREEN = 'HOME';
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
  });
  PLAYER.volume = DEFAULT_VOLUME

  PLAYER.ontimeupdate = function(e) {
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
  }

  PLAYER.onended = function(e) {
    if (REPEAT === 1) {
      togglePlay();
    } else if (REPEAT === 0 && (SEQUENCE_INDEX === (SEQUENCE.length - 1))) {
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

  function groupByType(_files, readyStateCb, cb) {
    var _taskLength = _files.length;
    var _taskDone = 0;
    var _FILE_BY_GROUPS = {};
    _files.forEach(function(element) {
      getFile(element, function(file) {
        var mime = file.type.split('/');
        if (_FILE_BY_GROUPS[mime[0]] == undefined) {
          _FILE_BY_GROUPS[mime[0]] = []
        }
        _FILE_BY_GROUPS[mime[0]].push(file.name);
        _taskDone++;
        if (_taskDone === _taskLength) {
          if (readyStateCb !== undefined) {
            readyStateCb();
          }
          if (cb !== undefined) {
            cb(0);
          }
        }
      });
    })
    return _FILE_BY_GROUPS;
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
    jsmediatags.read(file, {
      onSuccess: function(media) {
        if (media.tags.title) {
          TRACK_TITLE.innerHTML = media.tags.title;
        } else {
          var name = file.name.split('/');
          TRACK_TITLE.innerHTML = name[name.length - 1];
        }
        if (media.tags.artist) {
          ARTIS_LBL.innerHTML = media.tags.artist;
        } else {
          ARTIS_LBL.innerHTML = 'Unknown';
        }
        if (media.tags.album) {
          ALBUM_LBL.innerHTML = media.tags.album;
        } else {
          ALBUM_LBL.innerHTML = 'Unknown';
        }
        if (media.tags.genre) {
          GENRE_LBL.innerHTML = media.tags.genre;
        } else {
          GENRE_LBL.innerHTML = 'Unknown';
        }
        if (media.tags.picture) {
          const data = media.tags.picture.data;
          const type = media.tags.picture.type ;
          const byteArray = new Uint8Array(data);
          const blob = new Blob([byteArray], { type });
          ALBUM_COVER.src = URL.createObjectURL(blob);
        } else {
          ALBUM_COVER.src = '/assets/img/baseline_album_white_48.png';
        }
      },
      onError: function(error) {
        console.dir(error);
      }
    });
  }

  function playAudio(file) {
    if (file.type.split('/').length === 2) {
      if (file.type.split('/')[0] === 'audio') {
        var name = file.name.split('/');
        getMetadata(file);
        TRACK_TITLE.innerHTML = name[name.length - 1];
        PLAYER.mozAudioChannelType = 'content';
        PLAYER.src = URL.createObjectURL(file);
        PLAYER.play();
      }
    }
  }

  function indexingStorage() {
    FILES = [];
    const cursor = SDCARD.enumerate('');
    cursor.onsuccess = function () {
      if (!this.done) {
        if(cursor.result.name !== null) {
          FILES.push(cursor.result.name)
          this.continue();
        }
      } else {
        toggleReadyState();
        DOCUMENT_TREE = {};
        DOCUMENT_TREE = indexingDocuments(FILES);
        FILE_BY_GROUPS = {};
        FILE_BY_GROUPS = groupByType(FILES, toggleReadyState, indexingPlaylist);
      }
    }
    cursor.onerror = function () { 
      console.warn("No file found: " + this.error); 
    }
  }

  function indexingPlaylist(current) {
    // sync default playlist
    // sync users playlist
    PLAYLIST['DEFAULT'] = [];
    if (FILE_BY_GROUPS.hasOwnProperty('audio')) {
      FILE_BY_GROUPS['audio'].forEach(function(t) {
        PLAYLIST['DEFAULT'].push({name: t, selected: true});
      });
    }
    processPlaylist(current);
  }

  function processPlaylist(current) {
    CURRENT_PLAYLIST = current || CURRENT_PLAYLIST;
    PLAYLIST_NAME.innerHTML = CURRENT_PLAYLIST;
    SEQUENCE = [];
    SEQUENCE_PLAYLIST = [];
    while(PLAYLIST_TRACK.firstChild) {
      PLAYLIST_TRACK.removeChild(PLAYLIST_TRACK.firstChild);
    }
    PLAYLIST[CURRENT_PLAYLIST].forEach(function(k, i) {
      if (k.selected === true) {
        SEQUENCE.push(i);
        SEQUENCE_PLAYLIST.push(k);
        const li = document.createElement("li");
        const name = k.name.split('/');
        li.appendChild(document.createTextNode(name[name.length - 1]));
        li.setAttribute("class", "nav_track");
        li.setAttribute("tabIndex", i);
        PLAYLIST_TRACK.appendChild(li);
      }
    });
    shuffling();
    CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
    PLAYLIST_LENGTH.innerHTML = SEQUENCE.length;
    playCurrentPlaylist();
  }

  function playCurrentPlaylist(idx) {
    if (idx !== undefined) {
      SEQUENCE_INDEX = idx;
    }
    if (SEQUENCE.length > 0) {
      getFile(PLAYLIST[CURRENT_PLAYLIST][SEQUENCE[SEQUENCE_INDEX]].name, function(file) {
        if (file.type.split('/').length === 2) {
          if (file.type.split('/')[0] === 'audio') {
            getMetadata(file);
            PLAYER.mozAudioChannelType = 'content';
            PLAYER.src = URL.createObjectURL(file);
            if (idx !== undefined) {
              PLAYER.play();
            }
            CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
            //console.log('Index:', SEQUENCE_INDEX, SEQUENCE[SEQUENCE_INDEX]);
          }
        }
      });
    }
  }

  function nextTrack() {
    if (SEQUENCE.length > 0) {
      SEQUENCE_INDEX += 1;
      if (SEQUENCE_INDEX >= SEQUENCE.length) {
        SEQUENCE_INDEX = 0;
      }
      getFile(PLAYLIST[CURRENT_PLAYLIST][SEQUENCE[SEQUENCE_INDEX]].name, playAudio);
      CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
      //console.log('Index:', SEQUENCE_INDEX, SEQUENCE[SEQUENCE_INDEX]);
    }
  }

  function previousTrack() {
    if (SEQUENCE.length > 0) {
      SEQUENCE_INDEX -= 1;
      if (SEQUENCE_INDEX < 0) {
        SEQUENCE_INDEX = (SEQUENCE.length - 1);
      }
      getFile(PLAYLIST[CURRENT_PLAYLIST][SEQUENCE[SEQUENCE_INDEX]].name, playAudio);
      CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
      //console.log('Index:', SEQUENCE_INDEX, SEQUENCE[SEQUENCE_INDEX]);
    }
  }

  function toggleShuffle() {
    SHUFFLE = !SHUFFLE;
    shuffling();
    if (SHUFFLE) {
      SHUFFLE_BTN.classList.remove('inactive');
    } else {
      SHUFFLE_BTN.classList.add('inactive');
    }
  }

  function toggleRepeat() {
    REPEAT++;
    if (REPEAT === 0) {
      REPEAT_BTN.src = '/assets/img/baseline_repeat_white_18dp.png';
      REPEAT_BTN.classList.remove('inactive');
    } else if (REPEAT === 1) {
      REPEAT_BTN.src = '/assets/img/baseline_repeat_one_white_18dp.png';
      REPEAT_BTN.classList.remove('inactive');
    } else {
      REPEAT = -1;
      REPEAT_BTN.src = '/assets/img/baseline_repeat_white_18dp.png';
      REPEAT_BTN.classList.add('inactive');
    }
  }

  function togglePlay() {
    if (PLAYER.duration > 0 && !PLAYER.paused) {
      PLAYER.pause();
    } else {
      PLAYER.play();
    }
  }

  function toogleVolume(volume) {
    if (volume > 0) {
      VOLUME_BTN.src = '/assets/img/baseline_volume_up_white_18dp.png';
    } else {
      VOLUME_BTN.src = '/assets/img/baseline_volume_off_white_18dp.png';
    }
  }

  function volumeDown() {
    if (PLAYER.volume > 0) {
      PLAYER.volume = parseFloat((PLAYER.volume - DEFAULT_VOLUME).toFixed(2));
      toogleVolume(PLAYER.volume);
      showSnackbar('Volume ' + (PLAYER.volume * 100).toFixed(0).toString() + '%');
    }
  }

  function volumeUp() {
    if (PLAYER.volume < 1) {
      PLAYER.volume = parseFloat((PLAYER.volume + DEFAULT_VOLUME).toFixed(2));
      toogleVolume(PLAYER.volume);
      showSnackbar('Volume ' + (PLAYER.volume * 100).toFixed(0).toString() + '%');
    }
  }

  function nav(next, selector) {
    const currentIndex = document.activeElement.tabIndex;
    var move = currentIndex + next;
    const nav = document.querySelectorAll(selector);
    var targetElement = nav[move]
    if (targetElement !== undefined) {
      targetElement.focus()
      document.activeElement.tabIndex = move;
    } else {
      if (move < 0) {
        move = nav.length - 1;
      } else if (move >= nav.length) {
        move = 0;
      }
      targetElement = nav[move];
      targetElement.focus();
      document.activeElement.tabIndex = move;
    }
  }

  function showSnackbar(text) {
    if (SNACKBAR_STATUS !== undefined) {
      clearTimeout(SNACKBAR_STATUS);
      SNACKBAR_STATUS = undefined;
    }
    SNACKBAR.className = "show";
    SNACKBAR.innerHTML = text;
    SNACKBAR_STATUS = setTimeout(function() {
      SNACKBAR.className = SNACKBAR.className.replace("show", "");
      SNACKBAR_STATUS = undefined;
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

  function toggleReadyState() {
    READY_STATE = !READY_STATE;
    if (READY_STATE) {
      LOADING.classList.add('sr-only');
    } else {
      LOADING.classList.remove('sr-only');
    }
  }

  function shuffling() {
    if (SHUFFLE) {
      for (let i = SEQUENCE.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [SEQUENCE[i], SEQUENCE[j]] =
        [SEQUENCE[j], SEQUENCE[i]];
      }
    } else {
      SEQUENCE.sort((a, b) => a - b);
    }
  }

  function handleKeydown(e) {
    switch(e.key) {
      case '*':
        if (CURRENT_SCREEN === 'HOME') {
          toggleShuffle();
        }
        break
      case '#':
        if (CURRENT_SCREEN === 'HOME') {
          toggleRepeat();
        }
        break
      case 'SoftLeft':
        if (CURRENT_SCREEN === 'HOME' && CURRENT_SCREEN !== 'PLAYLIST_MODAL') {
          PLAYLIST_MODAL.show();
        }
        break
      case 'SoftRight':
        if (CURRENT_SCREEN === 'HOME' && CURRENT_SCREEN !== 'MENU_MODAL') {
          MENU_MODAL.show();
        }
        break
      case 'ArrowUp':
        if (CURRENT_SCREEN === 'HOME') {
          volumeUp();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          nav(-1, '.nav_menu');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          nav(-1, '.nav_track');
        }
        break
      case 'ArrowDown':
        if (CURRENT_SCREEN === 'HOME') {
          volumeDown();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          nav(1, '.nav_menu');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          nav(1, '.nav_track');
        }
        break
      case 'ArrowRight':
        if (CURRENT_SCREEN === 'HOME') {
          nextTrack();
        }
        break
      case 'ArrowLeft':
        if (CURRENT_SCREEN === 'HOME') {
          previousTrack();
        }
        break
      case 'Enter':
        if (CURRENT_SCREEN === 'HOME') {
          if (!PLAYER.src) {
            break
          }
          togglePlay();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          if (document.activeElement.tabIndex === 1) {
            indexingStorage();
            MENU_MODAL.hide();
          }
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          playCurrentPlaylist(SEQUENCE.indexOf(document.activeElement.tabIndex));
        }
        break
      case 'Backspace':
        if (CURRENT_SCREEN === 'MENU_MODAL') {
          MENU_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
          break
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          PLAYLIST_MODAL.hide();
          e.preventDefault();
          e.stopPropagation();
        }
        break
    }
  }

  document.activeElement.addEventListener('keydown', handleKeydown)
  toggleReadyState();
  indexingStorage();
  const DATE = new Date();
  setInterval(function() {
    CLOCK.innerHTML = DATE.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  }, 1000)
  //setInterval(toggleReadyState, 1000);
});
