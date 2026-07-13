import { toast } from "react-toastify";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaExclamationTriangle,
} from "react-icons/fa";
const TOAST_IDS = {

    LOGIN: "login",

    SEND_OTP: "send_otp",

    VERIFY_OTP: "verify_otp",

    RESEND_OTP: "resend_otp",

    DELETE_NOTIFICATION: "delete_notification",

    MARK_READ: "mark_read",

    MARK_ALL: "mark_all",

    BOOK_APPOINTMENT: "book_appointment",

    PAYMENT: "payment",

};

const common = {

    position: "top-right",

    autoClose: 3500,

    hideProgressBar: false,

    newestOnTop: true,

    closeOnClick: true,

    pauseOnHover: true,

    draggable: true,

    draggablePercent: 60,

    progress: undefined,

    icon: false,

    theme: "light",

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

    loading(message = "Please wait...", id = undefined) {

        return toast.loading(message, {

            position: "top-right",

            closeButton: false,

            draggable: false,

            closeOnClick: false,

            pauseOnHover: false,

            icon: false,

            toastId: id,

        });

    },

    updateSuccess(id, title, message = "") {

        toast.update(id, {

            render: (

                <div className="hms-toast-content">

                    <div className="hms-toast-icon success">

                        <FaCheckCircle />

                    </div>

                    <div>

                        <h4>{title}</h4>

                        {message && <p>{message}</p>}

                    </div>

                </div>

            ),

            type: "success",

            isLoading: false,

            autoClose: 2500,

            closeButton: true,

            draggable: true,

            icon: false,

        });

    },

    updateError(id, title, message = "") {

        toast.update(id, {

            render: (

                <div className="hms-toast-content">

                    <div className="hms-toast-icon error">

                        <FaTimesCircle />

                    </div>

                    <div>

                        <h4>{title}</h4>

                        {message && <p>{message}</p>}

                    </div>

                </div>

            ),

            type: "error",

            isLoading: false,

            autoClose: 3500,

            closeButton: true,

            draggable: true,

            icon: false,

        });

    },

};
export { TOAST_IDS };