import { Zpl } from "react-native-zpl-code";
import Net from "react-native-tcp-socket";
import { getSettings } from "../utils/storage"; // Importing the settings utility
import { Alert } from "react-native";

// Handle WebView navigation changes
export const handleWebViewNavigationStateChange = (
  navState,
  setCurrentUrl,
  onPrintTrigger
) => {
  const { url } = navState;
  setCurrentUrl(url);

  if (url.includes("print")) {
    onPrintTrigger();
  }
};

// Generate ZPL from WebView URL and send to printer
export const handleGenerateZPL = async (currentUrl, webViewRef) => {
  try {
    const settings = await getSettings(); // Fetch settings dynamically

    if (!settings || !settings.PrinterIp || !settings.PrinterPort) {
      throw new Error("Printer settings not configured");
    }

    const zplCommand = generateZPLFromUrl(currentUrl);
    console.log(zplCommand);
    if (!zplCommand) throw new Error("Failed to generate ZPL");
    sendToPrinter(zplCommand, settings.PrinterIp, settings.PrinterPort);
  } catch (error) {
    Alert.alert( error);

  }
};

// Generate ZPL command from the WebView URL
const generateZPLFromUrl = (url) => {
  const urlParams = new URLSearchParams(url);
  const zplBuilder = new Zpl.Builder();

  zplBuilder.setup({
    size: { heightDots: 609, widthDots: 609 },
    labelHome: { x: 0, y: 0 },
    orientation: "NORMAL",
    media: { type: "MARK_SENSING", dots: 24 },
  });

  let yPosition = 50;
  for (const [key, value] of urlParams.entries()) {
    zplBuilder.text({
      x: 50,
      y: yPosition,
      font: { type: "A", h: 20, w: 10 },
      text: `${key}: ${value}`,
    });
    yPosition += 50;
  }

  return zplBuilder.build()._j; // Return the ZPL string
};

// Send the generated ZPL command to the printer
const sendToPrinter = (zplCommandString, printerIp, printerPort) => {
  const client = Net.createConnection(
    { host: printerIp, port: printerPort },
    () => {
      console.log(`Connected to printer at ${printerIp}:${printerPort}`);
      client.write(zplCommandString, "utf-8");
      client.end();
    }
  );

  client.on("data", (data) => {
    console.log("Printer response:", data.toString());
  });

  client.on("error", (error) => {
    Alert.alert("Error connecting to printer:", error);
  });

  client.on("close", () => {
    console.log("Printer connection closed");
  });
};
