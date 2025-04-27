export interface PopupPosition {
    top: number;
    left: number;
}
  
  /**
   * Tính toán vị trí popup sao cho không tràn khỏi viewport.
   *
   * @param triggerRect - DOMRect từ phần tử gốc (getBoundingClientRect)
   * @param popupWidth - Chiều rộng popup
   * @param popupHeight - Chiều cao popup
   * @param padding - Khoảng cách padding từ viền màn hình (mặc định 16px)
   * @returns Tọa độ { top, left } dùng cho position: fixed
   */
export function calculatePopupPosition(
    triggerRect: DOMRect,
    popupWidth: number,
    popupHeight: number,
    padding: number = 16
): PopupPosition {
    let top = triggerRect.bottom;
    let left = triggerRect.left;
  
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = window.innerWidth - triggerRect.left;
    const spaceLeft = triggerRect.right;
  
    // Nếu không đủ chỗ bên dưới → show lên trên
    if (spaceBelow < popupHeight && spaceAbove >= popupHeight) {
        top = triggerRect.top - popupHeight;
    }
  
    // Nếu không đủ chỗ bên phải → dịch trái
    if (spaceRight < popupWidth && triggerRect.right >= popupWidth) {
        left = window.innerWidth - popupWidth - padding;
    }
  
    return { top, left };
}
  