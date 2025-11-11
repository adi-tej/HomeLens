import { Analytics } from "./analytics";

/**
 * User Profile Service
 * Detects and tracks user state and buyer type from their inputs
 */

export type AustralianState =
    | "NSW"
    | "VIC"
    | "QLD"
    | "WA"
    | "SA"
    | "TAS"
    | "ACT"
    | "NT";
export type BuyerType =
    | "first_home_buyer"
    | "upgrader"
    | "investor"
    | "unknown";

interface UserProfile {
    state?: AustralianState;
    buyerType?: BuyerType;
    lastUpdated?: string;
}

/**
 * Detect buyer type from scenario/property details
 */
export function detectBuyerType(data: {
    isFirstHome?: boolean;
    isInvestment?: boolean;
    hasExistingProperty?: boolean;
    numberOfProperties?: number;
}): BuyerType {
    if (data.isFirstHome === true) {
        return "first_home_buyer";
    }

    if (
        data.isInvestment === true ||
        (data.numberOfProperties && data.numberOfProperties > 1)
    ) {
        return "investor";
    }

    if (data.hasExistingProperty === true) {
        return "upgrader";
    }

    return "unknown";
}

/**
 * Detect state from stamp duty calculations or property location
 */
export function detectState(
    stampDutyState?: string,
): AustralianState | undefined {
    const stateMap: Record<string, AustralianState> = {
        nsw: "NSW",
        "new south wales": "NSW",
        vic: "VIC",
        victoria: "VIC",
        qld: "QLD",
        queensland: "QLD",
        wa: "WA",
        "western australia": "WA",
        sa: "SA",
        "south australia": "SA",
        tas: "TAS",
        tasmania: "TAS",
        act: "ACT",
        "australian capital territory": "ACT",
        nt: "NT",
        "northern territory": "NT",
    };

    if (!stampDutyState) return undefined;

    const normalized = stampDutyState.toLowerCase().trim();
    return stateMap[normalized];
}

/**
 * Update user profile and send to analytics
 */
export async function updateUserProfile(
    updates: Partial<UserProfile>,
): Promise<void> {
    try {
        const profile: UserProfile = {
            ...updates,
            lastUpdated: new Date().toISOString(),
        };

        // Track in analytics
        await Analytics.logUserProfile({
            state: profile.state,
            buyerType: profile.buyerType,
        });

        // Also set as user properties for segmentation
        await Analytics.setUserProperties({
            state: profile.state,
            buyerType: profile.buyerType,
        });

        console.log("[UserProfile] Updated:", profile);
    } catch (error) {
        console.error("[UserProfile] Failed to update:", error);
    }
}

/**
 * Track when user sets stamp duty state (indicates their location)
 */
export async function trackStateSelection(
    state: AustralianState,
): Promise<void> {
    await updateUserProfile({ state });
}

/**
 * Track when we can infer buyer type from their inputs
 */
export async function trackBuyerType(buyerType: BuyerType): Promise<void> {
    await updateUserProfile({ buyerType });
}

/**
 * Analyze property form data to detect buyer type
 */
export async function analyzePropertyData(data: {
    isOwnerOccupied?: boolean;
    isInvestment?: boolean;
    hasExistingHome?: boolean;
    stampDutyState?: string;
}): Promise<void> {
    // Detect state
    const state = detectState(data.stampDutyState);
    if (state) {
        await trackStateSelection(state);
    }

    // Detect buyer type
    const buyerType = detectBuyerType({
        isFirstHome: data.isOwnerOccupied && !data.hasExistingHome,
        isInvestment: data.isInvestment,
        hasExistingProperty: data.hasExistingHome,
    });

    if (buyerType !== "unknown") {
        await trackBuyerType(buyerType);
    }
}
