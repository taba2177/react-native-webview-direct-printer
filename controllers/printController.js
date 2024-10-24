import Net from "react-native-tcp-socket";
import { getSettings } from "../utils/storage";
import { Alert } from "react-native";

// Handle WebView navigation changes
export const handleWebViewNavigationStateChange = (
  navState,
  setCurrentUrl,
  onPrintTrigger
) => {
  const { url } = navState;
  setCurrentUrl(url);

  // Trigger the print when URL contains the "print" keyword 
  if (url.includes("print")) {
    onPrintTrigger();
  }
};

// Generate and send ESC/POS commands based on the available connection type (TCP/IP)
export const handleGenerateESC = async (currentUrl, htmlContent) => {
  try {
    const settings = await getSettings(); // Fetch settings dynamically

    // Check if printer settings are valid
    if (!settings) {
      throw new Error("Printer settings not configured");
    }

    // Check for missing or invalid printer IP or Port
    if (!settings.PrinterIp || !settings.PrinterPort) {
      throw new Error("Printer IP or Port is missing");
    }

    console.log("Printer settings:", settings); // Debugging info

    // Generate ESC/POS commands
    const escPosCommand = generateEscPosFromUrl(
      htmlContent ? htmlContent : currentUrl
    );
    console.log("ESC/POS Command Generated:", escPosCommand);

    if (!escPosCommand) throw new Error("Failed to generate ESC/POS commands");

    // Attempt to print using TCP/IP connection
    await sendViaTcp(escPosCommand, settings.PrinterIp, settings.PrinterPort);
  } catch (error) {
    Alert.alert("Error", error.message || "An unexpected error occurred");
  }
};

// Generate ESC/POS command from the WebView URL
const generateEscPosFromUrl = (urlOrHtmlContent) => {
  const urlParams = new URLSearchParams(urlOrHtmlContent);
  let escPosCommands = ""; // String to hold the ESC/POS commands

  // ESC/POS command to initialize the printer
  escPosCommands += "\x1B\x40"; // Initialize printer

  for (const [key, value] of urlParams.entries()) {
    escPosCommands += `\x1B\x21\x00${key}: ${value}\n`; // Add text to the ESC/POS buffer
  }

  // Add line feed and cut command
  escPosCommands += "\x1B\x64\x02"; // Feed paper and add new lines
  escPosCommands += "\x1D\x56\x00"; // Cut paper

  return escPosCommands; // Return ESC/POS command string
};

// Send ESC/POS commands via TCP/IP connection
const sendViaTcp = (escPosCommandString, printerIp, printerPort) => {
  return new Promise((resolve, reject) => {
    if (!printerIp || !printerPort) {
      reject(new Error("Invalid TCP IP or Port"));
      return;
    }

    const client = Net.createConnection(
      { host: printerIp, port: printerPort },
      () => {
        console.log(`Connected to printer at ${printerIp}:${printerPort}`);
        client.write(escPosCommandString, "utf-8");
        client.end();
        resolve(); // Connection successful
      }
    );

    client.on("error", (error) => {
      reject(new Error("TCP connection error: " + error.message));
    });

    client.on("close", () => {
      console.log("TCP connection closed");
    });
  });
};
