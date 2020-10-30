const app = getApp()
// 云服务
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:'',
    userInfo:{},
    history:{},
    local_total_detected:'',
    local_total_eye_freq:'',
    local_total_yaw_freq:'',
    local_total_eye:'',
    local_time:''
  },

  getOpenid(){
    let that = this;
    wx.cloud.callFunction({
      name:'getOpenId',
      complete:res=>{
        console.log('云函数获取到的openid:',res.result.openid)
        var openid = res.result.openid;
        that.setData({
          openid:openid
        })
      }
    })
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenid();
    var that = this
    that.setData({
      userInfo:app.globalData.userInfo,
      local_total_detected:app.globalData.temp_total_detected,
      local_total_eye_freq:app.globalData.temp_total_eye_freq,
      local_total_yaw_freq: app.globalData.temp_total_yaw_freq,
      local_total_eye:app.globalData.temp_total_eye, 
      local_time:app.globalData.temp_time
    })
    // 判断本次有没有检测
    if(that.data.local_time.length==0){
      that.setData({
        local_time:'1'
      })
    }

    // 从服务器获取历史报告数据
    db.collection("xinghuo1").where({
      _openid:that.data.openid
    }).get({
      success:res=>{
        that.setData({
          history:res.data
        })
        // console.log(that.data.dataObjectFromCloud)
        // for(var i=0;i<that.data.dataObjectFromCloud.length;i++){
        //   that.data.history[that.data.dataObjectFromCloud[i].time] = that.data.dataObjectFromCloud[i].total_detected
        // }
        // console.log(that.data.dataObjectFromCloud[1].time)
        // console.log(that.data.dataObjectFromCloud[1].total_detected)
        // console.log(that.data.history.length)
        console.log(that.data.history)
      }
    })
  },

  navigateTo_poster:function(){
    wx.navigateTo({
      url: '/pages/poster/poster',
    })
  },

  navigateTo_board:function(){
    wx.redirectTo({
      url: '/pages/board/board',
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