import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChatMessage as ChatMessageType } from "../types/health";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {!isUser && <Text style={styles.senderLabel}>Brownie</Text>}
        <Text
          style={[styles.text, isUser ? styles.userText : styles.assistantText]}
        >
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.userTime : styles.assistantTime]}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  assistantContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B5E3C",
    marginBottom: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#1F2937",
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTime: {
    color: "rgba(255,255,255,0.7)",
  },
  assistantTime: {
    color: "#9CA3AF",
  },
});
