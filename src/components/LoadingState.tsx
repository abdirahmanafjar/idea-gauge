import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-muted animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Analyzing Your Idea
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Our AI is evaluating market potential, risk factors, and scalability...
        </p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingState;