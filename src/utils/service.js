import wepy from 'wepy'
export default{
  isLoginStatus:()=>{
    var res = wepy.getStorageSync('loginData');
    if(res && res.accessToken && res.memberID){
      return true
    }else{
      return false
    }
  },
  dateToStamp: (date,type) => {
    /**
     * @params type  时间戳类型 1 ==>> php(秒) 2 ==>> java(毫秒)
     */
    type = type ? type : 1
    if(date){
      let stamp = new Date(date).getTime()
      let level = type == 1 ? 1000 : 1
      return stamp / level
    }
    return ''
  },
  stampToDate: (stamp,conSymbol) => {
    conSymbol = conSymbol ? conSymbol : '-'
    var date = new Date(stamp);
    let Y = date.getFullYear();
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
    let D = date.getDate();
    let dateArr = [Y,M,D];
    return dateArr.join(conSymbol)
  },
  setStorage: (keyname, value) => {
    wx.setStorage({
      key: keyname,
      data: value
    })
  },
  getStorage: (keyname) => {
    return wx.getStorageSync(keyname)
  },
  navigate: (data) => {
    if(!data.url){
      return
    }
    let url = data.url + '?';
    let params = data.params
    if(params){
      for(let key in params){
        let val = params[key];
        if(typeof val == 'object'){
          val = JSON.stringify(val);
        }
        url += key + '=' + val + '&';
      }
    }
    wepy.navigateTo({
      url: url
    })
  },
  post2get: (url,data) => {
    url = url + '?';
    let params = data
    if(params){
      for(let key in params){
        let val = params[key];
        if(typeof val == 'object'){
          val = JSON.stringify(val);
        }
        url += key + '=' + val + '&';
      }
    }
    return url
  },
  upDateLoginData: (data) => {
    let loginData = wepy.getStorageSync('loginData') || {};
    Object.assign(loginData, data);
    wepy.setStorageSync('loginData', loginData);
  },
  rsa: (val) => {
    var publicKey =
    `-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCo66/QsuCKAsgPn7KyupcTpOIB
    7i7K7BlnnQzVukRK1xUNFANYdxL3uwVwzl2yMluP4OMG0h/v1n06fGMvzH0Azxyx
    j9JhM2TDvSHvE58Dj/4Vr/LmcDfNBl4u5a7KSNbiwZFgiIuM+rGiOv0dLhdyV8WK
    yd6otr0PDUKSdIvYhQIDAQAB-----END PUBLIC KEY-----`;
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(publicKey);
    var encStr = encrypt_rsa.encrypt(val)
    encStr = RSA.hex2b64(encStr);
    // return encodeURIComponent(encStr);
    return encStr;
  },
  existInPages: (route) => {
    var pages=getCurrentPages()
    let exist = pages.some(el => {
      return el.route == route
    });
    return exist
  }
}
