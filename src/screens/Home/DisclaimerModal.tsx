import React from "react";
import { Divider, Text } from "react-native-paper";
import ReusableModal from "../../components/primitives/ReusableModal";

type Props = {
    visible: boolean;
    onDismiss: () => void;
};

export default function DisclaimerModal({ visible, onDismiss }: Props) {
    return (
        <ReusableModal
            visible={visible}
            onDismiss={onDismiss}
            title="Full disclaimers & privacy"
        >
            <Divider style={{ marginVertical: 8 }} />

            <Text variant="titleMedium" style={{ marginTop: 8 }}>
                Disclaimers
            </Text>
            <Text style={{ marginTop: 8 }}>
                HomeLens provides estimates and projections for informational
                purposes only. The calculations are based on assumptions and
                user inputs; actual results will vary. HomeLens does not provide
                financial, legal, tax or real-estate advice. You should consult
                qualified professionals before making any purchase, sale or
                financing decisions.
            </Text>

            <Text variant="titleMedium" style={{ marginTop: 12 }}>
                Limitations
            </Text>
            <Text style={{ marginTop: 8 }}>
                The app simplifies complex matters and may omit factors such as
                transaction costs, local market micro-trends, or regulatory
                changes. Projections are not guarantees and may not account for
                unexpected events or personal circumstances.
            </Text>

            <Text variant="titleMedium" style={{ marginTop: 12 }}>
                Privacy
            </Text>
            <Text style={{ marginTop: 8 }}>
                We respect your privacy. HomeLens stores scenario data locally
                on your device (or in-app storage) and does not transmit
                personal data to third parties without consent. If you opt into
                syncing or analytics, those services will be described at the
                point of opt-in.
            </Text>

            <Text variant="titleMedium" style={{ marginTop: 12 }}>
                Data sources
            </Text>
            <Text style={{ marginTop: 8 }}>
                Market numbers shown are illustrative unless sourced from a live
                data provider. Where live data is used we rely on the provider's
                accuracy and timeliness; verify with official sources for
                critical decisions.
            </Text>

            <Text variant="titleMedium" style={{ marginTop: 12 }}>
                Contact
            </Text>
            <Text style={{ marginTop: 8 }}>
                For support or questions about HomeLens, please refer to the
                Help section in the app or contact the development team.
            </Text>
        </ReusableModal>
    );
}
