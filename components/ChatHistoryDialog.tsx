import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChatMessage } from "../types/health";

interface Props {
  visible: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onClear: () => void;
}

export default function ChatHistoryDialog({
  visible,
  messages,
  onClose,
  onClear,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Chat History</Text>
          <Text style={styles.subtitle}>
            Review your recent conversation with Brownie.
          </Text>

          <View style={styles.headerRow}>
            <Text style={styles.countText}>
              {messages.length > 0
                ? `${messages.length} message${messages.length === 1 ? "" : "s"}`
                : "No messages yet"}
            </Text>
            {messages.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {messages.length > 0 ? (
              messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageCard,
                    message.role === "user" ? styles.userCard : styles.assistantCard,
                  ]}
                >
                  <Text style={styles.roleLabel}>
                    {message.role === "user" ? "You" : "Brownie"}
                  </Text>
                  <Text style={styles.messageText}>{message.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No chat history yet</Text>
                <Text style={styles.emptyText}>
                  Start a conversation and it will show up here.
                </Text>
              </View>
            )}
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  countText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B91C1C",
  },
  list: {
    maxHeight: 420,
  },
  listContent: {
    paddingBottom: 8,
  },
  messageCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  userCard: {
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  assistantCard: {
    backgroundColor: "#FDF8F0",
    borderWidth: 1,
    borderColor: "#E8D5C4",
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B5E3C",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
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
