import { useEffect } from "react";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaTimes,
} from "react-icons/fa";

export default function HMSToast({
    show,
    type = "success",
    title,
    message,
    duration = 3000,
    onClose,
}) {

    useEffect(() => {

        if (!show) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);

    }, [show, duration, onClose]);

    if (!show) return null;

    const icons = {
        success: <FaCheckCircle />,
        error: <FaTimesCircle />,
        warning: <FaExclamationTriangle />,
        info: <FaInfoCircle />,
    };

    return (
        <div className={`hms-toast ${type}`}>

            <div className="toast-left">

                <div className="toast-icon">
                    {icons[type]}
                </div>

                <div className="toast-content">

                    <h4>{title}</h4>

                    <p>{message}</p>

                </div>

            </div>

            <button
                className="toast-close"
                onClick={onClose}
            >
                <FaTimes />
            </button>

            <div
                className="toast-progress"
                style={{
                    animationDuration: `${duration}ms`,
                }}
            ></div>

        </div>
    );
}