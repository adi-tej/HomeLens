// import analytics from '@react-native-firebase/analytics';
// import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Firebase Analytics Service - STUBBED
 * Currently using console.log until native Firebase modules are built via prebuild
 *
 * To enable Firebase:
 * 1. Run: npx expo prebuild --clean
 * 2. Uncomment the imports above
 * 3. Replace console.log calls with actual Firebase calls
 */

// Screen names enum for consistency
export enum ScreenName {
    CALCULATOR = "Calculator",
    INSIGHTS = "Insights",
    LEARN = "Learn",
    HELP = "Help",
    ABOUT = "About",
    SCENARIO_MANAGER = "ScenarioManager",
    COMPARE = "Compare",
    ONBOARDING = "Onboarding",
}

// Feature names enum
export enum FeatureName {
    CREATE_SCENARIO = "create_scenario",
    EDIT_SCENARIO = "edit_scenario",
    DELETE_SCENARIO = "delete_scenario",
    COMPARE_SCENARIOS = "compare_scenarios",
    CALCULATE_STAMP_DUTY = "calculate_stamp_duty",
    CALCULATE_LMI = "calculate_lmi",
    VIEW_PROJECTIONS = "view_projections",
    EXPORT_SHARE = "export_share",
    RESET_ONBOARDING = "reset_onboarding",
}

// Property type enum
export enum PropertyType {
    HOUSE = "House",
    APARTMENT = "Apartment",
    LAND = "Land",
    TOWNHOUSE = "Townhouse",
}

/**
 * Analytics Service (STUBBED - using console.log)
 */
export const Analytics = {
    async logScreenView(screenName: ScreenName): Promise<void> {
        console.log("[Analytics] Screen View:", screenName);
    },

    async logFeatureUsed(
        feature: FeatureName,
        properties?: Record<string, any>,
    ): Promise<void> {
        console.log("[Analytics] Feature Used:", feature, properties);
    },

    async logScenarioCreated(scenarioName: string): Promise<void> {
        console.log("[Analytics] Scenario Created:", scenarioName);
    },

    async logScenarioComparison(scenarioCount: number): Promise<void> {
        console.log("[Analytics] Scenarios Compared:", scenarioCount);
    },

    async logCalculation(
        calculationType: string,
        propertyType?: PropertyType,
    ): Promise<void> {
        console.log("[Analytics] Calculation:", calculationType, propertyType);
    },

    async logPropertyInput(
        propertyType: PropertyType,
        value: number,
    ): Promise<void> {
        console.log(
            "[Analytics] Property Input:",
            propertyType,
            value,
            getValueRange(value),
        );
    },

    async logEngagement(duration: number): Promise<void> {
        console.log("[Analytics] Engagement:", duration);
    },

    async logShare(contentType: string): Promise<void> {
        console.log("[Analytics] Share:", contentType);
    },

    async setUserProperties(properties: {
        userType?: "first_time_buyer" | "investor" | "upgrader";
        preferredPropertyType?: PropertyType;
        numberOfScenarios?: number;
    }): Promise<void> {
        console.log("[Analytics] User Properties:", properties);
    },

    async logOnboardingComplete(email: string): Promise<void> {
        console.log("[Analytics] Onboarding Complete:", email);
    },
};

/**
 * Crashlytics Service (STUBBED - using console.log)
 */
export const Crashlytics = {
    recordError(error: Error, context?: string): void {
        console.error("[Crashlytics] Error:", context, error);
    },

    setUserId(userId: string): void {
        console.log("[Crashlytics] User ID:", userId);
    },

    log(message: string): void {
        console.log("[Crashlytics]", message);
    },

    setAttribute(key: string, value: string): void {
        console.log("[Crashlytics] Attribute:", key, value);
    },
};

/**
 * Helper function to categorize property values
 */
function getValueRange(value: number): string {
    if (value < 300000) return "under_300k";
    if (value < 500000) return "300k_500k";
    if (value < 750000) return "500k_750k";
    if (value < 1000000) return "750k_1m";
    if (value < 1500000) return "1m_1.5m";
    return "over_1.5m";
}
