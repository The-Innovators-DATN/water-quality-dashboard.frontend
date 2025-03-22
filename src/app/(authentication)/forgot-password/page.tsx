"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError("");
    
    // Validate email
    if (!email) {
      setError("Email là bắt buộc");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      // Import mockAuthService để sử dụng
      const { mockAuthService } = await import('@/lib/services/mockAuthService');
      
      // Gọi service quên mật khẩu
      const result = await mockAuthService.forgotPassword(email);
      
      // Trong môi trường development, hiển thị token để dễ test
      console.log('[DEBUG] Reset token for testing:', result.debugToken);
      
      // Đánh dấu đã gửi thành công
      setSubmitted(true);
    } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/water-monitoring-bg.jpg')] bg-cover bg-center flex items-center justify-center p-4 relative">
      {/* Overlay màu xanh nước biển mờ */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-cyan-800/70 backdrop-blur-sm"></div>
      
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden z-10 border border-blue-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-blue-800">
              {submitted ? "Email đã được gửi" : "Quên mật khẩu"}
            </h1>
            <p className="text-blue-600 mt-2 font-medium">
              Hệ thống quan trắc chất lượng nước
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="mb-3 bg-green-100 p-2 rounded-full">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-800">Kiểm tra email của bạn</h3>
                <p className="mt-2 text-green-600">
                  Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến {email}. Vui lòng kiểm tra hộp thư đến của bạn.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-gray-600 text-sm">
                  Không nhận được email? Kiểm tra thư mục spam hoặc
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Thử lại với email khác
                </button>
                
                <div className="pt-4">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại trang đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="mb-6 text-gray-600">
                Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi đường dẫn để đặt lại mật khẩu.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none border-gray-300 focus:ring-blue-200"
                      placeholder="example@domain.com"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Send size={18} className="mr-2" />
                    )}
                    {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                  </button>

                  <div className="text-center text-sm">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}