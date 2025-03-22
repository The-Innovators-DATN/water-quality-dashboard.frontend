export interface User {
    id: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
}

const MOCK_USERS: User[] = [
    {
      id: "user-1",
      fullName: "Nguyễn Văn Admin",
      email: "admin@example.com",
      password: "Admin@123",
      role: "admin"
    },
    {
      id: "user-2",
      fullName: "Trần Thị Kỹ Thuật",
      email: "tech@example.com",
      password: "Tech@123",
      role: "technician"
    },
    {
      id: "user-3", 
      fullName: "Lê Văn Nhân Viên",
      email: "user@example.com",
      password: "User@123",
      role: "user"
    }
];
  
interface ResetToken {
    token: string;
    email: string;
    expiresAt: number;
}

let resetTokens: ResetToken[] = [];

const TOKEN_EXPIRY = 60 * 60 * 1000;

export const mockAuthService = {
    login: async (email: string, password: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error("Email hoặc mật khẩu không chính xác");
      }
      
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        },
        token: `mock-jwt-token-${user.id}-${Date.now()}`
      };
    },
    
    register: async (fullName: string, email: string, password: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error("Email này đã được sử dụng");
      }
      
      const newUser: User = {
        id: `user-${MOCK_USERS.length + 1}`,
        fullName,
        email,
        password,
        role: "user"
      };

      MOCK_USERS.push(newUser);
      
      return {
        success: true,
        message: "Đăng ký thành công"
      };
    },
    
    forgotPassword: async (email: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        return {
          success: true,
          message: "Nếu địa chỉ email này tồn tại, chúng tôi đã gửi link đặt lại mật khẩu"
        };
      }

      const token = `reset-${user.id}-${Date.now()}`;

      resetTokens.push({
        token,
        email: user.email,
        expiresAt: Date.now() + TOKEN_EXPIRY
      });

      console.log(`[MOCK] Reset password link: /reset-password?token=${token}`);
      
      return {
        success: true,
        message: "Link đặt lại mật khẩu đã được gửi đến email của bạn",
        debugToken: token
      };
    },
    
    validateResetToken: async (token: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));

      const resetToken = resetTokens.find(t => t.token === token);

      if (!resetToken || resetToken.expiresAt < Date.now()) {
        return {
          valid: false,
          message: "Token không hợp lệ hoặc đã hết hạn"
        };
      }
      
      return {
        valid: true,
        email: resetToken.email
      };
    },

    resetPassword: async (token: string, newPassword: string) => {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const validation = await mockAuthService.validateResetToken(token);
      
      if (!validation.valid) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn");
      }

      const userIndex = MOCK_USERS.findIndex(u => u.email === validation.email);
      
      if (userIndex !== -1) {
        MOCK_USERS[userIndex].password = newPassword;

        resetTokens = resetTokens.filter(t => t.token !== token);
        
        return {
          success: true,
          message: "Mật khẩu đã được đặt lại thành công"
        };
      }
      
      throw new Error("Không tìm thấy tài khoản liên kết với token này");
    },

    getUserInfo: async (userId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = MOCK_USERS.find(u => u.id === userId);
      
      if (!user) {
        throw new Error("Không tìm thấy người dùng");
      }
      
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      };
    }
};