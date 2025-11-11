/**
 * Backend integration for sending user email to HubSpot
 * Stores user emails from onboarding in HubSpot CRM
 * Includes Firebase Analytics and error logging
 */

import { Platform } from "react-native";
import { Analytics, Crashlytics } from "./analytics";

type EmailSubmissionResponse = {
    success: boolean;
    error?: string;
};

// HubSpot Configuration
// Get these values from: https://app.hubspot.com/forms/{portalId}
const HUBSPOT_CONFIG = {
    portalId: "442436456", // Replace with your HubSpot Portal ID
    formGuid: "f403e383-b839-4023-8081-6e7eb13d0906", // Replace with your Form GUID
};

/**
 * Send user email to HubSpot using Forms API
 * Documentation: https://developers.hubspot.com/docs/api/marketing/forms
 */
export async function sendToHubSpot(
    email: string,
    additionalData?: Record<string, string>,
): Promise<EmailSubmissionResponse> {
    try {
        const { portalId, formGuid } = HUBSPOT_CONFIG;

        // Validate configuration
        if (portalId === "YOUR_PORTAL_ID" || formGuid === "YOUR_FORM_GUID") {
            console.warn(
                "HubSpot not configured. Set HUBSPOT_CONFIG in backend.ts",
            );
            return {
                success: false,
                error: "HubSpot configuration missing",
            };
        }

        const fields = [
            {
                objectTypeId: "0-1", // Contact object
                name: "email",
                value: email,
            },
        ];

        // Add additional fields if provided
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                fields.push({
                    objectTypeId: "0-1",
                    name: key,
                    value: value,
                });
            });
        }

        const payload = {
            fields,
            context: {
                pageUri: "app://homelens/onboarding",
                pageName: "HomeLens Onboarding",
            },
            legalConsentOptions: {
                consent: {
                    consentToProcess: true,
                    text: "I agree to allow HomeLens to store and process my personal data.",
                },
            },
        };

        console.log("[HubSpot] Submitting email:", email);

        // Track submission attempt in Firebase Analytics
        await Analytics.logFeatureUsed("submit_email_to_hubspot" as any, {
            has_metadata: !!additionalData,
        });

        const response = await fetch(
            `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            },
        );

        const responseData = await response.json();

        if (response.ok) {
            console.log("[HubSpot] ✅ Email submitted successfully");

            // Track successful submission in Firebase Analytics
            await Analytics.logFeatureUsed(
                "hubspot_submission_success" as any,
                {
                    email_domain: email.split("@")[1],
                    platform: additionalData?.platform || Platform.OS,
                },
            );

            return { success: true };
        } else {
            console.error("[HubSpot] ❌ Submission failed:", responseData);

            // Log error to Firebase Analytics
            await Analytics.logFeatureUsed("hubspot_submission_failed" as any, {
                error_type: "api_error",
                error_message: responseData.message || "Unknown error",
                status_code: response.status,
            });

            // Log to Crashlytics
            const error = new Error(
                `HubSpot submission failed: ${responseData.message || "Unknown error"}`,
            );
            Crashlytics.recordError(error, "HubSpot API Error");

            return {
                success: false,
                error: responseData.message || "HubSpot submission failed",
            };
        }
    } catch (error) {
        console.error("[HubSpot] ❌ Network error:", error);

        // Log network error to Firebase Analytics
        await Analytics.logFeatureUsed("hubspot_submission_failed" as any, {
            error_type: "network_error",
            error_message: String(error),
        });

        // Log to Crashlytics with context
        Crashlytics.recordError(error as Error, "HubSpot Network Error");

        return { success: false, error: String(error) };
    }
}

/**
 * Send user email and device info to HubSpot
 */
export async function submitUserEmail(
    email: string,
    metadata?: {
        platform?: string;
        deviceModel?: string;
        appVersion?: string;
    },
): Promise<void> {
    try {
        // Track email submission start
        await Analytics.logFeatureUsed("email_submission_started" as any, {
            platform: metadata?.platform || Platform.OS,
            has_device_info: !!metadata?.deviceModel,
        });

        // Prepare additional data for HubSpot custom properties
        const additionalData: Record<string, string> = {
            platform: metadata?.platform || Platform.OS,
            app_source: "mobile_app",
            signup_date: new Date().toISOString(),
        };

        if (metadata?.deviceModel) {
            additionalData.device_model = metadata.deviceModel;
        }

        if (metadata?.appVersion) {
            additionalData.app_version = metadata.appVersion;
        }

        // Send to HubSpot
        const result = await sendToHubSpot(email, additionalData);

        if (!result.success) {
            // Log error but don't block user - onboarding should continue
            console.error(
                "[Backend] Failed to submit email to HubSpot:",
                result.error,
            );

            // Track submission failure
            await Analytics.logFeatureUsed(
                "email_submission_completed" as any,
                {
                    success: false,
                    error: result.error || "unknown",
                },
            );

            // Log to Crashlytics for monitoring
            const error = new Error(`Email submission failed: ${result.error}`);
            Crashlytics.recordError(error, "Email Submission Failed");

            // Don't throw - we want onboarding to succeed even if HubSpot fails
        } else {
            console.log("[Backend] ✅ Email successfully stored in HubSpot");

            // Track successful submission
            await Analytics.logFeatureUsed(
                "email_submission_completed" as any,
                {
                    success: true,
                    email_domain: email.split("@")[1],
                    platform: additionalData.platform,
                },
            );
        }
    } catch (error) {
        console.error("[Backend] Unexpected error:", error);

        // Track unexpected error
        await Analytics.logFeatureUsed("email_submission_error" as any, {
            error_type: "unexpected",
            error_message: String(error),
        });

        // Log to Crashlytics
        Crashlytics.recordError(
            error as Error,
            "Email Submission Unexpected Error",
        );

        // Don't throw - onboarding should continue
    }
}
