## 自定义音频播放组件

> 由于官方提供的音频组件无法提供进度条拖动功能，所以我们需要自定义一个音频播放组件
>
> 使用官方api: wx.createInnerAudioContext()  创建 InnerAudioContext 实例从而控制音频播放，前端播放UI需要完全自定义

已知bug：1、小程序开发组件下进度条拖动问题，但真机实测无该问题。

​				  2、安卓机情况下，要播放开始才能获取音频总时长信息

​				  3、多个组件不能同时放在同一页面，因为全局只能存在一个wx.createInnerAudioContext实例，如果						需要在同一个页面放多个组件，那么目前的解决方法是使用wx:if控制组件的生命，使同一个page一						次只能有一个组件出现

**使用方法**

> 这里以创建自定义播放组件为例

**创建InnerAudioContext实例**

在Page外创建实例：

```js
const innerAudioContext = wx.createInnerAudioContext()
```

**设置监听器，基础信息**

在onload或cteated中创建监听器，只需要执行一次即可使用

注：实测在自定义组件的父传子参数prop的observer(数据发送变化时调用)函数中调用也可以使用

```js
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
    // 进度条百分比
    audioPos: undefined,
    // 当前播放时常
    audioCurrent: '00:00',
  },
// 以在observer函数中调用为例
methods: {
  initAudio(data) {
    this.initParam()
    // 设置音频链接
    innerAudioContext.src = data
    // 在onCanplay里获取并设置音频时长和播放进度
    innerAudioContext.onCanplay(() => {
      // 这里必须初始化，否则获取不到音频时长
      innerAudioContext.duration
      // 必须使用定时器，否则获取不到音频时常
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
}
```

**界面样式**

<img src="https://blog-1302755396.cos.ap-shanghai.myqcloud.com/blog/20200904110854.png" alt="image-20200904110839141" style="zoom:50%;" />

基于小程序原生滑动组件和vant-ui的按钮/icon制作

包含功能：

- 播放/暂停
- 显示名称，作者
- 当前播放时长（由于音频播放总时长在安卓机上存在问题，所以暂未显示）
- 播放进度条，可拖拽调整进度

**注意点**

- 在组件从节点树被移除时，需要先停止播放，在销毁实例，否则可能还会继续播放音乐（疑似实例没有被真正销毁）

```js
// 组件实例从页面节点树移除
detached() {
  this.initParam() //初始化参数（可选）
  innerAudioContext.stop()
  innerAudioContext.destroy()
},
```

- 进度条的使用必须切换成百分比赋值，监听器获取的时长是毫秒，也必须化成分钟

```js
// 拖动进度条，到指定位置
sliderChange(e) {
  const position = e.detail.value;
  // 换算百分比
  const currentTime = position / 100 * innerAudioContext.duration;
  innerAudioContext.seek(currentTime);
  this.setData({
    audioPos: position,
    audioCurrent: this.format(currentTime)
  })
},
// 时间格式化 
format(t) {
  let time = Math.floor(t / 60) >= 10 ? Math.floor(t / 60) : '0' + Math.floor(t / 60);
  t = time + ':' + ((t % 60) / 100).toFixed(2).slice(-2);
  return t;
}
```

