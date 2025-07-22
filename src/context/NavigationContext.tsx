// src/context/NavigationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

type Direction = "left" | "right";

interface NavigationContextType {
  direction: Direction;
  setDirection: (direction: Direction) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [direction, setDirection] = useState<Direction>("left");

  return (
    <NavigationContext.Provider value={{ direction, setDirection }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider",
    );
  }
  return context;
};
