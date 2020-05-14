Page({
  data: { // 参与页面渲染的数据
    // logs: []
    msg:'初始化',
    itemA: [
      {name: '选项A', value: 'A',text:'A作品'}
    ],
    itemB: [
      {name: '选项B', value: 'B',text:'B作品'}
    ],
    countA:0,
    countB:0
  },
  onLoad: function () {
    // 页面渲染后 执行
    this.setData({ msg: "为喜爱的作品投票" });
    var $this = this;
    var util = require('../../utils/commonutil.js');
    var db = util.getDB();
    db.collection('show_pro').get().then(res => {
           console.log("作品表所有数据",res);
           if (res.data.length > 0) {
            this.setData({
              showPros : res.data
            });
           } else {
            this.setData({
              noDataViewHidden : true,
              noData : '暂无参赛作品'
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
      content: '投票成功',
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
        console.log(res.data);
        wx.redirectTo({
          url: '../dest/toupiaoresult'
        });
      },
      fail: function(err) {
        console.error('[数据库] [更新记录] 失败：', err);
      }
    });
 },
  
})