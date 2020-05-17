Page({
  data: {
    // 参与页面渲染的数据
    imgW:0,
    imgH:0,

    canvasW:'',
    canvasH:'',
    cutType:'',
    nowCutW:'',
    cutH:'',
    nowCutH:'',
    cutX:'',
    cutY:'',
    img:'',
    propor:'',
    resultImg:'',
    cutCanvasW:'',
    cutCanvasH:'',
    cutSrc:'',
    timer:'',
  },
  onLoad: function () {
    // 页面渲染后 执行
    var $this = this;
    var util = require('../../../utils/commonutil.js');
    var db = util.getDB();
  },
  // 选择图片
  selectImg: function () {
    var _this = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      // sourceType: ['album', 'camera'],
      success: function (res) {
        const ctx = wx.createCanvasContext('backgroungImg');
        // ctx.setGlobalAlpha(0.4)
        var src = res.tempFilePaths[0];
        _this.data.img = src;
        //获取当前屏幕宽度
        var phoneW = Number(wx.getSystemInfoSync().windowWidth*90)/100;
        var cutH = 150;
        wx.getImageInfo({
            src: src,
            success: function (res) {
              var w = phoneW;
              var h = (phoneW/Number(res.width))*Number(res.height);
              _this.data.imgW = res.width;
              _this.data.imgH = res.height;
              // ctx.save();
              ctx.drawImage(src, 0, 0, w, h);
              // ctx.restore();
              // ctx.setFillStyle('red');
              // ctx.fillRect(0, 0, phoneW, cutH);
              ctx.draw();
              _this.setData({
                  canvasW:w,
                  canvasH:h,
                  img:src,
                  cutH:cutH,
                  prienFlag:true,
                  alreay:true,
                  // imgW:res.width,
                  // imgH:res.height
              });
            }
        });
      },
      fail: e => {
        console.error(e);
      }
    })
  },
  // 点击红框开始移动
  canvasMove:function(e){
    var that = this;
    var nowCutW = that.data.nowCutW;
    var nowCutH = that.data.nowCutH;
    var touches = e.touches[0];  
    var x = touches.x;
    var y = touches.y-(Number(nowCutH)/2);
    x=x-(Number(nowCutW)/2);
      that.setData({
        cutX:x,
        cutY:y
    });
    that.data.cutX = x;
    that.data.cutY = y;
    const ctx = wx.createCanvasContext('merageImg');
    ctx.setGlobalAlpha(0.4)
    ctx.drawImage(that.data.cutSrc, x, y, 50, 50)
    ctx.setFillStyle('red')
    ctx.fillRect(x, y, 50, 50)
    ctx.draw()
  },
   //打开裁剪页面
   openPictureHandle:function(){
      wx.navigateTo({url: 'picturehandle'});
   },
   //确认
   okBtn : function() {
       var that = this;
       that.setData({prienFlag:false});
       that.setData({printFlag:true});
       const ctx = wx.createCanvasContext('resultImg', that);
       var phoneW = Number(wx.getSystemInfoSync().windowWidth*90)/100;
       var w = phoneW;
       var h = (phoneW/Number(that.data.imgW))*Number(that.data.imgH);
       ctx.drawImage(that.data.img, 0, 0, w, h);
       ctx.drawImage(that.data.cutSrc, that.data.cutX, that.data.cutY, 50, 50);
       ctx.draw(false,
        
      );
      wx.showLoading({
        title: '正在保存',
        mask: true
      });
      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: that.data.nowCutW,
          height: that.data.nowCutH,
          destWidth: that.data.imgW,
          destHeight: that.data.imgH,
          canvasId: 'resultImg',
          success: function(res) {
            let tempFilePath = res.tempFilePath;
            console.log(tempFilePath);
            that.setData({
              rimgsrc: tempFilePath,
            });
            // 保存到相册
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success(res) {
                // 修改下载状态
                // imgs[index].isDownLoad = true
                wx.hideLoading();
                wx.showModal({
                  title: '温馨提示',
                  content: '图片保存成功，可在相册中查看',
                  showCancel: false,
                  success(res) {
                    wx.clear;
                    that.setData({printFlag:false});
                    // if (res.confirm) {
                    //   that.setData({
                    //     isShow: true
                    //   })
                    // }
                  }
                })
              },
              fail(res) {
                wx.hideLoading();
                wx.showModal({
                  title: '温馨提示',
                  content: '图片保存失败，请重试',
                  showCancel: false
                })
              }
            });
          },
          fail: function(res) {
            console.log("生成图片失败 fail fail fail ", res);
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: '图片合成失败，请重试',
              showCancel: false
            });
          }
        })
      },1500);
   },
   //处理返回的裁剪图片
   cutImgHandle : function(url) {
      var $this = this;
      $this.data.cutSrc = url;
      var phoneW = Number(wx.getSystemInfoSync().windowWidth*90)/100;
      wx.getImageInfo({
        src: url,
        success: function (res) {
          var w = phoneW;
          var h = (phoneW/Number(res.width))*Number(res.height)
          const ctx = wx.createCanvasContext('merageImg');
          ctx.setGlobalAlpha(0.4)
          ctx.drawImage(url, 0, 0, 50, 50)
          ctx.setFillStyle('red')
          ctx.fillRect(0, 0, 50, 50)
          ctx.draw();
          $this.data.cutCanvasW = 50;
          $this.data.canvasH = 50;
        }
      });
   },
  
})