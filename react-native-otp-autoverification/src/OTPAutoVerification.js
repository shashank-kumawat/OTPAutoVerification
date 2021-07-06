'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
    this.state = {
      code: Array.apply(null, Array(this.props.numberOfInputs)).map(
        function () {},
      ),
    };
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
    const {
      numberOfInputs,
      selectionColor,
      secureTextEntry,
      keyboardAppearance,
      keyboardType,
      placeholder,
      placeholderTextColor,
    } = this.props;
    const inputs = Array.apply(null, Array(numberOfInputs)).map(function () {});
    const textInput = inputs.map((i, index) => (
      <View key={index}>
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          allowFontScaling={false}
          secureTextEntry={secureTextEntry}
          keyboardAppearance={keyboardAppearance}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          selectionColor={selectionColor}
          style={[styles.codeInput, this.props.inputStyles]}
          maxLength={1}
          onChangeText={value => this.focusNext(index, value)}
          onKeyPress={e => {
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
        />
      </View>
    ));

    return (
      <View style={[styles.textInputContainer, this.props.textInputContainer]}>
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
    if (this.state.keyPress === 'Backspace' && currentIndex !== 0) {
      if (
        currentIndex !== 0 ||
        (currentIndex <= this.otpTextInput.length - 1 && !!currentIndexValue)
      ) {
        this.otpTextInput[currentIndex - 1].focus();
      }
    }
  }

  focusNext(index, value) {
    if (index < this.otpTextInput.length - 1 && value) {
      this.otpTextInput[index + 1].focus();
    }
    if (index === this.otpTextInput.length - 1) {
      this.otpTextInput[index].blur();
    }
    let {code} = this.state;
    code[index] = value;
    this.setState({
      code: [...code.map((d, idex) => (idex === index ? value : d))],
    });
  }

  render() {
    return (
      <View style={[styles.container, this.props.conatinerStyles]}>
        {this.renderCodeInput(styles)}
      </View>
    );
  }
}

export default OTPAutoVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255,250,250)',
    justifyContent: 'center',
  },
  codeInput: {
    width: 40,
    height: 60,
    paddingLeft: 12,
    color: 'black',
    fontSize: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'grey',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
});

OTPAutoVerification.propTypes = {
  numberOfInputs: PropTypes.number.isRequired,
  selectionColor: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  keyboardAppearance: PropTypes.string,
  keyboardType: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
};

OTPAutoVerification.defaultProps = {
  numberOfInputs: 4,
  selectionColor: 'grey',
  secureTextEntry: false,
  keyboardAppearance: 'default',
  keyboardType: 'number-pad',
  placeholder: '',
  placeholderTextColor: 'grey',
};
