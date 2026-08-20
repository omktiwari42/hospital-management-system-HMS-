const fs = require("fs");
const path = require("path");
const multer = require("multer");
const notificationRoutes = require("./routes/notificationRoutes");
const createNotification = require("./utils/createNotification");
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "_")
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

require("dotenv").config();
const {
  router: sseRoutes,
  sendNotificationEvent,
} = require("./routes/sseRoutes");
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
const generatePrescriptionPDF = require("./utils/generatePrescriptionPDF");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
const otpStore = {};
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.myhms.online",
  "https://myhms.online"
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use("/api/sse", sseRoutes);
app.use(
  "/api/notifications",
  authenticateToken,
  notificationRoutes
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
// =========================================================
// PROFILE IMAGE ROUTE
// Reliable profile image delivery
// =========================================================

app.get(
  "/api/profile-image/:filename",
  async (req, res) => {
    try {
      const filename = path.basename(
        req.params.filename
      );

      if (!filename) {
        return res.status(400).json({
          message: "Invalid image filename.",
        });
      }

      const filePath = path.join(
        uploadPath,
        filename
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          message: "Profile image not found.",
        });
      }

      res.setHeader(
        "Cache-Control",
        "public, max-age=3600"
      );

      return res.sendFile(
        filePath
      );

    } catch (error) {
      console.error(
        "Profile image serving error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load profile image.",
      });
    }
  }
);

app.get("/", (req, res) => {
  res.send("Backend is Running");
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "HMS backend",
    timestamp: new Date().toISOString(),
  });
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

