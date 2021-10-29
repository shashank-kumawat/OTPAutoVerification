'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Platform, View, TextInput, StyleSheet } from 'react-native';

import OtpEvents from './OtpEvents';

const majorVersionIOS = parseInt(String(Platform.Version), 10);
const isAutoFillSupported = Platform.OS === 'ios' && majorVersionIOS >= 12;

class OTPAutoVerification extends Component {
	constructor(props) {
		super(props);
		this.otpTextInput = [];
		this.state = {
			code: this.props.code,
		};
	}

	componentDidMount() {
		this.otpTextInput[0].focus();
		if (Platform.OS === 'android') {
			OtpEvents.getHashCode();
			OtpEvents.removeListener();
			OtpEvents.startListeningForOtp(this.otpHandler);
		}
	}

	otpHandler = (message) => {
		try {
			if (message && message !== 'Timeout Error') {
				const otp = /(\d{6})/g.exec(message)[1];
				if (otp.length === 6) {
					this.setState({ code: [...otp] });
					this.otpTextInput[0].blur();
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	componentWillUnmount() {
		OtpEvents.removeListener();
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
					maxLength={6}
					onChangeText={(value) => {
				 this.focusNext(index,value)
					Platform.OS === 'ios' ? this.funcs(index,value):''
					}}
					onKeyPress={(e) => {
						this.setState({ keyPress: e.nativeEvent.key });
						if (e.nativeEvent.key === 'Backspace') {
							this.setState({ keyPress: e.nativeEvent.key }, () => {
								this.handleEdgeCase(index);
							});
						}
					}}
					ref={(ref) => (this.otpTextInput[index] = ref)}
					value={this.state.code[index]}
					textContentType={isAutoFillSupported ? 'oneTimeCode' : 'none'}
					selectTextOnFocus={true}
				/>
			</View>
		));

		return <View style={[styles.textInputContainer, this.props.textInputContainer]}>{textInput}</View>;
	}

	funcs(index,value){
		if(value.length===6){
			this.setState({ code: [...value] });
			this.otpTextInput[1].blur();
		}
	
	}

	handleEdgeCase(currentIndex) {
		const currentIndexValue = this.state.code[currentIndex] === '' || this.state.code[currentIndex] === undefined;
		if (currentIndex && currentIndexValue && this.state.keyPress === 'Backspace') {
			this.otpTextInput[currentIndex - 1].focus();
		}
		if (this.state.keyPress === 'Backspace' && currentIndex !== 0) {
			if (currentIndex !== 0 || (currentIndex <= this.otpTextInput.length - 1 && !!currentIndexValue)) {
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
		let { code } = this.state;
		code[index] = value;
		this.setState({
			code: [...code.map((d, idex) => (idex === index ? value : d))],
		});
	}

	render() {
		return <View style={[styles.container, this.props.conatinerStyles]}>{this.renderCodeInput(styles)}</View>;
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
	numberOfInputs: 6,
	selectionColor: 'grey',
	secureTextEntry: false,
	keyboardAppearance: 'default',
	keyboardType: 'number-pad',
	placeholder: '',
	placeholderTextColor: 'grey',
};
