// src/components/layout/MainFooter.jsx
import { FiFacebook, FiInstagram, FiPhone, FiMail } from 'react-icons/fi'
import { SiShopee } from 'react-icons/si'

const MainFooter = () => {
  return (
    <footer className="mt-10 bg-white text-black border-t border-black/10 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      <div className="max-w-6xl px-6 md:px-10 lg:px-16 mx-auto pt-10 pb-8">
        <div className="grid gap-10 md:grid-cols-4 text-[15px]">
          {/* Về BACK Perfume */}
          <div className="space-y-3">
            <h3 className="text-[17px] font-semibold">Về BACK Perfume</h3>
            <p className="text-sm leading-relaxed text-black/70">
              &quot;Luxe – Art – Nostalgia&quot; Sang trọng là bản chất. Nghệ
              thuật là hình thái. Hoài niệm là dấu vết. Mỗi mùi hương là một
              tuyên ngôn thẩm lặng dành cho người có gu sống riêng biệt.
            </p>
            <ul className="space-y-1.5 text-sm text-black/80">
              <li className="flex items-center gap-2">
                <FiPhone size={14} className="shrink-0 text-black/70" />
                <span className="whitespace-nowrap">
                  Thanh Hóa: 0397 55 0208
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={14} className="shrink-0 text-black/70" />
                <span className="whitespace-nowrap">
                  Hà Nội: 0397 55 0208
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={14} className="shrink-0 text-black/70" />
                <span className="whitespace-nowrap">
                  PTIT: 0397 55 0208
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={14} className="shrink-0 text-black/70" />
                <span className="whitespace-nowrap">
                  bachtieuquai@gmail.com
                </span>
              </li>
            </ul>
          </div>

          {/* Liên kết nhanh */}
          <div className="space-y-3">
            <h3 className="text-[17px] font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-1.5 text-sm text-black/80">
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Giới thiệu
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Bộ sưu tập nước hoa
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Thương hiệu
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Tin tức
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Liên hệ
              </li>
            </ul>
          </div>

          {/* Sản phẩm */}
          <div className="space-y-3">
            <h3 className="text-[17px] font-semibold">Sản phẩm</h3>
            <ul className="space-y-1.5 text-sm text-black/80">
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Nước hoa nam
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Nước hoa nữ
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Nước hoa unisex
              </li>
              <li className="cursor-pointer hover:text-black whitespace-nowrap">
                Body spray
              </li>
            </ul>
          </div>

          {/* Cửa hàng */}
          <div className="space-y-3">
            <h3 className="text-[17px] font-semibold">Cửa hàng</h3>
            <div className="space-y-2 text-sm text-black/80">
              <div>
                <p className="font-semibold">Hà Nội</p>
                <p className="whitespace-nowrap">
                  107 Ngọc Trục, Đại Mỗ, Nam Từ Liêm
                </p>
              </div>
              <div>
                <p className="font-semibold">Thanh Hóa</p>
                <p className="whitespace-nowrap">
                  Khu 5, thị trấn Quán Lào, Yên Định
                </p>
              </div>
              <div>
                <p className="font-semibold">Thanh Hóa</p>
                <p className="whitespace-nowrap">
                  Khu 1, thị trấn Quán Lào, Yên Định
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Đường kẻ mảnh */}
        <div className="mt-8 border-t border-black/10" />

        {/* Mạng xã hội */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="flex items-center justify-center w-8 h-8 text-black bg-white rounded-full cursor-pointer hover:bg-black hover:text-white transition-colors">
            <FiFacebook size={16} />
          </button>
          <button className="flex items-center justify-center w-8 h-8 text-black bg-white rounded-full cursor-pointer hover:bg-black hover:text-white transition-colors">
            <FiInstagram size={16} />
          </button>
          <button className="flex items-center justify-center w-8 h-8 text-black bg-white rounded-full cursor-pointer hover:bg-black hover:text-white transition-colors">
            <SiShopee size={16} />
          </button>
        </div>

        {/* Dòng chữ cuối */}
        <div className="mt-6 text-xs md:text-[13px] text-center text-black/70 space-y-1.5">
          <p className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
            <span className="cursor-pointer hover:text-black whitespace-nowrap">
              Chính sách bảo mật
            </span>
            <span className="cursor-pointer hover:text-black whitespace-nowrap">
              Chính sách thanh toán
            </span>
            <span className="cursor-pointer hover:text-black whitespace-nowrap">
              Chính sách bảo hành
            </span>
          </p>
          <p>
            Thiết kế bởi{' '}
            <span className="font-semibold cursor-pointer hover:text-black">
              S1mBack-Inheaven
            </span>{' '}
            / Website
          </p>
        </div>
      </div>
    </footer>
  )
}

export default MainFooter

