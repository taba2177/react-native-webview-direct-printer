
import React, { useRef, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Zpl } from 'react-native-zpl-code';
import Net from 'react-native-tcp-socket';

const App = () => {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Monitor URL changes in the WebView
  const handleWebViewNavigationStateChange = (newNavState) => {
    const { url } = newNavState;
    setCurrentUrl(url);

    // Automatically trigger ZPL generation if the URL contains 'print'
    if (url.includes('print')) {
      handleGenerateZPL(url);
    }
  };

  // Function to extract and generate ZPL from the WebView
  const handleGenerateZPL = async (url) => {
    try {
      const extractedHtml = await extractInvoiceContentFromWebView();
      const zplCommand = generateZPLFromUrl(url);

      if (!zplCommand) throw new Error('Failed to generate ZPL');
      sendToPrinter(zplCommand);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate ZPL');
      console.error(error);
    }
  };

  // Extract content from WebView (if needed)
  const extractInvoiceContentFromWebView = () => {
    return webViewRef.current.injectJavaScript(`
      (function() {
        const inv = document.documentElement.outerHTML;
        window.ReactNativeWebView.postMessage(inv);
        window.history.back();
        return inv;
      })();
    `);
  };

  // Generate ZPL command from the URL parameters
  const generateZPLFromUrl = (url) => {
    const urlParams = new URLSearchParams(url);
    const invoiceNumber = urlParams.get('invoice');
    const customerName = urlParams.get('customer');
    const date = urlParams.get('date');
    const amountDue = urlParams.get('amount');

    // Build the ZPL command
    const zplBuilder = new Zpl.Builder();
    zplBuilder.setup({
      size: { heightDots: 609, widthDots: 609 },
      labelHome: { x: 0, y: 0 },
      orientation: 'NORMAL',
      media: { type: 'MARK_SENSING', dots: 24 },
    });

    zplBuilder.text({ x: 50, y: 50, font: { type: 'A', h: 20, w: 10 }, text: `Invoice No: ${invoiceNumber}` });
    zplBuilder.text({ x: 50, y: 100, font: { type: 'A', h: 20, w: 10 }, text: `Date: ${date}` });
    zplBuilder.text({ x: 50, y: 150, font: { type: 'A', h: 20, w: 10 }, text: `Customer: ${customerName}` });
    zplBuilder.text({ x: 50, y: 200, font: { type: 'A', h: 20, w: 10 }, text: `Amount Due: ${amountDue}` });

    const zplCommandObj = zplBuilder.build();
    return zplCommandObj._j; // Extract ZPL string
  };

  // Send the ZPL command to the printer
  const sendToPrinter = (zplCommandString) => {
    const client = Net.createConnection({ host: '192.168.1.100', port: 9100 }, () => {
      client.write(zplCommandString, 'utf-8');
      client.end();
    });

    client.on('data', (data) => {
      console.log('Printer response:', data.toString());
    });

    client.on('error', (error) => {
      Alert.alert('Error', 'Failed to connect to printer');
      console.error(error);
    });

    client.on('close', () => {
      console.log('Connection closed');
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* WebView displaying the invoice */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        onMessage={(event) => console.log('Message from WebView:', event.nativeEvent.data)}
        javaScriptEnabled={true}
        cacheEnabled={false}
        source={{ uri: 'http://127.0.0.1/redirect' }} // Update with correct URL
        style={{ flex: 1 }}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />

      {/* Button to manually trigger ZPL generation */}
      <Button title="Generate ZPL Manually" onPress={() => handleGenerateZPL(currentUrl)} />
    </View>
  );
};

export default App;
