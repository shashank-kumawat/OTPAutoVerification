# React Native Auto OTP Verification


**react-native-OTPAutoverification** is a small library which use Google's SMS Retriever API and auto fill inputs from SMS received includes OTP. For Android, It will fill as the SMS arrives automatically no user concern is required And on iOS the input suggestion arrives when the OTP SMS is received. It includes all the features you need regarding Focus and inputs and all the edge cases has been taken care of. You can always customize the UI of the Input elements and container as you need it and like it.

## Installation Process

`npm install --save react-native-otp-autoverification`
or
`yarn add react-native-otp-autoverification`

## Dependencies
No such Dependencies. 
## Basic Usage

```js
import {OTPAutoVerification} from 'react-native-otp-autoverification'

...

<OTPAutoVerification numberOfInputs={6} />

```

## More Advanced Usage

```js
import {OTPAutoVerification} from 'react-native-otp-autoverification'

...

<OTPAutoVerification
    inputStyles={{width: 50, height: 50}}
    numberOfInputs={6}
    secureTextEntry
    selectionColor = {'grey'}
/>

```
## Parameters

| Parameter               | required | Description                                                                                     |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| numberOfInputs          | YES      | Number of Input Fileds in the component                                                         |
| selectionColor          | NO       | Color of the selection done of the text														   |
| secureTextEntry     	  | NO       | Content hidden when Text entered                                              				   |
| keyboardAppearance      | NO       | Theme for the keyboard to appear as.                                                  		   |
| keyboardType            | NO       | Type of keyboard                     														   |
| placeholder             | NO       | Default text shown in text fields                                                           	   |
| placeholderTextColor    | NO       | Placeholder Color                                                        					   |

## Notes to Remember

On Android, it will be auto filled when SMS with OTP arrives but make sure you render the OTP Input fileds screen first and then SMS with OTP should arrive.

The iOS input suggestion requires React Native 0.58+ and works for iOS 12 and above.

## Author

![for Sig](https://user-images.githubusercontent.com/37096648/124588064-036e4e80-de76-11eb-8256-c01e03b7d6b1.jpg)<br />
<sub><a href="https://github.com/shashank-kumawat">Shashank Kumawat</a></sub>

