import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Image as ImageIcon, 
  Upload,
  LayoutGrid,
  Settings,
  ArrowRight,
  ExternalLink,
  Github,
  Twitter,
  Instagram
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { Project, NewProject } from './types';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: file.name.split('.')[0],
              description: 'A new creative piece.',
              imageUrl: base64,
              category: 'General'
            })
          });
          const newProj = await res.json();
          setProjects(prev => [newProj, ...prev]);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      };
      reader.readAsDataURL(file);
    }
    setShowUploadModal(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] }
  } as any);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject)
      });
      setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
      setEditingProject(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="min-h-screen selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference text-white">
        <div className="text-xl font-bold tracking-tighter">VISIONARY.</div>
        <div className="flex gap-8 items-center">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs uppercase tracking-widest font-semibold hover:opacity-50 transition-opacity flex items-center gap-2"
          >
            {isEditing ? <Check size={14} /> : <Settings size={14} />}
            {isEditing ? 'Done' : 'Manage'}
          </button>
          {isEditing && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Add Project
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-40 mb-4 block">Graphic Designer & Visual Artist</span>
          <h1 className="editorial-title mb-8">
            Crafting <br />
            <span className="ml-20">Digital</span> <br />
            Experiences.
          </h1>
          <p className="max-w-md text-lg opacity-60 leading-relaxed font-light">
            A curated collection of visual identities, digital products, and artistic explorations. 
            Focused on the intersection of minimalism and high-impact design.
          </p>
        </motion.div>
      </header>

      {/* Portfolio Grid */}
      <main className="px-6 max-w-7xl mx-auto pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-200 relative">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay for Editing */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingProject(project)}
                        className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
                      >
                        <Edit2 size={20} className="text-black" />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-3 bg-red-500 rounded-full hover:scale-110 transition-transform"
                      >
                        <Trash2 size={20} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1 block">
                        {project.category}
                      </span>
                      <h3 className="text-xl font-medium tracking-tight">{project.title}</h3>
                    </div>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </div>
                  <p className="mt-2 text-sm opacity-50 line-clamp-2 font-light leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State / Add Placeholder */}
          {projects.length === 0 && !loading && (
            <div className="col-span-full py-40 text-center">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-xl opacity-30 font-serif italic">Your portfolio is a blank canvas.</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="mt-6 text-xs uppercase tracking-widest font-bold border-b border-black/20 pb-1 hover:border-black transition-colors"
              >
                Upload your first project
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-20 border-t border-black/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-sm opacity-40">© 2024 Visionary Studio. All rights reserved.</div>
        <div className="flex gap-8">
          <Instagram size={20} className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
          <Twitter size={20} className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
          <Github size={20} className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>
      </footer>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl p-12 relative"
            >
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-serif italic mb-2">Add to Portfolio</h2>
              <p className="text-sm opacity-50 mb-8">Drag and drop your high-resolution images below.</p>

              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
                  isDragActive ? "border-black bg-black/5 scale-[0.98]" : "border-black/10 hover:border-black/30"
                )}
              >
                <input {...getInputProps()} />
                <Upload size={32} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop them here" : "Click or drag images to upload"}
                </p>
                <p className="text-xs opacity-40 mt-2">Supports JPG, PNG, WEBP</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl p-12 relative"
            >
              <button 
                onClick={() => setEditingProject(null)}
                className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-serif italic mb-8">Edit Project</h2>
              
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Project Title</label>
                  <input 
                    type="text"
                    value={editingProject.title}
                    onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full bg-black/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-black/10 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Category</label>
                  <input 
                    type="text"
                    value={editingProject.category}
                    onChange={e => setEditingProject({...editingProject, category: e.target.value})}
                    className="w-full bg-black/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-black/10 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Description</label>
                  <textarea 
                    rows={4}
                    value={editingProject.description}
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                    className="w-full bg-black/5 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-black/10 transition-all font-medium resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform active:scale-95"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
