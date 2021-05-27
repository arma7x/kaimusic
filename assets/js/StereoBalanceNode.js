function StereoBalanceNode(context, options) {
    if (options === void 0) { options = { balance: 0 }; }
    var balance = 0;
    // ChannelSplitterNode cannot be told to use a `channelInterperatation` of
    // "speakers". This means that if we get a mono file, we will end up only
    // playing in the left speaker. So instead we use this dummy gain node to
    // convert whatever source we get (stereo, mono, or n channels) into a stereo
    // signal.
    // Idea credit: https://github.com/WebAudio/web-audio-api/issues/975#issue-177242377
    var upMixer = context.createGain();
    upMixer.channelCount = 2;
    upMixer.channelCountMode = "explicit";
    upMixer.channelInterpretation = "speakers";
    var splitter = context.createChannelSplitter(2);
    // Create the gains for left and right
    var leftGain = context.createGain();
    var rightGain = context.createGain();
    var merger = context.createChannelMerger(2);
    upMixer.connect(splitter);
    splitter.connect(leftGain, 0);
    splitter.connect(rightGain, 1);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    // -1 (left) to 1 (right)
    function set(rawValue) {
        var value = Number(rawValue);
        leftGain.gain.value = value > 0 ? 1 - value : 1;
        rightGain.gain.value = value > 0 ? 1 : 1 + value;
        balance = value;
    }
    function get() {
        return balance;
    }
    // Create our own version of an [AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam).
    // We don't currently support any of the "over time" methods, but maybe some day
    // we'll want to.
    var audioParam = {};
    Object.defineProperties(audioParam, {
        value: { get: get, set: set, enumerable: true, configurable: true },
    });
    // The way the `.connect` API works, we can't actually construct our own
    // AudioNode. Instead we have to take an existing node and monkey patch it.
    Object.defineProperties(upMixer, {
        balance: {
            value: audioParam,
            enumerable: true,
            writable: false,
            configurable: true,
        },
        connect: {
            value: AudioNode.prototype.connect.bind(merger),
            enumerable: false,
            writable: false,
            configurable: true,
        },
        disconnect: {
            value: AudioNode.prototype.disconnect.bind(merger),
            enumerable: false,
            writable: false,
            configurable: true,
        },
    });
    if (balance !== options.balance) {
        set(options.balance);
    }
    return upMixer;
}