import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const emergencyContacts = [
  { label: "911 Emergency", number: "911", color: "#DC2626" },
  { label: "Poison Control", number: "1-800-222-1222", color: "#EA580C" },
  { label: "Crisis Text Line", number: "741741", color: "#7C3AED", isText: true },
  { label: "Suicide Prevention", number: "988", color: "#2563EB" },
  { label: "Nurse Hotline", number: "1-800-874-2273", color: "#059669" },
];

export default function EmergencyDialog({ visible, onClose }: Props) {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/-/g, "")}`);
  };

  const handleText = (number: string) => {
    Linking.openURL(`sms:${number}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Emergency Resources</Text>
          <Text style={styles.subtitle}>
            If you are experiencing a medical emergency, call 911 immediately.
          </Text>

          <ScrollView style={styles.list}>
            {emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.number}
                style={[styles.contactButton, { backgroundColor: contact.color }]}
                onPress={() =>
                  contact.isText
                    ? handleText(contact.number)
                    : handleCall(contact.number)
                }
              >
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactNumber}>
                  {contact.isText ? `Text ${contact.number}` : contact.number}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Important Documents</Text>
            <Text style={styles.infoText}>
              Keep these documents accessible:{"\n"}- POLST (Physician Orders for Life-Sustaining Treatment){"\n"}- Advanced Directive{"\n"}- Healthcare Proxy
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
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
    color: "#DC2626",
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
    maxHeight: 300,
  },
  contactButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  contactLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  contactNumber: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  infoTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#92400E",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
