Page({
  data: { // 参与页面渲染的数据
    // logs: []
    msg:'初始化'
  },
  onLoad: function () {
    // 页面渲染后 执行
    this.setData({ msg: "demo" });
  }
})