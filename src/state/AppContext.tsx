import React, { createContext, useContext, useState, ReactNode } from "react";

type AppContextType = {
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const value: AppContextType = {
    isDrawerOpen,
    setDrawerOpen,
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
