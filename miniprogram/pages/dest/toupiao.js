Page({
  data: {
    toupiao_list_id:'',
    showProsArray:[],
    auth:'',
  },
  common:{
    util:require('../../utils/commonutil.js'),
  },
  onLoad: function (options) {
    // 页面渲染后 执行
    this.setData({ msg: "为喜爱的作品投票" });
    var $this = this;
    var util = $this.common.util;
    $this.data.toupiao_list_id = options.toupiao_list_id;
    $this.data.auth = util.getCache('userInfo').auth;
    var db = util.getDB();
    db.collection('show_pro').where({
      toupiao_list_id: options.toupiao_list_id
    }).get().then(res => {
           console.log("作品表所有数据",res);
           if (res.data.length > 0) {
            $this.setData({
              showPros : res.data,
              auth:$this.data.auth
            });
            $this.data.showProsArray = res.data;
           } else {
            $this.setData({
              noDataViewHidden : false,
              noData : '暂无参赛作品',
              auth:$this.data.auth
            });
           }
    });
  },
  // radio事件
  radioChange: function (e) {
    var $this = this;
    var value = e.detail.value;
    wx.showModal({
      title: '提示',
      content: '确认投票？',
      success: function (res) {
        if (res.confirm) {
          $this.setCount(value);
        } else {
          wx.redirectTo({
            url: '../index/index'
          });
        }
      }
    });
  },
  setCount:function(value) {
    var $this = this;
    var strArray = value.split('_');
    var _id = strArray[0];
    var count = strArray[1];
    //1.获取到数据库
    var util = require('../../utils/commonutil.js');
    var db = util.getDB();
    db.collection('show_pro').doc(_id).update({
      data: {
        count : Number(count) + 1
      },
      success: function(res) {
        $this.saveUserShow(value);
        wx.redirectTo({
          url: '../dest/toupiaoresult?toupiao_list_id=' + _this.data.toupiao_list_id
        });
      },
      fail: function(err) {
        console.error('[数据库] [更新记录] 失败：', err);
      }
    });
  },
  //保存投票人和内容关联表
  saveUserShow:function(value){
    var _this = this;
    var strArray = value.split('_');
    var _id = strArray[0];//作品ID
    var count = strArray[1];//票数
    var userInfo = _this.common.util.getCache('userInfo');
    var showProsArray = _this.data.showProsArray;
    var showImg = {};
    showProsArray.forEach(function(item, index){
      if (item._id === _id) {
        showImg = item;
        return;
      }
    });
    var data = {
      'toupiao_list_id': _this.data.toupiao_list_id,
      'user_open_id':userInfo.open_id,
      'user_name':userInfo.nickName,
      'user_photo_url':userInfo.avatarUrl,
      'user_show_detil':[{
        'show_id':_id,
        'show_count':count,
        'show_name':showImg.name,
      }]
    };
    var db = _this.common.util.getDB();
    db.collection('user_show').add({
      data: data,
      success: function(res) {
        wx.redirectTo({
          url: '../dest/toupiaoresult?toupiao_list_id=' + _this.data.toupiao_list_id
        });
      },
    });
  },
  
})