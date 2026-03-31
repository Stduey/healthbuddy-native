import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import * as Speech from "expo-speech";
import { ChatMessage as ChatMessageType, HealthProfile, DEFAULT_HEALTH_PROFILE } from "../types/health";
import {
  getHealthProfile,
  getChatSession,
  addMessageToSession,
  clearChatSession,
} from "../services/storage";
import { sendChatMessage, testConnection } from "../services/ollama";
import { getQuickResponse } from "../services/healthEducationCache";
import ChatMessage from "../components/ChatMessage";
import EmergencyDialog from "../components/EmergencyDialog";
import HelpGuideDialog from "../components/HelpGuideDialog";
import TipsDialog from "../components/TipsDialog";
import HealthProfileCard from "../components/HealthProfileCard";
import ChatHistoryDialog from "../components/ChatHistoryDialog";

const { width, height } = Dimensions.get("window");

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>(DEFAULT_HEALTH_PROFILE);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadInitialData = useCallback(async () => {
    const [savedProfile, session, connected] = await Promise.all([
      getHealthProfile(),
      getChatSession(),
      testConnection(),
    ]);
    setProfile(savedProfile);
    setIsConnected(connected);

    if (session?.messages.length) {
      setMessages(session.messages);
    } else {
      const welcome: ChatMessageType = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hi! I am Brownie. Tap the big button below and tell me what is on your mind. I am here to help!",
        timestamp: Date.now(),
      };
      setMessages([welcome]);
      await addMessageToSession(welcome);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    return () => {
      Speech.stop();
    };
  }, [loadInitialData]);

  useSpeechRecognitionEvent("start", () => {
    setSpeechError(null);
    setLiveTranscript("");
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript?.trim() ?? "";
    setLiveTranscript(transcript);

    if (event.isFinal && transcript) {
      setLiveTranscript("");
      handleMessage(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setSpeechError(event.message || event.error);
  });

  const buildHealthContext = useCallback((): string => {
    const parts: string[] = [];
    if (profile.age) parts.push("Age: " + profile.age);
    if (profile.sex) parts.push("Sex: " + profile.sex);
    if (profile.conditions.length)
      parts.push("Conditions: " + profile.conditions.join(", "));
    if (profile.medications.length)
      parts.push(
        "Medications: " + profile.medications.map((m) => m.name).join(", ")
      );
    if (profile.allergies.length)
      parts.push("Allergies: " + profile.allergies.join(", "));
    return parts.join("\n");
  }, [profile]);

  const handleRetryConnection = async () => {
    setIsRetryingConnection(true);
    setSpeechError(null);
    const connected = await testConnection();
    setIsConnected(connected);
    setIsRetryingConnection(false);
    if (!connected) {
      Alert.alert(
        "Still offline",
        "Brownie still cannot reach the local model. Please check Ollama and try again."
      );
    }
  };

  const handleStopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleBigButtonPress = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    await Speech.stop();
    setIsSpeaking(false);

    try {
      const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert(
          "Microphone access needed",
          "Please allow microphone and speech recognition access to use voice input."
        );
        return;
      }

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        Alert.alert(
          "Speech recognition unavailable",
          "Speech recognition is not available on this device or simulator. Try a development build on a physical device."
        );
        return;
      }

      setSpeechError(null);
      setLiveTranscript("");
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
        addsPunctuation: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown speech recognition error";
      setSpeechError(message);
      setIsListening(false);
      Alert.alert("Speech recognition error", message);
    }
  };

  const handleMessage = async (text: string) => {
    await Speech.stop();
    setIsSpeaking(false);

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await addMessageToSession(userMessage);

    setIsLoading(true);

    const quickResponse = getQuickResponse(text);
    let responseContent: string;

    if (quickResponse && Math.random() > 0.5) {
      responseContent = quickResponse;
    } else {
      const healthContext = buildHealthContext();
      const result = await sendChatMessage(
        updatedMessages.slice(-10),
        healthContext
      );
      if (result.error) {
        responseContent = "I am having trouble connecting right now. Please try again in a moment.";
        setIsConnected(false);
      } else {
        responseContent = result.content;
        setIsConnected(true);
      }
    }

    const assistantMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    await addMessageToSession(assistantMessage);
    setIsLoading(false);

    setIsSpeaking(true);
    Speech.speak(responseContent, {
      language: "en-US",
      rate: 0.9,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleLongPress = () => {
    setShowEmergency(true);
  };

  const hasProfileData =
    Boolean(profile.age) ||
    Boolean(profile.sex) ||
    profile.conditions.length > 0 ||
    profile.medications.length > 0 ||
    profile.allergies.length > 0;

  const handleClearHistory = async () => {
    await clearChatSession();
    const welcome: ChatMessageType = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Your chat history is cleared. I am ready whenever you want to talk again.",
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    await addMessageToSession(welcome);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIdentity}>
              <Image
                source={require("../assets/buddy-walking.png")}
                style={styles.headerMascot}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.headerTitle}>Brownie</Text>
                <Text style={styles.headerSubtitle}>
                  Calm health education, right on your device.
                </Text>
              </View>
            </View>
            {isSpeaking && (
              <TouchableOpacity style={styles.stopSpeakButton} onPress={handleStopSpeaking}>
                <Text style={styles.stopSpeakText}>■ Stop</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[
            styles.connectionBanner,
            isConnected ? styles.connectionOnline : styles.connectionOffline,
          ]}>
            <View style={styles.connectionStatusWrap}>
              <View style={[
                styles.connectionDot,
                isConnected ? styles.dotOnline : styles.dotOffline,
              ]} />
              <Text style={styles.connectionText}>
                {isRetryingConnection
                  ? "Retrying connection..."
                  : isConnected
                    ? "Brownie is connected"
                    : "Brownie is offline"}
              </Text>
            </View>
            {!isConnected && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryConnection}
                disabled={isRetryingConnection}
              >
                <Text style={styles.retryButtonText}>
                  {isRetryingConnection ? "Retrying..." : "Retry"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {hasProfileData && <HealthProfileCard profile={profile} />}

        <View style={styles.heroCard}>
          <Image
            source={require("../assets/buddy-listening.png")}
            style={styles.heroMascot}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>
            {isListening ? "I’m listening..." : "Ready to talk"}
          </Text>
          <Text style={styles.heroSubtitle}>
            Tap the big button to ask a question in your own words.
          </Text>

          <TouchableOpacity
            style={styles.bigButton}
            onPress={handleBigButtonPress}
            onLongPress={handleLongPress}
            activeOpacity={0.8}
          >
            <Image
              source={require("../assets/buddy-login.png")}
              style={styles.buttonMascot}
              resizeMode="contain"
            />
            <Text style={styles.bigButtonText}>
              {isListening ? "Listening..." : "Tap to Talk"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>Hold for emergency help</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowChatHistory(true)}
          >
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionTitle}>Chat History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowHelpGuide(true)}
          >
            <Text style={styles.actionEmoji}>❤️</Text>
            <Text style={styles.actionTitle}>Help Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyActionCard}
            onPress={() => setShowEmergency(true)}
          >
            <Text style={styles.actionEmoji}>🚨</Text>
            <Text style={styles.actionTitleLight}>Emergency Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowTips(true)}
          >
            <Text style={styles.actionEmoji}>💡</Text>
            <Text style={styles.actionTitle}>Tips</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatCard}>
          <Text style={styles.chatCardTitle}>Conversation</Text>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            scrollEnabled={false}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        </View>

        {speechError && !isListening && (
          <View style={styles.speechErrorBanner}>
            <Text style={styles.speechErrorText}>{speechError}</Text>
          </View>
        )}

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Educational information only</Text>
          <Text style={styles.disclaimerText}>
            HealthBuddy provides education, not medical advice, diagnosis, or treatment.
          </Text>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require("../assets/buddy-listening.png")}
            style={styles.loadingMascot}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#8B5E3C" />
          <Text style={styles.loadingText}>Brownie is thinking...</Text>
        </View>
      )}

      {isListening && (
        <View style={styles.listeningOverlay}>
          <Image
            source={require("../assets/buddy-listening.png")}
            style={styles.listeningMascot}
            resizeMode="contain"
          />
          <Text style={styles.listeningText}>
            {liveTranscript ? liveTranscript : "Listening..."}
          </Text>
        </View>
      )}

      <EmergencyDialog visible={showEmergency} onClose={() => setShowEmergency(false)} />
      <HelpGuideDialog visible={showHelpGuide} onClose={() => setShowHelpGuide(false)} />
      <TipsDialog visible={showTips} onClose={() => setShowTips(false)} />
      <ChatHistoryDialog
        visible={showChatHistory}
        messages={messages}
        onClose={() => setShowChatHistory(false)}
        onClear={handleClearHistory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EFE6",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  headerCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8D5C4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerMascot: {
    width: 54,
    height: 54,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#8B5E3C",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  stopSpeakButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#E8D5C4",
    borderRadius: 12,
  },
  stopSpeakText: {
    fontSize: 13,
    color: "#8B5E3C",
    fontWeight: "700",
  },
  connectionBanner: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  connectionOnline: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  connectionOffline: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  connectionStatusWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  dotOnline: {
    backgroundColor: "#22C55E",
  },
  dotOffline: {
    backgroundColor: "#EF4444",
  },
  connectionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  retryButton: {
    backgroundColor: "#8B5E3C",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D5C4",
    marginTop: 4,
    marginBottom: 12,
  },
  heroMascot: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  bigButton: {
    width: Math.min(width * 0.62, 250),
    height: Math.min(width * 0.62, 250),
    borderRadius: 999,
    backgroundColor: "#8B5E3C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonMascot: {
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  bigButtonText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
  },
  hintText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionCard: {
    width: "48.5%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8D5C4",
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 10,
    minHeight: 92,
    justifyContent: "center",
  },
  emergencyActionCard: {
    width: "48.5%",
    backgroundColor: "#DC2626",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 10,
    minHeight: 92,
    justifyContent: "center",
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
  },
  actionTitleLight: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
  },
  chatCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8D5C4",
    paddingTop: 18,
    paddingBottom: 8,
    marginBottom: 12,
    minHeight: 220,
  },
  chatCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#8B5E3C",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  messagesList: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  disclaimerCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 16,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 19,
  },
  loadingOverlay: {
    position: "absolute",
    top: height * 0.25,
    left: 16,
    right: 16,
    alignItems: "center",
    backgroundColor: "rgba(253, 248, 240, 0.97)",
    paddingVertical: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8D5C4",
  },
  loadingMascot: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: "#8B5E3C",
    fontWeight: "600",
    marginTop: 12,
  },
  listeningOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(139, 94, 60, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  listeningMascot: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  listeningText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  speechErrorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
  },
  speechErrorText: {
    color: "#991B1B",
    fontSize: 13,
    textAlign: "center",
  },
});
