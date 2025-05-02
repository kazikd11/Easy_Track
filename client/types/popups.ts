export type MessageType = "error" | "info";

export type MessageProps = {
    text: string
    type?: MessageType
};

export type ChoiceProps = {
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}