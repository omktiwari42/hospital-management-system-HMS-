function DashboardCard({ title, count }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{count}</p>
    </div>
  );
}

export default DashboardCard;