import React, {createContext, useContext, useEffect, useState} from "react";
import * as SecureStore from "expo-secure-store";

interface AuthContextType{
    user: string | null;
    login: (jwt: string) => void;
    logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : {children: React.ReactNode}) => {
    const [user, setUser] = useState<AuthContextType["user"]>(null);

    //load user on start
    useEffect(() => {
        const loadUser = async () => {
            const token = await getJwt();
            if (token) setUser(token)
        };
        loadUser().catch((e) => console.log(e));
        // setUser("test");
    }, []);

    //jwt access functions
    const saveJwt = async (jwt: string) => {
        try {
            await SecureStore.setItemAsync('jwt', jwt);
        } catch (error) {
            console.error('Error saving JWT', error);
        }
    };

    const getJwt = async () => {
        try {
            return await SecureStore.getItemAsync('jwt');
        } catch (error) {
            console.error('Error reading JWT', error);
            return null;
        }
    };

    const deleteJwt = async () => {
        try {
            await SecureStore.deleteItemAsync('jwt');
        } catch (error) {
            console.error('Error deleting JWT', error);
        }
    };

    const login = async (jwt: string) => {
        await saveJwt(jwt).catch((e) => {console.error(e)})
        setUser(jwt);
    };

    const logout = async () => {
        await deleteJwt().catch((e) => {console.error(e)})
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
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
