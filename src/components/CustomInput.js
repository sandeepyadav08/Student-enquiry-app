import { View, TextInput, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  multiline = false,
  style,
  error,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
          multiline && styles.multilineInput,
          !editable && {
            backgroundColor: colors.disabledInput,
            color: colors.textSecondary,
          },
          error && { borderColor: colors.error },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomInput;
