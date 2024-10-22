import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getSettings, saveSettings } from "../utils/storage";

const SettingsScreen = ({ navigation }) => {
  const [webViewUrl, setWebViewUrl] = useState("");
  const [printerIp, setPrinterIp] = useState("");
  const [printerPort, setPrinterPort] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getSettings();
      if (settings) {
        setWebViewUrl(settings.WebViewUrl);
        setPrinterIp(settings.PrinterIp);
        setPrinterPort(settings.PrinterPort);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const updatedSettings = {
      WebViewUrl: webViewUrl,
      PrinterIp: printerIp,
      PrinterPort: printerPort,
    };
    await saveSettings(updatedSettings);
    Alert.alert("Settings saved successfully!");
    navigation.goBack(); // Go back to the Home screen
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="WebView URL"
        value={webViewUrl}
        onChangeText={setWebViewUrl}
        style={styles.input}
      />
      <TextInput
        placeholder="Printer IP"
        value={printerIp}
        onChangeText={setPrinterIp}
        style={styles.input}
      />
      <TextInput
        placeholder="Printer Port"
        value={printerPort}
        onChangeText={setPrinterPort}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title="Save Settings" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 20, borderWidth: 1, padding: 10, borderRadius: 5 },
});

export default SettingsScreen;
