import React from "react";
import useMagicBackgroundStore from "../../../store/useMagicBackgroundStore";
import LocalMagicBackground from "./LocalMagicBackground";

const MagicBackground: React.FC = () => {
  const { isBackgroundVisible } = useMagicBackgroundStore();

  return <LocalMagicBackground isVisible={isBackgroundVisible} />;
};

export default MagicBackground;
