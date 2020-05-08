Page({
  data: { // 参与页面渲染的数据
    // logs: []
    msg:'初始化',
    itemA: [
      {name: '选项A', value: 'A'}
    ],
    itemB: [
      {name: '选项B', value: 'B'}
    ],
  },
  onLoad: function () {
    // 页面渲染后 执行
    this.setData({ msg: "投票" }); 
    var countItem = wx.getStorageSync('countItem');
    if (!countItem) {
      wx.setStorage({
        key: 'countItem',
        data: {
          countA:0,
          countB:0
        }
      })
    }
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
    this.setCount(e.detail.value);
    var $this = this;
    wx.showModal({
      title: '提示',
      content: msg,
      success: function (res) {
        if (res.confirm) {
          //这里是点击了确定以后
          console.log('用户点击确定');
          wx.navigateTo({
            url: '../work/demo1'
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
setCount:function(e) {
  var $this = this;
  var countA = Number($this.getCount().countA);
  var countB = Number($this.getCount().countB);
  if (e == 'A') {
    countA = countA + 1;
  } else {
    countB = countB + 1;
  }
  wx.setStorage({
    key: 'countItem',
    data: {
      countA: countA,
      countB: countB
    }
  });
},
getCount:function(e) {
  var countItem = wx.getStorageSync('countItem');
  console.log(countItem);
  return countItem;
}

})