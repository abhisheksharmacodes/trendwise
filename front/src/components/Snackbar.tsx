import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

// Define the types for the Snackbar component's props
interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info'; // 'success' is the default
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // 4000ms is the default
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 4000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for slide-down animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-yellow-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-sm z-[9999] px-0 sm:px-4">
      <div
        className={`
          ${getBgColor()}
          ${getTextColor()}
          border rounded-lg shadow-lg p-4
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'}
        `}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-center sm:text-left">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snackbar;