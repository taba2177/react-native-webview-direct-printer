import React, { useRef, useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import {
  handleWebViewNavigationStateChange,
  handleGenerateZPL,
} from "../controllers/printController";
import { getSettings } from "../utils/storage";

const HomeScreen = ({ navigation }) => {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [WebViewUrl, setWebViewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getSettings();
        if (settings && settings.WebViewUrl) {
          setWebViewUrl(settings.WebViewUrl);
          setError(null);
        } else {
          setError("WebView URL not found in settings");
        }
      } catch (error) {
        setError("Error fetching settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {WebViewUrl ? (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ uri: WebViewUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={(navState) =>
            handleWebViewNavigationStateChange(navState, setCurrentUrl, () =>
              handleGenerateZPL(currentUrl, webViewRef)
            )
          }
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Invalid WebView URL. Please check the settings.
          </Text>
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
