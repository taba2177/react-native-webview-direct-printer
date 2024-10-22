import React, { useRef, useState, useEffect } from "react";
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
  handleGenerateZPL,
} from "../controllers/printController";
import { getSettings } from "../utils/storage";

const POLLING_INTERVAL = 5000; // Poll every 5 seconds

const HomeScreen = ({ navigation }) => {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [WebViewUrl, setWebViewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load settings
  const loadSettings = async () => {
    setLoading(true);
    setError(null); // Reset error
    try {
      const settings = await getSettings();
      if (settings && settings.WebViewUrl) {
        setWebViewUrl(settings.WebViewUrl);
      } else {
        throw new Error("WebView URL not found in settings");
      }
    } catch (error) {
      setError(error.message || "Error fetching settings");
    } finally {
      setLoading(false);
    }
  };

  // Periodically check if settings have changed
  useEffect(() => {
    let intervalId;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const settings = await getSettings();
        if (settings?.WebViewUrl && settings.WebViewUrl !== WebViewUrl) {
          setWebViewUrl(settings.WebViewUrl); // Automatically update URL
        }
      }, POLLING_INTERVAL);
    };

    loadSettings(); // Load settings on mount
    startPolling(); // Start polling

    // Cleanup polling on unmount
    return () => clearInterval(intervalId);
  }, [WebViewUrl]);

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
        <Button title="Retry" onPress={loadSettings} color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          <Button
            title="Reload Settings"
            onPress={loadSettings}
            color="#4CAF50"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4CAF50",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default HomeScreen;
