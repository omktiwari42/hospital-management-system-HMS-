// import { useState } from "react";
// import api from "../services/api";
// import { toast } from "react-toastify";
//import PrescriptionSkeleton from "../components/skeletons/PrescriptionSkeleton";
// function Prescriptions() {
//     const [patientId, setPatientId] =
//         useState("");

//     const [doctorId, setDoctorId] =
//         useState("");

//     const [medicines, setMedicines] =
//         useState("");

//     const [dosage, setDosage] =
//         useState("");

//     const [duration, setDuration] =
//         useState("");

//     const [notes, setNotes] =

//         useState("");
//const [loading,setLoading]=useState(true);

//     async function savePrescription() {
//         try {
//             await api.post(
//                 "/prescriptions",
//                 {
//                     patient_id: patientId,
//                     doctor_id: doctorId,
//                     medicines,
//                     dosage,
//                     duration,
//                     notes,
//                 }
//             );

//             toast.success(
//                 "Prescription Saved"
//             );

//             setPatientId("");
//             setDoctorId("");
//             setMedicines("");
//             setDosage("");
//             setDuration("");
//             setNotes("");
//         } catch (error) {
//             console.log(error);

//             toast.error(
//                 "Failed to save prescription"
//             );
//         }
//     }

//     return (
//         <div className="page">
//             <h1>💊 Prescriptions</h1>

//             <div className="card">
//                 <input
//                     placeholder="Patient ID"
//                     value={patientId}
//                     onChange={(e) =>
//                         setPatientId(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <br /><br />

//                 <input
//                     placeholder="Doctor ID"
//                     value={doctorId}
//                     onChange={(e) =>
//                         setDoctorId(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <br /><br />

//                 <textarea
//                     placeholder="Medicines"
//                     value={medicines}
//                     onChange={(e) =>
//                         setMedicines(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <br /><br />

//                 <textarea
//                     placeholder="Dosage"
//                     value={dosage}
//                     onChange={(e) =>
//                         setDosage(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <br /><br />

//                 <input
//                     placeholder="Duration"
//                     value={duration}
//                     onChange={(e) =>
//                         setDuration(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <br /><br />

//                 <textarea
//                     placeholder="Notes"
//                     value={notes}
//                     onChange={(e) =>
//                         setNotes(
//                             e.target.value
//                         )
//                     }
//                 />

//                 <br /><br />

//                 <button
//                     onClick={
//                         savePrescription
//                     }
//                 >
//                     Save Prescription
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default Prescriptions;