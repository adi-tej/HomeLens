import React, { createContext, useContext, useMemo, useReducer } from "react";

export type AmountMode = "select" | "enter";
export type Occupancy = "" | "owner" | "investment";
export type PropertyType = "" | "brandnew" | "existing" | "land";

export interface MortgageState {
  valueMode: AmountMode;
  propertyValue?: number;
  valueMenuOpen: boolean;

  depositMode: AmountMode;
  deposit?: number;
  depositMenuOpen: boolean;

  firstHomeBuyer: boolean;
  occupancy: Occupancy;
  propertyType: PropertyType;

  touched: boolean;
}

export type MortgageAction =
  | { type: "setValueMode"; value: AmountMode }
  | { type: "setPropertyValue"; value: number | undefined }
  | { type: "setValueMenuOpen"; value: boolean }
  | { type: "setDepositMode"; value: AmountMode }
  | { type: "setDeposit"; value: number | undefined }
  | { type: "setDepositMenuOpen"; value: boolean }
  | { type: "toggleFirstHomeBuyer" }
  | { type: "setOccupancy"; value: Occupancy }
  | { type: "setPropertyType"; value: PropertyType }
  | { type: "touch" }
  | { type: "reset" };

const initialState: MortgageState = {
  valueMode: "select",
  valueMenuOpen: false,
  depositMode: "enter",
  depositMenuOpen: false,
  firstHomeBuyer: false,
  occupancy: "",
  propertyType: "",
  touched: false,
};

function reducer(state: MortgageState, action: MortgageAction): MortgageState {
  switch (action.type) {
    case "setValueMode":
      return { ...state, valueMode: action.value };
    case "setPropertyValue":
      return { ...state, propertyValue: action.value };
    case "setValueMenuOpen":
      return { ...state, valueMenuOpen: action.value };
    case "setDepositMode":
      return { ...state, depositMode: action.value };
    case "setDeposit":
      return { ...state, deposit: action.value };
    case "setDepositMenuOpen":
      return { ...state, depositMenuOpen: action.value };
    case "toggleFirstHomeBuyer":
      return { ...state, firstHomeBuyer: !state.firstHomeBuyer };
    case "setOccupancy":
      return { ...state, occupancy: action.value };
    case "setPropertyType":
      return { ...state, propertyType: action.value };
    case "touch":
      return { ...state, touched: true };
    case "reset":
      return { ...initialState };
    default:
      return state;
  }
}

export type MortgageErrors = Partial<
  Record<
    | "propertyValue"
    | "deposit"
    | "depositTooBig"
    | "occupancy"
    | "propertyType",
    string
  >
>;

function validate(state: MortgageState): MortgageErrors {
  const e: MortgageErrors = {};
  if (!state.propertyValue || state.propertyValue <= 0)
    e.propertyValue = "Enter or select a valid property value.";
  if (!state.deposit || state.deposit <= 0)
    e.deposit = "Enter or select a valid deposit.";
  if (
    state.propertyValue &&
    state.deposit &&
    state.deposit > state.propertyValue
  )
    e.depositTooBig = "Deposit cannot exceed property value.";
  if (!state.occupancy) e.occupancy = "Select Owner-Occupied or Investment.";
  if (!state.propertyType)
    e.propertyType = "Select Brand New, Existing or Land.";
  return e;
}

interface CtxValue extends MortgageState {
  setValueMode: (v: AmountMode) => void;
  setPropertyValue: (v: number | undefined) => void;
  setValueMenuOpen: (b: boolean) => void;
  setDepositMode: (v: AmountMode) => void;
  setDeposit: (v: number | undefined) => void;
  setDepositMenuOpen: (b: boolean) => void;
  toggleFirstHomeBuyer: () => void;
  setOccupancy: (v: Occupancy) => void;
  setPropertyType: (v: PropertyType) => void;
  submit: () => void;
  reset: () => void;
  errors: MortgageErrors;
  isInvalid: boolean;
}

const Ctx = createContext<CtxValue | undefined>(undefined);

export function MortgageCalculatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const errors = useMemo(() => validate(state), [state]);
  const isInvalid = Object.keys(errors).length > 0;

  const value: CtxValue = useMemo(
    () => ({
      ...state,
      setValueMode: (v) => dispatch({ type: "setValueMode", value: v }),
      setPropertyValue: (v) => dispatch({ type: "setPropertyValue", value: v }),
      setValueMenuOpen: (b) => dispatch({ type: "setValueMenuOpen", value: b }),
      setDepositMode: (v) => dispatch({ type: "setDepositMode", value: v }),
      setDeposit: (v) => dispatch({ type: "setDeposit", value: v }),
      setDepositMenuOpen: (b) =>
        dispatch({ type: "setDepositMenuOpen", value: b }),
      toggleFirstHomeBuyer: () => dispatch({ type: "toggleFirstHomeBuyer" }),
      setOccupancy: (v) => dispatch({ type: "setOccupancy", value: v }),
      setPropertyType: (v) => dispatch({ type: "setPropertyType", value: v }),
      submit: () => {
        dispatch({ type: "touch" });
        if (Object.keys(validate({ ...state, touched: true })).length > 0)
          return;
        // Submit handler placeholder — integrate with backend or analytics if needed
        const payload = {
          propertyValue: state.propertyValue,
          deposit: state.deposit,
          firstHomeBuyer: state.firstHomeBuyer,
          occupancy: state.occupancy,
          propertyType: state.propertyType,
        };
        // console.log('mortgage_form_submit', payload);
      },
      reset: () => dispatch({ type: "reset" }),
      errors,
      isInvalid,
    }),
    [state, errors, isInvalid],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMortgageCalculator() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useMortgageCalculator must be used within MortgageCalculatorProvider",
    );
  return ctx;
}
