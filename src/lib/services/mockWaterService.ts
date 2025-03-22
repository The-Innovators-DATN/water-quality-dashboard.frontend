export interface MonitoringStation {
    id: string;
    name: string;
    location: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    status: 'active' | 'maintenance' | 'inactive';
    lastUpdate: string;
  }

  export interface WaterQualityData {
    stationId: string;
    timestamp: string;
    parameters: {
      temperature: number;  // nhiệt độ (°C)
      ph: number;           // độ pH
      turbidity: number;    // độ đục (NTU)
      do: number;           // oxy hòa tan (mg/L)
      cod: number;          // nhu cầu oxy hóa học (mg/L)
      bod: number;          // nhu cầu oxy sinh học (mg/L)
      ammonium: number;     // amoni (mg/L)
      nitrate: number;      // nitrat (mg/L)
      phosphate: number;    // phosphat (mg/L)
      tds: number;          // tổng chất rắn hòa tan (mg/L)
      conductivity: number; // độ dẫn điện (µS/cm)
      salinity: number;     // độ mặn (ppt)
    };
    wqi: number;            // chỉ số chất lượng nước (0-100)
    qualityLevel: 'excellent' | 'good' | 'medium' | 'poor' | 'very-poor';
    alerts: string[];       // các cảnh báo (nếu có)
  }
  
  // Cấu trúc dữ liệu cảnh báo
  export interface Alert {
    id: string;
    stationId: string;
    stationName: string;
    timestamp: string;
    parameter: string;
    value: number;
    threshold: number;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    acknowledged: boolean;
  }
  
  // Mock dữ liệu các trạm quan trắc
  const MOCK_STATIONS: MonitoringStation[] = [
    {
      id: "station-1",
      name: "Trạm Sông Hồng",
      location: "Cầu Long Biên, Hà Nội",
      coordinates: {
        lat: 21.0435,
        lng: 105.8508
      },
      status: "active",
      lastUpdate: "2025-03-19T12:30:45"
    },
    {
      id: "station-2",
      name: "Trạm Hồ Tây",
      location: "Quận Tây Hồ, Hà Nội",
      coordinates: {
        lat: 21.0585,
        lng: 105.8232
      },
      status: "active",
      lastUpdate: "2025-03-19T12:28:10"
    },
    {
      id: "station-3",
      name: "Trạm Sông Đuống",
      location: "Huyện Gia Lâm, Hà Nội",
      coordinates: {
        lat: 21.0813,
        lng: 105.9380
      },
      status: "maintenance",
      lastUpdate: "2025-03-19T10:45:33"
    },
    {
      id: "station-4",
      name: "Trạm Hồ Đồng Mô",
      location: "Huyện Sơn Tây, Hà Nội",
      coordinates: {
        lat: 21.1012,
        lng: 105.4675
      },
      status: "active",
      lastUpdate: "2025-03-19T12:29:53"
    },
    {
      id: "station-5",
      name: "Trạm Sông Nhuệ",
      location: "Quận Hà Đông, Hà Nội",
      coordinates: {
        lat: 20.9738,
        lng: 105.7820
      },
      status: "active", 
      lastUpdate: "2025-03-19T12:15:22"
    }
  ];
  
  // Hàm tạo dữ liệu ngẫu nhiên trong phạm vi
  const randomInRange = (min: number, max: number, precision: number = 2): number => {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(precision));
  };
  
  // Hàm tạo dữ liệu chất lượng nước giả lập cho một trạm
  const generateWaterQualityData = (stationId: string, timestamp: string, isAlert: boolean = false): WaterQualityData => {
    // Tạo dữ liệu các thông số cơ bản
    const temperature = randomInRange(20, 30);
    let ph = randomInRange(6.5, 8.5);
    let turbidity = randomInRange(5, 50);
    let do_value = randomInRange(4, 9);
    let cod = randomInRange(10, 30);
    const bod = randomInRange(2, 15);
    let ammonium = randomInRange(0.1, 0.5);
    const nitrate = randomInRange(2, 10);
    const phosphate = randomInRange(0.1, 0.3);
    const tds = randomInRange(100, 500);
    const conductivity = randomInRange(200, 800);
    const salinity = randomInRange(0.1, 5);
    
    const alerts: string[] = [];
    if (isAlert) {
      // Chọn ngẫu nhiên 1-2 thông số để tạo cảnh báo
      const alertTypes = ['ph', 'do', 'cod', 'ammonium', 'turbidity'];
      const numAlerts = Math.floor(Math.random() * 2) + 1;
      const selectedAlerts = alertTypes.sort(() => 0.5 - Math.random()).slice(0, numAlerts);
      
      for (const alert of selectedAlerts) {
        switch (alert) {
          case 'ph':
            // pH ngoài khoảng 6.5-8.5
            ph = Math.random() > 0.5 ? randomInRange(8.6, 9.5) : randomInRange(5.5, 6.4);
            alerts.push(`pH ${ph > 8.5 ? 'cao' : 'thấp'}: ${ph}`);
            break;
          case 'do':
            // DO thấp hơn 4 mg/L
            do_value = randomInRange(2, 3.9);
            alerts.push(`Oxy hòa tan thấp: ${do_value} mg/L`);
            break;
          case 'cod':
            // COD cao hơn 30 mg/L
            cod = randomInRange(31, 50);
            alerts.push(`COD cao: ${cod} mg/L`);
            break;
          case 'ammonium':
            // Amoni cao hơn 0.5 mg/L
            ammonium = randomInRange(0.6, 1.5);
            alerts.push(`Amoni cao: ${ammonium} mg/L`);
            break;
          case 'turbidity':
            // Độ đục cao hơn 50 NTU
            turbidity = randomInRange(51, 100);
            alerts.push(`Độ đục cao: ${turbidity} NTU`);
            break;
        }
      }
    }
    
    // Tính WQI (Water Quality Index) dựa trên các thông số
    // Đơn giản hóa bằng cách tính trung bình chuẩn hóa của các thông số chính
    // Trong thực tế, công thức WQI phức tạp hơn nhiều
    let wqi = 0;
    
    // Chuẩn hóa pH (tốt nhất là 7, giảm dần khi xa 7)
    const phScore = Math.max(0, 100 - Math.abs(ph - 7) * 20);
    
    // Chuẩn hóa DO (càng cao càng tốt, tối đa 100 khi >= 7.5)
    const doScore = Math.min(100, (do_value / 7.5) * 100);
    
    // Chuẩn hóa COD (càng thấp càng tốt)
    const codScore = Math.max(0, 100 - (cod / 30) * 100);
    
    // Chuẩn hóa BOD (càng thấp càng tốt)
    const bodScore = Math.max(0, 100 - (bod / 15) * 100);
    
    // Chuẩn hóa amoni (càng thấp càng tốt)
    const ammoniumScore = Math.max(0, 100 - (ammonium / 0.5) * 100);
    
    // Chuẩn hóa turbidity (độ đục - càng thấp càng tốt)
    const turbidityScore = Math.max(0, 100 - (turbidity / 50) * 100);
    
    // Tính WQI trung bình có trọng số
    wqi = Math.round((phScore * 0.15 + doScore * 0.2 + codScore * 0.15 + bodScore * 0.15 + ammoniumScore * 0.15 + turbidityScore * 0.2));
    
    // Xác định mức chất lượng nước dựa trên WQI
    let qualityLevel: WaterQualityData['qualityLevel'];
    if (wqi >= 90) {
      qualityLevel = 'excellent';
    } else if (wqi >= 75) {
      qualityLevel = 'good';
    } else if (wqi >= 50) {
      qualityLevel = 'medium';
    } else if (wqi >= 25) {
      qualityLevel = 'poor';
    } else {
      qualityLevel = 'very-poor';
    }
    
    return {
      stationId,
      timestamp,
      parameters: {
        temperature,
        ph,
        turbidity,
        do: do_value,
        cod,
        bod,
        ammonium,
        nitrate,
        phosphate,
        tds,
        conductivity,
        salinity
      },
      wqi,
      qualityLevel,
      alerts
    };
  };
  
  // Lưu trữ dữ liệu đo lường hiện tại (để mô phỏng lịch sử)
  let currentMeasurements: WaterQualityData[] = [];
  
  // Lưu trữ cảnh báo
  let currentAlerts: Alert[] = [];
  
  // Tạo dữ liệu đo lường hiện tại cho tất cả các trạm
  const generateAllCurrentMeasurements = () => {
    const timestamp = new Date().toISOString();
    currentMeasurements = MOCK_STATIONS.map(station => {
      // 30% khả năng tạo cảnh báo
      const isAlert = Math.random() < 0.3;
      return generateWaterQualityData(station.id, timestamp, isAlert);
    });
    
    // Tạo cảnh báo dựa trên các đo lường hiện tại
    updateAlerts();
    
    return currentMeasurements;
  };
  
  // Tạo dữ liệu lịch sử
  const generateHistoricalData = (stationId: string, days: number): WaterQualityData[] => {
    const now = new Date();
    const data: WaterQualityData[] = [];
    
    // Tạo dữ liệu cho mỗi ngày, mỗi ngày có 24 điểm đo (1 giờ/lần)
    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(hour, 0, 0, 0);
        
        // 10% khả năng tạo cảnh báo trong dữ liệu lịch sử
        const isAlert = Math.random() < 0.1;
        data.push(generateWaterQualityData(stationId, date.toISOString(), isAlert));
      }
    }
    
    return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };
  
  // Tạo hoặc cập nhật cảnh báo dựa trên các đo lường
  const updateAlerts = () => {
    // Danh sách cảnh báo mới
    const newAlerts: Alert[] = [];
    
    // Kiểm tra từng đo lường hiện tại để tạo cảnh báo
    for (const measurement of currentMeasurements) {
      if (measurement.alerts.length > 0) {
        const station = MOCK_STATIONS.find(s => s.id === measurement.stationId);
        
        if (!station) continue;
        
        // Tạo cảnh báo cho mỗi thông báo cảnh báo
        measurement.alerts.forEach(alertMsg => {
          // Xác định thông số và giá trị từ thông báo cảnh báo
          let parameter = '';
          let value = 0;
          let threshold = 0;
          let severity: Alert['severity'] = 'medium';
          
          if (alertMsg.includes('pH')) {
            parameter = 'pH';
            value = measurement.parameters.ph;
            threshold = value > 8.5 ? 8.5 : 6.5;
            severity = Math.abs(value - 7) > 1.5 ? 'high' : 'medium';
          } else if (alertMsg.includes('Oxy')) {
            parameter = 'Oxy hòa tan (DO)';
            value = measurement.parameters.do;
            threshold = 4;
            severity = value < 3 ? 'high' : 'medium';
          } else if (alertMsg.includes('COD')) {
            parameter = 'COD';
            value = measurement.parameters.cod;
            threshold = 30;
            severity = value > 40 ? 'high' : 'medium';
          } else if (alertMsg.includes('Amoni')) {
            parameter = 'Amoni';
            value = measurement.parameters.ammonium;
            threshold = 0.5;
            severity = value > 1 ? 'high' : 'medium';
          } else if (alertMsg.includes('đục')) {
            parameter = 'Độ đục';
            value = measurement.parameters.turbidity;
            threshold = 50;
            severity = value > 70 ? 'high' : 'medium';
          }
          
          // Tạo ID cảnh báo duy nhất
          const alertId = `alert-${parameter}-${measurement.stationId}-${Date.now()}`;
          
          // Tạo cảnh báo mới
          newAlerts.push({
            id: alertId,
            stationId: measurement.stationId,
            stationName: station.name,
            timestamp: measurement.timestamp,
            parameter,
            value,
            threshold,
            message: alertMsg,
            severity,
            acknowledged: false
          });
        });
      }
    }
    
    // Thêm cảnh báo mới vào danh sách cảnh báo hiện tại
    currentAlerts = [...currentAlerts, ...newAlerts];
    
    // Giới hạn số lượng cảnh báo lưu trữ
    if (currentAlerts.length > 50) {
      currentAlerts = currentAlerts.slice(currentAlerts.length - 50);
    }
    
    return newAlerts;
  };
  
  // Service để xử lý các tác vụ liên quan đến dữ liệu quan trắc nước
  export const mockWaterService = {
    // Lấy danh sách tất cả các trạm
    getStations: async (): Promise<MonitoringStation[]> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 600));
      return [...MOCK_STATIONS];
    },
    
    // Lấy thông tin chi tiết của một trạm
    getStationById: async (stationId: string): Promise<MonitoringStation | null> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 400));
      return MOCK_STATIONS.find(s => s.id === stationId) || null;
    },
    
    // Lấy dữ liệu đo lường hiện tại của tất cả các trạm
    getCurrentMeasurements: async (): Promise<WaterQualityData[]> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Nếu chưa có dữ liệu hiện tại, tạo mới
      if (currentMeasurements.length === 0) {
        generateAllCurrentMeasurements();
      }
      
      return [...currentMeasurements];
    },
    
    // Lấy dữ liệu đo lường hiện tại của một trạm
    getCurrentMeasurementByStationId: async (stationId: string): Promise<WaterQualityData | null> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Nếu chưa có dữ liệu hiện tại, tạo mới
      if (currentMeasurements.length === 0) {
        generateAllCurrentMeasurements();
      }
      
      return currentMeasurements.find(m => m.stationId === stationId) || null;
    },
    
    // Lấy dữ liệu lịch sử của một trạm
    getHistoricalData: async (stationId: string, days: number = 7): Promise<WaterQualityData[]> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return generateHistoricalData(stationId, days);
    },
    
    // Lấy danh sách tất cả các cảnh báo
    getAlerts: async (acknowledged: boolean | null = null): Promise<Alert[]> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Nếu có yêu cầu lọc theo tình trạng acknowledgement
      if (acknowledged !== null) {
        return currentAlerts.filter(alert => alert.acknowledged === acknowledged);
      }
      
      return [...currentAlerts];
    },
    
    // Lấy cảnh báo theo ID
    getAlertById: async (alertId: string): Promise<Alert | null> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 300));
      return currentAlerts.find(a => a.id === alertId) || null;
    },
    
    // Xác nhận một cảnh báo
    acknowledgeAlert: async (alertId: string): Promise<boolean> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const alertIndex = currentAlerts.findIndex(a => a.id === alertId);
      if (alertIndex >= 0) {
        currentAlerts[alertIndex].acknowledged = true;
        return true;
      }
      
      return false;
    },
    
    // Tạo lại dữ liệu đo lường hiện tại (để mô phỏng cập nhật dữ liệu thời gian thực)
    refreshData: async (): Promise<WaterQualityData[]> => {
      // Mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return generateAllCurrentMeasurements();
    }
  };

generateAllCurrentMeasurements();