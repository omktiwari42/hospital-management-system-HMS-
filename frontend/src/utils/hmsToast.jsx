import { toast } from "react-toastify";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaExclamationTriangle,
} from "react-icons/fa";

const common = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    newestOnTop: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,

    icon: false,
};

export const hmsToast = {

    success(title, message = "") {

        toast.success(
            <div className="hms-toast-content">

                <div className="hms-toast-icon success">

                    <FaCheckCircle />

                </div>

                <div>

                    <h4>{title}</h4>

                    {message && <p>{message}</p>}

                </div>

            </div>,
            common
        );

    },

    error(title, message = "") {

        toast.error(
            <div className="hms-toast-content">

                <div className="hms-toast-icon error">

                    <FaTimesCircle />

                </div>

                <div>

                    <h4>{title}</h4>

                    {message && <p>{message}</p>}

                </div>

            </div>,
            common
        );

    },

    warning(title, message = "") {

        toast.warning(
            <div className="hms-toast-content">

                <div className="hms-toast-icon warning">

                    <FaExclamationTriangle />

                </div>

                <div>

                    <h4>{title}</h4>

                    {message && <p>{message}</p>}

                </div>

            </div>,
            common
        );

    },

    info(title, message = "") {

        toast.info(
            <div className="hms-toast-content">

                <div className="hms-toast-icon info">

                    <FaInfoCircle />

                </div>

                <div>

                    <h4>{title}</h4>

                    {message && <p>{message}</p>}

                </div>

            </div>,
            common
        );

    },

};