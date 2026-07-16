const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/profile");
    },

    filename(req, file, cb) {
        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter(req, file, cb) {

        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Images only"));
        }
    },
});

router.post(
    "/",
    upload.single("avatar"),
    async (req, res) => {

        try {

            res.json({
                success: true,
                image:
                    "/uploads/profile/" +
                    req.file.filename,
            });

        } catch (err) {

            res.status(500).json({
                message: err.message,
            });

        }

    }
);

module.exports = router;