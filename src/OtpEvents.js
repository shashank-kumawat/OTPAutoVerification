'use strict';
import {NativeModules, DeviceEventEmitter} from 'react-native';
const RNOtpVerify = NativeModules.RNOtp;

let OtpVerify = {
  getOtp:
    RNOtpVerify === null || RNOtpVerify === void 0
      ? void 0
      : RNOtpVerify.getOtp,
  getHash:
    RNOtpVerify === null || RNOtpVerify === void 0
      ? void 0
      : RNOtpVerify.getHash,
  addListener: function (handler) {
    return DeviceEventEmitter.addListener(
      'com.otpautoverification:otpReceived',
      handler,
    );
  },
  removeListener: function () {
    return DeviceEventEmitter.removeAllListeners(
      'com.otpautoverification:otpReceived',
    );
  },
};

export default class OtpEvents {
	
  static getHashCode() {
    return OtpVerify.getHash().then(console.log).catch(console.log);
  }

  static removeListener() {
    return OtpVerify.removeListener();
  }

  static startListeningForOtp(otpHandler) {
    OtpVerify.getOtp()
      .then(p => {
        OtpVerify.addListener(otpHandler);
      })
      .catch(error => {
        console.log(error);
      });
  }
}
