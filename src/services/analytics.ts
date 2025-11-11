/**
 * Firebase Analytics Service
 * Works in both development (console.log) and production (Firebase)
 * Safely handles cases where Firebase native modules aren't available
 */

import { Dimensions, Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

let analytics: any = null;
let crashlytics: any = null;

// Try to load Firebase modules (will fail gracefully if not available)
try {
    analytics = require("@react-native-firebase/analytics").default;
    crashlytics = require("@react-native-firebase/crashlytics").default;
} catch (error) {
    // Firebase not available - will use console.log fallback
    console.log(
        "[Analytics] Firebase modules not available, using console.log fallback",
    );
}

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
    USE_BOTTOM_TAB = "use_bottom_tab",
    USE_MAIN_MENU = "use_main_menu",
    OPEN_DRAWER = "open_drawer",
}

// Property type enum
export enum PropertyType {
    HOUSE = "House",
    APARTMENT = "Apartment",
    LAND = "Land",
    TOWNHOUSE = "Townhouse",
}

/**
 * Analytics Service
 * Automatically uses Firebase if available, falls back to console.log
 */
export const Analytics = {
    async logScreenView(screenName: ScreenName): Promise<void> {
        try {
            if (analytics) {
                await analytics().logScreenView({
                    screen_name: screenName,
                    screen_class: screenName,
                });
            }
            console.log("[Analytics] Screen View:", screenName);
        } catch (error) {
            console.error("[Analytics] Failed to log screen view:", error);
        }
    },

    async logFeatureUsed(
        feature: FeatureName,
        properties?: Record<string, any>,
    ): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("feature_used", {
                    feature,
                    ...properties,
                });
            }
            console.log("[Analytics] Feature Used:", feature, properties);
        } catch (error) {
            console.error("[Analytics] Failed to log feature:", error);
        }
    },

    async logScenarioCreated(scenarioName: string): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("scenario_created", {
                    scenario_name: scenarioName,
                });
            }
            console.log("[Analytics] Scenario Created:", scenarioName);
        } catch (error) {
            console.error(
                "[Analytics] Failed to log scenario creation:",
                error,
            );
        }
    },

    async logScenarioComparison(scenarioCount: number): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("scenarios_compared", {
                    scenario_count: scenarioCount,
                });
            }
            console.log("[Analytics] Scenarios Compared:", scenarioCount);
        } catch (error) {
            console.error("[Analytics] Failed to log comparison:", error);
        }
    },

    async logCalculation(
        calculationType: string,
        propertyType?: PropertyType,
    ): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("calculation_performed", {
                    calculation_type: calculationType,
                    property_type: propertyType,
                });
            }
            console.log(
                "[Analytics] Calculation:",
                calculationType,
                propertyType,
            );
        } catch (error) {
            console.error("[Analytics] Failed to log calculation:", error);
        }
    },

    async logPropertyInput(
        propertyType: PropertyType,
        value: number,
    ): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("property_value_entered", {
                    property_type: propertyType,
                    value_range: getValueRange(value),
                });
            }
            console.log(
                "[Analytics] Property Input:",
                propertyType,
                value,
                getValueRange(value),
            );
        } catch (error) {
            console.error("[Analytics] Failed to log property input:", error);
        }
    },

    async logEngagement(duration: number): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("session_duration", {
                    duration_seconds: Math.round(duration / 1000),
                });
            }
            console.log("[Analytics] Engagement:", duration);
        } catch (error) {
            console.error("[Analytics] Failed to log engagement:", error);
        }
    },

    async logShare(contentType: string): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("share", {
                    content_type: contentType,
                    method: "native_share",
                });
            }
            console.log("[Analytics] Share:", contentType);
        } catch (error) {
            console.error("[Analytics] Failed to log share:", error);
        }
    },

    async setUserProperties(properties: {
        userType?: "first_time_buyer" | "investor" | "upgrader";
        preferredPropertyType?: PropertyType;
        numberOfScenarios?: number;
        state?: string;
        buyerType?: "first_home_buyer" | "upgrader" | "investor" | "unknown";
    }): Promise<void> {
        try {
            if (analytics) {
                if (properties.userType) {
                    await analytics().setUserProperty(
                        "user_type",
                        properties.userType,
                    );
                }
                if (properties.preferredPropertyType) {
                    await analytics().setUserProperty(
                        "preferred_property_type",
                        properties.preferredPropertyType,
                    );
                }
                if (properties.numberOfScenarios !== undefined) {
                    await analytics().setUserProperty(
                        "scenario_count",
                        String(properties.numberOfScenarios),
                    );
                }
                if (properties.state) {
                    await analytics().setUserProperty(
                        "user_state",
                        properties.state,
                    );
                }
                if (properties.buyerType) {
                    await analytics().setUserProperty(
                        "buyer_type",
                        properties.buyerType,
                    );
                }
            }
            console.log("[Analytics] User Properties:", properties);
        } catch (error) {
            console.error("[Analytics] Failed to set user properties:", error);
        }
    },

    async logUserProfile(profile: {
        state?: string;
        buyerType?: "first_home_buyer" | "upgrader" | "investor" | "unknown";
        propertyType?: PropertyType;
    }): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("user_profile_updated", {
                    state: profile.state,
                    buyer_type: profile.buyerType,
                    property_type: profile.propertyType,
                });
            }
            console.log("[Analytics] User Profile:", profile);
        } catch (error) {
            console.error("[Analytics] Failed to log user profile:", error);
        }
    },

    async logOnboardingComplete(email: string): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("onboarding_complete", {
                    method: "email",
                    email_domain: email.split("@")[1],
                });
            }
            console.log("[Analytics] Onboarding Complete:", email);
        } catch (error) {
            console.error("[Analytics] Failed to log onboarding:", error);
        }
    },

    async logMenuUsage(
        menuType: "bottom_tab" | "main_menu",
        destination: string,
    ): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("menu_navigation", {
                    menu_type: menuType,
                    destination,
                });
            }
            console.log("[Analytics] Menu Usage:", menuType, "→", destination);
        } catch (error) {
            console.error("[Analytics] Failed to log menu usage:", error);
        }
    },

    async logDrawerOpen(source: "left" | "right"): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("drawer_opened", {
                    drawer_side: source,
                });
            }
            console.log("[Analytics] Drawer Opened:", source);
        } catch (error) {
            console.error("[Analytics] Failed to log drawer open:", error);
        }
    },

    /**
     * Initialize and track device/platform information
     * Call this once when app starts
     */
    async initializeDeviceTracking(): Promise<void> {
        try {
            const { width, height } = Dimensions.get("window");
            const deviceInfo = {
                platform: Platform.OS,
                platform_version: Platform.Version,
                device_brand: Device.brand || "unknown",
                device_model: Device.modelName || "unknown",
                device_type: Device.deviceType || "unknown",
                os_name: Device.osName || Platform.OS,
                os_version: Device.osVersion || String(Platform.Version),
                app_version: Constants.expoConfig?.version || "1.0.0",
                screen_width: width,
                screen_height: height,
                is_tablet: Device.deviceType === Device.DeviceType.TABLET,
            };

            // Set as user properties for segmentation
            if (analytics) {
                await analytics().setUserProperty(
                    "platform",
                    deviceInfo.platform,
                );
                await analytics().setUserProperty(
                    "device_model",
                    deviceInfo.device_model,
                );
                await analytics().setUserProperty(
                    "os_version",
                    deviceInfo.os_version,
                );
                await analytics().setUserProperty(
                    "app_version",
                    deviceInfo.app_version,
                );
                await analytics().setUserProperty(
                    "device_type",
                    String(deviceInfo.device_type),
                );
            }

            // Log device info event
            await this.logDeviceInfo(deviceInfo);

            console.log("[Analytics] Device Tracking Initialized:", deviceInfo);
        } catch (error) {
            console.error(
                "[Analytics] Failed to initialize device tracking:",
                error,
            );
        }
    },

    async logDeviceInfo(deviceInfo: Record<string, any>): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("device_info", deviceInfo);
            }
            console.log("[Analytics] Device Info:", deviceInfo);
        } catch (error) {
            console.error("[Analytics] Failed to log device info:", error);
        }
    },

    async logAppOpen(): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("app_open", {
                    platform: Platform.OS,
                    timestamp: new Date().toISOString(),
                });
            }
            console.log("[Analytics] App Opened:", Platform.OS);
        } catch (error) {
            console.error("[Analytics] Failed to log app open:", error);
        }
    },

    async logAppClose(sessionDuration: number): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("app_close", {
                    session_duration: Math.round(sessionDuration / 1000),
                    platform: Platform.OS,
                });
            }
            console.log(
                "[Analytics] App Closed. Session:",
                sessionDuration,
                "ms",
            );
        } catch (error) {
            console.error("[Analytics] Failed to log app close:", error);
        }
    },

    async logUIInteraction(
        component: string,
        action: string,
        properties?: Record<string, any>,
    ): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("ui_interaction", {
                    component,
                    action,
                    platform: Platform.OS,
                    ...properties,
                });
            }
            console.log(
                "[Analytics] UI Interaction:",
                component,
                action,
                properties,
            );
        } catch (error) {
            console.error("[Analytics] Failed to log UI interaction:", error);
        }
    },

    async logError(error: Error, context?: string): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("app_error", {
                    error_message: error.message,
                    error_stack: error.stack?.substring(0, 500),
                    context: context || "unknown",
                    platform: Platform.OS,
                });
            }
            console.error("[Analytics] Error Logged:", context, error);

            // Also send to Crashlytics
            Crashlytics.recordError(error, context);
        } catch (err) {
            console.error("[Analytics] Failed to log error:", err);
        }
    },

    async logPerformanceMetric(
        metric: string,
        value: number,
        unit?: string,
    ): Promise<void> {
        try {
            if (analytics) {
                await analytics().logEvent("performance_metric", {
                    metric_name: metric,
                    metric_value: value,
                    metric_unit: unit || "ms",
                    platform: Platform.OS,
                });
            }
            console.log("[Analytics] Performance:", metric, value, unit);
        } catch (error) {
            console.error("[Analytics] Failed to log performance:", error);
        }
    },
};

