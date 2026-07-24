const PDFDocument = require("pdfkit");

function generatePrescriptionPDF(res, prescription) {
    const doc = new PDFDocument({
        margin: 50,
        size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=Prescription-${prescription.id}.pdf`
    );

    doc.pipe(res);

    doc
        .fontSize(24)
        .fillColor("#2563eb")
        .text("Hospital Management System", {
            align: "center"
        });

    doc.moveDown();

    doc
        .fontSize(18)
        .fillColor("black")
        .text("Medical Prescription", {
            align: "center"
        });

    doc.moveDown(2);

    doc.fontSize(12);

    doc.text(`Prescription ID : ${prescription.id}`);
    doc.text(`Date : ${new Date(prescription.created_at).toLocaleDateString()}`);

    doc.moveDown();

    doc.text(`Patient : ${prescription.patient_name}`);
    doc.text(`Doctor : ${prescription.doctor_name}`);
    doc.text(`Specialization : ${prescription.specialization}`);

    doc.moveDown();

    doc.fontSize(14).text("Medicines", {
        underline: true
    });

    doc.moveDown(0.5);

    doc.fontSize(12).text(prescription.medicines);

    doc.moveDown();

    doc.text(`Dosage : ${prescription.dosage}`);

    doc.text(`Duration : ${prescription.duration}`);

    doc.moveDown();

    doc.fontSize(14).text("Doctor Notes", {
        underline: true
    });

    doc.moveDown(0.5);

    doc.fontSize(12).text(
        prescription.notes || "No notes provided."
    );

    doc.moveDown(4);

    doc.text("________________________");

    doc.text("Doctor Signature");

    doc.end();
}

module.exports = generatePrescriptionPDF;