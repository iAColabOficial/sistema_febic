import React from 'react';
import { X } from 'lucide-react';

const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{project.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <p><strong>Título:</strong> {project.title}</p>
          <p><strong>Status:</strong> {project.status}</p>
          <p><strong>Resumo:</strong> {project.summary}</p>
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
