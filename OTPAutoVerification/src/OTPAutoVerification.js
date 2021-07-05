'use strict';

import React, {Component} from 'react';
import {
  Platform,
  Text,
  View,
  TextInput,
  NativeModules,
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';

const RNOtpVerify = NativeModules.RNOtpVerify;

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

const majorVersionIOS = parseInt(String(Platform.Version), 10);
const isAutoFillSupported = Platform.OS === 'ios' && majorVersionIOS >= 12;

class OTPAutoVerification extends Component {
  constructor(props) {
    super(props);
    this.otpTextInput = [];
    this.state = {code: Array.apply(null, Array(6)).map(function () {})};
  }

  componentDidMount() {
    this.otpTextInput[0].focus();
    if (Platform.OS === 'android') {
      this.getHash();
      OtpVerify.removeListener();
      this.startListeningForOtp();
      this.timer = setInterval(this.startListeningForOtp, 1000);
    }
  }

  getHash = () => OtpVerify.getHash().then(console.log).catch(console.log);

  startListeningForOtp() {
    OtpVerify.getOtp()
      .then(p => {
        OtpVerify.addListener(message => {
          try {
            if (message && message !== 'Timeout Error') {
              const otp = /(\d{6})/g.exec(message)[1];
              if (otp.length === 6) {
                this.setState({code: [...otp]});
                // this.props.updateData([...otp]);
                this.props.isFormValid();
                this.otpTextInput[0].blur();
              }
            } else {
              console.log(
                'OTPVerification: OTPAutoVerification.getOtp - message=>',
                message,
              );
            }
          } catch (error) {
            console.log(
              'OTPVerification: OTPAutoVerification.getOtp error=>',
              error,
            );
          }
        });
      })
      .catch(error => {
        console.log(error);
      });
    return () => {
      OtpVerify.removeListener();
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    OtpVerify.removeListener();
  }

  renderCodeInput(styles) {
    const inputs = Array.apply(null, Array(6)).map(function () {});
    const textInput = inputs.map((i, index) => (
      <View key={index}>
        <TextInput
          autoCapitalize="characters"
          returnKeyType={'done'}
          autoCorrect={false}
          allowFontScaling={false}
          style={styles.codeInput}
          maxLength={1}
          keyboardType="default"
          onChangeText={value => this.focusNext(index, value)}
          onKeyPress={e => {
            console.log('e.nativeEvent.key', e.nativeEvent);
            this.setState({keyPress: e.nativeEvent.key});
            if (e.nativeEvent.key === 'Backspace') {
              this.setState({keyPress: e.nativeEvent.key}, () => {
                this.handleEdgeCase(index);
              });
            }
          }}
          ref={ref => (this.otpTextInput[index] = ref)}
          value={this.state.code[index]}
          textContentType={isAutoFillSupported ? 'oneTimeCode' : 'none'}
          selectTextOnFocus={true}
          selectionColor={'grey'}
        />
      </View>
    ));

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 34,
        }}>
        {textInput}
      </View>
    );
  }

  handleEdgeCase(currentIndex) {
    const currentIndexValue =
      this.state.code[currentIndex] === '' ||
      this.state.code[currentIndex] === undefined;
    if (
      currentIndex &&
      currentIndexValue &&
      this.state.keyPress === 'Backspace'
    ) {
      this.otpTextInput[currentIndex - 1].focus();
    }
  }

  focusNext(index, value) {
    if (index < this.otpTextInput.length - 1 && value) {
      this.otpTextInput[index + 1].focus();
    }
    if (index === this.otpTextInput.length - 1) {
      this.otpTextInput[index].blur();
    }
    if (this.state.keyPress === 'Backspace' && index !== 0) {
      let currentIndexValue = this.state.code[index] === '';
      if (
        index !== 0 ||
        (index <= this.otpTextInput.length - 1 && !!currentIndexValue)
      ) {
        this.otpTextInput[index - 1].focus();
      }
    }
    let {code} = this.state;
    code[index] = value;
    this.setState({
      code: [...code.map((d, idex) => (idex === index ? value : d))],
    });
  }

  render() {
    return <View style={styles.container}>{this.renderCodeInput(styles)}</View>;
  }
}

export default OTPAutoVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 100,
  },
  codeInput: {
    width: 40,
    height: 60,
    paddingLeft: 12,
    color: 'black',
    fontSize: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgb(67, 71, 88)',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
});