/**
 * Crashlytics Service
 * Automatically uses Firebase if available, falls back to console.log
 */
export const Crashlytics = {
    recordError(error: Error, context?: string): void {
        try {
            if (crashlytics) {
                if (context) {
                    crashlytics().log(`Context: ${context}`);
                }
                crashlytics().recordError(error);
            }
            console.error("[Crashlytics] Error:", context, error);
        } catch (err) {
            console.error("[Crashlytics] Failed to record error:", err);
        }
    },

    setUserId(userId: string): void {
        try {
            if (crashlytics) {
                crashlytics().setUserId(userId);
            }
            console.log("[Crashlytics] User ID:", userId);
        } catch (error) {
            console.error("[Crashlytics] Failed to set user ID:", error);
        }
    },

    log(message: string): void {
        try {
            if (crashlytics) {
                crashlytics().log(message);
            }
            console.log("[Crashlytics]", message);
        } catch (error) {
            console.error("[Crashlytics] Failed to log message:", error);
        }
    },

    setAttribute(key: string, value: string): void {
        try {
            if (crashlytics) {
                crashlytics().setAttribute(key, value);
            }
            console.log("[Crashlytics] Attribute:", key, value);
        } catch (error) {
            console.error("[Crashlytics] Failed to set attribute:", error);
        }
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
