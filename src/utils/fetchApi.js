import wepy from 'wepy';
import service from '@/utils/service'
const AJAX_SUCCESS = 200;
const NO_LOGIN = 103;
let common = null;

function makeOpenUdid() {
  let arr = [];
  [6, 4, 4, 4].forEach((el) => {
    let randomStr = getRandomStr(el);
    arr.push(randomStr)
  })
  let stamp = new Date().getTime();
  arr.push(stamp)
  return arr.join('-')
}

function getRandomStr(len) {
  let str = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let length = str.length;
  if (len > length) {
    return ''
  } else {
    let res = '';
    for (var i = 0; i < len; i++) {
      let random = Math.ceil(Math.random() * length);
      res += str.substring(random, random + 1)
    }
    return res;
  }
}
/**
 *
 * @param {*} data url、method、data
 * @param {*} param
 */
export default function fetchApi(req, param) {
  /**
   * @desc wepy对获取storage进行了封装，即使没有key，也会返回 '' 在这里默认为{}
   */
  if(!req.url){
    return;
  }
  req.method = req.method ? req.method : 'POST';
  let loginData = service.getStorage('loginData') || {};
  if (!loginData.udid) {
    let udid = makeOpenUdid();
    loginData = Object.assign(loginData, {
      udid: udid
    })
    service.setStorage('loginData', loginData);
  }
  if (!common) {
    let systemInfo = wepy.getSystemInfoSync();
    common = {
      deviceType: systemInfo.model,
      platform: systemInfo.platform == 'devtools' ? 'iOS' : systemInfo.platform,
      systemVersion: systemInfo.system,
      clientVersion: systemInfo.version,
      w: systemInfo.windowWidth,
      h: systemInfo.windowHeight,
      role: 1,
      fromType: 1,
      channel: "weixin"
    }
  }
  req.header = {
    'content-type': 'application/x-www-form-urlencoded'
  }
  /**
   * 设置处理状态码以及返回值参数
   */
  let params = Object.assign({
    intercept:true,
    needLogin: true,
    important: false // 业务和公参那个优先级高
  }, param);
  /**
   * 将公参和用户登录信息以及业务信息合并到一起
   */
  req.data = req.data ? req.data : {}
  if(params.important){
    req.data = Object.assign({},common,loginData,req.data);
  }else{
    Object.assign(req.data,common,loginData);
  }

  return new Promise((resolve, reject) => {
    wepy.request(req).then((res) => {
      if (res.statusCode === AJAX_SUCCESS) {
        let data = res.data;
        if (params.needLogin && data.error.returnCode == NO_LOGIN) {
          wepy.showModal({
            title: '提示',
            content: '登录状态已失效，是否重新登录？',
          }).then((res) => {
            if (res.confirm) {
              service.upDateLoginData({
                memberID: -1
              })
              wepy.navigateTo({
                url: '/pages/login/login'
              })
            }
          })
        } else if (params.intercept) {
          if (data.error && data.error.returnCode == 0) {
            resolve(data);
          } else {
            wepy.showToast({
              icon: 'none',
              title: data.error.returnUserMessage
            });
            reject(data);
          }
        } else {
          resolve(data);
        }
      } else {
        wepy.showToast({
          icon: 'none',
          title: res.errMsg
        })
      }
    })
  })
}
