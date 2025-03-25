import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formation } from "@/types/Formation";
import { PagedResponse } from "@/types/ApiResponse";

const API_BASE_URL = "http://192.168.172.144:8080";
const PAGE_SIZE = 10;

export default function FormationsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Formation[]>([]);
  const [savedFormations, setSavedFormations] = useState<Formation[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Load saved formations from AsyncStorage on mount
  useEffect(() => {
    const loadSavedFormations = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("savedFormations");
        if (jsonValue != null) {
          setSavedFormations(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error("Error loading saved formations:", error);
      }
    };
    loadSavedFormations();
  }, []);

  // Function to load a page of formations for the /all endpoint
  const loadPage = async (pageNumber: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/formations/all?page=${pageNumber}&size=${PAGE_SIZE}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: PagedResponse<Formation[]> = await response.json();
      // If first page, replace the list; otherwise, append the new items
      if (pageNumber === 0) {
        setSuggestions(data.content);
      } else {
        setSuggestions((prev) => [...prev, ...data.content]);
      }
      setPage(data.page.number);
      setTotalPages(data.page.totalPages);
    } catch (error) {
      console.error("Error fetching page:", error);
    }
  };

  // useEffect to load the initial page when searchQuery is empty.
  useEffect(() => {
    if (!searchQuery.trim()) {
      setInitialLoading(true);
      // Reset paging
      setPage(0);
      loadPage(0).then(() => setInitialLoading(false));
    }
  }, [searchQuery]);

  // Fetch suggestions based on user input (for search)
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length === 0) {
      // When cleared, the above useEffect will load the /all endpoint
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/formations/search?query=${encodeURIComponent(
          text
        )}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  // Infinite scrolling: load more data when the end is reached
  const handleLoadMore = async () => {
    // Only load more when not searching and if more pages are available
    if (
      searchQuery.trim().length === 0 &&
      !loadingMore &&
      page < totalPages - 1
    ) {
      setLoadingMore(true);
      await loadPage(page + 1);
      setLoadingMore(false);
    }
  };

  // Toggle saving or unsaving a formation
  const toggleSaveFormation = async (formation: Formation) => {
    const isSaved = savedFormations.some((item) => item.id === formation.id);
    let updatedSaved: Formation[];
    if (isSaved) {
      updatedSaved = savedFormations.filter((item) => item.id !== formation.id);
    } else {
      updatedSaved = [...savedFormations, formation];
    }
    setSavedFormations(updatedSaved);
    try {
      await AsyncStorage.setItem(
        "savedFormations",
        JSON.stringify(updatedSaved)
      );
    } catch (error) {
      console.error("Error saving formation", error);
    }
  };

  // Check if a formation is already saved
  const isFormationSaved = (formation: Formation) => {
    return savedFormations.some((item) => item.id === formation.id);
  };

  // Child component for each formation card
  const FormationCard = ({ formation }: { formation: Formation }) => {
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
              <Text style={styles.detailText}>
                Académie: {formation.academy}
              </Text>
              <Text style={styles.detailText}>
                Commune: {formation.commune}
              </Text>
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
          <TouchableOpacity onPress={() => toggleSaveFormation(formation)}>
            <Ionicons
              name={isFormationSaved(formation) ? "heart" : "heart-outline"}
              size={20}
              color="#FF7A7C"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render footer for FlatList (spinner for loading more data)
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.screen}>
      {/* AppBar with search */}
      <View style={styles.appBar}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un établissement"
            placeholderTextColor="#888"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>
      </View>

      {/* Content: FlatList for infinite scrolling */}
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.container}
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FormationCard formation={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  appBar: {
    backgroundColor: "#EAC42ED4",
    paddingTop: 40, // Adjust according to status bar height if needed
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
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
  loadingMore: {
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResults: {
    textAlign: "center",
    marginTop: 16,
    color: "#777",
  },
});
