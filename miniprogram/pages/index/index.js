//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    auth:'',
  },
  common:{
    util:require('../../utils/commonutil.js'),
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    var _this = this;
    var util = require('../../utils/commonutil.js');
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              var userInfo = res.userInfo;
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
              // 调用云函数
              wx.cloud.callFunction({
                name: 'login',
                data: {},
                success: res => {
                  app.globalData.openid = res.result.openid;
                  userInfo.openid = res.result.openid;
                  var db = util.getDB();
                  db.collection('auth_user').where({
                    open_id: userInfo.openid
                  }).get({
                    success: function(res) {
                      // res.data 是包含以上定义的两条记录的数组
                      console.log(res.data);
                      if (res.data && res.data.length > 0) {
                        _this.data.auth = res.data[0].auth;
                        _this.setData({
                          auth: _this.data.auth
                        });
                        userInfo.auth = _this.data.auth;
                      }else{
                        _this.data.auth = 'none'
                        _this.setData({
                          auth: 'none'
                        });
                        userInfo.auth = 'none';
                      }
                      util.setCache('userInfo', userInfo);
                    }
                  })
                },
                fail: err => {
                  console.error('[云函数] [login] 调用失败', err);
                }
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      var _this = this;
      var util = require('../../utils/commonutil.js');
      var userInfo = e.detail.userInfo;
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      // 调用云函数
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData.openid = res.result.openid;
          userInfo.openid = res.result.openid;
          var db = util.getDB();
          db.collection('auth_user').where({
            open_id: userInfo.openid
          }).get({
            success: function(res) {
              // res.data 是包含以上定义的两条记录的数组
              console.log(res.data);
              if (res.data && res.data.length > 0) {
                _this.data.auth = res.data[0].auth;
                _this.setData({
                  auth: _this.data.auth
                });
                userInfo.auth = _this.data.auth;
              }else{
                _this.setData({
                  auth: 'none'
                });
                userInfo.auth = 'none';
              }
              util.setCache('userInfo', userInfo);
            }
          })
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err);
        }
      })
      
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
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
        var util = require('../../utils/commonutil.js');
        var id = util.wxuuid();
        // 上传图片
        const cloudPath = id + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
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
    let db = wx.cloud.database({
      env: 'alex-liu-demo-vgm6j'
    });
    db.collection('show_pro_index').get().then(res => {
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
            console.log(res.data);
          }
        });
        $this.saveData(showProObj);
      } else {
        db.collection('show_pro_index').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            index: 1
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
     //1.获取到数据库
    let db = wx.cloud.database({
      env: 'alex-liu-demo-vgm6j'
    });
    let showProColl = db.collection('show_pro');
    //3.调动接口上传数据
    showProColl.add({
      //要添加的数据
      data:saveData,
      success(res){
          wx.navigateTo({
            url: '../storageConsole/storageConsole'
          });
      },
      fail(err){
          console.log('数据添加失败',err);
      }
    });
  },
})
