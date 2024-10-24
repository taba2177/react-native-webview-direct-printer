
# React Native WebView ZPL Printer

This project demonstrates how to generate ZPL (Zebra Programming Language) code from a WebView in React Native and send it to a Zebra printer over TCP.
    
// Automatically trigger ZPL generation if the URL contains 'print'


# You need to set up the printing service from the settings on your Android device, and the appropriate driver for your printer will be downloaded.

## Features
- Display an invoice from a URL in a WebView
- Automatically detect URL changes and generate ZPL when the URL contains specific parameters
- Manually trigger ZPL generation from invoice details in the URL
- Send the generated ZPL to a Zebra printer over TCP

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/taba2177/react-native-webview-direct-printer.git

    cd react-native-webview-direct-printer
    ```

1. Install dependencies:
    ```bash
    yarn install
    ```

2. Install tcp-socket:
    ```bash
    yarn add react-native-tcp-socket

    yarn add react-native-zpl-code
    
    yarn add react-native-webview


5. Start the project:
    ```bash
    npx react-native run-android
    ```

6.  or for iOS:
    ```bash
    npx react-native run-ios
    ```

## Configuration
- Update the WebView `source` URI with the correct URL for displaying the invoice.
- Change the printer IP address and port (default is `192.168.1.100:9100`) to match your printer configuration.
- Generate ZPL command from the URL parameters.


## License
This project is licensed under the MIT License.

Happy Coding! 😊❤️

By: @taba217
