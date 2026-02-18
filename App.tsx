import { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";

export default function App() {
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const viewRef = useRef(null);
  const [saving, setSaving] = useState(false);
  let url = "https://dainyjose.github.io/my-portfolio/";

  const downloadQrCode = async () => {
    try {
      if (!status?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert(
            "Permission denied",
            "Cannot save without gallery access."
          );
          return;
        }
      }

      setSaving(true);
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        scale: 3,
      });
      const filePath = `${FileSystem.cacheDirectory}QR_code.png`;

      await FileSystem.copyAsync({
        from: uri,
        to: filePath,
      });

      const asset = await MediaLibrary.createAssetAsync(filePath);
      await MediaLibrary.createAlbumAsync("QR Codes", asset, false);

      Alert.alert("Success", "QR Code saved to gallery!");
    } catch (error) {
      console.error("Save failed:", error);
      Alert.alert("Error", "Failed to save QR code");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        ref={viewRef}
        collapsable={false}
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          padding: 20,
        }}
      >
        <QRCode
          value={url}
          size={220}
          // logo={require("./assets/icon.png")}
          logoSize={40}
          logoMargin={1}
          logoBorderRadius={8}
          backgroundColor="white"
        />
      </View>
      <TouchableOpacity
        style={{
          marginBottom: 20,
          backgroundColor: "lightgray",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          top: 20,
        }}
        onPress={downloadQrCode}
      >
        <Text>{saving ? "Saving..." : "Save QR to Gallery"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
