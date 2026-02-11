import { createContext, useReducer, useCallback } from 'react';
import { transactionAPI, categoryAPI, budgetAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  transactions: [],
  categories: [],
  budgets: [],
  summary: {
    income: 0,
    expense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0
  },
  loading: false,
  error: null,
  filters: {
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    currency: 'LAK'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_TRANSACTIONS':
      return { 
        ...state, 
        transactions: action.payload.data || [],
        pagination: {
          ...state.pagination,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
          page: action.payload.currentPage || 1
        },
        loading: false 
      };
    
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions]
      };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t._id === action.payload._id ? action.payload : t
        )
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t._id !== action.payload)
      };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload || [], loading: false };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload || [], loading: false };
    
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload || initialState.summary };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    
    default:
      return state;
  }
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTransactions = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await transactionAPI.getAll({
        ...state.filters,
        ...params
      });
      dispatch({ type: 'SET_TRANSACTIONS', payload: response });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  }, [state.filters]);

  const createTransaction = useCallback(async (data) => {
    try {
      const response = await transactionAPI.create(data);  // ✅ ໃຊ້ transactionAPI
      dispatch({ type: 'ADD_TRANSACTION', payload: response.data });
      toast.success('ບັນທຶກທຸລະກຳສຳເລັດ');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດ');
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id, data) => {
    try {
      const response = await transactionAPI.update(id, data);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: response.data });
      toast.success('ອັບເດດທຸລະກຳສຳເລັດ');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດ');
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await transactionAPI.delete(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      toast.success('ລຶບທຸລະກຳສຳເລັດ');
    } catch (error) {
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດ');
      throw error;
    }
  }, []);

  const fetchSummary = useCallback(async (params = {}) => {
    try {
      const response = await transactionAPI.getSummary({
        ...state.filters,
        ...params
      });
      dispatch({ type: 'SET_SUMMARY', payload: response.data });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [state.filters]);

  const fetchCategories = useCallback(async (type) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await categoryAPI.getAll(type);
      dispatch({ type: 'SET_CATEGORIES', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const createCategory = useCallback(async (data) => {
    try {
      const response = await categoryAPI.create(data);
      dispatch({ type: 'ADD_CATEGORY', payload: response.data });
      toast.success('ສ້າງໝວດໝູ່ສຳເລັດ');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດ');
      throw error;
    }
  }, []);

  const seedCategories = useCallback(async () => {
    try {
      await categoryAPI.seed();
      await fetchCategories();
      toast.success('ສ້າງໝວດໝູ່ເລີ່ມຕົ້ນສຳເລັດ');
    } catch (error) {
      toast.error(error.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  }, [fetchCategories]);

  const fetchBudgets = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await budgetAPI.getAll(params);
      dispatch({ type: 'SET_BUDGETS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const value = {
    ...state,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchSummary,
    fetchCategories,
    createCategory,
    seedCategories,
    fetchBudgets,
    setFilters,
    dispatch
  };

  

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;