app.post("/api/send-otp", async (req, res) => {
  try {
    let { phone, turnstileToken } = req.body;

    console.log("========== SEND OTP ==========");
    console.log("PHONE RECEIVED:", phone);
    console.log("TURNSTILE TOKEN:", !!turnstileToken);

    // -----------------------------
    // PHONE NORMALIZATION
    // -----------------------------
    phone = String(phone || "").trim();

    // If frontend sends only 10 digits
    if (/^\d{10}$/.test(phone)) {
      phone = "+91" + phone;
    }

    // Remove spaces, brackets, hyphens
    phone = phone.replace(/[\s()-]/g, "");

    console.log("NORMALIZED PHONE:", phone);

    // -----------------------------
    // PHONE VALIDATION
    // -----------------------------
    const phoneRegex = /^\+\d{10,15}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // -----------------------------
    // CLOUDFLARE TURNSTILE
    // -----------------------------
    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        message: "Please complete Cloudflare verification.",
      });
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
      console.error(
        "TURNSTILE_SECRET_KEY is missing from backend environment."
      );

      return res.status(500).json({
        success: false,
        message: "Server Turnstile configuration is missing.",
      });
    }

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const verifyResult = await verifyResponse.json();

    console.log(
      "TURNSTILE RESULT:",
      verifyResult
    );

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: "Cloudflare verification failed.",
        errors: verifyResult["error-codes"] || [],
      });
    }

    // -----------------------------
    // CHECK USER
    // -----------------------------
    const userResult = await pool.query(
      "SELECT id, phone, full_name, role FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number.",
      });
    }

    // -----------------------------
    // GENERATE OTP
    // -----------------------------
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    otpStore[phone] = otp;

    console.log(
      `OTP GENERATED FOR ${phone}: ${otp}`
    );

    // -----------------------------
    // TEMPORARY OTP RESPONSE
    // -----------------------------
    // IMPORTANT:
    // This does NOT send an SMS.
    // It stores the OTP on the backend.
    // For development, OTP is returned here.
    //
    // Remove `otp` later when real SMS
    // service is connected.
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully.",
      phone,
      otp,
    });

  } catch (error) {
    console.error(
      "SEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    let { phone, otp } = req.body;

    phone = String(phone || "").trim();
    otp = String(otp || "").trim();

    if (/^\d{10}$/.test(phone)) {
      phone = "+91" + phone;
    }

    phone = phone.replace(/[\s()-]/g, "");

    console.log("========== VERIFY OTP ==========");
    console.log("PHONE:", phone);
    console.log("OTP RECEIVED:", otp);
    console.log("OTP STORED:", otpStore[phone]);

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required.",
      });
    }

    if (!otpStore[phone]) {
      return res.status(401).json({
        success: false,
        message:
          "OTP expired or was not generated. Please request a new OTP.",
      });
    }

    if (String(otpStore[phone]) !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // OTP is correct
    delete otpStore[phone];

    // -----------------------------
    // FETCH USER
    // -----------------------------
    const result = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    // -----------------------------
    // JWT
    // -----------------------------
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

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      full_name: user.full_name,
      message: "Login Successful 🎉",
    });

  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {

    const {
      full_name,
      email,
      gender,
      dob,
      emergency_contact,
      blood_group,
      allergies,
      medical_history,
    } = req.body;

    const result = await pool.query(
      `
          UPDATE users
          SET
              full_name = $1,
              email = $2,
              gender = $3,
              dob = $4,
              emergency_contact = $5,
              blood_group = $6,
              allergies = $7,
              medical_history = $8
          WHERE id = $9
          RETURNING *
          `,
      [
        full_name,
        email,
        gender,
        dob,
        emergency_contact,
        blood_group,
        allergies,
        medical_history,
        req.user.id,
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Profile update error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});
app.post(
  "/api/profile/upload-image",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          req.file.mimetype
        )
      ) {
        const newFilePath =
          path.join(
            uploadPath,
            req.file.filename
          );

        if (
          fs.existsSync(newFilePath)
        ) {
          fs.unlinkSync(
            newFilePath
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Only JPG, PNG and WEBP images are allowed",
        });
      }

      /*
       * Get the current photo first.
       */
      const oldResult =
        await pool.query(
          `
          SELECT profile_image
          FROM users
          WHERE id = $1
          `,
          [req.user.id]
        );

      if (
        oldResult.rows.length === 0
      ) {

        const newFilePath =
          path.join(
            uploadPath,
            req.file.filename
          );

        if (
          fs.existsSync(
            newFilePath
          )
        ) {
          fs.unlinkSync(
            newFilePath
          );
        }

        return res.status(404).json({
          success: false,
          message: "User not found",
        });

      }

      const oldImage =
        oldResult.rows[0]
          .profile_image;

      const newImage =
        req.file.filename;

      /*
       * Save new image.
       */
      await pool.query(
        `
        UPDATE users
        SET profile_image = $1
        WHERE id = $2
        `,
        [
          newImage,
          req.user.id,
        ]
      );

      /*
       * Delete old image after
       * successful DB update.
       */
      if (oldImage) {

        const safeOldImage =
          path.basename(
            oldImage
          );

        const oldPath =
          path.resolve(
            path.join(
              uploadPath,
              safeOldImage
            )
          );

        const uploadRoot =
          path.resolve(
            uploadPath
          );

        if (
          oldPath.startsWith(
            uploadRoot +
            path.sep
          ) &&
          fs.existsSync(oldPath)
        ) {

          try {
            fs.unlinkSync(oldPath);
          } catch (fileError) {
            console.error(
              "Old profile image deletion error:",
              fileError
            );
          }

        }

      }

      res.json({
        success: true,
        image: newImage,
      });

    } catch (err) {

      console.error(
        "Profile image upload error:",
        err
      );

      /*
       * Remove new file if
       * something failed.
       */
      if (req.file?.filename) {

        const failedPath =
          path.join(
            uploadPath,
            path.basename(
              req.file.filename
            )
          );

        if (
          fs.existsSync(
            failedPath
          )
        ) {

          try {
            fs.unlinkSync(
              failedPath
            );
          } catch (cleanupError) {
            console.error(
              "Upload cleanup error:",
              cleanupError
            );
          }

        }
      }

      res.status(500).json({
        success: false,
        message: "Upload failed",
      });

    }
  }
);


