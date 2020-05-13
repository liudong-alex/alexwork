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
    let db = wx.cloud.database({
       env: 'alex-liu-demo-vgm6j'
    });
    let mycol = db.collection('img-pro');
    mycol.get({
       success(res){
           console.log("获取数据",res);
           $this.setData({ urlA: res.data[0].url });
           $this.setData({ urlB: res.data[1].url });
       },
       fail(err){
           console.log(err)
       }
    });
  },
  // radio事件
 radioChange: function (e) {
    var msg = '';
    if(e.detail.value== 'A'){
      this.setData({
        msg:'给A投票+1'
      });
      msg = '给A投票+1';
      this.data.countA = this.data.countA + 1;
    }else{
      this.setData({
        msg:'给B投票+1'
      });
      msg = '给B投票+1';
      this.data.countB = this.data.countB + 1;
    };
    var $this = this;
    wx.showModal({
      title: '提示',
      content: msg,
      success: function (res) {
        if (res.confirm) {
          //这里是点击了确定以后
          // console.log('用户点击确定');
          $this.setCount(e.detail.value);
        } else {
          //这里是点击了取消以后
          // console.log('用户点击取消');
          wx.redirectTo({
            url: '../index/index'
          });
        }
      }
    });
},
setCount:function(e) {
  var $this = this;
  //1.获取到数据库
  let db = wx.cloud.database({
    env: 'alex-liu-demo-vgm6j'
  });
  let mycol = db.collection('toupiao');
  mycol.get({
    success(res){
        console.log("获取数据",res);
        $this.addData(res, e);
    },
    fail(err){
        console.log(err);
    }
 });
},
addData:function(data, flg) {
  var $this = this;
  let db = wx.cloud.database({
    env: 'alex-liu-demo-vgm6j'
  });
  //2.链接数据库中的集合(表)
  let mycollection = db.collection('toupiao');

  var saveData = {};
  if (!data.data || data.data.length == 0) {
    saveData = {'countA':$this.data.countA,'countB':$this.data.countB};
    //3.调动接口上传数据
    mycollection.add({
      //要添加的数据
      data:saveData,
      success(res){
          console.log('数据添加成功',res);
          wx.redirectTo({
            url: '../dest/toupiaoresult'
          });
      },
      fail(err){
          console.log('上传失败',err);
      }
    });
  } else {
      if ('A' == flg) {
        saveData = {countA:data.data[0].countA + 1};
      } else {
        saveData = {countB:data.data[0].countB + 1};
      }
      //先查询再修改
      mycollection.doc(data.data[0]._id).update({
        data: saveData
      }).then(res=>{
          console.log(res)
      });
    }
  },
  
})