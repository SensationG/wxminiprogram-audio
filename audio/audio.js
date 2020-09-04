import Toast from '@vant/weapp/toast/toast'

const innerAudioContext = wx.createInnerAudioContext()

Component({
  properties: {
    name: {
      type: String,
      value: '无信息'
    },
    src: {
      type: String,
      observer: function(data) {   
        this.initAudio(data)
      }
    },
    author: {
      type: String
    }
  },
  data: {
    name: undefined,
    // 是否播放
    play: false,
    // 音频长度
    audioDuration: '00:00',
    // 当前播放时常
    audioCurrent: '00:00',
  },
  created() {
    
  },
  methods: {
    initAudio(data) {
      this.initParam()
      innerAudioContext.src = data
      // 在onCanplay里获取并设置音频时长和播放进度
      innerAudioContext.onCanplay(() => {
        // 这里必须初始化，否则获取不到音频时长
        innerAudioContext.duration
        setTimeout(() => {
          this.setData({
            audioDuration: this.format(innerAudioContext.duration),
            
          });
        }, 500);
      });

      // 播放进度更新
      innerAudioContext.onTimeUpdate(() => {
        this.setData({
          audioPos: innerAudioContext.currentTime / innerAudioContext.duration * 100,
          audioCurrent: this.format(innerAudioContext.currentTime)
        })
      })
      // 录音播放暂停
      innerAudioContext.onPause(() => {
        this.setData({
          play: false
        })
      })
      // 音频播放完成
      innerAudioContext.onEnded(() => {
        this.setData({
          play: false
        })
      })
      innerAudioContext.onError((res) => {
        // Toast.fail('音频加载失败')
        console.log('音频加载失败')
      })
    },
    // 点击播放
    playAudio() {
      if(!this.data.play) {
        innerAudioContext.play()
        this.setData({
          play: true
        })
      } else {
        innerAudioContext.pause()
        this.setData({
          play: false
        })
      }
    },
    // 拖动进度条，到指定位置
    sliderChange(e) {
      const position = e.detail.value;
      const currentTime = position / 100 * innerAudioContext.duration;
      innerAudioContext.seek(currentTime);
      this.setData({
        audioPos: position,
        audioCurrent: this.format(currentTime)
      })
    },
    // 初始化数据
    initParam() {
      this.setData({
        src: undefined,
        play: false,
        audioDuration: '00:00',
        audioCurrent: '00:00',
      })
    },
    // 时间格式化
    format(t) {
      let time = Math.floor(t / 60) >= 10 ? Math.floor(t / 60) : '0' + Math.floor(t / 60);
      t = time + ':' + ((t % 60) / 100).toFixed(2).slice(-2);
      return t;
    }
  },
  // 组件实例从页面节点树移除
  detached() {
    this.initParam()
    innerAudioContext.stop()
    innerAudioContext.destroy()
  },
})