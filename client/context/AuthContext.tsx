import React, {createContext, useContext, useEffect, useState} from "react";
import {usePopup} from "@/context/PopupContext";
import {getJwt, getRefreshToken} from "@/utils/jwt";

interface AuthContextType {
    user: string | null;
    login: (jwt: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    refresh: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthContextType["user"]>(null);
    const [refresh, setRefresh] = useState<string | null>(null);
    const {showMessage} = usePopup();

    //load user on start
    useEffect(() => {
        (async () => {
            const [token, refreshToken] = await Promise.all([
                getJwt(),
                getRefreshToken()
            ]);
            if (token) setUser(token);
            if (refreshToken) setRefresh(refreshToken);
        })();
    }, []);


    const login = async (jwt: string) => {
        await saveJwt(jwt).catch((e) => {
            console.error(e)
        })
        setUser(jwt);
    };

    const logout = async () => {
        await deleteJwt().catch((e) => {
            console.error(e)
        })
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, login, logout}}>
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
