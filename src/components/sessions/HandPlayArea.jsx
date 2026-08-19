import { memo } from "react";

const HandPlayArea = ({ canvasRef }) => {
  return <canvas ref={canvasRef} />;
};

export default memo(HandPlayArea);
