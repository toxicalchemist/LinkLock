import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '../components/Snackbar';

const SnackbarContext = createContext(null);

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [currentToast, setCurrentToast] = useState(null);
    const [timerId, setTimerId] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setCurrentToast({ message, type, id: Date.now() });
        if (timerId) clearTimeout(timerId);
        const newTimer = setTimeout(() => {
            setCurrentToast(null);
        }, 3000);
        setTimerId(newTimer);
    }, [timerId]);

    return (
        <SnackbarContext.Provider value={{ showToast }}>
            {children}
            <Snackbar toast={currentToast} />
        </SnackbarContext.Provider>
    );
};
