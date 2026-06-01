const pool = require("./db");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const otpStore = {};

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend is Running");
});
/* ===========================
   PATIENTS APIs
=========================== */

app.get("/api/patients", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM patients ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const {
      name,
      age,
      phone,
      gender,
      bloodGroup,
      address,
      email,
      emergencyContact,
      weight,
      height,
      allergies,
      medicalHistory,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patients
      (
        name,
        age,
        phone,
        gender,
        blood_group,
        address,
        email,
        emergency_contact,
        weight,
        height,
        allergies,
        medical_history
      )
      VALUES
      (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *`,
      [
        name,
        age,
        phone,
        gender,
        bloodGroup,
        address,
        email,
        emergencyContact,
        weight,
        height,
        allergies,
        medicalHistory,
      ]
    );

    res.status(201).json(
      result.rows[0]
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      age,
      phone,
      gender,
      bloodGroup,
      address,
      email,
      emergencyContact,
      weight,
      height,
      allergies,
      medicalHistory,
    } = req.body;

    await pool.query(
      `UPDATE patients
       SET
         name = $1,
         age = $2,
         phone = $3,
         gender = $4,
         blood_group = $5,
         address = $6,
         email = $7,
         emergency_contact = $8,
         weight = $9,
         height = $10,
         allergies = $11,
         medical_history = $12
       WHERE id = $13`,
      [
        name,
        age,
        phone,
        gender,
        bloodGroup,
        address,
        email,
        emergencyContact,
        weight,
        height,
        allergies,
        medicalHistory,
        id,
      ]
    );

    res.json({
      message:
        "Patient updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM patients WHERE id = $1",
      [id]
    );

    res.json({
      message:
        "Patient deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});
/* ===========================
   DOCTORS APIs
=========================== */

app.get("/api/doctors", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM doctors ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.post("/api/doctors", async (req, res) => {
  try {
    const {
      name,
      specialization,
      experience,
      fees,
      phone,
      email,
      availability,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO doctors
      (
        name,
        specialization,
        experience,
        fees,
        phone,
        email,
        availability
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
      )
      RETURNING *`,
      [
        name,
        specialization,
        experience,
        fees,
        phone,
        email,
        availability,
      ]
    );

    res.status(201).json(
      result.rows[0]
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.put("/api/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      specialization,
      experience,
      fees,
      phone,
      email,
      availability,
    } = req.body;

    await pool.query(
      `UPDATE doctors
       SET
       name=$1,
       specialization=$2,
       experience=$3,
       fees=$4,
       phone=$5,
       email=$6,
       availability=$7
       WHERE id=$8`,
      [
        name,
        specialization,
        experience,
        fees,
        phone,
        email,
        availability,
        id,
      ]
    );

    res.json({
      message:
        "Doctor updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.delete("/api/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM doctors WHERE id = $1",
      [id]
    );

    res.json({
      message:
        "Doctor deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});
/* ===========================
   APPOINTMENTS APIs
=========================== */

app.get("/api/appointments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
    
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const { patientName, doctorName, date } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments
      (patient_name, doctor_name, appointment_date)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [patientName, doctorName, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.put("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, doctorName, date } = req.body;

    await pool.query(
      `UPDATE appointments
       SET patient_name = $1,
           doctor_name = $2,
           appointment_date = $3
       WHERE id = $4`,
      [patientName, doctorName, date, id]
    );

    res.json({
      message: "Appointment updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM appointments WHERE id = $1",
      [id]
    );

    res.json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});


/* ===========================
   BILLING APIs
=========================== */

app.get("/api/bills", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bills ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

/* ADD THIS ROUTE */
app.post("/api/bills", async (req, res) => {
  try {
    const {
      patientName,
      amount,
      status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO bills
       (patient_name, amount, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patientName, amount, status]
    );

    res.status(201).json(
      result.rows[0]
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.put("/api/bills/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientName,
      amount,
      status,
    } = req.body;

    await pool.query(
      `UPDATE bills
       SET patient_name = $1,
           amount = $2,
           status = $3
       WHERE id = $4`,
      [patientName, amount, status, id]
    );

    res.json({
      message:
        "Bill updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.delete("/api/bills/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM bills WHERE id = $1",
      [id]
    );

    res.json({
      message:
        "Bill deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});
/* ===========================
   OTP AUTH APIs
=========================== */

/* ===========================
   OTP AUTH APIs
=========================== */

app.post("/api/send-otp", (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone Number Required",
      });
    }

    const phoneRegex =
      /^\+\d{10,15}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message:
          "Invalid Phone Number Format",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    otpStore[phone] = otp;

    console.log(
      `OTP for ${phone}: ${otp}`
    );

    res.json({
      message:
        "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/api/verify-otp", (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message:
          "Phone and OTP Required",
      });
    }

    if (otpStore[phone] !== otp) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    delete otpStore[phone];

    const token = jwt.sign(
      { phone },
      "hospital_secret_key",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      message:
        "Login Successful 🎉",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
}); 
app.post("/api/appointments", async (req, res) => {
  try {
    const {
      patientName,
      doctorName,
      date,
      time,
      status,
      reason,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments
      (
        patient_name,
        doctor_name,
        appointment_date,
        appointment_time,
        status,
        reason
      )
      VALUES
      ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        patientName,
        doctorName,
        date,
        time,
        status,
        reason,
      ]
    );

    res.status(201).json(
      result.rows[0]
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});
app.put("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      patientName,
      doctorName,
      date,
      time,
      status,
      reason,
    } = req.body;

    await pool.query(
      `UPDATE appointments
       SET
       patient_name=$1,
       doctor_name=$2,
       appointment_date=$3,
       appointment_time=$4,
       status=$5,
       reason=$6
       WHERE id=$7`,
      [
        patientName,
        doctorName,
        date,
        time,
        status,
        reason,
        id,
      ]
    );

    res.json({
      message:
        "Appointment updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.delete("/api/bills/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM bills WHERE id=$1",
      [id]
    );

    res.json({
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
    message: "Database Error",
  });
  }
});
app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});