app.delete(
  "/api/profile/delete-image",
  authenticateToken,
  async (req, res) => {

    try {

      /*
       * Get photo belonging ONLY
       * to authenticated user.
       */
      const result =
        await pool.query(
          `
          SELECT profile_image
          FROM users
          WHERE id = $1
          `,
          [req.user.id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const profileImage =
        result.rows[0]
          .profile_image;

      /*
       * Delete physical file.
       */
      if (profileImage) {

        const safeFilename =
          path.basename(
            profileImage
          );

        const imagePath =
          path.resolve(
            path.join(
              uploadPath,
              safeFilename
            )
          );

        const uploadsRoot =
          path.resolve(
            uploadPath
          );

        /*
         * Prevent path traversal.
         */
        if (
          imagePath.startsWith(
            uploadsRoot +
            path.sep
          ) &&
          fs.existsSync(imagePath)
        ) {

          try {

            fs.unlinkSync(
              imagePath
            );

          } catch (fileError) {

            console.error(
              "Profile image deletion error:",
              fileError
            );

          }

        }

      }

      /*
       * ALWAYS clear database,
       * even if physical file
       * is already missing.
       */
      await pool.query(
        `
        UPDATE users
        SET profile_image = NULL
        WHERE id = $1
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        message:
          "Profile photo removed successfully",
      });

    } catch (err) {

      console.error(
        "Profile image delete error:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete profile image",
      });

    }

  }
);
// =========================================================
// RAZORPAY CREATE ORDER
// =========================================================

app.post(
  "/api/create-order",
  authenticateToken,
  async (req, res) => {
    try {
      const { amount } = req.body;

      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment amount.",
        });
      }

      const options = {
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order =
        await razorpay.orders.create(options);

      return res.status(200).json(order);

    } catch (error) {
      console.error(
        "Razorpay order creation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create Razorpay order.",
      });
    }
  }
);


// =========================================================
// RAZORPAY VERIFY PAYMENT
// =========================================================

app.post(
  "/api/verify-payment",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        billId,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !billId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Incomplete payment verification data.",
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      if (
        generatedSignature !==
        razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment signature.",
        });
      }

      await client.query("BEGIN");

      const billResult =
        await client.query(
          `
          SELECT
            id,
            appointment_id,
            payment_status,
            status
          FROM bills
          WHERE id = $1
          FOR UPDATE
          `,
          [billId]
        );

      if (
        billResult.rows.length === 0
      ) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Bill not found.",
        });
      }

      const bill =
        billResult.rows[0];

      if (
        String(
          bill.payment_status
        ).toLowerCase() === "paid" ||
        String(
          bill.status
        ).toLowerCase() === "paid"
      ) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message:
            "This bill has already been paid.",
        });
      }

      await client.query(
        `
        UPDATE bills
        SET
          status = 'Paid',
          payment_status = 'Paid',
          payment_method = 'Online',
          payment_date = NOW(),
          transaction_id = $1
        WHERE id = $2
        `,
        [
          razorpay_payment_id,
          billId,
        ]
      );

      if (bill.appointment_id) {
        await client.query(
          `
          UPDATE appointments
          SET status = 'Confirmed'
          WHERE id = $1
          `,
          [
            bill.appointment_id,
          ]
        );
      }

      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message:
          "Payment verified successfully.",
      });

    } catch (error) {

      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Payment rollback after verification error:",
          rollbackError
        );
      }

      console.error(
        "Payment verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Payment verification failed.",
      });

    } finally {
      client.release();
    }
  }
);


// =========================================================
// ROLLBACK UNPAID PAYMENT
// =========================================================

app.delete(
  "/api/payment/rollback/:billId",
  authenticateToken,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      const { billId } = req.params;

      if (!billId) {
        return res.status(400).json({
          success: false,
          message:
            "Bill ID is required.",
        });
      }

      await client.query("BEGIN");

      const billResult =
        await client.query(
          `
          SELECT
            id,
            appointment_id,
            payment_status,
            status
          FROM bills
          WHERE id = $1
          FOR UPDATE
          `,
          [billId]
        );

      if (
        billResult.rows.length === 0
      ) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message:
            "Bill not found or already removed.",
        });
      }

      const bill =
        billResult.rows[0];

      if (
        String(
          bill.payment_status
        ).toLowerCase() === "paid" ||
        String(
          bill.status
        ).toLowerCase() === "paid"
      ) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message:
            "Paid appointment cannot be rolled back.",
        });
      }

      const appointmentId =
        bill.appointment_id;

      await client.query(
        `
        DELETE FROM bills
        WHERE id = $1
        `,
        [billId]
      );

      if (appointmentId) {
        await client.query(
          `
          DELETE FROM appointments
          WHERE id = $1
          AND status IN (
            'Pending',
            'Scheduled'
          )
          `,
          [appointmentId]
        );
      }

      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message:
          "Unpaid appointment and bill rolled back successfully.",
      });

    } catch (error) {

      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Rollback transaction error:",
          rollbackError
        );
      }

      console.error(
        "Payment rollback error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Payment rollback failed.",
      });

    } finally {
      client.release();
    }
  }
);
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
// =========================================================
// PATIENT BOOK APPOINTMENT
// Transactional appointment + bill creation
// =========================================================

app.post(
  "/api/patient/book-appointment",
  authenticateToken,
  async (req, res) => {

    const client = await pool.connect();

    try {

      const phone = req.user.phone;

      const {
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        reason,
      } = req.body;


      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (
        !doctor_name ||
        !department ||
        !appointment_date ||
        !appointment_time ||
        !reason
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All appointment details are required.",
        });
      }


      // -----------------------------------------------------
      // START TRANSACTION
      // -----------------------------------------------------

      await client.query("BEGIN");


      // -----------------------------------------------------
      // FIND DOCTOR
      // -----------------------------------------------------

      const doctorResult =
        await client.query(
          `
          SELECT
            id,
            fees,
            specialization
          FROM doctors
          WHERE name = $1
          `,
          [doctor_name]
        );


      if (
        doctorResult.rows.length === 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message: "Doctor not found.",
        });
      }


      const doctor =
        doctorResult.rows[0];


      const doctorFees =
        Number(doctor.fees);


      if (
        !Number.isFinite(doctorFees) ||
        doctorFees <= 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid consultation fee.",
        });
      }


      // -----------------------------------------------------
      // FIND USER
      // -----------------------------------------------------

      const userResult =
        await client.query(
          `
          SELECT
            id,
            full_name,
            phone,
            role
          FROM users
          WHERE id = $1
          `,
          [req.user.id]
        );


      if (
        userResult.rows.length === 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }


      const user =
        userResult.rows[0];


      // -----------------------------------------------------
      // FIND PATIENT
      // -----------------------------------------------------

      let patientResult =
        await client.query(
          `
          SELECT *
          FROM patients
          WHERE phone = $1
          `,
          [user.phone]
        );


      // -----------------------------------------------------
      // CREATE PATIENT IF MISSING
      // -----------------------------------------------------

      if (
        patientResult.rows.length === 0
      ) {

        patientResult =
          await client.query(
            `
            INSERT INTO patients
            (
              name,
              phone,
              age
            )
            VALUES
            (
              $1,
              $2,
              $3
            )
            RETURNING *
            `,
            [
              user.full_name,
              user.phone,
              18,
            ]
          );
      }


      const patientName =
        patientResult.rows[0].name;


      // -----------------------------------------------------
      // CHECK PATIENT ACTIVE APPOINTMENT
      // -----------------------------------------------------

      const existingAppointment =
        await client.query(
          `
          SELECT
            id,
            doctor_name,
            appointment_date,
            appointment_time,
            status
          FROM appointments
          WHERE patient_name = $1
          AND status IN (
            'Pending',
            'Scheduled',
            'Confirmed'
          )
          `,
          [patientName]
        );


      if (
        existingAppointment.rows.length > 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,
          message:
            "You already have an active appointment. Please complete or cancel it before booking another appointment.",
        });
      }


      // -----------------------------------------------------
      // CHECK DOCTOR SLOT
      // Prevent two appointments for same doctor/time.
      // -----------------------------------------------------

      const doctorSlot =
        await client.query(
          `
          SELECT id
          FROM appointments
          WHERE doctor_name = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND status IN (
            'Pending',
            'Scheduled',
            'Confirmed'
          )
          LIMIT 1
          `,
          [
            doctor_name,
            appointment_date,
            appointment_time,
          ]
        );


      if (
        doctorSlot.rows.length > 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "This doctor is already booked for the selected date and time.",
        });
      }


      // -----------------------------------------------------
      // CREATE APPOINTMENT
      // -----------------------------------------------------

      const appointmentResult =
        await client.query(
          `
          INSERT INTO appointments
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
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
          RETURNING *
          `,
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


      const appointment =
        appointmentResult.rows[0];


      // -----------------------------------------------------
      // CREATE PENDING BILL
      // -----------------------------------------------------

      const billResult =
        await client.query(
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
          RETURNING *
          `,
          [
            appointment.id,
            patientName,
            doctorFees,
            "Pending",
            "Pending",
          ]
        );


      const bill =
        billResult.rows[0];


      // -----------------------------------------------------
      // COMMIT
      // -----------------------------------------------------

      await client.query(
        "COMMIT"
      );


      // -----------------------------------------------------
      // NOTIFICATIONS
      // Do these AFTER COMMIT.
      // A notification failure must not destroy
      // an already-created appointment/bill.
      // -----------------------------------------------------

      try {

        await createNotification(
          req.user.id,
          "Appointment Booked",
          `Your appointment with Dr. ${doctor_name} has been booked successfully.`,
          "appointment"
        );


        sendNotificationEvent({
          title:
            "Appointment Booked",
          message:
            `Your appointment with Dr. ${doctor_name} has been booked successfully.`,
          type:
            "appointment",
          unread:
            true,
          created_at:
            new Date(),
        });


        await createNotification(
          req.user.id,
          "Bill Generated",
          `A bill of ₹${doctorFees} has been generated for your appointment.`,
          "payment"
        );


        sendNotificationEvent({
          title:
            "Bill Generated",
          message:
            `A bill of ₹${doctorFees} has been generated for your appointment.`,
          type:
            "payment",
          unread:
            true,
          created_at:
            new Date(),
        });

      } catch (notificationError) {

        console.error(
          "Appointment notification error:",
          notificationError
        );

      }


      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(201).json({
        success: true,

        message:
          "Appointment booked successfully.",

        amount:
          doctorFees,

        appointmentId:
          appointment.id,

        billId:
          bill.id,
      });


    } catch (error) {

      // -----------------------------------------------------
      // ALWAYS ROLLBACK THE TRANSACTION
      // -----------------------------------------------------

      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Booking transaction rollback error:",
          rollbackError
        );
      }


      // -----------------------------------------------------
      // LOG COMPLETE ERROR
      // -----------------------------------------------------

      console.error(
        "BOOK APPOINTMENT ERROR:",
        error
      );

      console.error(
        "ERROR CODE:",
        error.code
      );

      console.error(
        "ERROR DETAIL:",
        error.detail
      );


      // -----------------------------------------------------
      // DUPLICATE DOCTOR SLOT
      // PostgreSQL unique constraint
      // -----------------------------------------------------

      if (error.code === "23505") {

        return res.status(409).json({
          success: false,
          message:
            "This doctor is already booked for the selected date and time.",
        });
      }


      // -----------------------------------------------------
      // FOREIGN KEY ERROR
      // -----------------------------------------------------

      if (error.code === "23503") {

        return res.status(400).json({
          success: false,
          message:
            "Unable to create the appointment because related data is missing.",
        });
      }


      // -----------------------------------------------------
      // INVALID DATA TYPE
      // -----------------------------------------------------

      if (error.code === "22P02") {

        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment data. Please check the selected details.",
        });
      }


      // -----------------------------------------------------
      // NOT NULL / REQUIRED FIELD ERROR
      // -----------------------------------------------------

      if (error.code === "23502") {

        return res.status(400).json({
          success: false,
          message:
            "Some required appointment information is missing.",
        });
      }


      // -----------------------------------------------------
      // CHECK CONSTRAINT ERROR
      // -----------------------------------------------------

      if (error.code === "23514") {

        return res.status(400).json({
          success: false,
          message:
            "The appointment details are not valid.",
        });
      }


      // -----------------------------------------------------
      // DEFAULT SERVER ERROR
      // -----------------------------------------------------

      return res.status(500).json({
        success: false,
        message:
          "Unable to book appointment. Please try again.",
      });
    }
  }
);
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
      `
  SELECT
      a.*,
      b.payment_status,
      b.transaction_id,
      b.payment_method,
      b.payment_date,
      b.amount
  FROM appointments a
  LEFT JOIN bills b
      ON a.id = b.appointment_id
  WHERE a.patient_name = $1
  ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `,
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

