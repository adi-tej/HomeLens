import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import CurrencySelect from "../components/inputs/CurrencySelect";
import Select from "../components/inputs/Select";
import Toggle from "../components/inputs/Toggle";
import DepositInput from "../components/inputs/DepositInput";
import ScreenContainer from "../components/primitives/ScreenContainer";
import { formatCurrency } from "../utils/parser";
import { useMortgageCalculator } from "../state/MortgageCalculatorContext";
import { spacing } from "../theme/spacing";

export default function Calculator() {
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
    // Derived values from state
    stampDuty,
    lvr,
    lmi,
    totalLoan,
    monthlyMortgage,
    annualPrincipal,
    annualInterest,
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
        />

        {/* Deposit */}
        <DepositInput
          propertyValue={propertyValue}
          deposit={deposit}
          onChange={setDeposit}
        />

        {/* Occupancy */}
        <Select
          label="Occupancy"
          value={firstHomeBuyer ? "owner" : occupancy}
          onChange={(v) => {
            if (firstHomeBuyer) return; // freeze to owner when FHB
            if (v === "owner" || v === "investment") setOccupancy(v);
            else setOccupancy("");
          }}
          options={[
            { label: "Owner-Occupied", value: "owner" },
            { label: "Investment", value: "investment" },
          ]}
          disabled={firstHomeBuyer}
        />

        {/* Property Type */}
        <Select
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
      </View>
      <View
        style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        {/* Summary table (computed from state) */}
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {[
            {
              key: "sd",
              label: "Stamp Duty",
              value: formatCurrency(stampDuty),
            },
            {
              key: "lvr",
              label: "LVR",
              value: `${Number.isFinite(lvr) ? Math.round(lvr * 100) / 100 : 0}%`,
            },
            { key: "lmi", label: "LMI", value: formatCurrency(lmi) },
            {
              key: "loan",
              label: "Total loan amount",
              value: formatCurrency(totalLoan),
            },
            {
              key: "mm",
              label: "Monthly mortgage",
              value: formatCurrency(monthlyMortgage),
              highlight: true,
            },
            {
              key: "ap",
              label: "Annual principle",
              value: formatCurrency(annualPrincipal),
            },
            {
              key: "ai",
              label: "Annual interest",
              value: formatCurrency(annualInterest),
            },
          ].map((row, idx) => {
            const isHighlight = row.highlight;
            const baseRowStyle = {
              flexDirection: "row" as const,
              justifyContent: "space-between" as const,
              alignItems: "center" as const,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: isHighlight
                ? theme.colors.secondaryContainer
                : theme.colors.surfaceVariant,
            };
            const labelStyle = {
              color: isHighlight
                ? theme.colors.onSecondaryContainer
                : theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: isHighlight ? "700" : "600",
            } as const;
            const valueStyle: import("react-native").TextStyle = {
              color: isHighlight
                ? theme.colors.onSecondaryContainer
                : theme.colors.onSurface,
              fontSize: isHighlight ? 18 : 14,
              fontWeight: isHighlight ? "700" : "500",
              fontVariant: ["tabular-nums"],
            };

            return (
              <View key={row.key} style={baseRowStyle}>
                <Text style={labelStyle}>{row.label}</Text>
                <Text style={valueStyle}>{row.value}</Text>
              </View>
            );
          })}
          {/* Caption / footnote */}
          <View style={{ padding: 10, backgroundColor: theme.colors.surface }}>
            <Text
              style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
            >
              Assumes fixed 5.5% p.a. interest and 30-year term. Values are
              estimates.
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
});
