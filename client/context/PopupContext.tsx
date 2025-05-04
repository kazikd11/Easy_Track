import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import MessagePopup from "@/components/MessagePopup";
import {MessageProps, ChoiceProps} from "@/types/popups";
import ChoicePopup from "@/components/ChoicePopup";


interface PopupContextType{
    showMessage: (props: MessageProps) => void;
    showChoice: (props: ChoiceProps) => void;
}

const PopupContext = createContext<PopupContextType|undefined>(undefined)

export const PopupProvider = ({children}: { children: React.ReactNode }) => {
    const [message, setMessage] = useState<MessageProps|null>(null)
    const [choice, setChoice] = useState<ChoiceProps|null>(null)

    const showMessage = useCallback((props: MessageProps) => {
        setMessage(props);
    }, []);

    const showChoice = useCallback((props: ChoiceProps) => {
        setChoice(props)
    }, [])

    return (
        <PopupContext.Provider value={{ showMessage, showChoice }}>
            {children}
            {message && (<MessagePopup onHide={() => setMessage(null)} {...message} />)}
            {choice && (<ChoicePopup onHide={()=>setChoice(null)} {...choice}/>)}
        </PopupContext.Provider>
    )
}

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("Invalid context");
    }
    return context;
}