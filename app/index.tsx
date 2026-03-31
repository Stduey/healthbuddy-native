// HealthBuddy v1 - TKJ AI Systems
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { verifyPin, saveLanguage } from "../services/storage";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "Francais" },
  { code: "de", label: "Deutsch" },
  { code: "tl", label: "Tagalog" },
  { code: "ar", label: "Arabic" },
];

export default function PinLoginScreen() {
  const [pin, setPin] = useState("");
  const [language, setLanguage] = useState("en");
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = async (enteredPin: string) => {
    const valid = await verifyPin(enteredPin);
    if (valid) {
      await saveLanguage(language);
      router.replace("/chat");
    } else {
      Alert.alert("Incorrect PIN", "Please try again.");
      setPin("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/buddy-login.png")}
          style={styles.mascot}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to Health Buddy</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN</Text>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.dot, i < pin.length && styles.dotFilled]}
            />
          ))}
        </View>

        <View style={styles.keypad}>
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["", "0", "del"],
          ].map((row, ri) => (
            <View key={ri} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key || "empty"}
                  style={[styles.key, key === "" && styles.keyEmpty]}
                  onPress={() => {
                    if (key === "del") handleDelete();
                    else if (key) handleDigit(key);
                  }}
                  disabled={key === ""}
                >
                  <Text style={styles.keyText}>{key === "del" ? "\u232B" : key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setShowLangPicker(prev => !prev)}
        >
          <Text style={styles.langButtonText}>
            {LANGUAGES.find((l) => l.code === language)?.label || "English"}
          </Text>
        </TouchableOpacity>

        {showLangPicker && (
          <View style={styles.langPicker}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  lang.code === language && styles.langOptionActive,
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLangPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    lang.code === language && styles.langOptionTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF8F0",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B5E3C",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#A0845C",
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#8B5E3C",
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: "#8B5E3C",
  },
  keypad: {
    width: "100%",
    maxWidth: 280,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  key: {
    width: 72,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  keyEmpty: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  keyText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#4B3621",
  },
  langButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(139,94,60,0.1)",
  },
  langButtonText: {
    color: "#8B5E3C",
    fontSize: 14,
    fontWeight: "500",
  },
  langPicker: {
    marginTop: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  langOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  langOptionActive: {
    backgroundColor: "#8B5E3C",
  },
  langOptionText: {
    fontSize: 14,
    color: "#4B3621",
  },
  langOptionTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
});
