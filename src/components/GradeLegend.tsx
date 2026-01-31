export const GradeLegend = () => {
  const grades = [
    { grade: "A", label: "Very Poor", color: "bg-grade-a" },
    { grade: "B", label: "Poor", color: "bg-grade-b" },
    { grade: "C", label: "Below Avg", color: "bg-grade-c" },
    { grade: "D", label: "Average", color: "bg-grade-d" },
    { grade: "E", label: "Good", color: "bg-grade-e" },
    { grade: "F", label: "Excellent", color: "bg-grade-f" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 rounded-xl bg-secondary/50 border border-border">
      <span className="text-xs font-medium text-muted-foreground mr-2">Grade Scale:</span>
      {grades.map(({ grade, label, color }) => (
        <div key={grade} className="flex items-center gap-1.5">
          <div className={`h-5 w-5 rounded-md ${color} flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
            {grade}
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default GradeLegend;