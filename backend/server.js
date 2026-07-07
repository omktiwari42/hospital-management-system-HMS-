const multer = require("multer");



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
      "-" +
      file.originalname
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and PDF allowed"));
    }
  },
});
const path = require("path");
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
const crypto = require("crypto");
// MAIL TRANSPORTER
const nodemailer =
  require("nodemailer");

const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:
        process.env.EMAIL_USER,
      pass:
        process.env.EMAIL_PASS,
    },
  });



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
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
app.use(
  "/uploads",
  express.static("uploads")
);
app.get("/", (req, res) => {
  res.send("Backend is Running");
});

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

app.delete(
  "/api/patients/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
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
      experience,
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
        availability,
        experience
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
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
        experience
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
      experience
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
      availability=$6,
      experience=$7
      WHERE id=$8
      `,
      [
        name,
        specialization,
        fees,
        phone,
        email,
        availability,
        experience,
        id
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

app.delete(
  "/api/doctors/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
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
      const appointmentId = result.rows[0].id;

      await pool.query(
        `
  INSERT INTO bills
  (
    appointment_id,
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
    $4,
    $5
  )
  `,
        [
          appointmentId,
          patientName,
          500,
          "Pending",
          "Pending"
        ]
      );
      await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to: process.env.EMAIL_USER,

        subject: "Appointment Confirmation",

        html: `
          <h2>🏥 Appointment Confirmed</h2>
      
          <p><b>Patient:</b> ${patientName}</p>
      
          <p><b>Doctor:</b> ${doctorName}</p>
      
          <p><b>Date:</b> ${date}</p>
      
          <p><b>Time:</b> ${time}</p>
      
          <p>Your appointment has been booked successfully.</p>
        `
      });



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
app.get(
  "/api/bills",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
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
app.put("/api/bills/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, amount, status } = req.body;

    const result = await pool.query(
      `UPDATE bills
       SET
         patient_name = $1,
         amount = $2,
         status = $3
       WHERE id = $4
       RETURNING *`,
      [patientName, amount, status, id]
    );

    res.json(result.rows[0]);
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

app.post("/api/verify-otp", async (req, res) => {
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

    // Fetch user from database
    const result = await pool.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      role: user.role,
      full_name: user.full_name,
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
      full_name: req.user.full_name,
      phone: req.user.phone,
      role: req.user.role,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/api/create-order", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
});
app.post(
  "/api/verify-payment",
  authenticateToken,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        billId,
      } = req.body;

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
          )
          .digest("hex");

      if (
        generatedSignature !==
        razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

      await client.query('BEGIN');

      // Update bill
      const billResult = await client.query(
        `UPDATE bills
          SET
          status = 'Paid',
          payment_status = 'Paid',
          payment_method = 'Online',
          payment_date = NOW(),
          transaction_id = $1
          WHERE id = $2
          RETURNING appointment_id`,
        [
          razorpay_payment_id,
          billId,
        ]
      );

      if (billResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      // Update appointment status to Confirmed
      const appointmentId = billResult.rows[0].appointment_id;
      if (appointmentId) {
        await client.query(
          `UPDATE appointments
            SET status = 'Confirmed'
            WHERE id = $1`,
          [appointmentId]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Payment verification error:", error);

      res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: error.message
      });
    } finally {
      client.release();
    }
  }
);


/* ===========================
   DOCTORS APIs
=========================== */

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
      experience
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
      availability=$6,
      experience=$7
      WHERE id=$8
      `,
      [
        name,
        specialization,
        fees,
        phone,
        email,
        availability,
        experience,
        id
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

app.delete(
  "/api/doctors/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
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
      const appointmentId = result.rows[0].id;

      const bill = await pool.query(
        `
        INSERT INTO bills
        (
          appointment_id,
          patient_name,
          amount,
          status,
          payment_status
        )
        VALUES
        ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [
          appointment.rows[0].id,
          patientName,
          doctorFees,
          "Pending",
          "Pending",
        ]
      );
      await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to: process.env.EMAIL_USER,

        subject: "Appointment Confirmation",

        html: `
          <h2>🏥 Appointment Confirmed</h2>
      
          <p><b>Patient:</b> ${patientName}</p>
      
          <p><b>Doctor:</b> ${doctorName}</p>
      
          <p><b>Date:</b> ${date}</p>
      
          <p><b>Time:</b> ${time}</p>
      
          <p>Your appointment has been booked successfully.</p>
        `
      });



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
app.get(
  "/api/bills",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
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

app.put("/api/bills/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, amount, status } = req.body;

    const result = await pool.query(
      `UPDATE bills
       SET
         patient_name = $1,
         amount = $2,
         status = $3
       WHERE id = $4
       RETURNING *`,
      [patientName, amount, status, id]
    );

    res.json(result.rows[0]);
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

app.post("/api/verify-otp", async (req, res) => {
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

    // Fetch user from database
    const result = await pool.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      role: user.role,
      full_name: user.full_name,
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
  console.log(req.user);
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
app.get("/api/patient-dashboard", authenticateToken, async (req, res) => {
  try {
    const phone = req.user.phone;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    const patientResult = await pool.query(
      "SELECT * FROM patients WHERE phone = $1",
      [phone]
    );

    const patient = patientResult.rows[0];

    const appointments = await pool.query(
      "SELECT * FROM appointments WHERE patient_name = $1 ORDER BY appointment_date ASC",
      [patient?.name]
    );

    const bills = await pool.query(
      "SELECT * FROM bills WHERE patient_name = $1 ORDER BY id DESC",
      [patient?.name]
    );

    res.json({
      user,
      patient,
      appointments: appointments.rows,
      bills: bills.rows
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

app.post("/api/patient/book-appointment", authenticateToken, async (req, res) => {
  try {
    const phone = req.user.phone;

    const {
      doctor_name,
      department,
      appointment_date,
      appointment_time,
      reason,
    } = req.body;
    const doctor = await pool.query(
      "SELECT fees, specialization FROM doctors WHERE name = $1",
      [doctor_name]
    );

    if (doctor.rows.length === 0) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const doctorFees = doctor.rows[0].fees;


    const userResult = await pool.query(
      "SELECT full_name, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Find patient
    let patientResult = await pool.query(
      "SELECT * FROM patients WHERE phone = $1",
      [user.phone]
    );

    // Create patient automatically if missing
    if (patientResult.rows.length === 0) {
      patientResult = await pool.query(
        `INSERT INTO patients (name, phone, age)
         VALUES ($1, $2, 18)
         RETURNING *`,
        [user.full_name, user.phone]
      );
    }

    const patientName = patientResult.rows[0].name;
    // Check if patient already has an active appointment
    const existingAppointment = await pool.query(
      `
  SELECT *
  FROM appointments
  WHERE patient_name = $1
  AND status IN ('Pending', 'Scheduled')
  `,
      [patientName]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        message:
          "You already have a pending appointment. Please complete or cancel it before booking another appointment.",
      });
    }
    const appointment = await pool.query(
      `INSERT INTO appointments
      (
        patient_name,
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        reason,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        patientName,
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        reason,
        "Pending",
      ]
    );
    const bill = await pool.query(
      `INSERT INTO bills
      (
        appointment_id,
        patient_name,
        amount,
        status,
        payment_status
      )
      VALUES
      ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        appointment.rows[0].id,
        patientName,
        doctorFees,
        "Pending",
        "Pending",
      ]
    );

    res.json({
      success: true,
      message: "Appointment booked successfully",
      amount: doctorFees,
      appointmentId: appointment.rows[0].id,
      billId: bill.rows[0].id,
    });

  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:");
    console.error(error);
    console.error(error.stack);

    res.status(500).json({
      message: error.message,
    });
  }
});
app.get("/api/patient/appointments", authenticateToken, async (req, res) => {
  try {
    const phone = req.user.phone;

    const patientResult = await pool.query(
      "SELECT name FROM patients WHERE phone = $1",
      [phone]
    );

    if (patientResult.rows.length === 0) {
      return res.json({
        appointments: [],
      });
    }

    const patientName = patientResult.rows[0].name;

    const appointmentResult = await pool.query(
      `SELECT *
       FROM appointments
       WHERE patient_name = $1
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [patientName]
    );

    res.json({
      appointments: appointmentResult.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});
app.delete("/api/patient/appointment/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM bills WHERE appointment_id=$1",
      [id]
    );

    await pool.query(
      "DELETE FROM appointments WHERE id=$1",
      [id]
    );

    res.json({
      success: true,
      message: "Appointment deleted successfully"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });
  }
});
app.get("/api/dashboard-summary", authenticateToken, async (req, res) => {
  try {
    const patients = await pool.query(
      "SELECT COUNT(*) FROM patients"
    );

    const doctors = await pool.query(
      "SELECT COUNT(*) FROM doctors"
    );

    const appointments = await pool.query(
      "SELECT COUNT(*) FROM appointments"
    );

    const revenue = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM bills
      WHERE payment_status = 'Paid'
    `);

    res.json({
      patients: Number(patients.rows[0].count),
      doctors: Number(doctors.rows[0].count),
      appointments: Number(appointments.rows[0].count),
      revenue: Number(revenue.rows[0].total),
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Dashboard Error",
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
app.post(
  "/api/upload-report/:id",
  authenticateToken,
  upload.single("report"),
  async (req, res) => {
    try {
      const { id } = req.params;

      console.log("Patient ID:", id);
      console.log("File:", req.file);

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      await pool.query(
        `UPDATE patients
         SET report = $1
         WHERE id = $2`,
        [req.file.filename, id]
      );

      res.json({
        message: "Report uploaded successfully",
        file: req.file.filename,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  }
);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
