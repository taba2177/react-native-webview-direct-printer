import AsyncStorage from "@react-native-async-storage/async-storage";

// Get stored settings from AsyncStorage
export const getStoredSettings = async () => {
  try {
    const webViewUrl = await AsyncStorage.getItem("webViewUrl");
    const printerIp = await AsyncStorage.getItem("printerIp");
    const printerPort = await AsyncStorage.getItem("printerPort");

    return {
      webViewUrl: webViewUrl || "http://192.168.8.174:5500",
      printerIp: printerIp || "192.168.1.100",
      printerPort: printerPort || "9100",
    };
  } catch (error) {
    console.error("Failed to load settings", error);
    return null;
  }
};

// Save settings to AsyncStorage
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem("webViewUrl", settings.webViewUrl);
    await AsyncStorage.setItem("printerIp", settings.printerIp);
    await AsyncStorage.setItem("printerPort", settings.printerPort);
  } catch (error) {
    console.error("Failed to save settings", error);
  }
};
