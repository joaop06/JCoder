import React, { createContext, useContext, useReducer } from 'react';
import { applicationService } from '../services/applicationService';

// Estado inicial
const initialState = {
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,
};

// Actions
const APPLICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_APPLICATIONS: 'SET_APPLICATIONS',
  SET_SELECTED_APPLICATION: 'SET_SELECTED_APPLICATION',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_APPLICATION: 'UPDATE_APPLICATION',
  REMOVE_APPLICATION: 'REMOVE_APPLICATION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function applicationReducer(state, action) {
  switch (action.type) {
    case APPLICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case APPLICATION_ACTIONS.SET_APPLICATIONS:
      return {
        ...state,
        applications: action.payload,
        isLoading: false,
        error: null,
      };
    case APPLICATION_ACTIONS.SET_SELECTED_APPLICATION:
      return {
        ...state,
        selectedApplication: action.payload,
        isLoading: false,
        error: null,
      };
    case APPLICATION_ACTIONS.ADD_APPLICATION:
      return {
        ...state,
        applications: [...state.applications, action.payload],
        isLoading: false,
        error: null,
      };
    case APPLICATION_ACTIONS.UPDATE_APPLICATION:
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? action.payload : app
        ),
        selectedApplication: state.selectedApplication?.id === action.payload.id 
          ? action.payload 
          : state.selectedApplication,
        isLoading: false,
        error: null,
      };
    case APPLICATION_ACTIONS.REMOVE_APPLICATION:
      return {
        ...state,
        applications: state.applications.filter(app => app.id !== action.payload),
        selectedApplication: state.selectedApplication?.id === action.payload 
          ? null 
          : state.selectedApplication,
        isLoading: false,
        error: null,
      };
    case APPLICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case APPLICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
const ApplicationContext = createContext();

// Provider
export function ApplicationProvider({ children }) {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  // Buscar todas as aplicações
  const fetchApplications = async () => {
    try {
      dispatch({ type: APPLICATION_ACTIONS.SET_LOADING, payload: true });
      const applications = await applicationService.getAll();
      dispatch({ type: APPLICATION_ACTIONS.SET_APPLICATIONS, payload: applications });
    } catch (error) {
      dispatch({ 
        type: APPLICATION_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Erro ao buscar aplicações' 
      });
    }
  };

  // Buscar uma aplicação por ID
  const fetchApplicationById = async (id) => {
    try {
      dispatch({ type: APPLICATION_ACTIONS.SET_LOADING, payload: true });
      const application = await applicationService.getById(id);
      dispatch({ type: APPLICATION_ACTIONS.SET_SELECTED_APPLICATION, payload: application });
      return application;
    } catch (error) {
      dispatch({ 
        type: APPLICATION_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Erro ao buscar aplicação' 
      });
      return null;
    }
  };

  // Criar uma nova aplicação
  const createApplication = async (applicationData) => {
    try {
      dispatch({ type: APPLICATION_ACTIONS.SET_LOADING, payload: true });
      const newApplication = await applicationService.create(applicationData);
      dispatch({ type: APPLICATION_ACTIONS.ADD_APPLICATION, payload: newApplication });
      return { success: true, application: newApplication };
    } catch (error) {
      dispatch({ 
        type: APPLICATION_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Erro ao criar aplicação' 
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar aplicação' 
      };
    }
  };

  // Atualizar uma aplicação
  const updateApplication = async (id, applicationData) => {
    try {
      dispatch({ type: APPLICATION_ACTIONS.SET_LOADING, payload: true });
      const updatedApplication = await applicationService.update(id, applicationData);
      dispatch({ type: APPLICATION_ACTIONS.UPDATE_APPLICATION, payload: updatedApplication });
      return { success: true, application: updatedApplication };
    } catch (error) {
      dispatch({ 
        type: APPLICATION_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Erro ao atualizar aplicação' 
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao atualizar aplicação' 
      };
    }
  };

  // Deletar uma aplicação
  const deleteApplication = async (id) => {
    try {
      dispatch({ type: APPLICATION_ACTIONS.SET_LOADING, payload: true });
      await applicationService.delete(id);
      dispatch({ type: APPLICATION_ACTIONS.REMOVE_APPLICATION, payload: id });
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: APPLICATION_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Erro ao deletar aplicação' 
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao deletar aplicação' 
      };
    }
  };

  // Limpar erro
  const clearError = () => {
    dispatch({ type: APPLICATION_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchApplications,
    fetchApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    clearError,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

// Hook para usar o contexto
export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications deve ser usado dentro de um ApplicationProvider');
  }
  return context;
}
