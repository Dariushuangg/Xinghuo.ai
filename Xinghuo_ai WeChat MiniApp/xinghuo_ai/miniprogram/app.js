//app.js
App({
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
  },
  buf2string: function (buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    var str = ''
    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i])
    }
    return str
  },
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

  },
  globalData: {
    userInfo: null,
    SystemInfo: {},
    has_BLEConnected:false,
    connectedDeviceId: 404, // Default
    name: "连接出错", // Default

    // 用户手机属性
    clientWinHeight:'',
    clientWinWidth:'',

    // 本次驾驶报告使用数据
    temp_total_detected:'',
    temp_total_eye_freq:'',
    temp_total_yaw_freq:'',
    temp_total_eye:'',
    temp_time:''
  }
})
