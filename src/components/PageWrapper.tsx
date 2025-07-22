// src/components/PageWrapper.tsx
import { motion, Variants } from "framer-motion";
import React from "react";
import { useNavigationContext } from "@/context/NavigationContext";

const pageVariants: Variants = {
  initial: (direction: "left" | "right") => ({
    x: direction === "left" ? "100%" : "-100%",
    position: "absolute" as const,
    width: "100%",
  }),
  in: {
    x: 0,
  },
  out: (direction: "left" | "right") => ({
    x: direction === "left" ? "-100%" : "100%",
    position: "absolute" as const,
    width: "100%",
  }),
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4,
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { direction } = useNavigationContext();

  return (
    <motion.div
      custom={direction}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
