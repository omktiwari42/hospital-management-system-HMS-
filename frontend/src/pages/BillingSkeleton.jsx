

export default function BillingSkeleton() {
    return (
        <div className="patient-billing-page">

            <div className="billing-summary-grid">
                {[1, 2, 3, 4].map(card => (
                    <div key={card} className="billing-summary-card skeleton-card">
                        <div className="skeleton skeleton-title"></div>
                        <div className="skeleton skeleton-number"></div>
                    </div>
                ))}
            </div>

            <div className="billing-search">
                <div className="skeleton skeleton-input"></div>
            </div>

            <div className="billing-table-wrapper">

                <table className="billing-table">

                    <thead>
                        <tr>
                            <th>Bill ID</th>
                            <th>Doctor</th>
                            <th>Patient</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {[1, 2, 3, 4, 5, 6, 7].map(row => (
                            <tr key={row}>

                                {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                                    <td key={col}>
                                        <div className="skeleton skeleton-line"></div>
                                    </td>
                                ))}

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}