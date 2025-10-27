    import React, { useState } from 'react';

    const CopyLinkButton = ({ issueId }) => {
        const [copySuccess, setCopySuccess] = useState('');

        const copyToClipboard = (e) => {
            e.stopPropagation(); // Prevents card click when copying from card view
            const url = `${window.location.origin}${window.location.pathname}#issue/${issueId}`;
            const textField = document.createElement('textarea');
            textField.innerText = url;
            document.body.appendChild(textField);
            textField.select();
            
            try {
                // Use execCommand as a fallback
                document.execCommand('copy');
                setCopySuccess(url);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                setCopySuccess('Failed to copy');
            }
            
            textField.remove();
            setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
        };

        return (
            <div className="relative">
                <button 
                    onClick={copyToClipboard} 
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                    aria-label="Copy issue link"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                {copySuccess && (
                    <div className="absolute top-full right-0 mt-2 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg z-50 w-max max-w-xs break-words">
                        <p className="font-bold">{copySuccess.startsWith('Failed') ? 'Error' : 'Copied!'}</p>
                        {!copySuccess.startsWith('Failed') && <p className="font-mono break-all">{copySuccess}</p>}
                    </div>
                )}
            </div>
        );
    };

    export default CopyLinkButton;
    
