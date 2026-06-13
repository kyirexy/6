'use client';

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
}

export default function ExportButton({
  targetRef,
  filename = 'videocapsule-card',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!targetRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [targetRef, filename, isExporting]);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="glass-input btn-magnetic flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground-secondary hover:text-foreground transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
    >
      {isExporting ? (
        <>
          <div className="spinner" />
          <span>导出中...</span>
        </>
      ) : (
        <>
          <Download size={16} className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0.5" />
          <span>导出长图</span>
        </>
      )}
    </button>
  );
}
