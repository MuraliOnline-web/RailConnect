import { FaTrain } from "react-icons/fa6";

export function RailLogo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="bg-railway-gradient flex items-center justify-center rounded-xl text-white shadow-soft"
        style={{ width: size, height: size }}
      >
        <FaTrain size={size * 0.5} />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-bold tracking-tight">
          Rail<span className="text-railway-gradient">Connect</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Commuter Pass
        </div>
      </div>
    </div>
  );
}