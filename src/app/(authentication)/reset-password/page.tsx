import { NextPage } from 'next';

const ResetPasswordPage: NextPage = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-bold">Chức năng đặt lại mật khẩu tạm thời không khả dụng</h1>
      <p className="mt-4">Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
    </div>
  );
};

export default ResetPasswordPage;