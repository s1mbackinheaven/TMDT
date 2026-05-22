const AdminDashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
      <p className="mt-2 text-sm text-black/60">
        Trang tổng quan quản trị.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Users', value: '—' },
          { label: 'Products', value: '—' },
          { label: 'Orders', value: '—' },
        ].map((i) => (
          <div key={i.label} className="p-5 bg-white border border-black/5 rounded-2xl">
            <p className="text-xs text-black/50">{i.label}</p>
            <p className="mt-2 text-2xl font-semibold text-black">{i.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage

