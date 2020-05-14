Page({
  data: { // 参与页面渲染的数据
    countItem:''
  },
  onLoad: function () {
    var $this = this;
    //1.获取到数据库
    var util = require('../../utils/commonutil.js');
    var db = util.getDB();
    db.collection('show_pro').get().then(res => {
           if (res.data.length > 0) {
            this.setData({
              resultPros : res.data
            });
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