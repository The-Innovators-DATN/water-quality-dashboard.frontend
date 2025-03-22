import { create } from 'zustand'

export interface Parameter {
  id: number
  name: string
  unit: string
  description: string
  category: string
}

const mockParameters: Parameter[] = [
  {
    id: 1,
    name: 'pH',
    unit: 'pH',
    description: 'Độ pH là thước đo tính axit hoặc kiềm của nước',
    category: 'Hóa lý'
  },
  {
    id: 2,
    name: 'Nhiệt độ',
    unit: '°C',
    description: 'Nhiệt độ của nước',
    category: 'Hóa lý'
  },
  {
    id: 3,
    name: 'DO (Oxy hòa tan)',
    unit: 'mg/L',
    description: 'Lượng oxy hòa tan trong nước',
    category: 'Hóa lý'
  },
  {
    id: 4,
    name: 'BOD (Nhu cầu oxy sinh hóa)',
    unit: 'mg/L',
    description: 'Lượng oxy cần thiết để vi sinh vật phân hủy chất hữu cơ',
    category: 'Sinh hóa'
  },
  {
    id: 5,
    name: 'Độ mặn',
    unit: 'ppt',
    description: 'Hàm lượng muối hòa tan trong nước',
    category: 'Hóa lý'
  },
  {
    id: 6,
    name: 'TSS (Tổng chất rắn lơ lửng)',
    unit: 'mg/L',
    description: 'Tổng số chất rắn không hòa tan trong nước',
    category: 'Hóa lý'
  },
  {
    id: 7,
    name: 'Clorophyl-a',
    unit: 'µg/L',
    description: 'Chỉ số đo lường tảo trong nước',
    category: 'Sinh học'
  },
  {
    id: 8,
    name: 'Độ cứng',
    unit: 'mg/L',
    description: 'Hàm lượng canxi và magiê trong nước',
    category: 'Hóa lý'
  },
  {
    id: 9,
    name: 'Amoni',
    unit: 'mg/L',
    description: 'Hàm lượng amoni trong nước',
    category: 'Hóa học'
  },
  {
    id: 10,
    name: 'Nitrat',
    unit: 'mg/L',
    description: 'Hàm lượng nitrat (NO3-) trong nước',
    category: 'Hóa học'
  },
  {
    id: 11,
    name: 'Phosphat',
    unit: 'mg/L',
    description: 'Hàm lượng phosphat trong nước',
    category: 'Hóa học'
  },
  {
    id: 12,
    name: 'COD (Nhu cầu oxy hóa học)',
    unit: 'mg/L',
    description: 'Lượng oxy cần thiết để oxy hóa các chất hữu cơ',
    category: 'Hóa học'
  }
];

interface ParameterState {
  parameters: Parameter[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchParameters: () => Promise<void>
  addParameter: (parameter: Omit<Parameter, 'id'>) => Promise<void>
  updateParameter: (id: number, data: Partial<Parameter>) => Promise<void>
  deleteParameter: (id: number) => Promise<void>
  
  // Selectors
  getParameterById: (id: number) => Parameter | undefined
  getParametersByCategory: (category: string) => Parameter[]
}

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const useParameterStore = create<ParameterState>((set, get) => ({
  parameters: [],
  loading: false,
  error: null,

  fetchParameters: async () => {
    set({ loading: true, error: null })
    try {
      await mockDelay(800)
      
      set({ parameters: mockParameters, loading: false })
    } catch (err) {
      if (err instanceof Error) {
        set({ error: err.message, loading: false })
      } else {
        set({ error: 'Lỗi khi thêm tham số', loading: false })
      }
    }
  },

  addParameter: async (parameter) => {
    set({ loading: true, error: null })
    try {
      await mockDelay(800)
      
      const maxId = get().parameters.reduce((max, p) => Math.max(max, p.id), 0)
      const newParameter = { ...parameter, id: maxId + 1 }
      
      set(state => ({ 
        parameters: [...state.parameters, newParameter],
        loading: false 
      }))
    } catch (err) {
      if (err instanceof Error) {
        set({ error: err.message, loading: false })
      } else {
        set({ error: 'Lỗi khi thêm tham số', loading: false })
      }
    }
  },

  updateParameter: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await mockDelay(800)
      
      set(state => ({
        parameters: state.parameters.map(p => p.id === id ? { ...p, ...data } : p),
        loading: false
      }))
    } catch (err) {
      if (err instanceof Error) {
        set({ error: err.message, loading: false })
      } else {
        set({ error: 'Lỗi khi thêm tham số', loading: false })
      }
    }
  },

  deleteParameter: async (id) => {
    set({ loading: true, error: null })
    try {
      await mockDelay(800)
      
      set(state => ({
        parameters: state.parameters.filter(p => p.id !== id),
        loading: false
      }))
    } catch (err) {
      if (err instanceof Error) {
        set({ error: err.message, loading: false })
      } else {
        set({ error: 'Lỗi khi thêm tham số', loading: false })
      }
    }
  },

  getParameterById: (id) => {
    return get().parameters.find(p => p.id === id)
  },
  
  getParametersByCategory: (category) => {
    return get().parameters.filter(p => p.category === category)
  }
}))

export default useParameterStore