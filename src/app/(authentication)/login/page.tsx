"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const { mockAuthService } = await import('@/lib/services/mockAuthService');
      
      const result = await mockAuthService.login(formData.email, formData.password);
      
      // Lưu thông tin vào localStorage để duy trì phiên đăng nhập
      localStorage.setItem('token', result.token);
      
      // Lưu thông tin người dùng vào store
      const { login } = await import('@/lib/stores/useAuthStore');
      login(result.user, result.token);
      
      // Chuyển hướng sau khi đăng nhập thành công
      const nextUrl = new URLSearchParams(window.location.search).get('from') || "/dashboard/water";
      router.push(nextUrl);
      
    } catch (error) {
      if (error instanceof Error) {
        setErrors((prev) => ({
          ...prev,
          general: error.message
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Đăng nhập thất bại. Vui lòng thử lại."
        }));
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
            <h1 className="text-2xl font-bold text-blue-800">Đăng nhập</h1>
            <p className="text-blue-600 mt-2 font-medium">
              Hệ thống quan trắc chất lượng nước
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

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
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.email
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="example@domain.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Nhớ tài khoản
                  </label>
                </div>
                <div className="text-sm">
                  <a href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <LogIn size={18} className="mr-2" />
                )}
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}