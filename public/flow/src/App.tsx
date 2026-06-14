/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Folder, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Trash2, 
  Clock, 
  BookOpen, 
  LayoutDashboard,
  Settings,
  MoreVertical,
  Edit3,
  CheckCircle2,
  Circle,
  Pencil,
  X,
  Network,
  HelpCircle
} from 'lucide-react';
import * as d3 from 'd3';
import { Container, Category, Project, Note, TimebendingData, FlowItem } from './types';

const STORAGE_KEY = 'timebending_data';

const INITIAL_DATA: TimebendingData = {
  containers: [
    { id: '1', name: 'Meavia', color: '#d8b4fe', description: 'Branding, Prijsstelling, Affiliate' },
    { id: '2', name: 'Producten', color: '#fbbf24', description: 'Weggever, Instap, Cursus, Traject' },
    { id: '3', name: 'Tool', color: '#67e8f9', description: 'Groeiladder, 6 sleutels, Kompas' },
    { id: '4', name: 'Investeren', color: '#86efac', description: 'Bitvavo, Banken' },
    { id: '5', name: 'Sales', color: '#c084fc', description: 'Webinar, Emaillijst' },
    { id: '6', name: 'Administratie', color: '#22d3ee', description: 'Kilometers' },
    { id: '7', name: 'Zichtbaarheid', color: '#fb923c', description: 'Social media, Mailing, Funnel' },
    { id: '8', name: 'Ontwikkeling', color: '#38bdf8', description: 'AI, Mpop' },
  ],
  categories: [
    { id: 'c1', containerId: '2', name: 'Weggever' },
    { id: 'c2', containerId: '2', name: 'Instap' },
  ],
  projects: [
    {
      id: 'p1',
      containerId: '2', // Producten
      categoryId: 'c1', // Weggever
      name: 'Zacht begin',
      description: 'Implementatie van de nieuwe welkomstflow voor klanten.',
      lastUpdated: new Date().toISOString(),
      flowItems: [
        {
          id: 'fi1',
          item: 'Welkomstmail',
          prio: 'Hoog',
          stoppedAt: 'Design fase',
          nextStep: 'Copywriting afronden',
          status: 'Bezig',
          note: 'Wachten op feedback van marketing.'
        }
      ],
      notes: 'Belangrijk: focus op de tone-of-voice.'
    },
    {
      id: 'p2',
      containerId: '2', // Producten
      categoryId: 'c2', // Instap
      name: 'Energieknop',
      description: 'Het instapproduct voor nieuwe klanten.',
      lastUpdated: new Date().toISOString(),
      flowItems: [],
      notes: ''
    }
  ],
  notes: [],
};

