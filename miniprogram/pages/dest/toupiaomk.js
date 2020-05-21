Page({
  data: {
    userInfo: {},
    toupiaoList:[],
    auth:'',
  },
  common:{
    util:require('../../utils/commonutil.js'),
  },
  onLoad: function () {
    // 页面渲染后 执行
    this.setData({ msg: "投票任务列表" });
    var _this = this;
    var userInfo = _this.common.util.getCache('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请点击头像登录',
        icon:'none',
        duration:10000
      })
      setTimeout(function(){
        wx.hideToast()
        wx.navigateBack({
          delta: 1  // 返回上一级页面。
        })
      },1000)
      return;
    } else {
      _this.data.userInfo = userInfo;
      _this.data.auth = userInfo.auth;
      _this.setData({
        auth:userInfo.auth
      });
      var db = _this.common.util.getDB();
      db.collection('toupiao_list').get({
        success: function(res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data);
          var toupiaoArray = res.data;
          if (toupiaoArray.length > 0) {
            _this.data.toupiaoList = toupiaoArray;
            _this.setData({
              noDataViewHidden:true,
              toupiaoList:_this.data.toupiaoList,
              nobtnViewHidden:false,
              showInput:false,
              showCK:true
            });
          } else {
            _this.setData({
              noDataViewHidden:false,
              nobtnViewHidden:false,
              noData:'无数据，请使用管理员身份添加'
            });
          }
        }
      });
    }
  },
  //添加按钮
  addToupiaoMoudle: function (e) {
    var _this = this;
    var value = e.detail.value;
    _this.data.toupiaoList.push({
      // 'title':'请设置主题',
      'state':'none'
    });
    _this.setData({
      noDataViewHidden:true,
      toupiaoList:_this.data.toupiaoList,
      nobtnViewHidden:true,
      showInput:true,
      showCK:false
    });
    // wx.showToast({
    //   title: '添加成功',//提示文字
    //   duration:2000,//显示时长
    //   mask:true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    //   icon:'success', //图标，支持"success"、"loading"  
    //   // success:function(){ },//接口调用成功
    //   // fail: function () { },  //接口调用失败的回调函数  
    //   // complete: function () { } //接口调用结束的回调函数  
    // })
  },
  //输入事件
  inputHandle: function(e) {
   var dataIndex = e.currentTarget.dataset.index;
   var toupiaoModel = this.data.toupiaoList[dataIndex];
   if (toupiaoModel) {
     toupiaoModel.state = 'update',
     toupiaoModel.title = e.detail.value;
   }
  },
  //保存--只保存不允许修改
  saveHandle:function(e){
    var dataIndex = e.currentTarget.dataset.index;
    var toupiaoModel = this.data.toupiaoList[dataIndex];
    if (toupiaoModel && toupiaoModel.state != 'none') {
      toupiaoModel.create_time = new Date();
      toupiaoModel.modfiy_time = new Date();
      toupiaoModel.state = 'none';
      this.saveModel(toupiaoModel, dataIndex);
    }
  },
  saveModel:function(data, index) {
    wx.showLoading({
      title: '正在保存',
      mask: true
    });
    var _this = this;
    var db = this.common.util.getDB();
    db.collection('toupiao_list').add({
      data: data,
      success: function(res) {
        _this.data.toupiaoList[index]._id = res._id;
        _this.setData({
          nobtnViewHidden:false,
          toupiaoList: _this.data.toupiaoList,
          showCK:true
        });
        wx.hideLoading();
      }
    });
  },
  tabHandle:function(e) {
    var dataIndex = e.currentTarget.dataset.index;
    var toupiaoModel = this.data.toupiaoList[dataIndex];
    var userInfo = this.common.util.getCache('userInfo');
    var db = this.common.util.getDB();
    db.collection('user_show').where({
      user_open_id: userInfo.openid,
      toupiao_list_id:toupiaoModel._id
    }).get().then(res => {
        if (res.data.length > 0) {
          wx.showModal({
            title: '提示',
            content: '每人仅能投一票',
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: 'toupiaoresult?toupiao_list_id=' + toupiaoModel._id
                });
              } else {
                wx.redirectTo({
                  url: '../index/index'
                });
              }
            }
          });
        } else {
          wx.navigateTo({
            url:'toupiao?toupiao_list_id=' + toupiaoModel._id
          })
        }
    });
  },
  
})