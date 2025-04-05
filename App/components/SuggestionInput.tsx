import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "http://192.168.172.144:8080";

interface SuggestionInputProps {
  label: string;
  fieldName: string; // e.g. "region", "department", etc.
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
  placeholder?: string;
}

// A small dropdown item
const SuggestionItem = ({
  item,
  onPress,
}: {
  item: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.suggestionItem} onPress={onPress}>
    <Text style={styles.suggestionItemText}>{item}</Text>
  </TouchableOpacity>
);

export const SuggestionInput: React.FC<SuggestionInputProps> = ({
  label,
  fieldName,
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = "",
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    // Whenever "value" changes, fetch new suggestions:
    fetchSuggestions(value);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    try {
      const params = new URLSearchParams({
        field: fieldName,
      });
      if (query) {
        params.append("query", query);
      }

      const url = `${API_BASE_URL}/api/formations/suggestions?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions.");
      }
      const data: string[] = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Optionally hide suggestions on blur.
    // setShowSuggestions(false);
  };

  const handleSelect = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#888"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText("")}
          >
            <Ionicons name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            scrollEnabled={false} // <-- Prevent nested scrolling issues
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <SuggestionItem item={item} onPress={() => handleSelect(item)} />
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#000",
  },
  clearButton: {
    position: "absolute",
    right: 8,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  suggestionItemText: {
    fontSize: 14,
    color: "#000",
  },
});