export default function App() {
  const [data, setData] = useState<TimebendingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_DATA,
            ...parsed,
            containers: Array.isArray(parsed.containers) ? parsed.containers : INITIAL_DATA.containers,
            categories: Array.isArray(parsed.categories) ? parsed.categories : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects.map(p => ({ ...p, flowItems: p.flowItems || [] })) : [],
            notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          };
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
    return INITIAL_DATA;
  });

  const [view, setView] = useState<'dashboard' | 'container' | 'project' | 'settings' | 'mindmap'>('dashboard');
  const [lastMainView, setLastMainView] = useState<'dashboard' | 'mindmap'>('dashboard');
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [navHistory, setNavHistory] = useState<{view: string, containerId: string | null, projectId: string | null}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigateTo = (newView: typeof view, containerId?: string | null, projectId?: string | null) => {
    // Push current state to history
    setNavHistory(prev => [...prev, { view, containerId: selectedContainerId, projectId: selectedProjectId }]);
    
    // Update current state
    if (containerId !== undefined) setSelectedContainerId(containerId);
    if (projectId !== undefined) setSelectedProjectId(projectId);
    setView(newView);
  };

  const goBack = () => {
    if (navHistory.length > 0) {
      const lastState = navHistory[navHistory.length - 1];
      setNavHistory(prev => prev.slice(0, -1));
      
      setView(lastState.view as any);
      setSelectedContainerId(lastState.containerId);
      setSelectedProjectId(lastState.projectId);
    } else {
      // Fallback to dashboard if no history
      setView('dashboard');
      setSelectedContainerId(null);
      setSelectedProjectId(null);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (view === 'dashboard' || view === 'mindmap') {
      setLastMainView(view);
    }
  }, [view]);

  const resetToDefaults = () => {
    setData(INITIAL_DATA);
    setView('dashboard');
    setNavHistory([]);
    setError(null);
  };

  const addContainer = (name: string, color: string) => {
    const newContainer: Container = {
      id: crypto.randomUUID(),
      name,
      color,
      description: ''
    };
    setData(prev => ({ ...prev, containers: [...prev.containers, newContainer] }));
    setError(null);
  };

  const updateContainer = (id: string, name: string, color: string) => {
    setData(prev => ({
      ...prev,
      containers: prev.containers.map(c => c.id === id ? { ...c, name, color } : c)
    }));
  };

  const deleteContainer = (id: string) => {
    const hasProjects = (data?.projects || []).some(p => p.containerId === id);
    if (hasProjects) {
      setError('Deze container bevat nog projecten. Verwijder eerst de projecten.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setData(prev => ({
      ...prev,
      containers: (prev.containers || []).filter(c => c.id !== id),
      categories: (prev.categories || []).filter(c => c.containerId !== id)
    }));
    setError(null);
  };

  const addCategory = (containerId: string, name: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      containerId,
      name
    };
    setData(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
  };

  const updateCategory = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, name } : c)
    }));
  };

  const deleteCategory = (id: string) => {
    const hasProjects = (data?.projects || []).some(p => p.categoryId === id);
    if (hasProjects) {
      setError('Deze categorie bevat nog projecten. Verplaats of verwijder deze eerst.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setData(prev => ({
      ...prev,
      categories: (prev.categories || []).filter(c => c.id !== id)
    }));
  };

  const selectedContainer = useMemo(() => 
    (data?.containers || []).find(c => c.id === selectedContainerId), 
    [data.containers, selectedContainerId]
  );

  const selectedProject = useMemo(() => 
    (data?.projects || []).find(p => p.id === selectedProjectId), 
    [data.projects, selectedProjectId]
  );

  const containerProjects = useMemo(() => 
    (data?.projects || []).filter(p => p.containerId === selectedContainerId),
    [data.projects, selectedContainerId]
  );

  const containerCategories = useMemo(() => 
    (data?.categories || []).filter(c => c.containerId === selectedContainerId),
    [data.categories, selectedContainerId]
  );

  const activeFlowItems = useMemo(() => 
    (data?.projects || []).flatMap(project => 
      (project.flowItems || []).map(item => ({ ...item, projectName: project.name, projectId: project.id }))
    ).filter(item => item.item || item.nextStep),
    [data.projects]
  );

  const projectNotes = useMemo(() => 
    (data?.notes || []).filter(n => n.projectId === selectedProjectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data.notes, selectedProjectId]
  );

  // Actions
  const addProject = (containerId: string, name: string, categoryId?: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      containerId,
      categoryId,
      name,
      description: '',
      lastUpdated: new Date().toISOString(),
      flowItems: [
        {
          id: crypto.randomUUID(),
          item: '',
          prio: '',
          stoppedAt: '',
          nextStep: '',
          status: '',
          note: ''
        }
      ],
      notes: ''
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProjectFlowItem = (projectId: string, itemId: string, updates: Partial<FlowItem>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? {
        ...p,
        lastUpdated: new Date().toISOString(),
        flowItems: (p.flowItems || []).map(item => item.id === itemId ? { ...item, ...updates } : item)
      } : p)
    }));
  };

  const addFlowItem = (projectId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? {
        ...p,
        flowItems: [...(p.flowItems || []), {
          id: crypto.randomUUID(),
          item: '',
          prio: '',
          stoppedAt: '',
          nextStep: '',
          status: '',
          note: ''
        }]
      } : p)
    }));
  };

  const deleteFlowItem = (projectId: string, itemId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? {
        ...p,
        flowItems: (p.flowItems || []).filter(item => item.id !== itemId)
      } : p)
    }));
  };

  const updateProjectName = (projectId: string, name: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, name, lastUpdated: new Date().toISOString() } : p
      )
    }));
  };

  const updateProjectDescription = (projectId: string, description: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, description, lastUpdated: new Date().toISOString() } : p
      )
    }));
  };

  const updateProjectNotes = (projectId: string, notes: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, notes, lastUpdated: new Date().toISOString() } : p
      )
    }));
  };

  const updateProjectCategory = (projectId: string, categoryId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, categoryId, lastUpdated: new Date().toISOString() } : p
      )
    }));
  };

  const updateProjectContainer = (projectId: string, containerId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, containerId, categoryId: undefined, lastUpdated: new Date().toISOString() } : p
      )
    }));
  };

  const updateCategoryContainer = (categoryId: string, containerId: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === categoryId ? { ...c, containerId } : c
      ),
      // Also update projects in this category to the new container
      projects: prev.projects.map(p => 
        p.categoryId === categoryId ? { ...p, containerId } : p
      )
    }));
  };

  const addNote = (projectId: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      projectId,
      content,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({ ...prev, notes: [...prev.notes, newNote] }));
  };

  const deleteProject = (projectId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      notes: prev.notes.filter(n => n.projectId !== projectId)
    }));
    setView('dashboard');
  };

  // Rendering
  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 flex justify-between items-end">
        <div onClick={() => navigateTo('dashboard')} className="cursor-pointer">
          <h1 className="text-5xl font-light tracking-tight text-olive-900 mb-2">Timebending®</h1>
          <p className="text-lg text-stone-500 italic serif">Vind je flow, buig de tijd.</p>
        </div>
        <div className="flex gap-4">
          {view === 'dashboard' && (
            <>
              <button 
                onClick={() => navigateTo('mindmap')}
                className="p-2 text-stone-400 hover:text-olive-600 transition-colors"
                title="Mindmap Weergave"
              >
                <Network size={24} />
              </button>
              <button 
                onClick={() => navigateTo('settings')}
                className="p-2 text-stone-400 hover:text-olive-600 transition-colors"
                title="Beheer Containers"
              >
                <Settings size={24} />
              </button>
            </>
          )}
          {view !== 'dashboard' && view !== 'mindmap' && (
            <button 
              onClick={goBack}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Terug</span>
            </button>
          )}
          {view === 'mindmap' && (
            <button 
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Terug</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 space-y-16">
        <AnimatePresence mode="wait">
          {view === 'mindmap' && (
            <motion.div
              key="mindmap"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Mindmap Overzicht</h2>
                <button 
                  onClick={() => { setView('dashboard'); setNavHistory([]); }}
                  className="text-sm font-bold uppercase tracking-widest text-olive-600 hover:text-olive-800"
                >
                  Terug naar Dashboard
                </button>
              </div>
              <MindmapView 
                data={data} 
                onProjectClick={(id) => {
                  navigateTo('project', undefined, id);
                }} 
                onContainerClick={(id) => {
                  navigateTo('container', id);
                }}
              />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Beheer Containers</h2>
                <div className="flex items-center gap-4">
                  {error && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-500 text-sm font-medium"
                    >
                      {error}
                    </motion.span>
                  )}
                  <button 
                    onClick={resetToDefaults}
                    className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 border border-red-100 px-4 py-2 rounded-full transition-all"
                  >
                    Reset naar Excel-standaard
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 space-y-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-stone-700 border-b border-stone-100 pb-2">Containers</h3>
                  {(data?.containers || []).map(container => (
                    <div key={container.id} className="space-y-4 p-6 bg-stone-50 rounded-3xl border border-stone-100">
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          value={container.color}
                          onChange={e => updateContainer(container.id, container.name, e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={container.name}
                          onChange={e => updateContainer(container.id, e.target.value, container.color)}
                          className="flex-1 bg-transparent border-b border-transparent focus:border-olive-200 outline-none font-bold text-xl"
                        />
                        <button 
                          onClick={() => deleteContainer(container.id)}
                          className="text-stone-300 hover:text-red-400 p-2 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Categories within this container in settings */}
                      <div className="pl-14 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Categorieën in {container.name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(data?.categories || []).filter(c => c.containerId === container.id).map(category => (
                            <div key={category.id} className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-stone-100 group">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategory(category.id, e.target.value)}
                                  className="flex-1 text-sm bg-transparent outline-none font-medium"
                                />
                                <button 
                                  onClick={() => deleteCategory(category.id)}
                                  className="text-stone-200 group-hover:text-red-300 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                                <span>Verplaats naar:</span>
                                <select 
                                  value={category.containerId}
                                  onChange={(e) => updateCategoryContainer(category.id, e.target.value)}
                                  className="bg-transparent border-none p-0 text-[10px] focus:ring-0 cursor-pointer hover:text-olive-600"
                                >
                                  {(data?.containers || []).map(cont => (
                                    <option key={cont.id} value={cont.id}>{cont.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const name = prompt('Nieuwe categorie naam:');
                              if (name) addCategory(container.id, name);
                            }}
                            className="flex items-center gap-2 p-2 text-xs text-stone-400 hover:text-olive-600 border border-dashed border-stone-200 rounded-xl transition-all"
                          >
                            <Plus size={14} />
                            <span>Categorie toevoegen</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-stone-100">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Nieuwe Container</h4>
                  <div className="flex gap-4">
                    <input 
                      id="new-container-name"
                      type="text" 
                      placeholder="Naam..."
                      className="flex-1 p-4 rounded-xl bg-stone-50 border border-transparent focus:border-olive-200 outline-none"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-container-name') as HTMLInputElement;
                        if (input.value) {
                          addContainer(input.value, '#5a5a40');
                          input.value = '';
                        }
                      }}
                      className="bg-olive-600 text-white px-6 rounded-xl hover:bg-olive-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={20} />
                      <span>Toevoegen</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Top Section: Active Flow (The Table) */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-olive-600 rounded-full"></div>
                  <h2 className="text-3xl font-semibold">Actieve Flow</h2>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-bottom border-stone-100">
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Product</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Item</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Prio</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Gestopt bij</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Verder</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Status</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400">Notitie</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-stone-400 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeFlowItems.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-12 text-center text-stone-400 italic">
                              Geen actieve flow items gevonden. Voeg een project toe om te beginnen.
                            </td>
                          </tr>
                        ) : (
                          activeFlowItems.map(flowItem => (
                            <tr 
                              key={flowItem.id} 
                              onClick={() => navigateTo('project', undefined, flowItem.projectId)}
                              className="border-b border-stone-50 hover:bg-olive-50/30 cursor-pointer transition-colors group"
                            >
                              <td className="p-4">
                                <div className="font-medium">{flowItem.projectName}</div>
                              </td>
                              <td className="p-4 text-stone-600">{flowItem.item}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${flowItem.prio === 'Hoog' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                                  {flowItem.prio || '-'}
                                </span>
                              </td>
                              <td className="p-4 text-stone-600">{flowItem.stoppedAt}</td>
                              <td className="p-4 text-olive-700 font-medium">{flowItem.nextStep}</td>
                              <td className="p-4 text-stone-500">{flowItem.status}</td>
                              <td className="p-4 text-stone-400 text-sm truncate max-w-[150px]">{flowItem.note}</td>
                              <td className="p-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Weet je zeker dat je dit flow item wilt verwijderen?')) {
                                      deleteFlowItem(flowItem.projectId, flowItem.id);
                                    }
                                  }}
                                  className="text-stone-300 hover:text-red-500 transition-colors p-2"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Bottom Section: Container Grid (The Index) */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-stone-300 rounded-full"></div>
                  <h2 className="text-3xl font-semibold">Alle Containers</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(data?.containers || []).map(container => (
                    <div 
                      key={container.id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: container.color }}
                        ></div>
                        <h3 className="font-bold text-stone-800">{container.name}</h3>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        {/* Grouped by Category */}
                        {(data?.categories || []).filter(c => c.containerId === container.id).map(category => {
                          const projectsInCategory = (data?.projects || []).filter(p => p.categoryId === category.id);
                          return (
                            <div key={category.id} className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-1">{category.name}</h4>
                              <div className="space-y-1 pl-2 border-l border-stone-100">
                                {projectsInCategory.length === 0 ? (
                                  <span className="text-[10px] text-stone-300 italic">No projects yet</span>
                                ) : (
                                  projectsInCategory.map(project => (
                                    <button
                                      key={project.id}
                                      onClick={() => navigateTo('project', undefined, project.id)}
                                      className="w-full text-left text-sm text-stone-500 hover:text-olive-700 hover:underline transition-all block truncate"
                                    >
                                      <span className="font-medium">{project.name}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Projects without category */}
                        {((data?.projects || []).filter(p => p.containerId === container.id && !p.categoryId)).length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-1">Overig</h4>
                            <div className="space-y-1 pl-2 border-l border-stone-100">
                              {(data?.projects || []).filter(p => p.containerId === container.id && !p.categoryId).map(project => (
                                <button
                                  key={project.id}
                                  onClick={() => navigateTo('project', undefined, project.id)}
                                  className="w-full text-left text-sm text-stone-500 hover:text-olive-700 hover:underline transition-all block truncate"
                                >
                                  <span className="font-medium">{project.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => navigateTo('container', container.id)}
                        className="mt-4 pt-3 border-t border-stone-50 text-xs font-bold uppercase tracking-widest text-stone-300 hover:text-stone-500 flex items-center justify-between group"
                      >
                        <span>Open Container</span>
                        <Plus size={14} className="group-hover:scale-125 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'container' && selectedContainer && (
            <motion.div 
              key="container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedContainer.color }}
                  >
                    <Folder size={24} />
                  </div>
                  <h2 className="text-4xl font-medium">{selectedContainer.name}</h2>
                </div>
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Terug naar Dashboard</span>
                </button>
              </div>

              <div className="space-y-12">
                {/* Empty state or Quick Start */}
                {containerCategories.length === 0 && (
                  <div className="bg-stone-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-stone-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-stone-300 mx-auto mb-6 shadow-sm">
                      <LayoutDashboard size={32} />
                    </div>
                    <h3 className="text-2xl font-semibold text-stone-700 mb-2">Nog geen categorieën</h3>
                    <p className="text-stone-50 mb-8 max-w-md mx-auto">
                      Organiseer je projecten door categorieën toe te voegen zoals 'Weggever', 'Instap' of 'Cursus'.
                    </p>
                    <div className="max-w-sm mx-auto">
                      <AddCategoryInput onAdd={(name) => addCategory(selectedContainer.id, name)} placeholder="Nieuwe categorie (bijv. Weggever)..." />
                    </div>
                  </div>
                )}

                {/* Categories and their projects */}
                {containerCategories.map(category => {
                  const projectsInCategory = containerProjects.filter(p => p.categoryId === category.id);
                  return (
                    <div key={category.id} className="space-y-6">
                      <div className="flex items-center justify-between group border-b border-stone-100 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-olive-200 rounded-full"></div>
                          <h3 className="text-2xl font-semibold text-stone-700">{category.name}</h3>
                          <span className="text-xs font-bold text-stone-300 bg-stone-50 px-2 py-0.5 rounded-full">
                            {projectsInCategory.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              // Find the AddProjectInput for this category and trigger it
                              // Since we don't have refs easily, we'll just rely on the user clicking the input below
                              // But we can make the input below more prominent
                            }}
                            className="text-olive-600 hover:text-olive-800 transition-all p-1"
                            title="Project toevoegen"
                          >
                            <Plus size={18} />
                          </button>
                          <button 
                            onClick={() => deleteCategory(category.id)}
                            className="text-stone-300 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                            title="Categorie verwijderen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 pl-4">
                        {projectsInCategory.map(project => (
                          <ProjectListItem 
                            key={project.id} 
                            project={project} 
                            onClick={() => navigateTo('project', undefined, project.id)}
                          />
                        ))}
                        <AddProjectInput 
                          onAdd={(name) => addProject(selectedContainer.id, name, category.id)} 
                          placeholder={`Project toevoegen aan ${category.name}...`}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Projects without category */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-stone-200 rounded-full"></div>
                      <h3 className="text-2xl font-semibold text-stone-400">Overige Projecten</h3>
                    </div>
                    <button 
                      onClick={() => {
                        const name = prompt('Nieuwe categorie naam (bijv. Weggever, Instap):');
                        if (name) addCategory(selectedContainer.id, name);
                      }}
                      className="text-xs font-bold uppercase tracking-widest text-olive-600 hover:text-olive-800 transition-colors"
                    >
                      + Categorie Toevoegen
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 pl-4">
                    {containerProjects.filter(p => !p.categoryId).map(project => (
                      <ProjectListItem 
                        key={project.id} 
                        project={project} 
                        onClick={() => navigateTo('project', undefined, project.id)}
                      />
                    ))}
                    <AddProjectInput 
                      onAdd={(name) => addProject(selectedContainer.id, name)} 
                      placeholder="Nieuw project (bijv. Zacht begin)..."
                    />
                  </div>
                </div>

                {/* Add Category / General Project */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-100">
                  <AddCategoryInput 
                    onAdd={(name) => addCategory(selectedContainer.id, name)} 
                    label="Nieuwe Categorie (bijv. Weggever, Instap)"
                  />
                  <AddProjectInput 
                    onAdd={(name) => addProject(selectedContainer.id, name)} 
                    label="Nieuw Los Project (bijv. Zacht begin)"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {view === 'project' && selectedProject && (
            <motion.div 
              key="project"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Content Section */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 flex items-center gap-2 group">
                      <input 
                        type="text"
                        value={selectedProject.name}
                        onChange={(e) => updateProjectName(selectedProject.id, e.target.value)}
                        className="text-3xl font-semibold bg-transparent border-none focus:ring-0 p-0 w-full hover:bg-stone-50 rounded px-2 -ml-2 transition-colors"
                        placeholder="Projectnaam..."
                      />
                      <Pencil size={18} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <button 
                      onClick={() => deleteProject(selectedProject.id)}
                      className="text-stone-300 hover:text-red-400 transition-colors ml-4"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mb-8">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 block">Omschrijving</label>
                    <textarea 
                      value={selectedProject.description}
                      onChange={(e) => updateProjectDescription(selectedProject.id, e.target.value)}
                      className="w-full bg-stone-50 rounded-2xl p-4 text-stone-700 border border-transparent focus:border-olive-200 outline-none resize-none h-24 transition-all"
                      placeholder="Wat is het doel van dit project?"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-stone-800">Uitvoering (Flow Items)</h3>
                      <button 
                        onClick={() => addFlowItem(selectedProject.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-xl hover:bg-olive-700 transition-colors text-sm font-medium"
                      >
                        <Plus size={16} />
                        <span>Flow Item Toevoegen</span>
                      </button>
                    </div>

                    <div className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-100">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-stone-100/50 border-b border-stone-200">
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Item</th>
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Prio</th>
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 w-32">Gestopt bij</th>
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Verder</th>
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Status</th>
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Notitie</th>
                              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedProject.flowItems || []).map((item) => (
                              <FlowItemRow 
                                key={item.id}
                                item={item}
                                onUpdate={(updates) => updateProjectFlowItem(selectedProject.id, item.id, updates)}
                                onDelete={() => deleteFlowItem(selectedProject.id, item.id)}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
                  <h3 className="text-2xl font-serif italic mb-6">Project Notities</h3>
                  <textarea 
                    value={selectedProject.notes}
                    onChange={(e) => updateProjectNotes(selectedProject.id, e.target.value)}
                    className="w-full bg-stone-50 rounded-2xl p-6 text-stone-700 border border-transparent focus:border-olive-200 outline-none resize-none h-64 transition-all leading-relaxed"
                    placeholder="Belangrijke details, links, of ideeën voor dit project..."
                  />
                </div>
              </div>

              {/* Sidebar / Context */}
              <div className="space-y-6">
                <div className="bg-stone-100 rounded-[2rem] p-6">
                  <h4 className="text-sm uppercase tracking-widest text-stone-400 font-semibold mb-4">Project Info</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-stone-600">
                      <Clock size={18} />
                      <span className="text-sm">Laatst bijgewerkt: {new Date(selectedProject.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Container Selection */}
                    <div className="flex items-start gap-3 text-stone-600">
                      <Folder size={18} className="mt-1" />
                      <div className="flex-1">
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Container</div>
                        <select 
                          value={selectedProject.containerId}
                          onChange={(e) => updateProjectContainer(selectedProject.id, e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer hover:text-olive-700 transition-colors font-medium"
                        >
                          {(data?.containers || []).map(cont => (
                            <option key={cont.id} value={cont.id}>{cont.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="flex items-start gap-3 text-stone-600">
                      <LayoutDashboard size={18} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Categorie</div>
                          <button 
                            onClick={() => {
                              const name = prompt('Nieuwe categorie naam:');
                              if (name) {
                                const newId = crypto.randomUUID();
                                const newCategory: Category = {
                                  id: newId,
                                  containerId: selectedProject.containerId,
                                  name
                                };
                                setData(prev => ({ 
                                  ...prev, 
                                  categories: [...(prev.categories || []), newCategory] 
                                }));
                                updateProjectCategory(selectedProject.id, newId);
                              }
                            }}
                            className="text-[10px] font-bold text-olive-600 hover:underline uppercase tracking-widest"
                          >
                            + Nieuw
                          </button>
                        </div>
                        <select 
                          value={selectedProject.categoryId || ''}
                          onChange={(e) => updateProjectCategory(selectedProject.id, e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer hover:text-olive-700 transition-colors font-medium"
                        >
                          <option value="">Geen categorie</option>
                          {(data?.categories || []).filter(c => c.containerId === selectedProject.containerId).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-olive-50 rounded-[2rem] p-6 border border-olive-100">
                  <h4 className="text-sm uppercase tracking-widest text-olive-700 font-semibold mb-3">Timebending Tip</h4>
                  <p className="text-sm text-olive-800 italic leading-relaxed">
                    "Flow ontstaat wanneer je stopt met vechten tegen de klok en begint te luisteren naar je creatieve energie."
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 pt-8 border-t border-stone-200 flex justify-between items-center text-stone-400 text-sm">
        <div>© {new Date().getFullYear()} Timebending® Flow Tool</div>
        <div className="flex gap-6">
          <button className="hover:text-stone-600 transition-colors">Over Timebending</button>
          <button 
            onClick={() => navigateTo('settings')}
            className="hover:text-stone-600 transition-colors"
          >
            Instellingen
          </button>
        </div>
      </footer>
    </div>
  );
}

interface ContainerCardProps {
  key?: React.Key;
  container: Container;
  projectCount: number;
  onClick: () => void;
}

function ContainerCard({ container, projectCount, onClick }: ContainerCardProps) {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-[2.5rem] p-8 text-left shadow-sm hover:shadow-md transition-all border border-stone-100 group"
    >
      <div 
        className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-white transition-transform group-hover:scale-110"
        style={{ backgroundColor: container.color }}
      >
        <Folder size={28} />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{container.name}</h3>
      <p className="text-stone-400 text-sm mb-4 line-clamp-2">{container.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-300">{projectCount} Projecten</span>
        <ChevronRight size={20} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
      </div>
    </motion.button>
  );
}

interface ProjectListItemProps {
  key?: React.Key;
  project: Project;
  onClick: () => void;
}

function ProjectListItem({ project, onClick }: ProjectListItemProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-5 flex items-center justify-between text-left border border-stone-100 hover:border-stone-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-olive-50 group-hover:text-olive-600 transition-colors">
          <BookOpen size={18} />
        </div>
        <div>
          <h4 className="font-medium text-lg">{project.name}</h4>
          <p className="text-sm text-stone-400 italic">
            {project.flowItems && project.flowItems[0]?.nextStep ? `Volgende: ${project.flowItems[0].nextStep}` : 'Geen actieve uitvoering'}
          </p>
        </div>
      </div>
      <ChevronRight size={20} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
    </button>
  );
}

function AddProjectInput({ onAdd, placeholder = "Nieuw project toevoegen...", label }: { onAdd: (name: string) => void, placeholder?: string, label?: string }) {
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <div className="space-y-4">
        {label && <h4 className="text-sm font-bold uppercase tracking-widest text-stone-300 px-5">{label}</h4>}
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 p-4 text-stone-400 hover:text-olive-600 hover:bg-olive-50 rounded-2xl transition-all italic border border-dashed border-stone-200 hover:border-olive-200 w-full"
        >
          <Plus size={18} />
          <span>{placeholder}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {label && <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 px-5">{label}</h4>}
      <div className="bg-white rounded-2xl p-3 border-2 border-olive-200 flex gap-2 shadow-md w-full">
        <input 
          autoFocus
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') setIsAdding(false);
          }}
          placeholder="Project naam..."
          className="flex-1 outline-none px-2 text-lg"
        />
        <div className="flex gap-1">
          <button 
            onClick={() => setIsAdding(false)}
            className="text-stone-400 hover:text-stone-600 p-2"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-olive-600 text-white p-2 rounded-xl hover:bg-olive-700 transition-colors"
          >
            <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryInput({ onAdd, label, placeholder = "Nieuwe categorie toevoegen..." }: { onAdd: (name: string) => void, label?: string, placeholder?: string }) {
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <div className="space-y-4">
        {label && <h4 className="text-sm font-bold uppercase tracking-widest text-stone-300 px-5">{label}</h4>}
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 p-4 text-stone-400 hover:text-olive-600 hover:bg-olive-50 rounded-2xl transition-all italic border border-dashed border-stone-200 hover:border-olive-200 w-full"
        >
          <Plus size={18} />
          <span>{placeholder}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {label && <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 px-5">{label}</h4>}
      <div className="bg-white rounded-2xl p-3 border-2 border-olive-200 flex gap-2 shadow-md w-full">
        <input 
          autoFocus
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') setIsAdding(false);
          }}
          placeholder="Categorie naam (bv. Weggever)..."
          className="flex-1 outline-none px-2 text-lg"
        />
        <div className="flex gap-1">
          <button 
            onClick={() => setIsAdding(false)}
            className="text-stone-400 hover:text-stone-600 p-2"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-olive-600 text-white p-2 rounded-xl hover:bg-olive-700 transition-colors"
          >
            <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FlowItemRow({ item, onUpdate, onDelete }: { key?: React.Key, item: FlowItem, onUpdate: (updates: Partial<FlowItem>) => void, onDelete: () => void }) {
  return (
    <tr className="border-b border-stone-100 hover:bg-white transition-colors group">
      <td className="p-2">
        <input 
          type="text"
          value={item.item}
          onChange={e => onUpdate({ item: e.target.value })}
          className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm"
          placeholder="Onderdeel..."
        />
      </td>
      <td className="p-2">
        <select 
          value={item.prio}
          onChange={e => onUpdate({ prio: e.target.value })}
          className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm cursor-pointer"
        >
          <option value="">Prio...</option>
          <option value="Hoog">Hoog</option>
          <option value="Middel">Middel</option>
          <option value="Laag">Laag</option>
        </select>
      </td>
      <td className="p-2">
        <input 
          type="text"
          value={item.stoppedAt}
          onChange={e => onUpdate({ stoppedAt: e.target.value })}
          className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm"
          placeholder="Fase..."
        />
      </td>
      <td className="p-2">
        <input 
          type="text"
          value={item.nextStep}
          onChange={e => onUpdate({ nextStep: e.target.value })}
          className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm font-medium text-olive-700"
          placeholder="Actie..."
        />
      </td>
      <td className="p-2">
        <input 
          type="text"
          value={item.status}
          onChange={e => onUpdate({ status: e.target.value })}
          className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm"
          placeholder="Status..."
        />
      </td>
      <td className="p-2">
        <input 
          type="text"
          value={item.note}
          onChange={e => onUpdate({ note: e.target.value })}
          className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm italic text-stone-400"
          placeholder="Notitie..."
        />
      </td>
      <td className="p-2">
        <button 
          onClick={onDelete}
          className="text-stone-300 hover:text-red-500 transition-colors p-2"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

function MindmapView({ data, onProjectClick, onContainerClick }: { 
  data: TimebendingData, 
  onProjectClick: (id: string) => void,
  onContainerClick: (id: string) => void
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const zoomRef = React.useRef<any>(null);
  const [showHelp, setShowHelp] = React.useState(false);

  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      const initialTransform = d3.zoomIdentity.translate(80, 100).scale(0.7);
      svg.transition().duration(750).call(zoomRef.current.transform, initialTransform);
    }
  };

  const fitToScreen = () => {
    if (svgRef.current && zoomRef.current && containerRef.current) {
      const svg = d3.select(svgRef.current);
      const g = svg.select("g");
      const bounds = (g.node() as SVGGElement).getBBox();
      const parent = containerRef.current;
      const fullWidth = parent.clientWidth;
      const fullHeight = parent.clientHeight;
      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;
      
      if (width === 0 || height === 0) return;

      const scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    }
  };

  React.useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Transform data for d3 tree
    const rootData: any = {
      name: "Timebending®",
      children: data.containers.map(container => {
        const categories = data.categories.filter(cat => cat.containerId === container.id);
        const containerProjects = data.projects.filter(p => p.containerId === container.id && !p.categoryId);
        
        const children = [
          ...categories.map(cat => ({
            name: cat.name,
            containerId: container.id,
            children: data.projects
              .filter(p => p.categoryId === cat.id)
              .map(p => ({ name: p.name, id: p.id }))
          })),
          ...containerProjects.map(p => ({ name: p.name, id: p.id }))
        ].filter(child => child.name);

        return {
          name: container.name,
          id: container.id,
          color: container.color,
          children: children.length > 0 ? children : undefined
        };
      }).filter(c => c.name)
    };

    const root = d3.hierarchy(rootData);
    
    // Use nodeSize for more consistent spacing regardless of node count
    const treeLayout = d3.tree().nodeSize([60, 240]);
    treeLayout(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");
    
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .clickDistance(20) // Critical for mobile: allow some movement during tap
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom as any);

    // Initial position - center vertically based on tree height
    const initialTransform = d3.zoomIdentity.translate(100, 150).scale(0.6);
    svg.call(zoom.transform as any, initialTransform);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .attr("fill", "none")
      .attr("stroke", "#d1d5db")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.4);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    const handleNodeClick = (event: any, d: any) => {
      event.stopPropagation();
      if (!d.data || d.depth === 0) return;

      if (d.depth === 1) {
        // Container
        onContainerClick(d.data.id);
      } else if (d.depth === 2 && d.data.containerId) {
        // Category - go to container
        onContainerClick(d.data.containerId);
      } else if (d.data.id) {
        // Project (depth 2 or 3)
        onProjectClick(d.data.id);
      }
    };

    // Larger hit area for tapping
    node.append("circle")
      .attr("r", 30)
      .attr("fill", "transparent")
      .style("cursor", (d: any) => d.depth > 0 ? "pointer" : "default")
      .on("click", handleNodeClick);

    // Visible node circles
    node.append("circle")
      .attr("r", d => d.depth === 0 ? 16 : d.depth === 1 ? 12 : 9)
      .attr("fill", (d: any) => {
        if (d.depth === 0) return "#5a5a40";
        if (d.depth === 1) return d.data.color || "#e5e7eb";
        return "#fff";
      })
      .attr("stroke", (d: any) => {
        if (d.depth === 0) return "#fff";
        if (d.depth === 1) return d3.color(d.data.color)?.darker().toString() || "#5a5a40";
        return "#5a5a40";
      })
      .attr("stroke-width", 2.5)
      .style("pointer-events", "none");

    // Labels with background for better readability
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.depth === 0 ? -26 : 26)
      .attr("text-anchor", d => d.depth === 0 ? "end" : "start")
      .text((d: any) => d.data.name)
      .attr("font-size", d => d.depth === 0 ? "22px" : d.depth === 1 ? "20px" : "16px")
      .attr("font-weight", d => d.depth < 2 ? "800" : "600")
      .attr("fill", "#1c1917")
      .attr("class", "select-none")
      .style("cursor", (d: any) => d.depth > 0 ? "pointer" : "default")
      .on("click", handleNodeClick)
      .style("text-shadow", "0 0 10px white, 0 0 10px white, 0 0 10px white");

  }, [data, onProjectClick, onContainerClick]);

  return (
    <div ref={containerRef} className="bg-white rounded-[3rem] p-4 shadow-sm border border-stone-100 overflow-hidden relative h-[75vh]">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`p-3 rounded-2xl shadow-lg border transition-all active:scale-95 flex items-center gap-2 ${showHelp ? 'bg-olive-600 text-white border-olive-700' : 'bg-white text-stone-600 border-stone-100 hover:bg-stone-50'}`}
            title="Uitleg & Legenda"
          >
            <HelpCircle size={18} />
            {showHelp && <span className="text-xs font-bold">Sluit Uitleg</span>}
          </button>
          
          <button 
            onClick={resetZoom}
            className="bg-white hover:bg-stone-50 text-stone-600 p-3 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            title="Herstel Beeld"
          >
            <LayoutDashboard size={18} />
          </button>
          
          <button 
            onClick={fitToScreen}
            className="bg-white hover:bg-stone-50 text-stone-600 p-3 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            title="Passend maken"
          >
            <Plus size={18} className="rotate-45" />
          </button>
        </div>

        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2.5rem] shadow-xl border border-stone-100 max-w-[240px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-olive-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-600">Interactief</span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                  Sleep om te bewegen. Zoom met twee vingers of scrollwiel. Tik op een bolletje om te navigeren.
                </p>
              </div>

              {/* Legend */}
              <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2.5rem] shadow-xl border border-stone-100 max-w-[240px]">
                <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Legenda</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#5a5a40] shadow-sm"></div>
                    <span className="text-[11px] font-bold text-stone-600">Centrum</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-olive-500 bg-white shadow-sm"></div>
                    <span className="text-[11px] font-bold text-stone-600">Container</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border border-stone-400 bg-white shadow-sm"></div>
                    <span className="text-[11px] font-bold text-stone-600">Project</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <svg 
        ref={svgRef} 
        className="w-full h-full touch-none cursor-move"
      ></svg>
    </div>
  );
}
