"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Save, Check } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: ""
  });

  // Validate token khi trang load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidatingToken(false);
        return;
      }

      try {
        // Import mockAuthService để sử dụng
        const { mockAuthService } = await import('@/lib/services/mockAuthService');
        
        // Gọi service để validate token
        const result = await mockAuthService.validateResetToken(token);
        
        // Kiểm tra kết quả
        if (result.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Lỗi khi xác thực token:', error);
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      valid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({ password: "", confirmPassword: "", general: "" });

    try {
      if (!token) {
        throw new Error("Token không tồn tại");
      }
      
      // Import mockAuthService để sử dụng
      const { mockAuthService } = await import('@/lib/services/mockAuthService');
      
      // Gọi service để đặt lại mật khẩu
      await mockAuthService.resetPassword(token, formData.password);
      
      // Đặt lại mật khẩu thành công
      setResetComplete(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          general: error.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: "Đặt lại mật khẩu thất bại. Vui lòng thử lại."
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trạng thái loading khi đang validate token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-[url('/water-monitoring-bg.jpg')] bg-cover bg-center flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-cyan-800/70 backdrop-blur-sm"></div>
        <div className="bg-white/90 p-8 rounded-xl shadow-xl z-10 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-800 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

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
              {!tokenValid 
                ? "Link không hợp lệ" 
                : resetComplete 
                  ? "Mật khẩu đã được đặt lại" 
                  : "Đặt lại mật khẩu"}
            </h1>
            <p className="text-blue-600 mt-2 font-medium">
              Hệ thống quan trắc chất lượng nước
            </p>
          </div>

          {!tokenValid ? (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-yellow-800">
                  Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại với một liên kết mới.
                </p>
              </div>
              
              <Link
                href="/forgot-password"
                className="mt-6 block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-center"
              >
                Yêu cầu link mới
              </Link>
              
              <div className="pt-2">
                <Link 
                  href="/login" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại trang đăng nhập
                </Link>
              </div>
            </div>
          ) : resetComplete ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="mb-3 bg-green-100 p-2 rounded-full">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-800">Thành công!</h3>
                <p className="mt-2 text-green-600">
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.
                </p>
              </div>
              
              <Link
                href="/login"
                className="mt-6 block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-center"
              >
                Đi đến trang đăng nhập
              </Link>
            </div>
          ) : (
            <div>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <p className="mb-6 text-gray-600">
                Vui lòng nhập mật khẩu mới của bạn.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                          errors.password
                            ? "border-red-300 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                          errors.confirmPassword
                            ? "border-red-300 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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