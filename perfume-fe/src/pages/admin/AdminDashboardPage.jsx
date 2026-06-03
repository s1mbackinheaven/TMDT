import { useEffect, useState } from 'react'
import { getDashboardStatsApi } from '../../api/dashboardApi'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts'
import { FiUsers, FiBox, FiBookOpen, FiDollarSign, FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  PENDING_CONFIRMATION: { label: 'Cần xác nhận', color: '#D4AF37', icon: FiClock }, // Gold/Luxury
  PROCESSING: { label: 'Đang xử lý', color: '#64748B', icon: FiBox }, // Slate
  SHIPPED: { label: 'Chờ vận chuyển', color: '#8B5CF6', icon: FiTruck }, // Violet
  DELIVERED: { label: 'Đang giao', color: '#3B82F6', icon: FiTruck }, // Blue
  COMPLETED: { label: 'Đã hoàn thành', color: '#10B981', icon: FiCheckCircle }, // Emerald
  CANCELLED: { label: 'Đã huỷ', color: '#EF4444', icon: FiXCircle }, // Red
}

const formatCurrency = (value) => {
  if (!value) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.2))' }}
      />
    </g>
  )
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStatsApi()
      if (data) {
        setStats(data)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-black/50">Đang tải dữ liệu tổng quan...</div>
  }

  if (!stats) {
    return <div className="py-20 text-center text-red-500">Lỗi khi lấy dữ liệu tổng quan.</div>
  }

  const { totalUsers, totalProducts, totalArticles, totalRevenue, orderStatusCounts } = stats

  // Prepare data for PieChart
  const pieData = Object.entries(orderStatusCounts || {})
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status]?.label || status,
      value: count,
      color: STATUS_CONFIG[status]?.color || '#cbd5e1'
    }))

  // Prepare cards
  const overviewCards = [
    { label: 'Tổng người dùng', value: totalUsers, icon: FiUsers, bg: 'bg-blue-50/50', color: 'text-blue-600' },
    { label: 'Sản phẩm', value: totalProducts, icon: FiBox, bg: 'bg-emerald-50/50', color: 'text-emerald-600' },
    { label: 'Bài viết', value: totalArticles, icon: FiBookOpen, bg: 'bg-purple-50/50', color: 'text-purple-600' },
    { label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), icon: FiDollarSign, bg: 'bg-black', color: 'text-white' },
  ]

  const totalOrders = Object.values(orderStatusCounts || {}).reduce((a, b) => a + b, 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-10"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Tổng quan hệ thống</h1>
          <p className="mt-2 text-[15px] text-black/60">
            Thống kê tình hình kinh doanh và dữ liệu chung.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={card.label} 
              className="p-6 bg-white border border-black/5 rounded-[24px] shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-black">{card.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Order Status Cards */}
        <div className="xl:col-span-2 bg-white border border-black/5 rounded-[28px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Trạng thái đơn hàng</h2>
            <span className="px-4 py-1.5 bg-black/5 rounded-full text-sm font-medium text-black">
              Tổng số: {totalOrders}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = orderStatusCounts?.[status] || 0
              const StatusIcon = config.icon
              return (
                <div key={status} className="p-5 rounded-[20px] border border-black/5 hover:border-black/10 transition-colors flex flex-col gap-3 cursor-default">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                      <StatusIcon size={18} />
                    </div>
                    <span className="text-2xl font-bold text-black">{count}</span>
                  </div>
                  <span className="text-sm font-medium text-black/70">{config.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white border border-black/5 rounded-[28px] p-8 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-black mb-6">Tỷ lệ trạng thái</h2>
          <div className="flex-1 min-h-[380px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="transition-all duration-300 ease-out hover:scale-[1.08] hover:drop-shadow-md cursor-pointer"
                        style={{ transformOrigin: 'center', transformBox: 'fill-box', outline: 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '13px', lineHeight: '24px' }}
                    iconType="circle" 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-black/40 text-sm">
                Chưa có dữ liệu đơn hàng
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminDashboardPage

