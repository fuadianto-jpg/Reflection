import type { ReactNode } from "react";

export default function PhoneMockup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`phone ${className ?? ""}`}>
      <span className="phone-notch" />
      <div className="phone-screen">{children}</div>
    </div>
  );
}
