Page({
  data: { // 参与页面渲染的数据
    countItem:''
  },
  onLoad: function () {
    var $this = this;
    // 页面渲染后 执行
    // var countItem = wx.getStorageSync('countItem');
    //1.获取到数据库
    let db = wx.cloud.database({
      env: 'alex-liu-demo-vgm6j'
    });
    let mycol = db.collection('toupiao');
    mycol.get({
      success(res){
          console.log("获取数据",res);
          var msg = 'A票数：' + res.data[0].countA + ' B票数：' + res.data[0].countB;
          $this.setData({ countItem: msg }); 
      },
      fail(err){
          console.log(err);
      }
    });
    
  },
  backIndex: function() {
    //跳转页面
    wx.redirectTo({
      url: '../index/index'
    })
  },
})