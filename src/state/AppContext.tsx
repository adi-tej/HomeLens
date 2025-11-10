import React, { createContext, ReactNode, useContext, useState } from "react";

type AppContextType = {
    isDrawerOpen: boolean;
    setDrawerOpen: (isOpen: boolean) => void;
    isCompareScreenActive: boolean;
    setCompareScreenActive: (isActive: boolean) => void;
    activeRouteName?: string;
    setActiveRouteName: (name: string | undefined) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isCompareScreenActive, setCompareScreenActive] = useState(false);
    const [activeRouteName, setActiveRouteName] = useState<string | undefined>(
        undefined,
    );

    const value: AppContextType = {
        isDrawerOpen,
        setDrawerOpen,
        isCompareScreenActive,
        setCompareScreenActive,
        activeRouteName,
        setActiveRouteName,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within AppProvider");
    }
    return context;
}
