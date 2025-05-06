import React, { createContext, useContext, useRef, useEffect } from "react";
import MessagePopup from "@/components/MessagePopup";
import ChoicePopup from "@/components/ChoicePopup";
import { MessageProps, ChoiceProps } from "@/types/popups";

interface PopupContextType {
    showMessage: (props: MessageProps) => void;
    showChoice: (props: ChoiceProps) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

let externalSetMessage: ((props: MessageProps | null) => void) | null = null;
let externalSetChoice: ((props: ChoiceProps | null) => void) | null = null;

function MessageManager() {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const messageRef = useRef<MessageProps | null>(null);

    useEffect(() => {
        externalSetMessage = (msg) => {
            messageRef.current = msg;
            forceUpdate();
        };
    }, []);

    return messageRef.current ? (
        <MessagePopup {...messageRef.current} onHide={() => externalSetMessage?.(null)} />
    ) : null;
}

function ChoiceManager() {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const choiceRef = useRef<ChoiceProps | null>(null);

    useEffect(() => {
        externalSetChoice = (msg) => {
            choiceRef.current = msg;
            forceUpdate();
        };
    }, []);

    return choiceRef.current ? (
        <ChoicePopup {...choiceRef.current} onHide={() => externalSetChoice?.(null)} />
    ) : null;
}

export const PopupProvider = ({ children }: { children: React.ReactNode }) => {
    const showMessage = (props: MessageProps) => {
        externalSetMessage?.(props);
    };

    const showChoice = (props: ChoiceProps) => {
        externalSetChoice?.(props);
    };

    return (
        <PopupContext.Provider value={{ showMessage, showChoice }}>
            {children}
            <MessageManager />
            <ChoiceManager />
        </PopupContext.Provider>
    );
};

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("PopupContext must be used within a PopupProvider");
    }
    return context;
};
