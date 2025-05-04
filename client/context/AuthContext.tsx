import React, {createContext, useContext, useEffect, useState} from "react";
import {usePopup} from "@/context/PopupContext";
import {deleteJwt, deleteRefreshToken, getJwt, saveJwt, saveRefreshToken} from "@/utils/jwt";

interface AuthContextType {
    user: string | null;
    login: (jwt: string, refresh: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: (jwt: string) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthContextType["user"]>(null);
    const {showMessage} = usePopup();

    //load user on start
    useEffect(() => {
        (async () => {
            const token = await getJwt()
            if (token) setUser(token);
        })();
    }, []);


    const login = async (jwt: string, refresh: string) => {
        await Promise.all([
            saveJwt(jwt),
            saveRefreshToken(refresh)
        ])
        setUser(jwt);
        showMessage({text: "Logged in successfully", type: "info"});
    };

    const logout = async () => {
        await Promise.all([
            deleteJwt(),
            deleteRefreshToken()
        ])
        setUser(null);
        showMessage({text: "Logged out successfully", type: "info"});
    };

    const refresh = async (jwt: string) => {
        await saveJwt(jwt);
        setUser(jwt);
        console.log("jwt refreshed");
    }

    return (
        <AuthContext.Provider value={{user, login, logout, refresh}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("Invalid context");
    }
    return context;
}
