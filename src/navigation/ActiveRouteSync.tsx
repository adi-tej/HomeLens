import React, { useEffect } from "react";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useAppContext } from "../state/AppContext";

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
    const { setActiveRouteName } = useAppContext();

    useEffect(() => {
        const ref = navigationRef?.current;
        if (!ref) return;

        // initial
        try {
            const state = ref.getRootState?.();
            setActiveRouteName(getDeepActiveName(state));
        } catch {
            setActiveRouteName(undefined);
        }

        const unsubscribe = ref.addListener?.("state", () => {
            try {
                const s = ref.getRootState?.();
                setActiveRouteName(getDeepActiveName(s));
            } catch {
                setActiveRouteName(undefined);
            }
        });

        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, [navigationRef, setActiveRouteName]);

    return null;
}
