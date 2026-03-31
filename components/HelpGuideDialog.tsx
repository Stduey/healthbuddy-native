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

const features = [
  { icon: "💬", title: "Health Chat", desc: "Ask questions about conditions, medications, and wellness." },
  { icon: "📋", title: "Health Profile", desc: "Track your conditions, medications, and allergies." },
  { icon: "🚨", title: "Emergency Help", desc: "Quick access to emergency contacts and resources." },
  { icon: "💡", title: "Health Tips", desc: "Get quick tips on managing common health conditions." },
];

const sampleQuestions = [
  "What are the side effects of metformin?",
  "How can I lower my blood pressure naturally?",
  "What foods should I avoid with diabetes?",
  "What are the symptoms of a heart attack?",
  "How much water should I drink daily?",
];

export default function HelpGuideDialog({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Help Guide</Text>
          <Text style={styles.subtitle}>
            Learn what Brownie can do for you.
          </Text>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>What Brownie Can Do</Text>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Sample Questions
            </Text>
            {sampleQuestions.map((q, i) => (
              <View key={i} style={styles.questionRow}>
                <Text style={styles.questionText}>"{q}"</Text>
              </View>
            ))}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Brownie provides health education only. Always consult your healthcare provider for medical advice, diagnosis, or treatment.
              </Text>
            </View>
          </ScrollView>

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
    color: "#4F46E5",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  content: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1F2937",
  },
  featureDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  questionRow: {
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 13,
    color: "#4338CA",
    fontStyle: "italic",
  },
  disclaimer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#4F46E5",
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
