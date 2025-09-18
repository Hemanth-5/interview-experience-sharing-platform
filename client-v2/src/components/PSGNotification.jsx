import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * PSGNotification - Modern notification toast component
 * @param {object} props
 * @param {string} props.message - The message to display
 * @param {string} [props.type] - 'success' | 'error' | 'info' | 'warning' (default: 'info')
 * @param {boolean} [props.open] - Whether the notification is visible
 * @param {function} [props.onClose] - Callback when notification closes
 * @param {number} [props.duration] - Auto-close duration in ms (default: 4000)
 */
const PSGNotification = ({ message, type = 'info', open, onClose, duration = 4000 }) => {
    const [visible, setVisible] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setVisible(false), 150); // Wait for animation
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        if (visible && isAnimating) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, isAnimating, duration]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, 150);
    };

    if (!visible) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/90 dark:to-emerald-950/90',
                    borderColor: 'border-green-200 dark:border-green-800',
                    textColor: 'text-green-800 dark:text-green-200',
                    iconColor: 'text-green-600 dark:text-green-400',
                    icon: CheckCircle
                };
            case 'error':
                return {
                    bgColor: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/90 dark:to-rose-950/90',
                    borderColor: 'border-red-200 dark:border-red-800',
                    textColor: 'text-red-800 dark:text-red-200',
                    iconColor: 'text-red-600 dark:text-red-400',
                    icon: XCircle
                };
            case 'warning':
                return {
                    bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/90 dark:to-orange-950/90',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    textColor: 'text-yellow-800 dark:text-yellow-200',
                    iconColor: 'text-yellow-600 dark:text-yellow-400',
                    icon: AlertCircle
                };
            default:
                return {
                    bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/90 dark:to-cyan-950/90',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    textColor: 'text-blue-800 dark:text-blue-200',
                    iconColor: 'text-blue-600 dark:text-blue-400',
                    icon: Info
                };
        }
    };

    const typeStyles = getTypeStyles();
    const IconComponent = typeStyles.icon;

    const notification = (
        <div 
            className={`
                fixed top-4 right-4 z-50 min-w-80 max-w-md
                ${typeStyles.bgColor} ${typeStyles.borderColor}
                backdrop-blur-md border rounded-xl shadow-lg
                transform transition-all duration-300 ease-out
                ${isAnimating 
                    ? 'translate-x-0 opacity-100 scale-100' 
                    : 'translate-x-full opacity-0 scale-95'
                }
            `}
            role="alert"
            aria-live="polite"
        >
            <div className="p-4">
                <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        <IconComponent className={`w-5 h-5 ${typeStyles.iconColor}`} />
                    </div>
                    
                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-5 ${typeStyles.textColor}`}>
                            {message}
                        </p>
                    </div>
                    
                    {/* Close Button */}
                    <div className="flex-shrink-0">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`
                                inline-flex rounded-md p-1.5 transition-colors duration-200
                                ${typeStyles.textColor} hover:bg-black/10 dark:hover:bg-white/10
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                                focus:ring-blue-500 dark:focus:ring-blue-400
                            `}
                            aria-label="Close notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className={`mt-3 w-full bg-black/10 dark:bg-white/10 rounded-full h-1 overflow-hidden`}>
                    <div 
                        className={`h-full bg-current ${typeStyles.iconColor} transition-all duration-100 ease-linear`}
                        style={{
                            animation: isAnimating ? `shrink ${duration}ms linear` : 'none',
                        }}
                    />
                </div>
            </div>
        </div>
    );

    return createPortal(
        <>
            {notification}
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </>,
        document.body
    );
};

export default PSGNotification;
