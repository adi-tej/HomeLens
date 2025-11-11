import Constants from "expo-constants";

export const ENV = {
    DEV: !!Constants?.expoConfig?.extra?.dev,
};
