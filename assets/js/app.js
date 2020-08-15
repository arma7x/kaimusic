window.addEventListener("load", function() {

  const SDCARD = navigator.getDeviceStorage('sdcard');

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
  var SEQUENCE = []; //[[SEQUENCE_PLAYLIST[random]]
  var TRACK = []; //[{name: string, selected: bool}]
  var GLOBAL_TRACK = ''; //[{name: string, selected: bool}]
  var EDITOR_MODE = false;
  var PLAYLIST_MODAL = {};
  var MENU_MODAL = {};
  var PLAYLIST_MANAGER_MODAL = {};
  var PLAYLIST_EDITOR_MODAL = {};

  const PLAYER = new Audio();
  const DEFAULT_VOLUME = 0.02;
  const CLOCK = document.getElementById('clock');
  const BATTERY_LEVEL = document.getElementById('battery_level');
  const TRACK_TITLE = document.getElementById('track_title');
  const CURRENT_TIME = document.getElementById('current_time');
  const DURATION = document.getElementById('duration');
  const DURATION_SLIDER = document.getElementById("duration_slider");
  const PLAY_BTN = document.getElementById('play_btn');
  const SHUFFLE_BTN = document.getElementById('shuffle_btn');
  const REPEAT_BTN = document.getElementById('repeat_btn');
  const VOLUME_BTN = document.getElementById('volume_btn');
  const VOLUME_LEVEL = document.getElementById('volume_level');
  const ALBUM_COVER = document.getElementById('album_cover');
  const LOADING = document.getElementById('loading');
  const MENU_SK = document.getElementById('menu_software_key');
  const OFFMENU_SK = document.getElementById('offmenu_software_key');
  const PM_SK = document.getElementById('pm_software_key');
  const CP_SK = document.getElementById('cp_software_key');
  const SNACKBAR = document.getElementById("snackbar");
  const ARTIS_LBL = document.getElementById("artis_label");
  const ALBUM_LBL = document.getElementById("album_label");
  const GENRE_LBL = document.getElementById("genre_label");
  const PLAYLIST_NAME = document.getElementById("playlist_name");
  const PLAYLIST_TRACK_UL = document.getElementById("playlist_track_ul");
  const CURRENT_TRACK = document.getElementById("current_track");
  const PLAYLIST_LENGTH = document.getElementById("playlist_length");
  const PLAYLISTS_UL = document.getElementById("playlists_ul");
  const TRACK_EDITOR_UL = document.getElementById("track_editor_ul");
  const PLAYLIST_NAME_INPUT = document.getElementById("playlist_name_input");
  const EDITOR_MODE_LABEL = document.getElementById("editor_mode_label");

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
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
  });

  PLAYLIST_MANAGER_MODAL = new Modalise('playlist_manager_modal')
  .attach()
  .on('onShow', function() {
    CURRENT_SCREEN = 'PLAYLIST_MANAGER_MODAL';
    document.activeElement.tabIndex = -1;
    setTimeout(function() {
      nav(1, '.nav_man_pl');
    }, 300);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PM_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
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
    }, 300);
    MENU_SK.classList.add('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
    CP_SK.classList.remove('sr-only');
    
  })
  .on('onConfirm', function() {
    
  })
  .on('onHide', function() {
    document.activeElement.tabIndex = -1;
    MENU_SK.classList.remove('sr-only');
    OFFMENU_SK.classList.add('sr-only');
    CP_SK.classList.add('sr-only');
    PM_SK.classList.add('sr-only');
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

  function groupByType(_files, cb) {
    var _taskLength = _files.length;
    var _taskDone = 0;
    var _FILE_BY_GROUPS = {};
    setReadyState(false);
    if (_files.length === 0) {
      setReadyState(true);
    }
    _files.forEach(function(element) {
      getFile(element, function(file) {
        var mime = file.type.split('/');
        if (_FILE_BY_GROUPS[mime[0]] == undefined) {
          _FILE_BY_GROUPS[mime[0]] = []
        }
        _FILE_BY_GROUPS[mime[0]].push(file.name);
        _taskDone++;
        if (_taskDone === _taskLength) {
          setReadyState(true);
          if (cb !== undefined) {
            cb();
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
        DOCUMENT_TREE = {};
        DOCUMENT_TREE = indexingDocuments(FILES);
        FILE_BY_GROUPS = {};
        FILE_BY_GROUPS = groupByType(FILES, indexingPlaylist);
      }
    }
    cursor.onerror = function () { 
      console.warn("No file found: " + this.error); 
    }
  }

  function indexingPlaylist(current, playable = true) {
    //localforage.clear();
    localforage.setDriver(localforage.LOCALSTORAGE);
    var _playlistUlIndex = 0;
    var _playlistLength = 0;
    var _playlistDone = 0;
    
    while(PLAYLISTS_UL.firstChild) {
      PLAYLISTS_UL.removeChild(PLAYLISTS_UL.firstChild);
    }

    const create_playlist_li = document.createElement("LI");
    create_playlist_li.appendChild(document.createTextNode('+ Create Playlist'));
    create_playlist_li.setAttribute("class", "nav_man_pl");
    create_playlist_li.setAttribute("tabIndex", _playlistUlIndex);
    PLAYLISTS_UL.appendChild(create_playlist_li);
    _playlistUlIndex++;

    // DEFAULT
    GLOBAL_TRACK = '';
    TRACK = [];
    if (FILE_BY_GROUPS.hasOwnProperty('audio')) {
      FILE_BY_GROUPS['audio'].forEach(function(n) {
        TRACK.push({name: n, selected: true});
      });
    }
    GLOBAL_TRACK = JSON.stringify(TRACK);
    //console.log('playlistName', JSON.parse(GLOBAL_TRACK)[0].selected);

    const default_playlist_li = document.createElement("LI");
    default_playlist_li.appendChild(document.createTextNode('DEFAULT'));
    default_playlist_li.setAttribute("class", "nav_man_pl");
    default_playlist_li.setAttribute("tabIndex", _playlistUlIndex);
    default_playlist_li.setAttribute("value", 'DEFAULT');
    PLAYLISTS_UL.appendChild(default_playlist_li);
    _playlistUlIndex++;
    // END DEFAULT

    if ((current === undefined || current === 'DEFAULT') && playable) {
      processPlaylist(current);
    } else if (playable) {
      setReadyState(false);
    }

    localforage.getItem('__PLAYLISTS__')
    .then((PLAYLISTS) => {
      if (PLAYLISTS !== null) {
        _playlistLength = PLAYLISTS.length;
        const _playlistCollections = [];
        PLAYLISTS.forEach((playlistName) => {
          //console.log('Playlist: ', playlistName);
          localforage.getItem(playlistName)
          .then((oldTracks) => {
            const newTracks = [];
            Object.assign(newTracks, JSON.parse(GLOBAL_TRACK));
            const hiddenTracks = [];
            if (oldTracks !== null) {
              //console.log(playlistName+"::STAGE 1", oldTracks[0].selected, newTracks[0].selected, hiddenTracks.length, JSON.parse(GLOBAL_TRACK)[0].selected);
              oldTracks.forEach((track) => {
                if (track.selected === false) {
                  hiddenTracks.push(track);
                }
              });
              //console.log(playlistName+"::STAGE 2", oldTracks[0].selected, newTracks[0].selected, hiddenTracks.length);
              newTracks.forEach((newTrack, i) => {
                  hiddenTracks.forEach((hiddenTrack) => {
                  if (newTrack.name === hiddenTrack.name) {
                    newTracks[i].selected = hiddenTrack.selected;
                  }
                });
              });
              //console.log(playlistName+"::STAGE 3", oldTracks[0].selected, newTracks[0].selected);
            }

            const exec = (_newTracks) => {
              //console.log(playlistName+"::STAGE  4", _newTracks[0].selected);
              const store = localforage.setItem(playlistName, _newTracks);
              store.then((savedTracks) => {
                //console.log(playlistName+"::STAGE 4", JSON.parse(GLOBAL_TRACK)[0].selected, _newTracks === JSON.parse(GLOBAL_TRACK));
                //console.log("playlistName", savedTracks[0].selected, _newTracks === JSON.parse(GLOBAL_TRACK));
                const custom_playlist_li = document.createElement("LI");
                custom_playlist_li.appendChild(document.createTextNode(playlistName));
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
                  //console.log(_playlistDone, _playlistLength);
                }
                _playlistCollections.push(playlistName);
                if (_playlistDone === _playlistLength && _playlistCollections.indexOf(current) !== -1) {
                  localforage.getItem(current)
                  .then((raw) => {
                    TRACK = [];
                    const filtered = [];
                    raw.forEach((t) => {
                      if (t.selected === true) {
                        filtered.push(t);
                      }
                    });
                    Object.assign(TRACK, filtered);
                    //console.log('indexingPlaylist', current, TRACK.length, filtered.length);
                    if (playable) {
                      processPlaylist(current);
                    }
                  });
                }
              });
            }

            exec(newTracks);
          });
        });
      } else {
        setReadyState(true);
        if (playable) {
          processPlaylist('DEFAULT');
        }
      }
    })
  }

  function processPlaylist(current) {
    //console.log('processPlaylist', current);
    CURRENT_PLAYLIST = current || CURRENT_PLAYLIST;
    PLAYLIST_NAME.innerHTML = CURRENT_PLAYLIST;
    showSnackbar('Playing ' + PLAYLIST_NAME.innerHTML);
    SEQUENCE = [];
    while(PLAYLIST_TRACK_UL.firstChild) {
      PLAYLIST_TRACK_UL.removeChild(PLAYLIST_TRACK_UL.firstChild);
    }
    var i = 0;
    TRACK.forEach(function(k) {
      if (k.selected === true) {
        SEQUENCE.push(i);
        const li = document.createElement("LI");
        const name = k.name.split('/');
        //console.log(i, name);
        li.appendChild(document.createTextNode(name[name.length - 1]));
        li.setAttribute("class", "nav_track");
        li.setAttribute("tabIndex", i);
        PLAYLIST_TRACK_UL.appendChild(li);
        i++;
      }
    });
    shuffling();
    CURRENT_TRACK.innerHTML = SEQUENCE.length > 0 ? SEQUENCE_INDEX + 1 : 0;
    PLAYLIST_LENGTH.innerHTML = SEQUENCE.length;
    playCurrentPlaylist(0);
  }

  function playCurrentPlaylist(idx) {
    if (idx !== undefined) {
      SEQUENCE_INDEX = idx;
    }
    if (SEQUENCE.length > 0) {
      getFile(TRACK[SEQUENCE[SEQUENCE_INDEX]].name, function(file) {
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
        chkbx.setAttribute("type", "checkbox");
        chkbx.setAttribute("id", 'track_' + i.toString());
        chkbx.name = 'track_' + i.toString();
        chkbx.value = k.name;
        chkbx.checked = k.selected;
        div.appendChild(chkbx);
        text.setAttribute("style", "padding:0px 5px;width:92%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;");
        text.appendChild(document.createTextNode(name[name.length - 1]));
        div.appendChild(text);
        li.appendChild(div);
        li.setAttribute("class", "nav_track_editor");
        li.setAttribute("tabIndex", i);
        TRACK_EDITOR_UL.appendChild(li);
      });
    }
  }

  function savePlaylist(overwrite) {
    const trackList = [];
    for (var i=0;i<(TRACK_EDITOR_UL.childElementCount);i++) {
      const chkbx = document.getElementById("track_" + i);
      trackList.push({name: chkbx.value, selected: chkbx.checked});
    }
    createPlaylist(PLAYLIST_NAME_INPUT.value, trackList, overwrite);
  }

  function createPlaylist(name, trackList, overwrite) {
    //console.log('createPlaylist:', name);
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
        //console.log('Added:', name, savedTracks.length);
        indexingPlaylist(name, (operation === 'updated' ? true : false));
        showSnackbar('Playlist ' + name + ' was ' + operation);
        CURRENT_SCREEN = 'HOME';
        PLAYLIST_EDITOR_MODAL.hide();
        PLAYLIST_MANAGER_MODAL.show();
      })
      .catch(function(err) {
        showSnackbar(err.toString());
      })
    }
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

  function removePlaylist(name) {
    if (CURRENT_PLAYLIST === name) {
      showSnackbar('This playlist being play');
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
        //console.log('Removed:', name);
        indexingPlaylist('DEFAULT', false);
        showSnackbar('Playlist ' + name + ' was removed');
        CURRENT_SCREEN = 'HOME';
        PLAYLIST_EDITOR_MODAL.hide();
        PLAYLIST_MANAGER_MODAL.show();
      })
      .catch(function(err) {
        showSnackbar(err.toString());
      })
    }
    //console.log(name);
  }

  function nextTrack() {
    if (SEQUENCE.length > 0) {
      SEQUENCE_INDEX += 1;
      if (SEQUENCE_INDEX >= SEQUENCE.length) {
        SEQUENCE_INDEX = 0;
      }
      getFile(TRACK[SEQUENCE[SEQUENCE_INDEX]].name, playAudio);
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
      getFile(TRACK[SEQUENCE[SEQUENCE_INDEX]].name, playAudio);
      CURRENT_TRACK.innerHTML = SEQUENCE_INDEX + 1;
      //console.log('Index:', SEQUENCE_INDEX, SEQUENCE[SEQUENCE_INDEX]);
    }
  }

  function toggleShuffle() {
    SHUFFLE = !SHUFFLE;
    shuffling();
    if (SHUFFLE) {
      SHUFFLE_BTN.classList.remove('inactive');
      showSnackbar('Shuffle On');
    } else {
      SHUFFLE_BTN.classList.add('inactive');
      showSnackbar('Shuffle Off');
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
      showSnackbar('Repeat Current');
    } else {
      REPEAT = -1;
      REPEAT_BTN.src = '/assets/img/baseline_repeat_white_18dp.png';
      REPEAT_BTN.classList.add('inactive');
      showSnackbar('Repeat Off');
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
    VOLUME_LEVEL.innerHTML = (volume * 100).toFixed(0);
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

  function setReadyState(state) {
    READY_STATE = state;
    if (READY_STATE) {
      LOADING.classList.add('sr-only');
    } else {
      LOADING.classList.remove('sr-only');
    }
  }

  function shuffling() {
    // update current track index
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
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            if (document.activeElement.tabIndex > 1) {
              editPlaylist(PLAYLISTS_UL.childNodes[document.activeElement.tabIndex].textContent);
            }
          }
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          savePlaylist(EDITOR_MODE);
        }
        break
      case 'SoftRight':
        if (CURRENT_SCREEN === 'HOME' && CURRENT_SCREEN !== 'MENU_MODAL') {
          MENU_MODAL.show();
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          if (document.activeElement.tagName === 'LI') {
            if (document.activeElement.tabIndex > 1) {
              removePlaylist(PLAYLISTS_UL.childNodes[document.activeElement.tabIndex].textContent);
            }
          }
        } else if (CURRENT_SCREEN !== 'HOME' && CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          if (document.activeElement.tagName === 'INPUT') {
            document.activeElement.blur();
            nav(1, '.nav_track_editor');
          } else {
            PLAYLIST_NAME_INPUT.focus();
          }
        } 
        break
      case 'ArrowUp':
        if (CURRENT_SCREEN === 'HOME') {
          volumeUp();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          nav(-1, '.nav_menu');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          nav(-1, '.nav_track');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          nav(-1, '.nav_man_pl');
        } else if (CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          nav(-1, '.nav_track_editor');
        }
        break
      case 'ArrowDown':
        if (CURRENT_SCREEN === 'HOME') {
          volumeDown();
        } else if (CURRENT_SCREEN === 'MENU_MODAL') {
          nav(1, '.nav_menu');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          nav(1, '.nav_track');
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          nav(1, '.nav_man_pl');
        } else if (CURRENT_SCREEN === 'PLAYLIST_EDITOR_MODAL') {
          nav(1, '.nav_track_editor');
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
          if (document.activeElement.tabIndex === 0) {
            MENU_MODAL.hide();
            PLAYLIST_MANAGER_MODAL.show();
          } else if (document.activeElement.tabIndex === 1) {
            indexingStorage();
            CURRENT_SCREEN = 'HOME';
            MENU_MODAL.hide();
          }
        } else if (CURRENT_SCREEN === 'PLAYLIST_MODAL') {
          playCurrentPlaylist(SEQUENCE.indexOf(document.activeElement.tabIndex));
        } else if (CURRENT_SCREEN === 'PLAYLIST_MANAGER_MODAL') {
          if (document.activeElement.tabIndex === 0) {
            playlistEditor(undefined, JSON.parse(GLOBAL_TRACK), false);
          } else {
            const nav = document.querySelectorAll('.nav_man_pl');
            indexingPlaylist(nav[document.activeElement.tabIndex].attributes.value.value, true);
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
        }
        break
      case 'Backspace':
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
        }
        break
    }
  }

  document.activeElement.addEventListener('keydown', handleKeydown);
  toogleVolume(PLAYER.volume);
  indexingStorage();
  const DATE = new Date();
  setInterval(function() {
    const d = DATE.toLocaleTimeString().split(' ');
    const t = d[0].split(':');
    t.splice(-1,1);
    CLOCK.innerHTML = [t.join(':'), d[1]].join(' ');
  }, 1000)
  BATTERY_LEVEL.innerHTML = (navigator.battery.level * 100).toFixed(0);
  navigator.battery.onlevelchange = function(e) {
    BATTERY_LEVEL.innerHTML = (e.target.level * 100).toFixed(0);
  }
});
