import React from 'react';
import CurrencySelect from '../components/dropdown/CurrencySelect';
import TextSelect from '../components/dropdown/TextSelect';
import ToggleRow from '../components/ToggleRow';

import { formatCurrency } from '../utils/parser';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';
import ScreenContainer from '../components/primitives/ScreenContainer';
import SectionTitle from '../components/primitives/SectionTitle';
import { useMortgageCalculator } from '../state/MortgageCalculatorContext';
import { spacing } from '../theme/spacing';

const CURRENCY_PRESETS = [400000, 600000, 800000, 1000000, 1200000];
const DEPOSIT_PRESETS = [20000, 50000, 100000, 150000, 200000];

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
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text>Enter your details</Text>
            <ToggleRow
              label="First home buyer?"
              checked={firstHomeBuyer}
              onToggle={toggleFirstHomeBuyer}
            />

            {/* Property Value */}
            <CurrencySelect
              label="Property value"
              value={propertyValue}
              onChange={setPropertyValue}
              options={CURRENCY_PRESETS.map(n => ({ value: n, label: formatCurrency(n) }))}
            />
            <HelperText type="error" visible={touched && !!errors.propertyValue}>
              {errors.propertyValue}
            </HelperText>

            {/* Deposit */}
            <CurrencySelect
              label="Deposit"
              value={deposit}
              onChange={setDeposit}
              options={DEPOSIT_PRESETS.map(n => ({ value: n, label: formatCurrency(n) }))}
            />
            <HelperText type="error" visible={touched && !!errors.deposit}>
              {errors.deposit}
            </HelperText>
            <HelperText type="error" visible={touched && !!errors.depositTooBig}>
              {errors.depositTooBig}
            </HelperText>

            {/* Occupancy */}
            <TextSelect
              label="Occupancy"
              value={occupancy}
              onChange={v => {
                if (v === 'owner' || v === 'investment') setOccupancy(v);
                else setOccupancy('');
              }}
              options={[
                { label: 'Owner-Occupied', value: 'owner' },
                { label: 'Investment', value: 'investment' },
              ]}
            />
            <HelperText type="error" visible={touched && !!errors.occupancy}>
              {errors.occupancy}
            </HelperText>

            {/* Property Type */}
            <TextSelect
              label="Property type"
              value={propertyType}
              onChange={v => {
                if (v === 'brandnew' || v === 'existing' || v === 'land') setPropertyType(v);
                else setPropertyType('');
              }}
              options={[
                { label: 'Brand New', value: 'brandnew' },
                { label: 'Existing', value: 'existing' },
                { label: 'Land', value: 'land' },
              ]}
            />
            <HelperText type="error" visible={touched && !!errors.propertyType}>
              {errors.propertyType}
            </HelperText>

            <Button mode="contained" onPress={submit} style={styles.button} disabled={touched && isInvalid}>
              Submit
            </Button>

            {/* Inline summary */}
            <SectionTitle>Summary</SectionTitle>
            <Text>
              {[
                `Property: ${formatCurrency(propertyValue) || '—'}`,
                `Deposit: ${formatCurrency(deposit) || '—'}`,
                `FHB: ${firstHomeBuyer ? 'Yes' : 'No'}`,
                `Occupancy: ${occupancy || '—'}`,
                `Type: ${propertyType || '—'}`,
              ].join('  •  ')}
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
  card: {padding: spacing.md, borderRadius: 8},
});