app.get("/api/patient/bills", authenticateToken, async (req, res) => {

  try {

    const phone = req.user.phone;

    const patientResult = await pool.query(
      "SELECT name FROM patients WHERE phone = $1",
      [phone]
    );

    if (patientResult.rows.length === 0) {
      return res.json({
        bills: []
      });
    }

    const patientName = patientResult.rows[0].name;

    const billsResult = await pool.query(
      `
          SELECT
              b.*,
              a.doctor_name,
              a.department,
              a.appointment_date,
              a.appointment_time
          FROM bills b
          LEFT JOIN appointments a
              ON b.appointment_id = a.id
          WHERE b.patient_name = $1
          ORDER BY b.id DESC
          `,
      [patientName]
    );


    res.json({
      success: true,
      bills: billsResult.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to load bills."
    });

  }
});
// =========================================================
// PATIENT CANCEL APPOINTMENT
// =========================================================

// =========================================================
// PATIENT CANCEL APPOINTMENT
// Secure + transactional
// =========================================================

app.put(
  "/api/patient/cancel-appointment/:id",
  authenticateToken,
  async (req, res) => {

    const client = await pool.connect();

    try {

      const { id } = req.params;

      const userPhone =
        String(req.user.phone || "").trim();


      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Appointment ID is required.",
        });
      }


      if (!userPhone) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated patient could not be identified.",
        });
      }


      await client.query("BEGIN");


      // -----------------------------------------------------
      // FIND PATIENT
      // -----------------------------------------------------

      const patientResult =
        await client.query(
          `
          SELECT
            id,
            name,
            phone
          FROM patients
          WHERE phone = $1
          FOR UPDATE
          `,
          [userPhone]
        );


      if (patientResult.rows.length === 0) {

        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message:
            "Patient record not found.",
        });
      }


      const patient =
        patientResult.rows[0];

      const patientName =
        patient.name;


      // -----------------------------------------------------
      // FIND APPOINTMENT + BILL
      // Lock ONLY appointment row.
      // -----------------------------------------------------

      const appointmentResult =
        await client.query(
          `
          SELECT
            a.id,
            a.patient_name,
            a.doctor_name,
            a.department,
            a.appointment_date,
            a.appointment_time,
            a.status,

            b.id AS bill_id,
            b.payment_status,
            b.status AS bill_status

          FROM appointments a

          LEFT JOIN bills b
            ON b.appointment_id = a.id

          WHERE a.id = $1
          AND a.patient_name = $2

          FOR UPDATE OF a
          `,
          [
            id,
            patientName,
          ]
        );


      if (appointmentResult.rows.length === 0) {

        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message:
            "Appointment not found or it does not belong to you.",
        });
      }


      const appointment =
        appointmentResult.rows[0];


      // -----------------------------------------------------
      // ALREADY CANCELLED
      // -----------------------------------------------------

      if (
        String(
          appointment.status || ""
        ).toLowerCase() === "cancelled"
      ) {

        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message:
            "This appointment is already cancelled.",
        });
      }


      // -----------------------------------------------------
      // COMPLETED
      // -----------------------------------------------------

      if (
        String(
          appointment.status || ""
        ).toLowerCase() === "completed"
      ) {

        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message:
            "Completed appointments cannot be cancelled.",
        });
      }


      // -----------------------------------------------------
      // PAYMENT STATUS
      // -----------------------------------------------------

      const paymentStatus =
        String(
          appointment.payment_status || ""
        ).trim().toLowerCase();

      const billStatus =
        String(
          appointment.bill_status || ""
        ).trim().toLowerCase();


      // -----------------------------------------------------
      // PAID
      // -----------------------------------------------------

      if (
        paymentStatus === "paid" ||
        billStatus === "paid"
      ) {

        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          code: "PAYMENT_ALREADY_PAID",
          message:
            "This appointment has already been paid and cannot be cancelled directly. A refund is required.",
        });
      }


      // -----------------------------------------------------
      // CANCEL APPOINTMENT
      // -----------------------------------------------------

      const cancelResult =
        await client.query(
          `
          UPDATE appointments
          SET status = 'Cancelled'
          WHERE id = $1
          AND patient_name = $2
          AND LOWER(
            COALESCE(status, '')
          ) NOT IN (
            'cancelled',
            'completed'
          )
          RETURNING id
          `,
          [
            id,
            patientName,
          ]
        );


      if (cancelResult.rows.length === 0) {

        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          code: "CANCELLATION_NOT_APPLIED",
          message:
            "The appointment could not be cancelled because its status changed. Please refresh the page and try again.",
        });
      }


      // -----------------------------------------------------
      // CANCEL UNPAID BILL
      // -----------------------------------------------------

      if (appointment.bill_id) {

        await client.query(
          `
          UPDATE bills
          SET
            status = 'Cancelled',
            payment_status = 'Cancelled'
          WHERE id = $1
          AND LOWER(
            COALESCE(payment_status, '')
          ) <> 'paid'
          `,
          [appointment.bill_id]
        );
      }


      // -----------------------------------------------------
      // COMMIT
      // -----------------------------------------------------

      await client.query("COMMIT");


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Appointment cancelled successfully.",
      });


    } catch (error) {

      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Cancellation rollback error:",
          rollbackError
        );
      }


      console.error(
        "CANCEL APPOINTMENT ERROR:",
        error
      );

      console.error(
        "ERROR CODE:",
        error.code
      );

      console.error(
        "ERROR DETAIL:",
        error.detail
      );


      return res.status(500).json({
        success: false,
        message:
          "Unable to cancel appointment. Please try again.",
      });


    } finally {

      client.release();
    }
  }
);
// =========================================================
// PATIENT RESCHEDULE APPOINTMENT
// Secure + transactional
// =========================================================

