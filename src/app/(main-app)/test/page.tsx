"use client";

import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const ReportButton = () => {
  const contentRef = useRef(null);

  const generatePDF = () => {
    const element = contentRef.current;
    
    // Chụp toàn bộ trang web, bao gồm cả phần cuộn
    html2canvas(element, {
      scrollX: 0,
      scrollY: -window.scrollY,  // Đảm bảo phần cuộn cũng được chụp
      height: document.documentElement.scrollHeight, // Lấy chiều cao của toàn bộ trang
      width: document.documentElement.scrollWidth,  // Lấy chiều rộng của toàn bộ trang
      windowWidth: document.documentElement.scrollWidth, // Lấy chiều rộng của cửa sổ
      windowHeight: document.documentElement.scrollHeight, // Lấy chiều cao của cửa sổ
      scale: 2,  // Điều chỉnh độ phân giải
    }).then((canvas) => {
      const doc = new jsPDF("p", "mm", "a4");

      // Chuyển canvas thành ảnh
      const imgData = canvas.toDataURL("image/png");

      // Lấy kích thước của ảnh
      const imgWidth = doc.internal.pageSize.width;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Thêm ảnh vào PDF
      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Lưu file PDF
      doc.save("schedule_report.pdf");
    });
  };

  return (
    <div>
      <div ref={contentRef}>
        {/* Nội dung của bạn sẽ được xuất ra PDF */}
        <h1>Báo Cáo Lịch Trình - Chất Lượng Nước</h1>
        <div>
          {/* Nội dung trang: văn bản, biểu đồ, bảng,... */}
          <p>Dữ liệu về pH và chất lượng nước sẽ được xuất dưới dạng bảng hoặc biểu đồ.</p>
        </div>
        {/* Các phần tử khác của trang web */}
      </div>

      <button onClick={generatePDF}>Tải Báo Cáo PDF</button>
    </div>
  );
};

export default ReportButton;
