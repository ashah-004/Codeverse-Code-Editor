import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return <div  className={`bg-white p-4 rounded shadow ${className}`}>{children}</div>;
};

export const CardContent = ({ children }: { children: ReactNode }) => {
  return <div className="p-4">{children}</div>;
};
