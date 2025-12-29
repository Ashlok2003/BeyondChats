import React, { useMemo } from 'react';
import * as Diff from 'diff';

interface DiffViewerProps {
  originalRequest: string;
  enhancedRequest: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ originalRequest, enhancedRequest }) => {
  const diffs = useMemo(() => {
    if (!originalRequest || !enhancedRequest) return [];

    // Normalize newlines to avoid issues
    const original = originalRequest.replace(/\r\n/g, '\n');
    const enhanced = enhancedRequest.replace(/\r\n/g, '\n');

    // Use word-based diff for better readability in text
    return Diff.diffWords(original, enhanced);
  }, [originalRequest, enhancedRequest]);

  if (!originalRequest || !enhancedRequest) {
    return <div className="text-gray-500 italic">Content unavailable for comparison</div>;
  }

  return (
    <div className="font-['Helvetica'] text-[15px] leading-relaxed text-gray-900">
      <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider font-sans">Review Changes</span>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-red-700 bg-red-50 px-1 rounded">Removed content</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-green-700 bg-green-50 px-1 rounded">Added content</span>
          </div>
        </div>
      </div>

      <div className="whitespace-pre-wrap">
        {diffs.map((part: Diff.Change, index: number) => {
          if (part.added) {
            return (
              <span key={index} className="bg-green-100 text-green-800 px-1 rounded font-semibold mx-0.5 border-b-2 border-green-200" title="Added">
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span key={index} className="bg-red-100 text-red-800 line-through decoration-4 decoration-red-400 opacity-70 mx-0.5" title="Removed">
                {part.value}
              </span>
            );
          }
          return (
            <span key={index} className="text-gray-900">
              {part.value}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default DiffViewer;
