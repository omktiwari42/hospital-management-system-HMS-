require("dotenv").config();
const authenticateToken =
  require(
    "./middleware/auth"
  );

const authorizeRole =
  require(
    "./middleware/authorizeRole"
  );
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const pool = require("./db");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
const otpStore = {};

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend is Running");
});
app.post(
  "/api/create-order",
  authenticateToken,
  async (req, res) => {
    try {
      const { amount } = req.body;

      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt:
          "receipt_" + Date.now(),
      };

      const order =
        await razorpay.orders.create(
          options
        );

      res.json(order);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to create order",
      });
    }
  }
);

/* ===========================
   PATIENTS APIs
=========================== */

app.get(
  "/api/patient-details/:name",
  authenticateToken,
  async (req, res) => {
    try {
      const { name } = req.params;

      const patient =
        await pool.query(
          "SELECT * FROM patients WHERE name = $1",
          [name]
        );

      const appointments =
        await pool.query(
          `SELECT *
           FROM appointments
           WHERE patient_name = $1`,
          [name]
        );

      const bills =
        await pool.query(
          `SELECT *
           FROM bills
           WHERE patient_name = $1`,
          [name]
        );

      res.json({
        patient: patient.rows[0],
        appointments:
          appointments.rows,
        bills: bills.rows,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Database Error",
      });
    }
  }
);
app.get(
  "/api/patients",
  authenticateToken,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT * FROM patients ORDER BY id DESC"
        );

      res.json(result.rows);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Database Error",
      });
    }
  }
);
app.post("/api/patients", authenticateToken, async (req, res) => {
  console.log("PATIENT DATA:", req.body);
  try {
    const {
      name,
      age,
      phone,
      gender,
      bloodGroup,
      address,
      emergencyContact,
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
        
        emergency_contact,
        
      
        allergies,
        medical_history
      )
      VALUES
      (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      )
      RETURNING *`,
      [
        name,
        age,
        phone,
        gender,
        bloodGroup,
        address,

        emergencyContact,

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

app.put("/api/patients/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      age,
      phone,
      gender,
      bloodGroup,
      address,
      emergencyContact,

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
         emergency_contact = $7,
         allergies = $8,
         medical_history = $9
       WHERE id = $10`,
      [
        name,
        age,
        phone,
        gender,
        bloodGroup,
        address,

        emergencyContact,
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

app.delete("/api/patients/:id", authenticateToken, async (req, res) => {
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

app.get("/api/doctors", authenticateToken, async (req, res) => {
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
app.post("/api/doctors", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      specialization,
      fees,
      phone,
      email,
      availability,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO doctors
      (
        name,
        specialization,
        fees,
        phone,
        email,
        availability
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6
      )
      RETURNING *
      `,
      [
        name,
        specialization,
        fees,
        phone,
        email,
        availability,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});
app.put("/api/doctors/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      specialization,
      fees,
      phone,
      email,
      availability,
    } = req.body;

    await pool.query(
      `
      UPDATE doctors
      SET
      name=$1,
      specialization=$2,
      fees=$3,
      phone=$4,
      email=$5,
      availability=$6
      WHERE id=$7
      `,
      [
        name,
        specialization,
        fees,
        phone,
        email,
        availability,
        id,
      ]
    );

    res.json({
      message: "Doctor updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.delete("/api/doctors/:id", authenticateToken, async (req, res) => {
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

app.get("/api/appointments", authenticateToken, async (req, res) => {
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

app.post(
  "/api/appointments",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        patientName,
        doctorName,
        date,
        time,
        status,
        reason,
      } = req.body;

      // Check if doctor is already booked
      const existingAppointment =
        await pool.query(
          `
          SELECT *
          FROM appointments
          WHERE doctor_name = $1
          AND appointment_date = $2
          AND appointment_time = $3
          `,
          [
            doctorName,
            date,
            time,
          ]
        );

      if (
        existingAppointment.rows
          .length > 0
      ) {
        return res.status(400).json({
          message:
            "Doctor already booked for this slot",
        });
      }

      // Insert Appointment
      const result =
        await pool.query(
          `
          INSERT INTO appointments
          (
            patient_name,
            doctor_name,
            appointment_date,
            appointment_time,
            status,
            reason
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          RETURNING *
          `,
          [
            patientName,
            doctorName,
            date,
            time,
            status,
            reason,
          ]
        );
      // Create Bill Automatically
      await pool.query(
        `
        INSERT INTO bills
        (
          patient_name,
          amount,
          status,
          payment_status
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        `,
        [
          patientName,
          500,
          "Pending",
          "Pending"
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
  }
);
app.put("/api/appointments/:id", authenticateToken, async (req, res) => {
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
       patient_name = $1,
       doctor_name = $2,
       appointment_date = $3,
       appointment_time = $4,
       status = $5,
       reason = $6
       WHERE id = $7`,
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

app.delete("/api/appointments/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM appointments WHERE id = $1",
      [id]
    );

    res.json({
      message:
        "Appointment deleted successfully",
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

app.get("/api/bills", authenticateToken, async (req, res) => {
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
app.post("/api/bills", authenticateToken, async (req, res) => {
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

app.put(
  "/api/bills/pay/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE bills
        SET
          status = 'Paid',
          payment_status = 'Paid',
          payment_method = 'Online',
          payment_date = NOW(),
          transaction_id = $1
        WHERE id = $2
        RETURNING *
        `,
        [
          "TXN" + Date.now(),
          id,
        ]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Payment Failed",
      });
    }
  }
);

app.delete("/api/bills/:id", authenticateToken, async (req, res) => {
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

app.post("/api/send-otp", (req, res) => {
  console.log("BUTTN CLICKED")
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

    console.log("PHONE:", phone);
    console.log("OTP RECEIVED:", otp);
    console.log("OTP STORED:", otpStore[phone]);

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone and OTP Required",
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
      "my_super_secret_key_123",
      { expiresIn: "1d" }
    );
    res.json({
      token,
      message: "Login Successful 🎉",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      phone: req.user.phone,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
app.get(
  "/api/recent-appointments",
  authenticateToken,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `SELECT *
           FROM appointments
           ORDER BY id DESC
           LIMIT 5`
        );

      res.json(result.rows);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Database Error",
      });
    }
  }
);
app.get(
  "/api/recent-patients",
  authenticateToken,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT *
          FROM patients
          ORDER BY id DESC
          LIMIT 5
        `);

      res.json(result.rows);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Error fetching recent patients",
      });
    }
  }
);
app.get(
  "/api/appointment-status",
  authenticateToken,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `SELECT
             status,
             COUNT(*) as count
           FROM appointments
           GROUP BY status`
        );

      res.json(result.rows);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Database Error",
      });
    }
  }
);
app.get(
  "/api/revenue-chart",
  authenticateToken,
  async (req, res) => {
    try {
      console.log(
        "REVENUE ROUTE HIT"
      );

      const result =
        await pool.query(`
          SELECT *
          FROM bills
          LIMIT 5
        `);

      console.log(result.rows);

      return res.json(
        result.rows
      );
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message:
          "Database Error",
      });
    }
  }
);
// pool.query(`
//   SELECT column_name
//   FROM information_schema.columns
//   WHERE table_name = 'bills'
// `)
//   .then(res => {
//     console.log("BILLS COLUMNS:");
//     console.table(res.rows);
//   })
//   .catch(console.error);
app.post("/api/prescriptions", async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      medicines,
      dosage,
      duration,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO prescriptions
      (patient_id, doctor_id, medicines, dosage, duration, notes)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        patient_id,
        doctor_id,
        medicines,
        dosage,
        duration,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Database Error",
    });
  }
});
app.get("/api/prescriptions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM prescriptions ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
