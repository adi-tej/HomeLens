import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Animated, Dimensions } from "react-native";

type DrawerContextType = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
  progress: Animated.Value;
  drawerWidth: number;
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function useRightDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx)
    throw new Error("useRightDrawer must be used within RightDrawerProvider");
  return ctx;
}

export function RightDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const screenWidth = Dimensions.get("window").width;
  const drawerWidth = Math.min(360, Math.round(screenWidth * 0.8));

  const progress = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsOpen(true);
  }, [progress]);

  const close = useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  }, [progress]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const value = useMemo(
    () => ({ open, close, toggle, isOpen, progress, drawerWidth }),
    [isOpen, progress, drawerWidth],
  );

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}
