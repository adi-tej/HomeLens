import React from "react";
import CurrencySelect from "../components/inputs/CurrencySelect";
import TextSelect from "../components/inputs/TextSelect";
import Toggle from "../components/inputs/Toggle";
import DepositInput from "../components/inputs/DepositInput";

import { formatCurrency } from "../utils/parser";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import ScreenContainer from "../components/primitives/ScreenContainer";
import SectionTitle from "../components/primitives/SectionTitle";
import { useMortgageCalculator } from "../state/MortgageCalculatorContext";
import { spacing } from "../theme/spacing";

const CURRENCY_PRESETS = [400000, 600000, 800000, 1000000, 1200000];

export default function CalculatorScreen() {
  const theme = useTheme();
  const {
    propertyValue,
    setPropertyValue,
    deposit,
    setDeposit,
    firstHomeBuyer,
    toggleFirstHomeBuyer,
    occupancy,
    setOccupancy,
    propertyType,
    setPropertyType,
    touched,
    errors,
    isInvalid,
    submit,
  } = useMortgageCalculator();

  return (
    <ScreenContainer>
      <View
        style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <Toggle
          label="First home buyer?"
          checked={firstHomeBuyer}
          onToggle={toggleFirstHomeBuyer}
        />

        {/* Property Value */}
        <CurrencySelect
          label="Property value"
          value={propertyValue}
          onChange={setPropertyValue}
          options={CURRENCY_PRESETS.map((n) => ({
            value: n,
            label: formatCurrency(n),
          }))}
        />

        {/* Deposit */}
        <DepositInput
          propertyValue={propertyValue}
          deposit={deposit}
          onChange={setDeposit}
        />

        {/* Occupancy */}
        <TextSelect
          label="Occupancy"
          value={occupancy}
          onChange={(v) => {
            if (v === "owner" || v === "investment") setOccupancy(v);
            else setOccupancy("");
          }}
          options={[
            { label: "Owner-Occupied", value: "owner" },
            { label: "Investment", value: "investment" },
          ]}
        />

        {/* Property Type */}
        <TextSelect
          label="Property type"
          value={propertyType}
          onChange={(v) => {
            if (v === "brandnew" || v === "existing" || v === "land")
              setPropertyType(v);
            else setPropertyType("");
          }}
          options={[
            { label: "Brand New", value: "brandnew" },
            { label: "Existing", value: "existing" },
            { label: "Land", value: "land" },
          ]}
        />

        {touched && isInvalid && (
          <Text style={{ color: theme.colors.error }}>
            {[
              errors.propertyValue && `• ${errors.propertyValue}`,
              errors.deposit && `• ${errors.deposit}`,
              errors.depositTooBig && `• ${errors.depositTooBig}`,
              errors.occupancy && `• ${errors.occupancy}`,
              errors.propertyType && `• ${errors.propertyType}`,
              !propertyValue &&
                touched &&
                "• Enter property value to use deposit %",
            ]
              .filter(Boolean)
              .join("\n")}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={submit}
          style={styles.button}
          disabled={touched && isInvalid}
        >
          Submit
        </Button>

        {/* Inline summary */}
        <SectionTitle>Summary</SectionTitle>
        <Text>
          {[
            `Property: ${formatCurrency(propertyValue) || "—"}`,
            `Deposit: ${formatCurrency(deposit) || "—"}`,
            `FHB: ${firstHomeBuyer ? "Yes" : "No"}`,
            `Occupancy: ${occupancy || "—"}`,
            `Type: ${propertyType || "—"}`,
          ].join("  •  ")}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  button: { marginTop: spacing.md },
  summaryHeader: { marginTop: spacing.md },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
});
