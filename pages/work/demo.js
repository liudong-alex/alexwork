Page({
  data: { // 参与页面渲染的数据
    // logs: []
    msg:'初始化',
    itemA: [
      {name: '选项A', value: 'A'}
    ],
    itemB: [
      {name: '选项B', value: 'B'}
    ]
  },
  onLoad: function () {
    // 页面渲染后 执行
    this.setData({ msg: "投票" });
  },
  // radio事件
 radioChange: function (e) {
  var msg = '';
  if(e.detail.value== 'A'){
    this.setData({
      msg:'给A投票+1'
    });
    msg = '给A投票+1';
  }else{
    this.setData({
      msg:'给B投票+1'
    });
    msg = '给B投票+1';
  };
  wx.showModal({
    title: '提示',
    content: msg,
    success: function (res) {
      if (res.confirm) {
        //这里是点击了确定以后
        console.log('用户点击确定');
        wx.navigateTo({
          url: '../index/index'
        });
      } else {
        //这里是点击了取消以后
        console.log('用户点击取消');
        wx.navigateTo({
          url: '../index/index'
        });
      }
    }
  });
},

})