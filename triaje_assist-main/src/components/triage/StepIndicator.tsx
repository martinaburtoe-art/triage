import { CheckCircle2 } from "lucide-react";

interface Props {
  current: number;
  steps: string[];
}

export function StepIndicator({ current, steps }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done
                      ? "bg-success text-success-foreground"
                      : active
                        ? "gradient-primary text-primary-foreground shadow-glow scale-110"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium hidden sm:block ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? "bg-success" : "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
