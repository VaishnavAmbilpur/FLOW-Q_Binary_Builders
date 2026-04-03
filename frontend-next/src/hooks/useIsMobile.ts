import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the screen is mobile-sized.
 * Threshold is typically 768px (MD breakpoint in Tailwind).
 */
export const useIsMobile = (threshold = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < threshold);
        };

        // Check on mount
        checkMobile();

        // Listen for resize
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [threshold]);

    return isMobile;
};
