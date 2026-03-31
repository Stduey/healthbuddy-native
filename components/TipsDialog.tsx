import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const tips = [
  {
    title: "Share Your Conditions",
    description: "Tell Brownie about any health conditions you have, like diabetes or high blood pressure.",
    example: "\"I have type 2 diabetes and high blood pressure\"",
  },
  {
    title: "List Your Medications",
    description: "Share what medications you take so Brownie can provide relevant information.",
    example: "\"I take metformin 500mg twice a day\"",
  },
  {
    title: "Mention Allergies",
    description: "Let Brownie know about any allergies or sensitivities.",
    example: "\"I am allergic to penicillin\"",
  },
  {
    title: "Ask Health Questions",
    description: "Ask about your conditions, medications, or general wellness topics.",
    example: "\"What foods should I avoid with diabetes?\"",
  },
  {
    title: "Track Doctor Visits",
    description: "Tell Brownie about recent or upcoming doctor visits.",
    example: "\"I saw my cardiologist last week\"",
  },
];

export default function TipsDialog({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Tips for Talking to Brownie</Text>
          <Text style={styles.subtitle}>
            Here are some things you can share to get the most out of your health buddy.
          </Text>

          <ScrollView style={styles.list}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
                <Text style={styles.tipExample}>{tip.example}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dialog: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8B5E3C",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  list: {
    maxHeight: 400,
  },
  tipCard: {
    backgroundColor: "#FDF8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  tipTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#92400E",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 19,
    marginBottom: 6,
  },
  tipExample: {
    fontSize: 12,
    color: "#B45309",
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#8B5E3C",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
