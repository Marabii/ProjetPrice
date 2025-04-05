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

// Child components
import { FormationCard } from "@/components/FormationCard";
import { FilterModal } from "@/components/FilterModal";

const API_BASE_URL = "http://192.168.172.144:8080";
const PAGE_SIZE = 10;

// Define a type for our applied filters
interface Filters {
  region: string;
  department: string;
  status: string;
  program: string;
  sortBy: string;
  sortDirection: "ASC" | "DESC";
}

const defaultFilters: Filters = {
  region: "",
  department: "",
  status: "",
  program: "",
  sortBy: "id",
  sortDirection: "ASC",
};

export default function FormationsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // The list of displayed formations
  const [suggestions, setSuggestions] = useState<Formation[]>([]);

  // The list of user-saved formations
  const [savedFormations, setSavedFormations] = useState<Formation[]>([]);

  // Paging states
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Temporary filter states (bound to the modal inputs)
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // public / privé
  const [programFilter, setProgramFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  // Applied filter state – only updated when user clicks "Apply"
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);

  // Filter Modal visibility
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  // ---------------------------------------------
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

  // ---------------------------------------------
  // Unified function to load data, based on search and/or applied filters.
  const loadFormations = async (pageNumber: number, isLoadMore = false) => {
    try {
      let url = "";
      if (searchQuery.trim().length > 0) {
        // Searching by name
        url = `${API_BASE_URL}/api/formations/search?query=${encodeURIComponent(
          searchQuery
        )}`;
      } else if (
        appliedFilters.region.trim() ||
        appliedFilters.department.trim() ||
        appliedFilters.status.trim() ||
        appliedFilters.program.trim() ||
        appliedFilters.sortBy !== "id" ||
        appliedFilters.sortDirection !== "ASC"
      ) {
        // Advanced filters in effect – use appliedFilters values.
        const queryParams = new URLSearchParams({
          region: appliedFilters.region,
          department: appliedFilters.department,
          establishmentStatus: appliedFilters.status,
          program: appliedFilters.program,
          page: pageNumber.toString(),
          size: PAGE_SIZE.toString(),
          sortBy: appliedFilters.sortBy,
          direction: appliedFilters.sortDirection,
        });
        // Remove empty filter values
        for (const [key, val] of queryParams.entries()) {
          if (!val) {
            queryParams.delete(key);
          }
        }
        url = `${API_BASE_URL}/api/formations/advancedSearch?${queryParams.toString()}`;
      } else {
        // No search and no filters – use the "all" endpoint.
        url = `${API_BASE_URL}/api/formations/all?page=${pageNumber}&size=${PAGE_SIZE}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // For /search, we assume an array; for advanced/all we assume a PagedResponse.
      if (searchQuery.trim().length > 0) {
        const data: Formation[] = await response.json();
        if (!isLoadMore || pageNumber === 0) {
          setSuggestions(data);
        } else {
          setSuggestions((prev) => [...prev, ...data]);
        }
        setPage(0);
        setTotalPages(1);
      } else {
        const data: PagedResponse<Formation[]> = await response.json();
        if (!isLoadMore || pageNumber === 0) {
          setSuggestions(data.content);
        } else {
          setSuggestions((prev) => [...prev, ...data.content]);
        }
        setPage(data.page.number);
        setTotalPages(data.page.totalPages);
      }
    } catch (error) {
      console.error("Error loading formations:", error);
    }
  };

  // ---------------------------------------------
  // Effect to load data when searchQuery or appliedFilters change.
  useEffect(() => {
    setInitialLoading(true);
    loadFormations(0).then(() => setInitialLoading(false));
  }, [searchQuery, appliedFilters]);

  // ---------------------------------------------
  // Infinite Scroll
  const handleLoadMore = async () => {
    if (
      !loadingMore &&
      page < totalPages - 1 &&
      searchQuery.trim().length === 0
    ) {
      setLoadingMore(true);
      await loadFormations(page + 1, true);
      setLoadingMore(false);
    }
  };

  // ---------------------------------------------
  // Handler for search input changes.
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // ---------------------------------------------
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

  // ---------------------------------------------
  // Check if a formation is already saved.
  const isFormationSaved = (formation: Formation) => {
    return savedFormations.some((item) => item.id === formation.id);
  };

  // ---------------------------------------------
  // Render footer for FlatList.
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

  // ---------------------------------------------
  // Modal open/close handlers.
  const openFilterModal = () => {
    setFilterModalVisible(true);
  };
  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  // Handler for "Apply" button in the modal.
  const applyFilters = () => {
    // Update appliedFilters with the current temporary filter values.
    setAppliedFilters({
      region: regionFilter,
      department: departmentFilter,
      status: statusFilter,
      program: programFilter,
      sortBy: sortBy,
      sortDirection: sortDirection,
    });
    closeFilterModal();
  };

  // Handler for "Clear" button in the modal.
  const clearFilters = () => {
    setRegionFilter("");
    setDepartmentFilter("");
    setStatusFilter("");
    setProgramFilter("");
    setSortBy("id");
    setSortDirection("ASC");
    setAppliedFilters(defaultFilters);
    closeFilterModal();
  };

  // ---------------------------------------------
  // UI
  return (
    <View style={styles.screen}>
      {/* AppBar with search & filter button */}
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
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={closeFilterModal}
        onApply={applyFilters}
        onClear={clearFilters}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        programFilter={programFilter}
        setProgramFilter={setProgramFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />

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
          renderItem={({ item }) => (
            <FormationCard
              formation={item}
              isSaved={isFormationSaved(item)}
              onToggleSave={toggleSaveFormation}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !initialLoading ? (
              <Text style={styles.noResults}>Aucun résultat.</Text>
            ) : null
          }
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
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  filterButton: {
    padding: 8,
  },
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
