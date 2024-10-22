import AsyncStorage from "@react-native-async-storage/async-storage";

export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@app_settings");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error reading settings from storage", e);
  }
};

export const saveSettings = async (settings) => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem("@app_settings", jsonValue);
  } catch (e) {
    console.error("Error saving settings to storage", e);
  }
};
