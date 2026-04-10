import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useSpring(-100, { stiffness: 350, damping: 32 });
  const y = useSpring(-100, { stiffness: 350, damping: 32 });

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer:fine)");
    const setCursorMode = () => {
      const nextEnabled = pointerQuery.matches;

      setEnabled(nextEnabled);
      document.body.classList.toggle("has-custom-cursor", nextEnabled);
    };

    const handleMove = (event) => {
      x.set(event.clientX - 14);
      y.set(event.clientY - 14);
      setVisible(true);
    };

    const handleLeave = () => setVisible(false);

    setCursorMode();
    pointerQuery.addEventListener("change", setCursorMode);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleLeave);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      pointerQuery.removeEventListener("change", setCursorMode);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleLeave);
    };
  }, [x, y]);

  if (!enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] h-7 w-7 rounded-full border border-white/30 bg-accent/20 backdrop-blur-md"
      style={{
        opacity: visible ? 1 : 0,
        x,
        y,
      }}
    />
  );
}

export default CustomCursor;
