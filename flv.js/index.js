import flvParse from './core/flv-parse'

export function createFlv() {
  let isFirst = true
  this._onInitSegment = null
  this._onMediaSegment = null
  this._onMediaInfo = null

  function setFlv(uint8) {
    const offset = isFirst ? setflvBasefrist(uint8) : setflvBaseUsually(uint8)
    return offset
  }

  function setflvBasefrist(uint8) {
    isFirst = false
    let offset = flvParse.acceptFlv(new Uint8Array(uint8))
    // console.log('==> flvParse', flvParse)
    if (flvParse.arrTag[0].tagType != 18) {
      throw new Error('without metadata tag')
    }
    if (flvParse.arrTag.length > 0) {
      // tagdemux.hasAudio = this.hasAudio = flvParse._hasAudio
      // tagdemux.hasVideo = this.hasVideo = flvParse._hasVideo
      // if (this._tempBaseTime != 0 && this._tempBaseTime == flvParse.arrTag[0].getTime()) {
      //   tagdemux._timestampBase = 0
      // }
      // tagdemux.moofTag(flvParse.arrTag)
    }
    return offset
  }

  function setflvBaseUsually(uint8) {
    const offset = flvParse.acceptFlv(new Uint8Array(uint8))

    if (flvParse.arrTag.length > 0) {
      // tagdemux.moofTag(flvParse.arrTag)
    }

    return offset
  }

  return {
    setFlv,
    set onInitSegment(fun) {
      this._onInitSegment = fun
    },

    set onMediaSegment(fun) {
      this._onMediaSegment = fun
    },

    set onMediaInfo(fun) {
      this._onMediaInfo = fun
    },
  }
}
