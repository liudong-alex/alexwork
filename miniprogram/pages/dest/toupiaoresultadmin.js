Page({
  data: {
    countItem:''
  },
  common:{
    util:require('../../utils/commonutil.js'),
  },
  onLoad: function (opt) {
    var _this = this;
    var util = _this.common.util;
    //1.获取到数据库
    var db = util.getDB();
    db.collection('user_show').where({
      toupiao_list_id: opt.toupiao_list_id
    }).get().then(res => {
           if (res.data.length > 0) {
            _this.setData({
              resultUserShow : res.data
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