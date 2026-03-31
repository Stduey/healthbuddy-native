import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HealthProfile } from "../types/health";

interface Props {
  profile: HealthProfile;
}

export default function HealthProfileCard({ profile }: Props) {
  const hasData =
    profile.conditions.length > 0 ||
    profile.medications.length > 0 ||
    profile.allergies.length > 0 ||
    profile.age ||
    profile.sex;

  if (!hasData) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Health Profile</Text>

      {(profile.age || profile.sex) && (
        <View style={styles.row}>
          <Text style={styles.label}>Demographics:</Text>
          <Text style={styles.value}>
            {[profile.age && `Age ${profile.age}`, profile.sex]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>
      )}

      {profile.conditions.length > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Conditions:</Text>
          <Text style={styles.value}>{profile.conditions.join(", ")}</Text>
        </View>
      )}

      {profile.medications.length > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Medications:</Text>
          <Text style={styles.value}>
            {profile.medications
              .map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ""}`)
              .join(", ")}
          </Text>
        </View>
      )}

      {profile.allergies.length > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Allergies:</Text>
          <Text style={styles.value}>{profile.allergies.join(", ")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FDF8F0",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E5D5C0",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B5E3C",
    marginBottom: 8,
  },
  row: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  value: {
    fontSize: 12,
    color: "#78350F",
    marginTop: 1,
  },
});
