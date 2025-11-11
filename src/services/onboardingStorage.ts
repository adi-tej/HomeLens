import AsyncStorage from "@react-native-async-storage/async-storage";

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
            await AsyncStorage.multiSet([
                [ONBOARDING_KEY, "true"],
                [USER_EMAIL_KEY, email],
            ]);
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

    async reset(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([ONBOARDING_KEY, USER_EMAIL_KEY]);
        } catch (error) {
            console.error("Error resetting onboarding:", error);
            throw error;
        }
    },
};
