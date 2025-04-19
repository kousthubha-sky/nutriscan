import { CheckCircle } from 'lucide-react';

export function SuccessCheckmark({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-lg animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 animate-success" />
      </div>
    </div>
  );
}