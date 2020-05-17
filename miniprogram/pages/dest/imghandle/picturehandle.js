Page({
  data: {
    // 参与页面渲染的数据
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
        const ctx = wx.createCanvasContext('cutImg');
        ctx.setGlobalAlpha(0.4)
        var src = res.tempFilePaths[0];
        _this.data.img = src;
        //获取当前屏幕宽度
        var phoneW = Number(wx.getSystemInfoSync().windowWidth*90)/100;
        var cutH = 150;
        wx.getImageInfo({
            src: src,
            success: function (res) {
              var w = phoneW;
              var h = (phoneW/Number(res.width))*Number(res.height)
              ctx.save();
              ctx.drawImage(src, 0, 0, w, h);
              ctx.restore();
              ctx.setFillStyle('red');
              ctx.fillRect(0, 0, phoneW, cutH);
              ctx.draw();
              _this.setData({
                  canvasW:w,
                  canvasH:h,
                  img:src,
                  cutH:cutH,
                  prienFlag:true,
                  alreay:true
              });
            }
        });
      },
      fail: e => {
        console.error(e);
      }
    })
  },
  // 点击确认裁剪图片
  okCutImg:function(){
    var that = this;
    var canvasW = that.data.canvasW;
    var canvasH = that.data.canvasH;
    var nowCutW = that.data.cutType?canvasW:that.data.nowCutW;
    var nowCutH = that.data.cutType?that.data.cutH:that.data.nowCutH;
    var cutX = that.data.cutX;
    var cutY = that.data.cutY;
    const ctx = wx.createCanvasContext('cutImg');
    ctx.setGlobalAlpha(1)
    ctx.drawImage(that.data.img, 0, 0, canvasW, canvasH)
    ctx.draw()
    wx.canvasToTempFilePath({
        x: cutX,
        y: cutY,
        width: nowCutW,
        height: nowCutH,
        destWidth: nowCutW,
        destHeight: nowCutH,
        canvasId: 'cutImg',
        success: function(res) {
          var src = res.tempFilePath;
          that.data.resultImg = src;
          that.setData({
            cutImgUrl:src,
            prienFlag:false,
            alreay:false
          });
        } 
    })
  },
  // 点击红框开始移动
  canvasMove:function(e){
    var that = this;
    var canvasW = that.data.canvasW;
    var canvasH = that.data.canvasH;
    var nowCutW = that.data.cutType?canvasW:that.data.nowCutW;
    var nowCutH = that.data.cutType?that.data.cutH:that.data.nowCutH
    var touches = e.touches[0];  
    var x = touches.x;
    var y = touches.y-(Number(nowCutH)/2);
    that.data.cutType?x=0:x=x-(Number(nowCutW)/2);
      that.setData({
        cutX:x,
        cutY:y
    })
    const ctx = wx.createCanvasContext('cutImg');
    ctx.setGlobalAlpha(0.4)
    ctx.drawImage(that.data.img, 0, 0, canvasW, canvasH)
    ctx.setFillStyle('red')
    ctx.fillRect(x, y, nowCutW, nowCutH)
    ctx.draw()
  },
  //等屏裁剪
  etcType:function(){
    var that = this;
    var propor = 100;
    var canvasW = that.data.canvasW;
    var canvasH = that.data.canvasH;
    var cutH = that.data.cutH;
    var nowCutW = (Number(canvasW)*propor)/100
    var nowCutH = (Number(cutH)*propor)/100
    const ctx = wx.createCanvasContext('cutImg');
    ctx.setGlobalAlpha(0.4)
    ctx.drawImage(that.data.img, 0, 0, canvasW, canvasH)
    ctx.setFillStyle('red')
    ctx.fillRect(0, 0, nowCutW, nowCutH)
    ctx.draw()
    that.setData({
      nowCutW:nowCutW,
      nowCutH:nowCutH,
      cutType:true
    })
  },
  areaType:function(){
    var that = this;
    var propor = that.data.propor;
    var canvasW = that.data.canvasW;
    var canvasH = that.data.canvasH;
    var cutH = that.data.cutH;
    var nowCutW = (Number(canvasW)*propor)/100
    var nowCutH = (Number(cutH)*propor)/100
    const ctx = wx.createCanvasContext('cutImg');
    ctx.setGlobalAlpha(0.4)
    ctx.drawImage(that.data.img, 0, 0, canvasW, canvasH)
    ctx.setFillStyle('red')
    ctx.fillRect(0,0, nowCutW, nowCutH)
    ctx.draw()
    that.setData({
     nowCutW:nowCutW,
     nowCutH:nowCutH,
     cutType:false
    })
   },
   areaChange:function(e){
    var that = this;
    var propor = e.detail.value;
    var canvasW = that.data.canvasW;
    var canvasH = that.data.canvasH;
    var cutH = that.data.cutH;
    var nowCutW = (Number(canvasW)*propor)/100
    var nowCutH = (Number(cutH)*propor)/100
    const ctx = wx.createCanvasContext('cutImg');
    ctx.setGlobalAlpha(0.4)
    ctx.drawImage(that.data.img, 0, 0, canvasW, canvasH)
    ctx.setFillStyle('red')
    ctx.fillRect(that.data.cutX||0, that.data.cutY||0,nowCutW, nowCutH)
    ctx.draw()
    that.setData({
     nowCutW:nowCutW,
     nowCutH:nowCutH,
     propor:propor
    })
   },
   // 重新裁剪
   againBtn:function(){
      var that = this;
      var data = that.data
      this.setData({
        prienFlag:true,
        alreay:true
      });
      const ctx = wx.createCanvasContext('cutImg');
      ctx.setGlobalAlpha(0.4)
      ctx.drawImage(data.img, 0, 0, data.canvasW, data.canvasH)
      ctx.setFillStyle('red')
      ctx.fillRect(that.data.cutX||0, that.data.cutY||0, data.nowCutW||data.canvasW, data.nowCutH||data.cutH)
      ctx.draw()
   },
   //确认
   okBtn : function() {
       var $this = this;
       console.log($this.data.resultImg);
       wx.showToast({
        title: $this.data.resultImg,
        icon: 'loading',
        duration: 2000
      });
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面
      prevPage.cutImgHandle($this.data.resultImg);
      wx.navigateBack({
        delta: 1  // 返回上一级页面。
      })
   },
  
})