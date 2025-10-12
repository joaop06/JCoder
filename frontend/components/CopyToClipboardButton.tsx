import React from 'react';

interface CopyToClipboardButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  textToCopy,
  label = 'Copiar',
  className = '',
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('Copiado para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      alert('Falha ao copiar o texto.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1.5M9 3h6l-2 2H9V3zM15 7h3a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h3"></path></svg>
      {label}
    </button>
  );
};

export default CopyToClipboardButton;
