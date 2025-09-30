import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '../../types/Project';
import api from '../../services/api';
import Loading from '../../components/ui/loading';

const ViewProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        if (response.data.success) {
          setProject(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao buscar projeto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  if (loading) return <Loading />;
  if (!project) return <div>Projeto não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Voltar
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Resumo</h3>
              <p>{project.summary}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Objetivos</h3>
              <p>{project.objective}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Metodologia</h3>
              <p>{project.methodology}</p>
            </div>
            
            {project.results && (
              <div>
                <h3 className="font-semibold">Resultados</h3>
                <p>{project.results}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold">Status</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProject;