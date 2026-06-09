'use client';

interface ConclusionProps {
  text: string;
  accentColor?: string;
}

export default function Conclusion({ text, accentColor = 'var(--accent-emerald)' }: ConclusionProps) {
  const lines = text.split('\n').filter(line => line.trim());

  return (
    <div
      className="relative rounded-2xl p-6 mt-6"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`,
        border: `1px solid ${accentColor}30`,
      }}
    >
      {/* Decorative accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
        style={{ background: accentColor }}
      />

      <div className="pl-4">
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span>3行字终极结论</span>
        </h3>
        <div className="space-y-2">
          {lines.map((line, index) => (
            <p key={index} className="text-foreground-secondary leading-relaxed text-sm">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
