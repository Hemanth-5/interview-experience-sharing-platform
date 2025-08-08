import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/psg-components.css';

/**
 * PSGNotification - Top-right notification popup for success/error/info messages
 * @param {object} props
 * @param {string} props.message - The message to display
 * @param {string} [props.type] - 'success' | 'error' | 'info' (default: 'info')
 * @param {boolean} [props.open] - Whether the notification is visible
 * @param {function} [props.onClose] - Callback when notification closes
 * @param {number} [props.duration] - Auto-close duration in ms (default: 4000)
 */
const PSGNotification = ({ message, type = 'info', open, onClose, duration = 4000 }) => {
    const [visible, setVisible] = useState(open);

    useEffect(() => {
        setVisible(open);
    }, [open]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    if (!visible) return null;

    const notification = (
        <div className={`psg-notification psg-fade-in psg-notification-${type}`}
            style={{ position: 'fixed', top: 24, right: 24, zIndex: 50000, minWidth: 260 }}
            onClick={() => { setVisible(false); if (onClose) onClose(); }}
        >
            <span className="psg-notification-message">{message}</span>
            <button className="psg-notification-close" onClick={e => { e.stopPropagation(); setVisible(false); if (onClose) onClose(); }}>&times;</button>
        </div>
    );

    return createPortal(notification, document.body);
};

export default PSGNotification;
