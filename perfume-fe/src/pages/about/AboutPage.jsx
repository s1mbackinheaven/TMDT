import React, { useEffect } from 'react'

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="w-full font-[Montserrat]">
      {/* Phần 1: Câu chuyện thương hiệu */}
      <div className="bg-[#F6F6F6] pt-32 pb-16 md:pt-40 md:pb-24 px-4">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-light tracking-widest uppercase mb-4 text-black">
            VỀ BACK PERFUME
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium mb-12 text-black">
            Câu chuyện thương hiệu
          </h2>
          <div className="text-left text-[#333333] text-sm md:text-[15px] space-y-6 leading-[1.8] mx-auto font-medium">
            <p>
              BACK Perfume là cửa hàng nước hoa cao cấp được hình thành từ hành trình vượt ra khỏi “vùng an toàn” của Founder Nguyễn Ngọc Lân – chàng trai trẻ 9x đầy nhiệt huyết cùng niềm đam mê bất tận về mùi hương.
            </p>
            <p>
              Sinh ra trong gia đình có định hướng nghề nghiệp truyền thống cùng tấm bằng cử nhân trên tay, những tưởng Nguyễn Ngọc Lân sẽ chọn một sự nghiệp ổn định và an toàn. Thế nhưng, niềm say mê bất tận với mùi hương đã thôi thúc anh bước sang một lĩnh vực hoàn toàn mới – Một reviewer chuyên về nước hoa. Khởi đầu bằng 5 chai nước hoa nữ yêu thích, Lân bắt đầu hành trình chia sẻ những trải nghiệm về nước hoa với bạn bè. Ấn tượng bởi lối review chân thật, gần gũi và dí dỏm, những người bạn ấy đã trở thành cầu nối lan tỏa, giúp anh tìm được những khách hàng đầu tiên trong sự nghiệp reviewer.
            </p>
            <p>
              Thế nhưng, ít ai biết rằng, ngày đầu theo đuổi đam mê, Lân như một người lữ hành không có bản đồ. Không kinh nghiệm, không nguồn lực, thậm chí còn bị gia đình phản đối kịch liệt. Đã từng có thời điểm, anh phải bán chiếc điện thoại đang dùng để có tiền vốn bắt đầu sự nghiệp. Khó khăn lại càng hun đúc thêm quyết tâm, trải qua bao thăng trầm, cuối cùng, Lân đã xây dựng chỗ đứng vững chắc trong cộng đồng review nước hoa tại Việt Nam. Mỗi bài viết, mỗi video review là một phần của hành trình khẳng định chính mình.
            </p>
            <p>
              Và rồi, BACK Perfume – cửa hàng nước hoa đầu tiên ra đời vào năm 2021 như một thành quả rực rỡ của chàng trai trẻ. Với ý tưởng “Khám phá bản thân qua mùi hương”, BACK Perfume quan niệm, nước hoa là thứ ma thuật kỳ diệu, khơi dậy những xúc cảm sâu lắng trong mỗi chúng ta. BACK Perfume hy vọng sẽ là người bạn đồng hành đáng tin cậy trên hành trình khám phá hương thơm, khơi dậy sự tự tin và khẳng định phong cách độc bản của mỗi người dùng. Hiện nay, bên cạnh 02 showroom tại Hà Nội, BACK Perfume đang bắt đầu hành trình mở rộng chi nhánh tại TP. HCM và các tỉnh thành khu vực phía Nam, hứa hẹn sẽ là nơi để các “đồng thơm” trải nghiệm và khám phá bản thân trong từng làn hương quyến rũ.
            </p>
          </div>
        </div>
      </div>

      {/* Phần 2: Grid Hình ảnh & Thống kê */}
      <div className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-16 items-center">
          
          {/* Top Left: Hình ảnh 1 */}
          <div className="w-full">
            <img 
              src="https://lanperfume.com/wp-content/uploads/2024/10/dia-chj-ban-nuoc-hoa-chinh-hang-lan-perfume.jpg" 
              alt="Cửa hàng BACK Perfume" 
              className="w-full h-auto object-cover rounded-md shadow-sm"
            />
          </div>

          {/* Top Right: Thống kê */}
          <div className="flex flex-col justify-center pl-0 md:pl-4">
            <h3 className="text-3xl md:text-4xl font-medium mb-10 text-black">
              Con số ấn tượng
            </h3>
            <div className="grid grid-cols-2 gap-y-10 gap-x-6">
              <div>
                <div className="text-3xl md:text-[40px] font-semibold mb-2">80%</div>
                <div className="text-[#333] text-sm md:text-base font-medium">Bán hàng trực tuyến</div>
              </div>
              <div>
                <div className="text-3xl md:text-[40px] font-semibold mb-2">100%</div>
                <div className="text-[#333] text-sm md:text-base font-medium">Hàng chính hãng</div>
              </div>
              <div>
                <div className="text-3xl md:text-[40px] font-semibold mb-2">&gt;300</div>
                <div className="text-[#333] text-sm md:text-base font-medium">Sản phẩm chất lượng</div>
              </div>
              <div>
                <div className="text-3xl md:text-[40px] font-semibold mb-2">2000+</div>
                <div className="text-[#333] text-sm md:text-base font-medium">Khách hàng hài lòng</div>
              </div>
            </div>
          </div>

          {/* Bottom Left: Quote */}
          <div className="flex flex-col justify-center order-last md:order-none pr-0 md:pr-4">
            <h3 className="text-3xl md:text-4xl font-medium mb-6 text-black">
              "Smell good - Feel good"
            </h3>
            <p className="text-[#333333] text-sm md:text-[15px] leading-[1.8] font-medium">
              Cái hay của nước hoa chính là hương thơm không cố định ở một mùi nhất định, mà thay đổi dần theo thời gian, nhiệt độ và chính cơ thể của người sử dụng. CEO Nguyễn Ngọc Lân hi vọng nhờ kiến thức cùng những hiểu biết của mình, BACK Perfume có thể giúp khách hàng lựa chọn được những mùi hương tốt nhất phù hợp với từng cá nhân và hoàn cảnh để giúp khách hàng cảm thấy tốt hơn, tự tin và thành công hơn.
            </p>
          </div>

          {/* Bottom Right: Hình ảnh 2 */}
          <div className="w-full">
            <img 
              src="https://lanperfume.com/wp-content/uploads/2024/10/cua-hang-lan-perfume-tai-ha-noi.jpg" 
              alt="Khách hàng tại BACK Perfume" 
              className="w-full h-auto object-cover rounded-md shadow-sm"
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default AboutPage