app.put(
  "/api/patient/reschedule-appointment/:id",
  authenticateToken,
  async (req, res) => {

    const client = await pool.connect();

    try {

      const { id } = req.params;

      const {
        appointment_date,
        appointment_time,
      } = req.body;

      const userPhone =
        String(req.user.phone || "").trim();


      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (!id) {

        return res.status(400).json({
          success: false,
          message:
            "Appointment ID is required.",
        });
      }


      if (
        !appointment_date ||
        !appointment_time
      ) {

        return res.status(400).json({
          success: false,
          message:
            "New appointment date and time are required.",
        });
      }


      if (!userPhone) {

        return res.status(401).json({
          success: false,
          message:
            "Unable to identify the authenticated patient.",
        });
      }


      // -----------------------------------------------------
      // TRANSACTION
      // -----------------------------------------------------

      await client.query("BEGIN");


      // -----------------------------------------------------
      // FIND PATIENT
      // -----------------------------------------------------

      const patientResult =
        await client.query(
          `
          SELECT name, phone
          FROM patients
          WHERE phone = $1
          FOR UPDATE
          `,
          [userPhone]
        );


      if (
        patientResult.rows.length === 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Patient record not found.",
        });
      }


      const patientName =
        patientResult.rows[0].name;


      // -----------------------------------------------------
      // FIND APPOINTMENT
      // AND VERIFY OWNERSHIP
      // -----------------------------------------------------

      const appointmentResult =
        await client.query(
          `
          SELECT
            a.id,
            a.patient_name,
            a.doctor_name,
            a.department,
            a.appointment_date,
            a.appointment_time,
            a.reason,
            a.status,

            b.id AS bill_id,
            b.payment_status,
            b.status AS bill_status

          FROM appointments a

          LEFT JOIN bills b
            ON b.appointment_id = a.id

          WHERE a.id = $1
          AND a.patient_name = $2

          FOR UPDATE OF a
          `,
          [
            id,
            patientName,
          ]
        );


      if (
        appointmentResult.rows.length === 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Appointment not found or you are not authorized to reschedule it.",
        });
      }


      const appointment =
        appointmentResult.rows[0];


      // -----------------------------------------------------
      // STATUS CHECK
      // -----------------------------------------------------

      const currentStatus =
        String(
          appointment.status || ""
        ).toLowerCase();


      if (
        currentStatus ===
        "cancelled"
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "Cancelled appointments cannot be rescheduled.",
        });
      }


      if (
        currentStatus ===
        "completed"
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "Completed appointments cannot be rescheduled.",
        });
      }


      // -----------------------------------------------------
      // PAYMENT CHECK
      // -----------------------------------------------------

      if (
        String(
          appointment.payment_status || ""
        ).toLowerCase() === "paid" ||

        String(
          appointment.bill_status || ""
        ).toLowerCase() === "paid"
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "Paid appointments cannot be rescheduled. Please contact support.",
        });
      }


      // -----------------------------------------------------
      // PREVENT PAST DATE
      // -----------------------------------------------------

      const selectedDateTime =
        new Date(
          `${appointment_date}T${appointment_time}`
        );

      if (
        Number.isNaN(
          selectedDateTime.getTime()
        )
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment date or time.",
        });
      }


      if (
        selectedDateTime <=
        new Date()
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,
          message:
            "Please select a future date and time.",
        });
      }


      // -----------------------------------------------------
      // CHECK DOCTOR SLOT
      // -----------------------------------------------------

      const doctorSlot =
        await client.query(
          `
          SELECT id
          FROM appointments
          WHERE doctor_name = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND id <> $4
          AND status IN (
            'Pending',
            'Scheduled',
            'Confirmed'
          )
          LIMIT 1
          `,
          [
            appointment.doctor_name,
            appointment_date,
            appointment_time,
            id,
          ]
        );


      if (
        doctorSlot.rows.length > 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "This doctor is already booked for the selected date and time.",
        });
      }


      // -----------------------------------------------------
      // UPDATE APPOINTMENT
      // -----------------------------------------------------

      const updateResult =
        await client.query(
          `
          UPDATE appointments
          SET
            appointment_date = $1,
            appointment_time = $2,
            status = 'Pending'
          WHERE id = $3
          AND patient_name = $4
          AND status NOT IN (
            'Cancelled',
            'Completed'
          )
          RETURNING *
          `,
          [
            appointment_date,
            appointment_time,
            id,
            patientName,
          ]
        );


      if (
        updateResult.rows.length === 0
      ) {

        await client.query(
          "ROLLBACK"
        );

        return res.status(409).json({
          success: false,
          message:
            "Appointment could not be rescheduled.",
        });
      }


      // -----------------------------------------------------
      // COMMIT
      // -----------------------------------------------------

      await client.query(
        "COMMIT"
      );


      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "Appointment rescheduled successfully.",

        appointment:
          updateResult.rows[0],
      });


    } catch (error) {

      // -----------------------------------------------------
      // ROLLBACK
      // -----------------------------------------------------

      try {

        await client.query(
          "ROLLBACK"
        );

      } catch (rollbackError) {

        console.error(
          "Reschedule rollback error:",
          rollbackError
        );
      }


      console.error(
        "RESCHEDULE APPOINTMENT ERROR:",
        error
      );

      console.error(
        "ERROR CODE:",
        error.code
      );

      console.error(
        "ERROR DETAIL:",
        error.detail
      );


      // -----------------------------------------------------
      // UNIQUE CONSTRAINT
      // -----------------------------------------------------

      if (
        error.code === "23505"
      ) {

        return res.status(409).json({
          success: false,
          message:
            "This doctor is already booked for the selected date and time.",
        });
      }


      // -----------------------------------------------------
      // INVALID DATA
      // -----------------------------------------------------

      if (
        error.code === "22P02"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment date or time.",
        });
      }


      return res.status(500).json({
        success: false,
        message:
          "Unable to reschedule appointment. Please try again.",
      });


    } finally {

      client.release();
    }
  }
);
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
app.post("/api/prescriptions", authenticateToken, async (req, res) => {
  // console.log("looged in user");
  // console.log("JWT USER:", req.user);
  // console.log("Patient ID used:", req.user.id);
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
    await createNotification(
      patient_id,
      "Prescription Ready",
      "Your doctor uploaded a prescription.",
      "prescription"
    );
    sendNotificationEvent({
      title: "Prescription Ready",
      message: "Your doctor uploaded a prescription.",
      type: "prescription",
      unread: true,
      created_at: new Date(),
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Database Error",
    });
  }
});
app.get("/api/prescriptions", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
      p.id,
      p.patient_id,
      p.doctor_id,
      p.medicines,
      p.dosage,
      p.duration,
      p.notes,
      p.created_at,
      p.status,
      d.name AS doctor_name,
      d.specialization,
      pt.name AS patient_name
FROM prescriptions p
INNER JOIN patients pt
      ON pt.id = p.patient_id
LEFT JOIN doctors d
      ON d.id = p.doctor_id
WHERE pt.phone = $1
ORDER BY p.created_at DESC;
      `,
      [req.user.phone]
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Database Error",
    });
  }
});
app.get(
  "/api/prescriptions/:id/pdf",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
        p.*,
        pt.name AS patient_name,
        d.name AS doctor_name,
        d.specialization
    FROM prescriptions p
    INNER JOIN patients pt
        ON pt.id = p.patient_id
    LEFT JOIN doctors d
        ON d.id = p.doctor_id
    WHERE
        p.id = $1
        AND pt.phone = $2;
        `,
        [
          id,
          req.user.phone,
        ]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({
            message: "Prescription not found",
          });
      }

      generatePrescriptionPDF(
        res,
        result.rows[0]
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to generate PDF",
      });
    }
  }
);
app.get(
  "/api/reports",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name AS patient_name,
          report AS file,
          phone,
          age,
          gender
        FROM patients
        WHERE report IS NOT NULL
        ORDER BY id DESC
      `);

      res.json(result.rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load reports",
      });
    }
  }
);
app.delete(
  "/api/reports/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "SELECT report FROM patients WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      const reportFile = result.rows[0].report;

      if (reportFile) {
        const reportPath = path.join(
          __dirname,
          "uploads",
          reportFile
        );

        if (fs.existsSync(reportPath)) {
          fs.unlinkSync(reportPath);
        }
      }

      await pool.query(
        "UPDATE patients SET report = NULL WHERE id = $1",
        [id]
      );

      res.json({
        success: true,
        message: "Medical report deleted successfully",
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: "Failed to delete medical report",
      });
    }
  }
);
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
/* ===========================
   PATIENT MEDICAL HISTORY APIs
=========================== */

// Get medical history by patient ID
app.get(
  "/api/patient-history/:patientId",
  authenticateToken,
  async (req, res) => {
    try {
      const { patientId } = req.params;

      const result = await pool.query(
        `
        SELECT *
        FROM patient_medical_history
        WHERE patient_id = $1
        ORDER BY updated_at DESC
        `,
        [patientId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load patient medical history",
      });
    }
  }
);

// Create medical history
app.post(
  "/api/patient-history",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        patient_id,
        previous_illnesses,
        surgeries,
        family_history,
        allergies,
        lifestyle,
        doctor_notes,
      } = req.body;

      const result = await pool.query(
        `
        INSERT INTO patient_medical_history
        (
          patient_id,
          previous_illnesses,
          surgeries,
          family_history,
          allergies,
          lifestyle,
          doctor_notes
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
          patient_id,
          previous_illnesses,
          surgeries,
          family_history,
          allergies,
          lifestyle,
          doctor_notes,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to create medical history",
      });
    }
  }
);

// Update medical history
app.put(
  "/api/patient-history/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        previous_illnesses,
        surgeries,
        family_history,
        allergies,
        lifestyle,
        doctor_notes,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE patient_medical_history
        SET
          previous_illnesses = $1,
          surgeries = $2,
          family_history = $3,
          allergies = $4,
          lifestyle = $5,
          doctor_notes = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
        `,
        [
          previous_illnesses,
          surgeries,
          family_history,
          allergies,
          lifestyle,
          doctor_notes,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Medical history not found",
        });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to update medical history",
      });
    }
  }
);

// Delete medical history
app.delete(
  "/api/patient-history/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM patient_medical_history
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Medical history not found",
        });
      }

      res.json({
        success: true,
        message: "Medical history deleted successfully",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to delete medical history",
      });
    }
  }
);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
