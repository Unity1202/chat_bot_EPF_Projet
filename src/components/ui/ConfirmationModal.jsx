import React from 'react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      ></div>
      
      {/* Contenu du modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-opacity-75"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring focus-visible:ring-red-500 focus-visible:ring-opacity-75"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;