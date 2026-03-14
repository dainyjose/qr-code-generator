import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";

import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function App() {
  const qrRef = useRef<any>(null);
  const svgRef = useRef<any>(null);

  const [url, setUrl] = useState("https://dainyjose.github.io/my-portfolio/");

  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor] = useState("#ffffff");

  const [qrSize, setQrSize] = useState("240");
  const [logoSize, setLogoSize] = useState("40");
  const [logoRadius, setLogoRadius] = useState("10");

  const [logo, setLogo] = useState<string | null>(null);
  const colors = [
    "#000000",
    "#1E88E5",
    "#E53935",
    "#8E24AA",
    "#43A047",
    "#FB8C00",
    "#00ACC1",
    "#FDD835",
  ];
  const validateURL = () => {
    const trimmed = url.trim();

    if (!trimmed) {
      Alert.alert("Invalid Input", "Please enter a URL");
      return false;
    }

    if (!trimmed.startsWith("http")) {
      Alert.alert("Invalid URL", "URL should start with http:// or https://");
      return false;
    }

    return true;
  };
  // Pick logo
  const pickLogo = async () => {
    if (!validateURL()) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  // Save PNG
  const savePNG = async () => {
    if (!validateURL()) return;
    try {
      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);

      await MediaLibrary.createAlbumAsync("QR Codes", asset, false);

      Alert.alert("Success", "PNG saved to gallery");
    } catch (e) {
      Alert.alert("Error saving PNG");
    }
  };

  // Save SVG
  const saveSVG = async () => {
    if (!validateURL()) return;

    try {
      svgRef.current.toDataURL(async (data: string) => {
        const fileUri = FileSystem.documentDirectory + "qrcode.svg";

        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg">${data}</svg>`;

        await FileSystem.writeAsStringAsync(fileUri, svgContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        Alert.alert("SVG saved", fileUri);
      });
    } catch (e) {
      Alert.alert("Error saving SVG");
    }
  };

  const shareQR = async () => {
    if (!validateURL()) return;

    try {
      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert("Sharing not available on this device");
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error sharing QR Code");
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>QR Generator</Text>
      <Text style={styles.label}>URL</Text>

      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Enter URL"
      />

      <Text style={styles.label}>QR Size</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={qrSize}
        onChangeText={setQrSize}
      />

      <Text style={styles.label}>Logo Size</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={logoSize}
        onChangeText={setLogoSize}
      />
      <Text style={styles.label}>Logo Radius</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={logoRadius}
        onChangeText={setLogoRadius}
      />
      <Text style={styles.label}>QR Color</Text>

      <View style={styles.colorRow}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              qrColor === color && styles.selectedColor,
            ]}
            onPress={() => setQrColor(color)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={pickLogo}
      >
        <Text>Upload Logo</Text>
      </TouchableOpacity>

      {url ? (
        <View
          ref={qrRef}
          collapsable={false}
          style={{
            padding: 20,
            backgroundColor: bgColor,
            marginTop: 20,
          }}
        >
          <QRCode
            value={url.trim()}
            size={parseInt(qrSize) || 240}
            color={qrColor}
            backgroundColor={bgColor}
            logo={logo ? { uri: logo } : undefined}
            logoSize={parseInt(logoSize) || 40}
            logoBorderRadius={parseInt(logoRadius) || 0}
            getRef={(c) => (svgRef.current = c)}
          />
        </View>
      ) : (
        <Text style={{ marginTop: 20, color: "gray" }}>
          Enter a URL to generate QR Code
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveBtn, !url && { opacity: 0.5 }]}
          onPress={savePNG}
        >
          <Text style={styles.btnText}>Download PNG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, !url && { opacity: 0.5 }]}
          onPress={saveSVG}
        >
          <Text style={styles.btnText}>Download SVG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, !url && { opacity: 0.5 }]}
          onPress={shareQR}
        >
          <Text style={styles.btnText}>Share QR Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: "center",
    marginVertical: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  label: {
    alignSelf: "flex-start",
    fontWeight: "600",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    flex: 1 / 3,
    gap: 5,
  },

  saveBtn: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    margin: 5,
    minWidth: 120,
  },

  btnText: {
    color: "#fff",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 6,
  },

  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
});
