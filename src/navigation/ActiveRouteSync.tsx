import React, { useEffect, useRef } from "react";
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
