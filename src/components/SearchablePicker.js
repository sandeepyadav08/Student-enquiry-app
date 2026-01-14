import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const SearchablePicker = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  style,
  error,
  searchFields = ["label"], // Fields to search in
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const { colors, isDark } = useTheme();

  const selectedItem = items.find((item) => item.value === selectedValue);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) => {
        return searchFields.some((field) => {
          const fieldValue = item[field] || "";
          return fieldValue.toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, items, searchFields]);

  const handleSelect = (item) => {
    onValueChange(item.value);
    setModalVisible(false);
    setSearchQuery("");
  };

  const openModal = () => {
    setModalVisible(true);
    setSearchQuery("");
  };

  const closeModal = () => {
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.pickerTrigger,
          {
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
          },
          error && { borderColor: colors.error },
        ]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.textValue,
            { color: colors.text },
            !selectedValue && { color: colors.placeholder },
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.white }]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                  backgroundColor: colors.white,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {label || "Select Option"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                { borderBottomColor: isDark ? "#374151" : "#F0F0F0" },
              ]}
            >
              <View
                style={[
                  styles.searchInputContainer,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground,
                  },
                ]}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.placeholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Results */}
            {filteredItems.length > 0 ? (
              <FlatList
                data={filteredItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.itemRow,
                      selectedValue === item.value && {
                        backgroundColor: colors.primary + "20",
                      },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        { color: colors.text },
                        selectedValue === item.value && {
                          color: colors.primary,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons
                  name="search"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={[styles.noResultsText, { color: colors.text }]}>
                  No results found
                </Text>
                <Text
                  style={[
                    styles.noResultsSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  Try adjusting your search terms
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  pickerTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  textValue: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default SearchablePicker;
