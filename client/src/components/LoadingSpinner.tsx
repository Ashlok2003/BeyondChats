import React from 'react';


const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-white/30 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            </div>
            <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
