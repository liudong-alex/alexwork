Page({
  data: { // 参与页面渲染的数据
    countItem:''
  },
  onLoad: function () {
    // 页面渲染后 执行
    var countItem = wx.getStorageSync('countItem');
    var msg = 'A票数：' + countItem.countA + ' B票数：' + countItem.countB;
    this.setData({ countItem: msg }); 
  },
  backIndex: function() {
    //跳转页面
    wx.redirectTo({
      url: '../index/index'
    })
  },
})