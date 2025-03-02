import { useState, useEffect } from "react";
import ArcadeDashboard from "./components/ArcadeDashboard";
import ThreeBackground from "./components/ThreeBackground";

export default function NexArcadeApp() {
  const [selectedText, setSelectedText] = useState<string>("");
  const [hoveredText, setHoveredText] = useState<string>("");

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection) {
        setSelectedText(selection.toString());
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleTextHover = (text: string) => {
    setHoveredText(text);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <ThreeBackground selectedText={selectedText || hoveredText} />
      </div>
      <div className="relative z-10">
        <ArcadeDashboard onTextHover={handleTextHover} />
      </div>
    </div>
  );
}
