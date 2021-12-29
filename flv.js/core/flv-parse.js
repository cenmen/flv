import flvTag from './flv-tag'

function FlvParse() {
  const _this = this
  this.tempUint8 = new Uint8Array()
  this.arrTag = []
  this.index = 0
  this.tempArr = []
  this.stop = false
  this.offset = 0
  this.frist = true
  this._hasAudio = false
  this._hasVideo = false

  function acceptFlv(uint8) {
    _this.stop = false
    _this.arrTag = []
    _this.index = 0
    _this.tempUint8 = uint8
    /* 是否初次 buffer, 13为内容体前存在字节, 前3字节为文件标识, FLV格式为(0x46, 0x4c, 0x66) => (70, 76, 86) */
    if (_this.tempUint8.length > 13 && _this.tempUint8[0] == 70 && _this.tempUint8[1] == 76 && _this.tempUint8[2] == 86) {
      probe(_this.tempUint8.buffer)
      read(9) // 略掉9个字节的flv header tag
      read(4) // 略掉第一个4字节的 tag size
      parse()
      _this.frist = false
      return _this.offset
    } else if (!_this.frist) {
      return parse()
    } else {
      return _this.offset
    }
  }

  function probe(buffer) {
    const data = new Uint8Array(buffer)
    const mismatch = { match: false }

    /* 判断是否 FLV 文件标志 */
    if (data[0] !== 0x46 || data[1] !== 0x4c || data[2] !== 0x56 || data[3] !== 0x01) {
      return mismatch
    }

    /* data[4]为1字节, 前5位保留, 必须为0。第6位表示是否存在音频Tag。第七位保留, 必须为0。第8位表示是否存在视频Tag。 */
    const hasAudio = (data[4] & 4) >>> 2 !== 0
    const hasVideo = (data[4] & 1) !== 0

    if (!hasAudio && !hasVideo) {
      return mismatch
    }
    // _this._hasAudio = tagdemux._hasAudio = hasAudio
    // _this._hasVideo = tagdemux._hasVideo = hasVideo
    return {
      match: true,
      hasAudioTrack: hasAudio,
      hasVideoTrack: hasVideo,
    }
  }

  function read(length) {
    const u8a = _this.tempUint8.slice(_this.index, _this.index + length)
    _this.index += length
    return u8a
  }

  /**
   * 开始解析
   */
  function parse() {
    while (_this.index < _this.tempUint8.length && !_this.stop) {
      _this.offset = _this.index

      const t = new flvTag()
      if (_this.tempUint8.length - _this.index >= 11) {
        /* 1字节, Tag类型, 包括音频(0x08 => 8), 视频(0x09 => 9)和script data(0x12 => 18) */
        t.tagType = read(1)[0]
        /* 3字节, 表示该Tag data部分的大小 */
        t.dataSize = read(3)
        /* 3字节, 表示该Tag的时间戳, 1字节表示时间戳的拓展字节*/
        t.Timestamp = read(4)
        /* 3字节 StreamID */
        t.StreamID = read(3)
      } else {
        _this.stop = true
        continue
      }
      /* 4字节表示下一个Tag size */
      if (_this.tempUint8.length - _this.index >= getBodySum(t.dataSize) + 4) {
        t.body = read(getBodySum(t.dataSize)) // 取出body
        if (t.tagType == 9 && _this._hasVideo) {
          _this.arrTag.push(t)
        }
        if (t.tagType == 8 && _this._hasAudio) {
          _this.arrTag.push(t)
        }
        if (t.tagType == 18) {
          if (_this.arrTag.length == 0) _this.arrTag.push(t)
          else {
            console.log('这是截获的自定义数据', t)
          }
        }
        /* 下一个Tag size */
        t.size = read(4)
      } else {
        _this.stop = true
        continue
      }
      _this.offset = _this.index
      console.log('==> parse', _this.offset, t);
    }

    return _this.offset
  }

  /**
   * 计算tag包体大小
   */
  function getBodySum(arr) {
    let _str = ''
    _str += arr[0].toString(16).length == 1 ? '0' + arr[0].toString(16) : arr[0].toString(16)
    _str += arr[1].toString(16).length == 1 ? '0' + arr[1].toString(16) : arr[1].toString(16)
    _str += arr[2].toString(16).length == 1 ? '0' + arr[2].toString(16) : arr[2].toString(16)
    return parseInt(_str, 16)
  }

  return {
    acceptFlv,

    get arrTag() {
      return _this.arrTag
    }
  }
}

export default new FlvParse()
