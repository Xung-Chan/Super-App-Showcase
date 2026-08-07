import React from 'react';

type Props = {
    children: React.ReactNode;
    FallbackComponent?: React.ComponentType<any>;
    onError?: (error: Error, info: React.ErrorInfo) => void;
};

type State = {
    error: Error | null;
};

class ErrorBoundary extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        const { error } = this.state;
        const { FallbackComponent, children } = this.props;

        // Nếu có lỗi, render giao diện báo lỗi (Fallback UI) và truyền hàm reset xuống
        if (error !== null) {
            if (FallbackComponent) {
                return <FallbackComponent error={error} />;
            }
            return null;
        }

        // Nếu không có lỗi, render UI bình thường (children)
        return children;
    }
}

export default ErrorBoundary;
