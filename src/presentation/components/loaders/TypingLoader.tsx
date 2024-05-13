import { FC } from "react";
import "./TypingLoader.css";

interface TypingProps {
  className?: string;
}

export const TypingLoader: FC<TypingProps> = ({ className }) => {
  return (
    <div className={`typing ${className}`}>
      <span className="circle scaling"></span>
      <span className="circle scaling"></span>
      <span className="circle scaling"></span>
    </div>
  );
};
