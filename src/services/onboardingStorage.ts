import AsyncStorage from "@react-native-async-storage/async-storage";
import { Analytics, FeatureName } from "./analytics";

const ONBOARDING_KEY = "@homelens:onboarding_completed";
const USER_EMAIL_KEY = "@homelens:user_email";

export const OnboardingStorage = {
    async isCompleted(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY);
            return value === "true";
        } catch (error) {
            console.error("Error checking onboarding status:", error);
            return false;
        }
    },

    async setCompleted(email: string): Promise<void> {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, "true");
            if (email) {
                await AsyncStorage.setItem(USER_EMAIL_KEY, email);
            }
        } catch (error) {
            console.error("Error saving onboarding status:", error);
            throw error;
        }
    },

    async getUserEmail(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(USER_EMAIL_KEY);
        } catch (error) {
            console.error("Error getting user email:", error);
            return null;
        }
    },

    async deleteUserEmail(): Promise<void> {
        try {
            await AsyncStorage.removeItem(USER_EMAIL_KEY);
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            void Analytics.logFeatureUsed(FeatureName.RESET_ONBOARDING, {
                action: "delete_email",
            });
        } catch (error) {
            console.error(
                "[OnboardingStorage] Error deleting user email:",
                error,
            );
            throw error;
        }
    },

    async reset(): Promise<void> {
        try {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            await AsyncStorage.removeItem(USER_EMAIL_KEY);
            void Analytics.logFeatureUsed(FeatureName.RESET_ONBOARDING, {
                action: "full_reset",
            });
        } catch (error) {
            console.error(
                "[OnboardingStorage] Error resetting onboarding:",
                error,
            );
            throw error;
        }
    },
};
