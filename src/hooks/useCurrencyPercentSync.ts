import { useEffect, useRef, useState } from "react";
import {
    calculateCurrencyFromPercent,
    calculatePercentFromCurrency,
    formatCurrency,
    formatPercentText,
    parseNumber,
} from "@utils/parser";

export type UseCurrencyPercentSyncOptions = {
    propertyValue?: number;
    value?: number; // external currency value
    onChange?: (v: number | undefined) => void;
    onBlur?: () => void;
};

export function useCurrencyPercentSync({
    propertyValue,
    value,
    onChange,
    onBlur,
}: UseCurrencyPercentSyncOptions) {
    const [currencyText, setCurrencyText] = useState("");
    const [percentText, setPercentText] = useState("");

    const onChangeRef = useRef(onChange);
    const onBlurRef = useRef(onBlur);
    // Initialize to undefined so first non-undefined value triggers sync
    const lastValueRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        onBlurRef.current = onBlur;
    }, [onBlur]);

    // -------------------------
    // Change handlers
    // -------------------------

    const handleCurrencyChange = (t: string) => {
        setCurrencyText(t);

        const parsed = parseNumber(t);
        if (parsed != null) {
            if (propertyValue) {
                const percent = calculatePercentFromCurrency(
                    parsed,
                    propertyValue,
                );
                if (percent !== null)
                    setPercentText(formatPercentText(percent));
            }
            onChangeRef.current?.(parsed);
        } else if (t === "") {
            setPercentText("");
            onChangeRef.current?.(undefined);
        }
    };

    const handlePercentChange = (t: string) => {
        setPercentText(t);

        const parsed = parseNumber(t);
        if (parsed != null && propertyValue) {
            const val = calculateCurrencyFromPercent(parsed, propertyValue);
            if (val !== null) {
                setCurrencyText(formatCurrency(val));
                onChangeRef.current?.(val);
            }
        } else if (t === "") {
            setCurrencyText("");
            onChangeRef.current?.(undefined);
        }
    };

    const handleCurrencyBlur = () => {
        const parsed = parseNumber(currencyText);
        if (parsed != null) {
            setCurrencyText(formatCurrency(parsed));
        }
        onBlurRef.current?.();
    };

    const handlePercentBlur = () => {
        const parsed = parseNumber(percentText);
        if (parsed != null) {
            setPercentText(formatPercentText(parsed));
        }
        onBlurRef.current?.();
    };

    // -------------------------
    // Sync from external value
    // -------------------------

    useEffect(() => {
        // Always update when value changes OR on first mount
        if (value === lastValueRef.current) return;

        lastValueRef.current = value;

        if (value != null) {
            setCurrencyText(formatCurrency(value));
            if (propertyValue) {
                const percent = calculatePercentFromCurrency(
                    value,
                    propertyValue,
                );
                if (percent !== null)
                    setPercentText(formatPercentText(percent));
            } else {
                // Clear percent if property value missing
                setPercentText("");
            }
        } else {
            setCurrencyText("");
            setPercentText("");
        }
    }, [value, propertyValue]);

    return {
        currencyText,
        percentText,
        setCurrencyText,
        setPercentText,

        handleCurrencyChange,
        handlePercentChange,
        handleCurrencyBlur,
        handlePercentBlur,
    };
}
