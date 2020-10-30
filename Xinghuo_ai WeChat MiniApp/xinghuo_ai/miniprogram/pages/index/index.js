//index.js
//获取应用实例
const app = getApp()

// 云服务
const db = wx.cloud.database()
// Utils
var util = require('../../utils/util.js');

Page({
  data: {
    user_reports:["眨眼频率是否高于60次/分钟","打哈欠次数是否超过5次/分钟","闭眼时长是否超过2秒"],
    user_height:500, // Default height
    local_isAsleep:false,
    local_noFace:false,
    local_eye_isWarning:false,
    local_eye_freq_isWarning:false,
    local_yaw_freq_isWarning:false,
    hasStartedDetection: false,
    local_has_BLEConnected:false,
    img_detectionResult:'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3128090700,416650229&fm=26&gp=0.jpg', //惊恐：https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598168523853&di=90e3462f20d1452376a8db8b813d47e3&imgtype=0&src=http%3A%2F%2Fww2.sinaimg.cn%2Flarge%2F85cc5ccbgy1ffncxx82ukg20d606zn63.jpg
    eye_freq_colorChange:'',
    eye_colorChange:'',
    yaw_freq_colorChange:'',
    show_startDetection:'',
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    //蓝牙传递所需参数：
    start: false,
    receiveText: '',
    outText: '',
    name: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    connected: true,

    // 用于上传的参数：
    local_total_eye:0,
    local_total_eye_freq:0,
    local_total_yaw_freq:0,
    local_total_detected:0, 
    local_time:'',

    // 用于调试的参数
    log_receivedText:'no_information_is_received',
    log_int_receivedText:'no_information_is_received',
    log_binary_receivedText:'no_information_is_received'
  },
  //事件处理函数

  // 测试函数1 (在1.0.2版本中 已因为传输信息格式变化而废弃)
  test_closed:function(){
    var that = this
    var receiveText = "closed"
    var receiveSrc = ""
    console.log('监听低功耗蓝牙设备的特征值变化事件成功');
    console.log(receiveText)
    
    
    if(receiveText == "closed"){that.setData({
      local_isAsleep:true
    })
    console.log("local_isAsleep改变"+that.data.local_isAsleep)
  }
    else{
      if(receiveText == "open"){
        that.setData({
          local_isAsleep:false
        })
      }
      else{
        that.setData({
          local_isAsleep:false,
          local_noFace: true
        })
        setTimeout(function(){that.setData({
          local_noFace:false
        })},2000)

        console.log("Wrong??"+that.data.local_noFace)
      }
    } 
    console.log(that.data.local_noFace)

    if(that.data.start == true){
        if(that.data.local_isAsleep == true && !(that.data.local_isWarning) ==true){
          //进入报警模式
          that.setData({
            img_detectionResult: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598168523853&di=90e3462f20d1452376a8db8b813d47e3&imgtype=0&src=http%3A%2F%2Fww2.sinaimg.cn%2Flarge%2F85cc5ccbgy1ffncxx82ukg20d606zn63.jpg',
            local_isWarning:true
          })

          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();

          // 回到正常模式
          setTimeout(function(){
            that.setData({
              local_isAsleep : false,
              img_detectionResult: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598162838406&di=f9d2bb56cc0e36d08d7a281ff5f6f9fb&imgtype=0&src=http%3A%2F%2Fp3.ssl.cdn.btime.com%2Ft01464ba1192f5ee71d.gif%3Fsize%3D480x360',
              local_isWarning:false
            })
          },6000)
        }

    }

  },
  // 测试函数2 (在1.0.2版本中 已因为传输信息格式变化而废弃)
  test_open:function(){
    var that = this
    var receiveText = "open"
    var receiveSrc = ""
    console.log('监听低功耗蓝牙设备的特征值变化事件成功');
    console.log(receiveText)
    
    
    if(receiveText == "closed"){that.setData({
      local_isAsleep:true
    })
    console.log("local_isAsleep改变"+that.data.local_isAsleep)
  }
    else{
      if(receiveText == "open" && !(this.data.local_isWarning)){
        that.setData({
          local_isAsleep:false
        })
      }
      else{
        if(!(this.data.local_isWarning)){
          that.setData({
            local_isAsleep:false,
            local_noFace: true
          })
          setTimeout(function(){that.setData({
            local_noFace:false
          })},2000)
  
          console.log("Wrong??"+that.data.local_noFace)
        }
      }
    } 
    console.log(that.data.local_noFace)

    if(that.data.start == true){
        if(that.data.local_isAsleep == true && !(that.data.local_isWarning) ==true){
          //进入报警模式
          that.setData({
            img_detectionResult: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598168523853&di=90e3462f20d1452376a8db8b813d47e3&imgtype=0&src=http%3A%2F%2Fww2.sinaimg.cn%2Flarge%2F85cc5ccbgy1ffncxx82ukg20d606zn63.jpg',
            local_isWarning:true
          })

          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();

          // 回到正常模式
          setTimeout(function(){
            that.setData({
              local_isAsleep : false,
              img_detectionResult: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598162838406&di=f9d2bb56cc0e36d08d7a281ff5f6f9fb&imgtype=0&src=http%3A%2F%2Fp3.ssl.cdn.btime.com%2Ft01464ba1192f5ee71d.gif%3Fsize%3D480x360',
              local_isWarning:false
            })
          },6000)
        }

    }

  },
  // 测试函数3 (在1.0.2版本中 已因为传输信息格式变化而废弃)
  test_noFace:function(){
    var that = this
    var receiveText = "no face"
    var receiveSrc = ""
    console.log('监听低功耗蓝牙设备的特征值变化事件成功');
    console.log(receiveText)
    
    
    if(receiveText == "closed"){that.setData({
      local_isAsleep:true
    })
    console.log("local_isAsleep改变"+that.data.local_isAsleep)
  }
    else{
      if(receiveText == "open"){
        that.setData({
          local_isAsleep:false
        })
      }
      else{
        that.setData({
          local_isAsleep:false,
          local_noFace: true
        })
        setTimeout(function(){that.setData({
          local_noFace:false
        })},2000)

        console.log("Wrong??"+that.data.local_noFace)
      }
    } 
    console.log(that.data.local_noFace)

    if(that.data.start == true){
        if(that.data.local_isAsleep == true && !(that.data.local_isWarning) ==true){
          //进入报警模式
          that.setData({
            img_detectionResult: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598168523853&di=90e3462f20d1452376a8db8b813d47e3&imgtype=0&src=http%3A%2F%2Fww2.sinaimg.cn%2Flarge%2F85cc5ccbgy1ffncxx82ukg20d606zn63.jpg',
            local_isWarning:true
          })

          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();

          // 回到正常模式
          setTimeout(function(){
            that.setData({
              local_isAsleep : false,
              img_detectionResult: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598162838406&di=f9d2bb56cc0e36d08d7a281ff5f6f9fb&imgtype=0&src=http%3A%2F%2Fp3.ssl.cdn.btime.com%2Ft01464ba1192f5ee71d.gif%3Fsize%3D480x360',
              local_isWarning:false
            })
          },6000)
        }

    }

  },
  // 测试函数4: 传入7 15 或 2
  test_multiInfo_8:function(){
    var that = this
    var receiveText = "12"
    var int_receiveText = parseInt(receiveText)
    console.log(int_receiveText)
    var bin = ''
    while(int_receiveText>0){
      var temp = int_receiveText%2
      bin += temp
      int_receiveText = (int_receiveText-temp)/2
    }
    for(var i=bin.length;i<4;i++){
      bin+=0
    }
    console.log(bin)
    that.setData({
      log_binary_receivedText:bin,
      log_receivedText:receiveText,
      log_int_receivedText:int_receiveText
    })
    // 开始判断
    // 1.没有人脸
    if(bin.substring(3,4)==0){
      that.setData({
        local_isAsleep:false,
        local_noFace: true
      })
      setTimeout(function(){that.setData({
        local_noFace:false
      })},2000)
    }
    // 2. 睁眼/闭眼
    if(bin.substring(2,3)==1){
      that.data.local_total_eye+=1
      if(!(that.data.local_eye_isWarning)){
          that.setData({
            local_eye_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var i=0;i<5;i++){
            setTimeout(function(){
              that.setData({
                eye_colorChange:'bg-yellow'
              })
            },1000*(i+(3/2)))
            setTimeout(function(){
              that.setData({
              eye_colorChange:'bg-gradual-red'
              })
            },1000*(i+1))
          }
          setTimeout(function(){
            that.setData({
              local_eye_isWarning:false
            })
          },6000)
      }
    }
    // 3. 哈欠
    if(bin.substring(1,2)==1){
      that.data.local_total_yaw_freq+=1
      if(!(that.data.local_yaw_freq_isWarning)){
          that.setData({
            local_yaw_freq_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var j=0;j<5;j++){
            setTimeout(function(){
              that.setData({
                yaw_freq_colorChange:'bg-grey'
              })
            },1000*(j+(3/2)))
            setTimeout(function(){
              that.setData({
                yaw_freq_colorChange:'bg-gradual-purple'
              })
            },1000*(j+1))
          }
          setTimeout(function(){
            that.setData({
              local_yaw_freq_isWarning:false
            })
          },6000)
      }
    }
    // 4. 眨巴眼
    if(bin.substring(0,1)==1){
      that.data.local_total_eye_freq+=1
      if(!(that.data.local_eye_freq_isWarning)){
          that.setData({
            local_eye_freq_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var j=0;j<5;j++){
            setTimeout(function(){
              that.setData({
                eye_freq_colorChange:'bg-brown'
              })
            },1000*(j+(3/2)))
            setTimeout(function(){
              that.setData({
                eye_freq_colorChange:'bg-gradual-blue'
              })
            },1000*(j+1))
          }
          setTimeout(function(){
            that.setData({
              local_eye_freq_isWarning:false
            })
          },6000)
      }
    }

  },
  test_multiInfo_12:function(){
    var that = this
    var receiveText = "12"
    var int_receiveText = parseInt(receiveText)
    console.log(int_receiveText)
    var bin = ''
    while(int_receiveText>0){
      var temp = int_receiveText%2
      bin += temp
      int_receiveText = (int_receiveText-temp)/2
    }
    for(var i=bin.length;i<4;i++){
      bin+=0
    }
    console.log(bin)
    that.setData({
      log_binary_receivedText:bin,
      log_receivedText:receiveText,
      log_int_receivedText:int_receiveText
    })
    // 开始判断
    // 1.没有人脸
    if(bin.substring(0,1)==0){
      that.setData({
        local_isAsleep:false,
        local_noFace: true
      })
      setTimeout(function(){that.setData({
        local_noFace:false
      })},2000)
    }
    // 2. 睁眼/闭眼
    if(bin.substring(1,2)==1){
      if(!(that.data.local_eye_isWarning)){
          that.setData({
            local_eye_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var i=0;i<5;i++){
            setTimeout(function(){
              that.setData({
                eye_colorChange:'bg-yellow'
              })
            },1000*(i+(3/2)))
            setTimeout(function(){
              that.setData({
              eye_colorChange:'bg-gradual-red'
              })
            },1000*(i+1))
          }
          setTimeout(function(){
            that.setData({
              local_eye_isWarning:false
            })
          },6000)
      }
    }
    // 3. 哈欠
    if(bin.substring(2,3)==1){
      if(!(that.data.local_yaw_freq_isWarning)){
          that.setData({
            local_yaw_freq_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var j=0;j<5;j++){
            setTimeout(function(){
              that.setData({
                yaw_freq_colorChange:'bg-grey'
              })
            },1000*(j+(3/2)))
            setTimeout(function(){
              that.setData({
                yaw_freq_colorChange:'bg-gradual-purple'
              })
            },1000*(j+1))
          }
          setTimeout(function(){
            that.setData({
              local_yaw_freq_isWarning:false
            })
          },6000)
      }
    }
    // 4. 眨巴眼
    if(bin.substring(3,4)==1){
      if(!(that.data.local_eye_freq_isWarning)){
          that.setData({
            local_eye_freq_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var j=0;j<5;j++){
            setTimeout(function(){
              that.setData({
                eye_freq_colorChange:'bg-brown'
              })
            },1000*(j+(3/2)))
            setTimeout(function(){
              that.setData({
                eye_freq_colorChange:'bg-gradual-blue'
              })
            },1000*(j+1))
          }
          setTimeout(function(){
            that.setData({
              local_eye_freq_isWarning:false
            })
          },6000)
      }
    }

  },
  test_multiInfo_2:function(){
    var that = this
    var receiveText = "2"
    var int_receiveText = parseInt(receiveText)
    console.log(int_receiveText)
    var bin = ''
    while(int_receiveText>0){
      var temp = int_receiveText%2
      bin += temp
      int_receiveText = (int_receiveText-temp)/2
    }
    for(var i=bin.length;i<4;i++){
      bin+=0
    }
    console.log(bin)
    that.setData({
      log_binary_receivedText:bin,
      log_receivedText:receiveText,
      log_int_receivedText:int_receiveText
    })
    // 开始判断
    // 1.没有人脸
    if(bin.substring(0,1)==0){
      that.setData({
        local_isAsleep:false,
        local_noFace: true
      })
      setTimeout(function(){that.setData({
        local_noFace:false
      })},2000)
    }
    // 2. 睁眼/闭眼
    if(bin.substring(1,2)==1){
      if(!(that.data.local_eye_isWarning)){
          that.setData({
            local_eye_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var i=0;i<5;i++){
            setTimeout(function(){
              that.setData({
                eye_colorChange:'bg-yellow'
              })
            },1000*(i+(3/2)))
            setTimeout(function(){
              that.setData({
              eye_colorChange:'bg-gradual-red'
              })
            },1000*(i+1))
          }
          setTimeout(function(){
            that.setData({
              local_eye_isWarning:false
            })
          },6000)
      }
    }
    // 3. 哈欠
    if(bin.substring(2,3)==1){
      if(!(that.data.local_yaw_freq_isWarning)){
          that.setData({
            local_yaw_freq_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var j=0;j<5;j++){
            setTimeout(function(){
              that.setData({
                yaw_freq_colorChange:'bg-grey'
              })
            },1000*(j+(3/2)))
            setTimeout(function(){
              that.setData({
                yaw_freq_colorChange:'bg-gradual-purple'
              })
            },1000*(j+1))
          }
          setTimeout(function(){
            that.setData({
              local_yaw_freq_isWarning:false
            })
          },6000)
      }
    }
    // 4. 眨巴眼
    if(bin.substring(3,4)==1){
      if(!(that.data.local_eye_freq_isWarning)){
          that.setData({
            local_eye_freq_isWarning:true
          })
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.src = '/audio/warning.mp3'
          that.innerAudioContext.obeyMuteSwitch = false
          that.innerAudioContext.play();
           // 一闪一闪
          for(var j=0;j<5;j++){
            setTimeout(function(){
              that.setData({
                eye_freq_colorChange:'bg-brown'
              })
            },1000*(j+(3/2)))
            setTimeout(function(){
              that.setData({
                eye_freq_colorChange:'bg-gradual-blue'
              })
            },1000*(j+1))
          }
          setTimeout(function(){
            that.setData({
              local_eye_freq_isWarning:false
            })
          },6000)
      }
    }

  },

  // 测试函数5：真机测试

  // 开始连接蓝牙设备
  detection_start: function(){
    wx.redirectTo({
      url: '/pages/search/search',
    })
  },

  onLoad: function (options) {
    // 初始化关键数据
    var that = this;
    that.setData({
      user_height: app.globalData.clientWinHeight,
      //获取是否连接了蓝牙检测设备
      local_has_BLEConnected: app.globalData.has_BLEConnected,
    });
    console.log(app.globalData.connectedDeviceId)
    console.log("Connection checked!")
    console.log("Height adjusted!")
    console.log(app.globalData.has_BLEConnected)

    // 统计数据归0
    that.setData({
      local_total_detected:0,
      local_total_eye_freq:0,
      local_total_yaw_freq:0,
      local_total_eye:0
    })
    
    // 已经开始检测，准备接收蓝牙数据
    if(app.globalData.has_BLEConnected == true){
      console.log("Receiving Data Now!")
      console.log(options)
      that.setData({
        name: app.globalData.name,
        connectedDeviceId: app.globalData.connectedDeviceId
      })
      wx.getBLEDeviceServices({
        deviceId: app.globalData.connectedDeviceId,
        success: function (res) {
          console.log("看看有没有成功初始化service")
          console.log(res.services)
          that.setData({
            services: res.services
          })
          wx.getBLEDeviceCharacteristics({
            deviceId: app.globalData.connectedDeviceId,
            serviceId: res.services[0].uuid,
            success: function (res) {
              console.log(res.characteristics)
              that.setData({
                characteristics: res.characteristics
              })
              wx.notifyBLECharacteristicValueChange({
                state: true,
                deviceId: app.globalData.connectedDeviceId,
                serviceId: that.data.services[0].uuid,
                characteristicId: that.data.characteristics[0].uuid,
                success: function (res) {
                  console.log('notify set up successfully!' + that.data.characteristics[0].uuid)
                  console.log(JSON.stringify(res));
                  that.onBLECharacteristicValueChange();
                },
                fail: function () {
                  console.log('something is wrong with notify' + that.characteristicId)
                }
              })
            }
          })
        }
      })
      wx.onBLEConnectionStateChange(function (res) {
        console.log(res.connected)
        that.setData({
          connected: res.connected
        })
      })
    }
  },

  onBLECharacteristicValueChange: function() {
      var that = this;
      wx.onBLECharacteristicValueChange(function(res) {
      var receiveText = app.buf2string(res.value)
      var situation = 's:'
      // // 获取int型蓝牙数据
      // var value = new Int32Array(res.value)
      // var int_receiveText = value[0]
      // var log_int_receiveText = value[0]

      // console.log('BLED Changed!');
      // console.log(app.buf2string(res.value));
      
      // // 转为二进制信息
      // var bin = ''
      // while(int_receiveText>0){
      //   var temp = int_receiveText%2
      //   bin += temp
      //   int_receiveText = (int_receiveText-temp)/2
      // }
      // for(var i=bin.length;i<4;i++){
      //   bin+=0
      // }
      // console.log("收到的信息二进制化之后是："+bin)
      // that.setData({
      //   log_int_receivedText:log_int_receiveText,
      //   log_binary_receivedText: bin
      // })

      var value = new Int16Array(res.value)[0];
      var bin = value.toString();
      var test = that.data.hasStartedDetection
      situation+=test+bin+': '
      // 开始检测

      if(that.data.hasStartedDetection!=false){
      // 1.没有人脸
      if(bin.substring(0,1)==0){
        situation+='没有人脸-'
        that.setData({
          local_isAsleep:false,
          local_noFace: true
        })
        setTimeout(function(){that.setData({
          local_noFace:false
        })},2000)
      }
      // 2. 睁眼/闭眼
      if(bin.substring(1,2)==1){
        situation+='-检测闭眼-'
        if(!(that.data.local_eye_isWarning)){
          that.data.local_total_eye+=1
            that.setData({
              local_eye_isWarning:true
            })
            that.innerAudioContext = wx.createInnerAudioContext()
            that.innerAudioContext.src = '/audio/warning.mp3'
            that.innerAudioContext.obeyMuteSwitch = false
            that.innerAudioContext.play();
            // 一闪一闪 修改版
             setTimeout(function(){
                that.setData({
                  eye_colorChange:'bg-yellow'
                })
              },6000)
              that.setData({
                eye_colorChange:'bg-gradual-red'
                })
            setTimeout(function(){
              that.setData({
                local_eye_isWarning:false
              })
            },6000)
        }
      }
      // 3. 哈欠
      if(bin.substring(2,3)==1){
        situation+='-检测哈欠-'
        if(!(that.data.local_yaw_freq_isWarning)){
          that.data.local_total_yaw_freq+=1
            that.setData({
              local_yaw_freq_isWarning:true
            })
            that.innerAudioContext = wx.createInnerAudioContext()
            that.innerAudioContext.src = '/audio/warning.mp3'
            that.innerAudioContext.obeyMuteSwitch = false
            that.innerAudioContext.play();
            // 一闪一闪
              setTimeout(function(){
                that.setData({
                  yaw_freq_colorChange:'bg-grey'
                })
              },6000)
                that.setData({
                  yaw_freq_colorChange:'bg-gradual-purple'
                })

            setTimeout(function(){
              that.setData({
                local_yaw_freq_isWarning:false
              })
            },6000)
        }
      }
      // 4. 眨巴眼
      if(bin.substring(3,4)==1){
        situation+='-检测闭眼频率'
        if(!(that.data.local_eye_freq_isWarning)){
          that.data.local_total_eye_freq+=1
            that.setData({
              local_eye_freq_isWarning:true
            })
            that.innerAudioContext = wx.createInnerAudioContext()
            that.innerAudioContext.src = '/audio/warning.mp3'
            that.innerAudioContext.obeyMuteSwitch = false
            that.innerAudioContext.play();
            // 一闪一闪
              setTimeout(function(){
                that.setData({
                  eye_freq_colorChange:'bg-brown'
                })
              },6000)
                that.setData({
                  eye_freq_colorChange:'bg-gradual-blue'
                })

            setTimeout(function(){
              that.setData({
                local_eye_freq_isWarning:false
              })
            },6000)
        }
      }
    }
      console.log(situation)
      })
  },

  Send_start: function () {
    var that = this
    that.data.connectedDeviceId = app.globalData.connectedDeviceId
    that.data.name = app.globalData.name
    console.log(that.data.connectedDeviceId)
    console.log(that.data.name)
    console.log("^^看看全球变量有没有赋值成功")
    that.setData({
      hasStartedDetection:true
    })
    if (that.data.connected) {
      var buffer = new ArrayBuffer(5)
      var dataView = new Uint8Array(buffer)

      that.data.start = true
      for (var i = 0; i < 5; i++) {
        dataView[i] = "start".charCodeAt(i)
      }

      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.services[0].uuid,
        characteristicId: that.data.characteristics[1].uuid,
        value: buffer,
        success: function (res) {
          console.log('发送指令成功:'+ res.errMsg)
          wx.showModal({
            title: '开始检测',
            content: ''
          })        
        },
        fail: function (res) {
          // fail
          //console.log(that.data.services)
          console.log('message发送失败:' +  res.errMsg)
          wx.showToast({
            title: '开始检测失败，请稍后重试',
            icon: 'none'
          })
        }       
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '蓝牙已断开',
        showCancel: false,
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },

  stopDetection:function(){
    console.log("Stop!")
    var that = this
    wx.showModal({
      title: '确定结束检测',
      confirmText:'确认结束',
      cancelText:'返回检测',
      content: '您本次驾驶到目前为止共有危险驾驶征兆'+(that.data.local_total_eye+that.data.local_total_eye_freq+that.data.local_total_yaw_freq)+'次！',
      success:function(res){
        if(res.confirm){
          console.log("成功取消")
          console.log(res.confirm)
            if (that.data.connected) {
            var buffer = new ArrayBuffer(3)
            var dataView = new Uint8Array(buffer)
      
            for (var i = 0; i < 3; i++) {
              dataView[i] = "end".charCodeAt(i)
            }
            that.data.start = false
      
            wx.writeBLECharacteristicValue({
              deviceId: that.data.connectedDeviceId,
              serviceId: that.data.services[0].uuid,
              characteristicId: that.data.characteristics[1].uuid,
              value: buffer,
              success: function (res) {
                console.log('发送指令成功:'+ res.errMsg)
              },
              fail: function (res) {
                // fail
                //console.log(that.data.services)
                console.log('message发送失败:' +  res.errMsg)
                wx.showToast({
                  title: '结束检测失败，请稍后重试',
                  icon: 'none'
                })
              }       
            })
          }
          that.data.local_total_detected = that.data.local_total_eye+that.data.local_total_eye_freq+that.data.local_total_yaw_freq
          app.globalData.temp_total_detected = that.data.local_total_detected
          app.globalData.temp_total_eye_freq = that.data.local_total_eye_freq
          app.globalData.temp_total_yaw_freq = that.data.local_total_yaw_freq
          app.globalData.temp_total_eye = that.data.local_total_eye
          that.data.local_time = util.formatTime(new Date());
          app.globalData.temp_time = that.data.local_time
          console.log("全球变量已储存：that.data.local_time"+app.globalData.temp_time)

          // 将数据存进云数据库
          db.collection("xinghuo1").add({
            data:{
              total_detected:that.data.local_total_detected,
              time:that.data.local_time
            }
          }).then(res=>{
            // 用then({callback..})处理回调会看起来清楚一点
            console.log(res) // 如果add成功，一般会res一个id值
          })

          wx.redirectTo({
            url: '/pages/board/board?total_detected='+that.data.local_total_detected,
          })
        }
        if(res.cancel){
          console.log("返回检测")
        }
      }
    })     
  }

})
