const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    correctWidth:'',//废弃
    shareImage: '', //用于保存
    startDraw:false,
    path:'404',
    bwidth:'',
    bheight:'',
    avapath:'404',
    times:'10',
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    //用户手机：
    clientWinWidth:'',
    clientWinHeight:''
  },

  navigateTo_history:function(){
    wx.redirectTo({
      url: '/pages/history/history',
    })
  },

  // 废弃，直接在onLoad中获取资源
  startDraw:function(){  
    var that = this
    // 背景图片：每天更换   
    wx.getImageInfo({
      src: 'https://636c-cloud1-nhw9y-1302995240.tcb.qcloud.la/poster2.png?sign=c33e5557e10646ec01be75d9a0332ac9&t=1598765891',
      success:function(res){
        that.setData({
          path:res.path,
          bwidth:res.width,
          bheight:res.height
        })  
      }
    })
    // 用户头像
    wx.getImageInfo({
      src: app.globalData.userInfo.avatarUrl+'',
      success:function(res){
        that.setData({
          avapath:res.path
        })
      }
    })
  },
  draw:function(){
    var that = this 
    that.setData({
      startDraw:true
    })
    // 底板图片  
    const canvasContext = wx.createCanvasContext('shareCanvas')
    canvasContext.drawImage(that.data.path, 0, 0, 
      that.data.clientWinWidth,
      that.data.bheight,
      that.data.bwidth,
      that.data.bheight)

    // 提醒文字
    canvasContext.setTextAlign('center') // 文字居中，左右居然是反的
    canvasContext.setFillStyle('#FFFFFF') // 文字颜色
    canvasContext.setFontSize(22) // 文字字号：22px
    // x-axis: 150; y-axis:200
    canvasContext.fillText("星火智行-陪伴您安全出行", 200, 100)
    canvasContext.setFontSize(15) // 文字字号: 15px
    canvasContext.fillText("您本次出行共计危险行为"+app.globalData.temp_total_detected+"次！", 200, 150) 

    // 之后再画吧, 微信的cavas太垃圾了
    // canvasContext.fillText("眨眼频率过低为"+that.data.times+"次！", 150, 270) 
    // canvasContext.fillText("打哈欠过多为"+that.data.times+"次！", 150, 290) 

    // 用户头像
    const qrImgSize = 50
    that.circleImg(canvasContext,that.data.avapath, 20, 20, 27)
    // canvasContext.drawImage(that.data.avapath, 100, 200, qrImgSize, qrImgSize)
    canvasContext.stroke()
    canvasContext.draw()
  },
  circleImg: function (ctx, img, x, y, r){
    ctx.save()
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.restore()
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    var width = (that.data.clientWinHeight)*(that.data.clientWinWidth/that.data.bwidth)
    that.setData({
      userInfo:app.globalData.userInfo,
      clientWinWidth:app.globalData.clientWinWidth,
      clientWinHeight:app.globalData.clientWinHeight,
      correctWidth:width
    })
    // 获取资源
        // 背景图片：每天更换   
    wx.getImageInfo({
      src: 'https://636c-cloud1-nhw9y-1302995240.tcb.qcloud.la/poster2.png?sign=c33e5557e10646ec01be75d9a0332ac9&t=1598765891',
      success:function(res){
        that.setData({
          path:res.path,
          bwidth:res.width,
          bheight:res.height
        })  
      }
    })
    // 用户头像
    wx.getImageInfo({
      src: that.data.userInfo.avatarUrl+'',
      success:function(res){
        that.setData({
          avapath:res.path
        })
      }
    })   
  },

  daochu: function () {

    var that = this;
    
    wx.canvasToTempFilePath({
    
    x: 0,
    
    y: 0,
    
    canvasId: 'shareCanvas',
    
    fileType: 'jpg',
    
    quality: 1,
    
    success: function (res) {
    
    that.setData({
    
    shareImage: res.tempFilePath
    
    })
    
    setTimeout(function(){
    
    wx.showModal({
    
    title: '提示',
    
    content: '请将这份海报分享给您的家人与朋友，请他们一起监督您安全驾驶！',
    
    success(res) {
    
    if (res.confirm) {
    
    that.eventSave()
    
    } else if (res.cancel) {
    
    console.log('用户点击取消')
    
    }
    
    }
    
    })
    
    },500)
    
    }
    
    })
    
    },
    
    // 将商品分享图片保存到本地
    
    eventSave() {
    
    wx.saveImageToPhotosAlbum({
    
    filePath: this.data.shareImage,
    
    success(res) {
    
    wx.showToast({
    
    title: '保存图片成功',
    
    
    duration: 2000
    
    })
    
    }
    
    })
    
    },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})