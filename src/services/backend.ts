/**
 * Backend integration for sending user email to HubSpot/Firebase
 *
 * This file should be updated once you decide on the backend service
 */

type EmailSubmissionResponse = {
    success: boolean;
    error?: string;
};

/**
 * Send user email to HubSpot
 * Documentation: https://developers.hubspot.com/docs/api/marketing/forms
 */
export async function sendToHubSpot(
    email: string,
): Promise<EmailSubmissionResponse> {
    try {
        // TODO: Replace with your HubSpot Portal ID and Form GUID
        const portalId = "YOUR_PORTAL_ID";
        const formGuid = "YOUR_FORM_GUID";

        const response = await fetch(
            `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fields: [
                        {
                            name: "email",
                            value: email,
                        },
                    ],
                    context: {
                        pageUri: "app://homelens/onboarding",
                        pageName: "Onboarding",
                    },
                }),
            },
        );

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message };
        }
    } catch (error) {
        console.error("HubSpot submission error:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Send user email to Firebase Firestore
 * Documentation: https://firebase.google.com/docs/firestore
 */
export async function sendToFirebase(
    email: string,
): Promise<EmailSubmissionResponse> {
    try {
        // TODO: Initialize Firebase and Firestore
        // import { getFirestore, collection, addDoc } from "firebase/firestore";
        // const db = getFirestore();

        // await addDoc(collection(db, "users"), {
        //     email,
        //     createdAt: new Date().toISOString(),
        //     platform: Platform.OS,
        // });

        return { success: true };
    } catch (error) {
        console.error("Firebase submission error:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Main function to submit email - update this based on your chosen backend
 */
export async function submitUserEmail(email: string): Promise<void> {
    // Choose your backend service here
    // const result = await sendToHubSpot(email);
    // const result = await sendToFirebase(email);

    // For now, just log (uncomment above when ready)
    console.log("User email submitted:", email);

    // Uncomment when implementing:
    // if (!result.success) {
    //     throw new Error(result.error || "Failed to submit email");
    // }
}
