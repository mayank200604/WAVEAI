import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode, Calendar, Download, Trash2, ExternalLink, Folder, Search, Filter, Menu, Home, User } from 'lucide-react';

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
  metadata: {
    idea: string;
    resurrection: string;
    mutation: string;
    techStack: string;
    pages: string[];
    settings: any;
    createdAt: string;
  };
  preview: string;
}

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    try {
      const stored = localStorage.getItem('wave_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProjects(parsed);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter(p => p.id !== projectId);
      setProjects(updated);
      localStorage.setItem('wave_projects', JSON.stringify(updated));
    }
  };

  const downloadProject = (project: Project) => {
    // Create a ZIP-like structure (simplified - just download main file)
    const mainFile = project.files[0];
    if (mainFile) {
      const blob = new Blob([mainFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_${mainFile.path}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const openInCodeGen = (project: Project) => {
    // Store project data for WaveCodeGen to load
    localStorage.setItem('wave_codegen_project', JSON.stringify(project));
    window.open('http://localhost:5178', '_blank');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.metadata.idea.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className="fixed top-4 left-4 z-[9999] p-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm"
        title="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-[1000] flex flex-col justify-between py-5 border-r border-gray-800 ${
          sidebarExpanded
            ? 'w-64 bg-gray-900/95 backdrop-blur-xl'
            : 'w-16 bg-gray-900/80 backdrop-blur-md'
        }`}
      >
        <div className="flex flex-col space-y-2 px-3">
          <button
            onClick={() => navigate('/main')}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 group ${
              sidebarExpanded ? 'justify-start' : 'justify-center'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            {sidebarExpanded && <span className="text-gray-300 group-hover:text-cyan-400">Home</span>}
          </button>

          <button
            onClick={() => navigate('/chat')}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 group ${
              sidebarExpanded ? 'justify-start' : 'justify-center'
            }`}
            title="Chat"
          >
            <div className="w-5 h-5 bg-gray-400 group-hover:bg-cyan-400 rounded-sm transition-colors"></div>
            {sidebarExpanded && <span className="text-gray-300 group-hover:text-cyan-400">Chat</span>}
          </button>

          <button
            onClick={() => navigate('/projects')}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 bg-cyan-500/20 shadow-lg shadow-cyan-500/20 group ${
              sidebarExpanded ? 'justify-start' : 'justify-center'
            }`}
            title="Projects"
          >
            <Folder className="w-5 h-5 text-cyan-400 transition-colors" />
            {sidebarExpanded && <span className="text-cyan-400 font-medium">Projects</span>}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 group ${
              sidebarExpanded ? 'justify-start' : 'justify-center'
            }`}
            title="Profile"
          >
            <User className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            {sidebarExpanded && <span className="text-gray-300 group-hover:text-cyan-400">Profile</span>}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/main')}
              className="text-[#009DFF] font-medium text-lg hover:opacity-70 transition-opacity"
            >
              ← Back to Wave AI
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#009DFF] to-[#0891b2] bg-clip-text text-transparent">
              My Projects
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009DFF] text-white"
            />
          </div>
          <button className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <Folder size={64} className="mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6">Generate your first project in WaveCodeGen!</p>
            <button
              onClick={() => navigate('/sitebuild')}
              className="px-6 py-3 bg-gradient-to-r from-[#009DFF] to-[#0891b2] rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-[#009DFF] transition-all group"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009DFF] to-[#0891b2] flex items-center justify-center">
                      <FileCode size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white group-hover:text-[#009DFF] transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} />
                        {formatDate(project.metadata.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {project.metadata.idea}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.metadata.techStack.split(',').slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-700 rounded-lg text-gray-300"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* File Count */}
                <div className="mb-4 text-sm text-gray-400">
                  {project.files.length} file{project.files.length !== 1 ? 's' : ''}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openInCodeGen(project)}
                    className="flex-1 px-4 py-2 bg-[#009DFF] hover:bg-[#0088dd] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Open
                  </button>
                  <button
                    onClick={() => downloadProject(project)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
