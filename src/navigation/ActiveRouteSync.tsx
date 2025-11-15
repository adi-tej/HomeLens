import React, { useEffect, useRef } from "react";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useAppActions } from "@state/useAppStore";
import { Analytics, ScreenName } from "@services/analytics";

function getDeepActiveName(state: any): string | undefined {
    if (!state) return undefined;
    const route = state.routes?.[state.index ?? 0];
    if (!route) return undefined;
    if (route.state) return getDeepActiveName(route.state);
    return route.name;
}

export default function ActiveRouteSync({
    navigationRef,
}: {
    navigationRef: React.RefObject<NavigationContainerRef<any>> | null;
}) {
    // Use action-only selector - never re-renders
    const { setActiveRouteName } = useAppActions();
    const lastNameRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const ref = navigationRef?.current;
        if (!ref || !ref.getRootState) return;

        const update = () => {
            const state = ref.getRootState();
            const name = getDeepActiveName(state);
            if (lastNameRef.current !== name) {
                lastNameRef.current = name;
                setActiveRouteName(name);
                void Analytics.logScreenView(name as ScreenName);
            }
        };

        // initial
        update();
        const unsubscribe = ref.addListener("state", update);
        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, [navigationRef, setActiveRouteName]);

    return null;
}
