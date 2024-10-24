import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
} from "react-native";
import { WebView } from "react-native-webview";
import {
  handleWebViewNavigationStateChange,
  handleGenerateESC,
} from "../controllers/printController";
import { getSettings } from "../utils/storage";

const HomeScreen = ({ navigation }) => {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [WebViewUrl, setWebViewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch settings and update WebView URL
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getSettings();
      if (settings?.WebViewUrl) {
        setWebViewUrl(settings.WebViewUrl);
        setError(null);
      } else {
        setError(
          "WebView URL not found in settings. Please update the settings."
        );
      }
    } catch (err) {
      setError("Error fetching settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Function to reload WebView and re-fetch settings
  const reloadWebView = () => {
    setError(null);
    fetchSettings(); // Re-fetch settings to get the updated URL
    webViewRef.current?.reload(); // Reload WebView after updating URL
  };

  // Show loading screen while fetching settings
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  // Show error message if there's an issue fetching settings
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Reload" onPress={reloadWebView} />
      </View>
    );
  }

  // Handle messages from WebView (e.g., extracting invoice data)
  const handleMessage = (event) => {
    const data = event.nativeEvent.data;
    setHtmlContent(data); // Update HTML content state with the WebView data
  };

  return (
    <View style={{ flex: 1 }}>
      {WebViewUrl ? (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ uri: WebViewUrl }}
          style={{ flex: 1 }}
          cacheEnabled={false}
          javaScriptEnabled={true}
          injectedJavaScript={`(function() {
            const inv = document.documentElement.innerText;
            window.ReactNativeWebView.postMessage(inv);
            return inv;
          })();`}
          onMessage={handleMessage}
          onNavigationStateChange={(navState) =>
            handleWebViewNavigationStateChange(navState, setCurrentUrl, () =>
              handleGenerateESC(currentUrl, htmlContent, webViewRef)
            )
          }
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Invalid WebView URL. Please check the settings.
          </Text>
          <Button title="Reload" onPress={reloadWebView} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4CAF50" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16, marginBottom: 20 },
});

export default HomeScreen;
