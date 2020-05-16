Page({
  data: {
    // 参与页面渲染的数据
    height:0,
    width:0,
    olddistance:'',//上一次两个手指的距离
    newdistance:'',//本次两手指之间的距离，两个一减咱们就知道了滑动了多少，以及放大还是缩小（正负嘛）  
    diffdistance:'', //这个是新的比例，新的比例一定是建立在旧的比例上面的，给人一种连续的假象  
    Scale: 1,//图片放大的比例，
    oldscaleA:0,//图片放大的比例历史记录
    baseHeight:'',//原始高  
    baseWidth:'',//原始宽
    x:'',
    y:'',
    src:'',

    //-----------------------
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
   },


  //手指在屏幕上移动
  scroll: function (e) {
    var _this = this;
    //当e.touches.length等于1的时候，表示是单指触摸，我们要的是双指
    if (e.touches.length == 2) {//两个手指滑动的时候
      var xMove = e.touches[1].clientX - e.touches[0].clientX;//手指在x轴移动距离
      var yMove = e.touches[1].clientY - e.touches[0].clientY;//手指在y轴移动距离
      var distance = Math.sqrt(xMove * xMove + yMove * yMove);//根据勾股定理算出两手指之间的距离  
      if (_this.data.olddistance == 0) {
        _this.data.olddistance = distance; //要是第一次就赋值
      }else {
        _this.data.newdistance = distance; //第二次就可以计算它们的差值了  
        _this.data.diffdistance = _this.data.newdistance - _this.data.olddistance;//两次差值
        _this.data.olddistance = _this.data.newdistance; //计算之后更新比例
        //这条公式是我查阅资料后找到的，按照这条公式计算出来的比例来处理图片，能给用户比较好的体验
        _this.data.Scale = _this.data.oldscaleA + 0.005 * _this.data.diffdistance;
        if (_this.data.Scale > 2.5){//放大的最大倍数
          return;
        } else if (_this.data.Scale < 1) {//缩小不能小于当前
          return;
        }
        //刷新.wxml ，每次相乘，都是乘以图片的显示宽高
        _this.setData({
          height: _this.data.baseHeight * _this.data.Scale,
          width: _this.data.baseWidth * _this.data.Scale
        })
        _this.data.oldscaleA = _this.data.Scale;//更新比例 
      }  
    }
  },
  //手指离开屏幕
  endTou: function (e) {
    this.data.olddistance = 0;//重置
    this.getRect();
    this.generate();
  },
  //用来获取节点信息的方法，用于得到wx.canvasToTempFilePath方法的坐标点
  getRect: function () {
    var _this = this;
    wx.createSelectorQuery().select('.FilePath').boundingClientRect(
      function (rect) {
          _this.data.x = Math.abs(rect.left);//x坐标
          _this.data.y = Math.abs(rect.top);//y坐标
      }).exec();
  },
  generate: function () {
    var _this = this;
    const ctx_A = wx.createCanvasContext('myCanvas_A');
    var baseWidth = _this.data.baseWidth * _this.data.Scale;//图片放大之后的宽
    var baseHeight = _this.data.baseHeight * _this.data.Scale;//图片放大之后的高
    ctx_A.drawImage(_this.data.src, 0, 0, 230, 100);//我们要在canvas中画一张和放大之后的图片宽高一样的图片
    ctx_A.draw();
    wx.showToast({
      title: '截取中...',
      icon: 'loading',
      duration: 10000
    });
    setTimeout(function(){//给延时是因为canvas画图需要时间
      wx.canvasToTempFilePath({//调用方法，开始截取
        x: _this.data.x,
        y: _this.data.y,
        width: 400,
        height: 400,
        destWidth: 400,
        destHeight: 400,
        canvasId: 'myCanvas_A',
        success: function (res) {
          console.log(res.tempFilePath);
          _this.setData({imgSrc:res.tempFilePath});
        }
      });
    }, 2000);
  },
  
})