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
      'user_open_id':userInfo.openid,
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

  // 上传图片
  doUpload: function () {
    var $this = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0];
        var util = $this.common.util;
        var id = util.wxuuid();
        // 上传图片
        const cloudPath = id + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res);
            $this.saveShowPro(res);
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  //保存图片并生成作品对象
  saveShowPro: function(saveData) {
    var $this = this;
    //1.获取到数据库
    let db = $this.common.util.getDB();
    db.collection('show_pro_index').where({
      toupiao_list_id:$this.data.toupiao_list_id
    }).get().then(res => {
      if (res.data.length > 0) {
        var index = res.data[0].index + 1;
        //处理作品对象
        var showProObj = {
          'proindex' : index,
          'url' : saveData.fileID,
          'name' : index + '号作品',
          'count' : 0
        };
        db.collection('show_pro_index').doc(res.data[0]._id).update({
          data: {
            index : index
          },
          success: function(res) {
            console.log(res);
          }
        });
        $this.saveData(showProObj);
      } else {
        db.collection('show_pro_index').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            index: 1,
            toupiao_list_id:$this.data.toupiao_list_id
          },
          success: function(res) {
            //处理作品对象
            var showProObj = {
              'proindex' : 1,
              'url' : saveData.fileID,
              'name' : '1号作品',
              'count' : 0
            };
            $this.saveData(showProObj);
          }
        });
      }
    });
  },
  saveData : function (saveData) {
    var _this = this;
      //1.获取到数据库
    let db = _this.common.util.getDB();
    let showProColl = db.collection('show_pro');
    saveData.toupiao_list_id =_this.data.toupiao_list_id
    //3.调动接口上传数据
    showProColl.add({
      //要添加的数据
      data:saveData,
      success(res){
          saveData._id = res._id;
          _this.data.showProsArray.push(saveData);
          _this.setData({
            showPros : _this.data.showProsArray,
            noDataViewHidden : true
          });
          wx.hideLoading();
      },
      fail(err){
          console.log('数据添加失败',err);
      }
    });
  },
  //删除图片
  delHandle:function(e){
    var _this = this;
    var dataIndex = e.currentTarget.dataset.index;
    var dataArray = _this.data.showProsArray;
    if (dataArray) {
      var delData = dataArray[dataIndex];
      var delId = delData._id;
      var db = _this.common.util.getDB();
      db.collection('show_pro').doc(delId).remove({
        success: function(res) {
          console.log(res.data);
          dataArray.forEach(function(item, index){
            if (item._id === delId) {
              dataArray.splice(index,1);
              return;
            }
          });
          _this.data.showProsArray = dataArray;
          if (_this.data.showProsArray.length > 0) {
            _this.setData({
              showPros : _this.data.showProsArray,
              noDataViewHidden : true
            });
          } else {
            _this.setData({
              showPros:[],
              noDataViewHidden : false,
              noData : '暂无参赛作品',
            });
          }
          
        },
        fail(err){
          console.log('删除失败',err);
          wx.showToast({
            title: '删除失败',
            icon:'none',
            duration:1500
          })
        }
      })
    }
  }
})