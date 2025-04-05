import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formation } from "@/types/Formation";

interface Props {
  formation: Formation;
  isSaved: boolean;
  onToggleSave: (formation: Formation) => void;
}

export const FormationCard: React.FC<Props> = ({
  formation,
  isSaved,
  onToggleSave,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{formation.establishmentName}</Text>
        {formation.establishmentStatus && (
          <Text style={styles.subtitle}>{formation.establishmentStatus}</Text>
        )}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#888" />
          <Text style={styles.location}>
            {formation.region ? formation.region : "Région inconnue"}
          </Text>
        </View>
        <Text style={styles.details}>
          {formation.program ? formation.program : "Programme Inconnu"}
        </Text>

        {expanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.detailText}>
              Département: {formation.department}
            </Text>
            <Text style={styles.detailText}>Académie: {formation.academy}</Text>
            <Text style={styles.detailText}>Commune: {formation.commune}</Text>
            <Text style={styles.detailText}>
              Sélectivité: {formation.selectivity}
            </Text>
            <Text style={styles.detailText}>
              Capacité: {formation.capacity}
            </Text>
            <Text style={styles.detailText}>
              Candidats: {formation.candidateCount}
            </Text>
            <Text style={styles.detailText}>
              Offres d'admission: {formation.admissionOfferCount}
            </Text>
            <Text style={styles.detailText}>
              Admis: {formation.admittedCount}
            </Text>
            <Text style={styles.detailText}>
              Taux d'accès: {formation.accessRate}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.linkText}>{expanded ? "Masquer" : "Voir"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onToggleSave(formation)}>
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={20}
            color="#FF7A7C"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: "#777",
    marginLeft: 4,
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },
  expandedSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
});
