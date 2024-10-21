
# React Native WebView ZPL Printer

This project demonstrates how to generate ZPL (Zebra Programming Language) code from a WebView in React Native and send it to a Zebra printer over TCP.

## Features
- Display an invoice from a URL in a WebView
- Automatically detect URL changes and generate ZPL when the URL contains specific parameters
- Manually trigger ZPL generation from invoice details in the URL
- Send the generated ZPL to a Zebra printer over TCP

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/your-username/react-native-webview-direct-printer.git
    cd react-native-webview-direct-printer
    ```

2. Install dependencies:
    ```bash
    yarn install
    ```

3. Install dependencies:
    ```bash
    yarn add react-native-tcp-socket
    ```

4. Install dependencies:
    ```bash
    yarn add react-native-zpl-code
    ```

5. Install dependencies:
    ```bash
    yarn react-native-webview
    ```

6. Start the project:
    ```bash
    npx react-native run-android
    ```

    or for iOS:
    ```bash
    npx react-native run-ios
    ```

## Configuration
- Update the WebView `source` URI with the correct URL for displaying the invoice.
- Change the printer IP address and port (default is `192.168.1.100:9100`) to match your printer configuration.

## License
This project is licensed under the MIT License.

Happy Coding! 😊❤️

By: @taba217
