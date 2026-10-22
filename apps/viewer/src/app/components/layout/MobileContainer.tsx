import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MobileContainer({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#F4F2EE] flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen overflow-hidden bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}