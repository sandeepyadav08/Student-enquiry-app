import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const CustomButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = "primary",
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary"
          ? { backgroundColor: colors.primary }
          : {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: colors.primary,
            },
        disabled && { backgroundColor: colors.disabled },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "primary"
              ? { color: colors.white }
              : { color: colors.primary },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
