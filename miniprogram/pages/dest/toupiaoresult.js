Page({
  data: { // 参与页面渲染的数据
    countItem:'',
    toupiao_list_id:'',
    auth:'',
  },
  common:{
    util:require('../../utils/commonutil.js'),
  },
  onLoad: function (opt) {
    var $this = this;
    var util = $this.common.util;
    $this.data.toupiao_list_id = opt.toupiao_list_id;
    $this.data.auth = util.getCache('userInfo').auth;
    //1.获取到数据库
    var db = util.getDB();
    db.collection('show_pro').where({
      toupiao_list_id: opt.toupiao_list_id
    }).get().then(res => {
           if (res.data.length > 0) {
            this.setData({
              resultPros : res.data,
              auth:$this.data.auth
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
  tabResult:function(){
    var toupiao_list_id = this.data.toupiao_list_id;
    wx.redirectTo({
      url: 'toupiaoresultadmin?toupiao_list_id=' + toupiao_list_id
    });
  }
})