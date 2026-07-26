import "./../styles/invoice.css";

function InvoiceCard({ invoice }) {
    return (
        <div className="invoice-card">

            <div className="invoice-header">
                <div>
                    <h1 className="hospital-name">🏥 My HMS</h1>
                    <p>Hospital Management System</p>
                    <p>myhms.online</p>
                </div>

                <div className="invoice-status paid">
                    PAID
                </div>
            </div>

            <hr />

            <div className="invoice-top-grid">

                <div>
                    <h3>Invoice</h3>
                    <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
                    <p><strong>Date:</strong> {invoice.date}</p>
                </div>

                <div>
                    <h3>Patient</h3>
                    <p>{invoice.patientName}</p>
                    <p>{invoice.patientPhone}</p>
                    <p>{invoice.gender}</p>
                </div>

                <div>
                    <h3>Doctor</h3>
                    <p>{invoice.doctor}</p>
                    <p>{invoice.department}</p>
                </div>

            </div>

            <table className="invoice-table">

                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>

                    {invoice.items.map((item, index) => (

                        <tr key={index}>
                            <td>{item.service}</td>
                            <td>{item.qty}</td>
                            <td>₹{item.price}</td>
                            <td>₹{item.qty * item.price}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

            <div className="invoice-summary">

                <div>
                    <span>Subtotal</span>
                    <strong>₹{invoice.subtotal}</strong>
                </div>

                <div>
                    <span>Tax</span>
                    <strong>₹{invoice.tax}</strong>
                </div>

                <div className="grand-total">
                    <span>Grand Total</span>
                    <strong>₹{invoice.total}</strong>
                </div>

            </div>

            <div className="invoice-footer">

                <button className="print-btn">
                    🖨 Print Invoice
                </button>

                <button className="download-btn">
                    ⬇ Download PDF
                </button>

            </div>

        </div>
    );
}

export default InvoiceCard;