import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Save, Search, Box, AlertCircle, CheckCircle, Plus, Minus, X, Server, WifiOff, HelpCircle, ShieldAlert, FileJson, Database, Terminal, Palette, Activity } from 'lucide-react';

// --- URLS DEFINITIVAS ---
// Estas URLs ya no se guardan ni se pueden modificar en la interfaz.
const ALTA_URL_DEFINITIVA = 'https://new.automatizar.work/webhook/alta';
const GET_URL_DEFINITIVA = 'https://new.automatizar.work/webhook/leer-inventario';
const UPDATE_URL_DEFINITIVA = 'https://new.automatizar.work/webhook/actualizar-inventario';
// --- URLS DEFINITIVAS ---

// Objeto de configuración fija (no es estado, solo referencia)
const CONFIG_FIJA = { 
    getUrl: GET_URL_DEFINITIVA, 
    postUrl: UPDATE_URL_DEFINITIVA, 
    postNewUrl: ALTA_URL_DEFINITIVA, 
};


// --- Componentes Modales (Funciones Auxiliares) ---

// Modal de Diagnóstico y Ayuda (Mantenido solo para fines de depuración interna si se necesita)
const DiagnosticsModal = ({ show, onClose, showDebug, setShowDebug, showHelp, setShowHelp, helpTopic, setHelpTopic, lastRawData, fetchData }) => {
    if (!show) return null;

    const handleClose = () => {
        setShowDebug(false);
        setShowHelp(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white w-full sm:w-96 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2 text-blue-800">
                <Server size={20} /> Diagnóstico y URLs
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {!showHelp && !showDebug ? (
                <div className="space-y-4">
                    <div className="p-3 bg-blue-100 rounded text-sm font-medium text-blue-800">
                        <p className="font-bold mb-2">URLs de n8n (Fijas):</p>
                        <div className="font-mono text-xs space-y-1">
                            <p><strong>GET (Lectura):</strong> <span className="break-all">{CONFIG_FIJA.getUrl}</span></p>
                            <p><strong>POST (Actualizar):</strong> <span className="break-all">{CONFIG_FIJA.postUrl}</span></p>
                            <p><strong>POST (Alta):</strong> <span className="break-all">{CONFIG_FIJA.postNewUrl}</span></p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600">Si hay problemas de conexión o datos, utiliza estas herramientas:</p>
                  
                  <div className="flex gap-2 mt-2">
                     <button onClick={() => {setHelpTopic('cors'); setShowHelp(true);}} className="flex-1 flex items-center justify-center gap-2 text-xs text-orange-600 bg-orange-50 p-3 rounded-xl font-bold hover:bg-orange-100 transition">
                      <HelpCircle size={14} /> Ayuda CORS
                    </button>
                     <button onClick={() => setShowDebug(true)} className="flex-1 flex items-center justify-center gap-2 text-xs text-slate-600 bg-slate-100 p-3 rounded-xl font-bold hover:bg-slate-200 transition">
                      <Terminal size={14} /> Ver JSON (Debug)
                    </button>
                  </div>

                  <button onClick={() => fetchData(CONFIG_FIJA.getUrl)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 mt-4 flex items-center justify-center gap-2">
                    <RefreshCw size={18} /> Forzar Recarga
                  </button>
                </div>
              ) : showDebug ? (
                <div className="animate-fade-in">
                   <div className="flex items-center gap-2 font-bold border-b pb-2 mb-2 text-slate-700">
                    <Database size={18} /> Datos Recibidos (Debug)
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Primer registro tal cual llega de n8n:</p>
                  <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-60">
                    {lastRawData ? JSON.stringify(lastRawData, null, 2) : '// No hay datos recibidos aún.\n// Vuelve a la pantalla principal y recarga.'}
                  </pre>
                  <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                    <strong>Columnas buscadas:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Pieza / Nombre</li>
                      <li>Material / Mat</li>
                      <li>Estado / Status</li>
                      <li>Color / Tono</li>
                      <li>Cantidad / Stock</li>
                      <li className="text-green-700 font-bold">ID: row_number (Prioridad)</li>
                    </ul>
                  </div>
                  <button onClick={() => { setShowDebug(false); setShowHelp(false); }} className="w-full bg-slate-200 text-slate-700 py-2 rounded font-bold hover:bg-slate-300 mt-4">
                    Volver
                  </button>
                </div>
              ) : (
                <div className="text-sm space-y-3 animate-fade-in">
                  <div className={`flex items-center gap-2 font-bold border-b pb-2 ${helpTopic === 'header500' ? 'text-red-600' : 'text-orange-600'}`}>
                    <ShieldAlert size={18} /> {helpTopic === 'header500' ? 'Error 500: Headers Inválidos' : 'Solución a "Failed to Fetch" (CORS)'}
                  </div>
                  {helpTopic === 'cors' && (
                    <>
                      <p className="text-slate-600">Este error de seguridad significa que el navegador está bloqueando la conexión. La solución es configurar n8n para que permita peticiones desde esta aplicación.</p>
                      <div className="bg-slate-100 p-3 rounded font-mono text-xs space-y-2 border border-slate-200">
                        <p className="font-bold text-slate-800">En tu flujo de n8n (Nodo "Respond to Webhook"):</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><strong>Response Headers:</strong><br/>Key: <code>Access-Control-Allow-Origin</code><br/>Value: <code>*</code></li>
                        </ul>
                      </div>
                    </>
                  )}
                  {helpTopic === 'header500' && (
                    <div className="bg-red-50 p-3 rounded text-xs space-y-2 border border-red-200">
                       <p><strong>¡Error!</strong> Hay una fila vacía o un nombre de encabezado inválido en los "Response Headers" del nodo "Respond to Webhook" de n8n. Elimina o corrige la fila.</p>
                    </div>
                  )}
                  <button onClick={() => { setShowDebug(false); setShowHelp(false); }} className="w-full bg-slate-200 text-slate-700 py-2 rounded font-bold hover:bg-slate-300 mt-4">Volver</button>
                </div>
              )}
            </div>
          </div>
        </div>
    );
};

// Modal de Nuevo Ítem
const NewItemModal = ({ show, onClose, data, onChange, onCreate, saving }) => {
    if (!show) return null;

    const isFormValid = data.name.trim() !== '' && data.counted > 0;

    const handleCountChange = (value) => {
        const val = parseInt(value) || 0;
        onChange(c => ({...c, counted: Math.max(0, val)}));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-4 sm:p-0">
            <div className="bg-white w-full sm:w-96 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600">
                        <Plus size={20} /> Dar de Alta Nuevo Ítem
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pieza / Nombre (*)</label>
                        <input type="text" placeholder="Ej: Carcasa Superior V3" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={data.name} onChange={(e) => onChange(c => ({...c, name: e.target.value}))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Material</label>
                        <input type="text" placeholder="Ej: PETG, PLA, ABS" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={data.material} onChange={(e) => onChange(c => ({...c, material: e.target.value}))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                        <input type="text" placeholder="Ej: Rojo Transparente, Negro Mate" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={data.color} onChange={(e) => onChange(c => ({...c, color: e.target.value}))} />
                    </div>
                    
                    <div className="flex items-center justify-between bg-slate-100 rounded-lg p-3">
                         <label className="text-sm font-medium text-slate-700">Cantidad Inicial (*)</label>
                         <div className="flex items-center gap-2">
                            <button onClick={() => handleCountChange(data.counted - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 active:bg-red-50 transition-colors">
                              <Minus size={18} />
                            </button>
                            <input 
                              type="number" 
                              className="w-16 bg-transparent text-center font-bold text-lg focus:outline-none text-slate-700" 
                              value={data.counted} 
                              onChange={(e) => handleCountChange(e.target.value)} 
                            />
                            <button onClick={() => handleCountChange(data.counted + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-green-600 active:bg-green-50 transition-colors">
                              <Plus size={18} />
                            </button>
                        </div>
                    </div>
                    <p className='text-xs text-slate-400'>* Campos obligatorios</p>
                </div>

                <div className="p-4 border-t">
                     <button onClick={onCreate} disabled={saving || !isFormValid} className={`w-full py-3 rounded-lg font-bold text-white transition-all transform flex items-center justify-center gap-2 ${isFormValid && !saving ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-400 cursor-not-allowed'}`}>
                        {saving ? <><RefreshCw className="animate-spin" size={20} /> Creando...</> : <><Plus size={20} /> Guardar Nuevo Ítem</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente principal ---

export default function InventoryApp() {
  // Estado de la aplicación
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false); 
  const [showHelp, setShowHelp] = useState(false);
  const [helpTopic, setHelpTopic] = useState('cors'); 
  const [showDebug, setShowDebug] = useState(false); 
  const [showNewItemModal, setShowNewItemModal] = useState(false); 
  const [lastRawData, setLastRawData] = useState(null); 
  const [msg, setMsg] = useState(null); 
  
  const [newItemData, setNewItemData] = useState({ 
    name: '', 
    material: '', 
    color: '', 
    counted: 0
  });

  // Datos de demostración (fallback)
  const demoData = [
    { row_number: 900, name: 'Engranaje Helicoidal (DEMO)', material: 'PETG', status: 'Nuevo', color: 'Naranja', stock: 15, counted: 15 },
    { row_number: 901, name: 'Carcasa Inferior V2 (DEMO)', material: 'PLA', status: 'En uso', color: 'Negro Mate', stock: 4, counted: 4 },
    { row_number: 902, name: 'Soporte de Bobina (DEMO)', material: 'ABS', status: 'Dañado', color: 'Blanco', stock: 2, counted: 2 },
    { row_number: 903, name: 'Conducto de Ventilación (DEMO)', material: 'ASA', status: 'Nuevo', color: 'Gris', stock: 8, counted: 8 },
    { row_number: 904, name: 'Clip de Cable (DEMO)', material: 'TPU', status: 'Nuevo', color: 'Azul', stock: 50, counted: 50 },
  ];

  // Helper para agregar IDs internos únicos (evita errores de Keys duplicadas en React)
  const addInternalIds = (data, prefix = 'item') => {
    return data.map((item, index) => ({
      ...item,
      _internalId: `${prefix}-${item.id || index}-${Math.random().toString(36).substr(2, 5)}`
    }));
  };

  useEffect(() => {
    fetchData(); 
  }, []); 

  // Función inteligente para normalizar claves (Keys) del JSON
  const normalizeItem = (rawItem) => {
    const keys = Object.keys(rawItem);
    const newItem = { ...rawItem }; // Copia base

    // Helper para encontrar el key, priorizando términos exactos (case-insensitive)
    const findKeyPrioritized = (exactTerms, regexFallback) => {
        // 1. Check for exact terms first (e.g., 'name', 'stock', 'color')
        for (const term of exactTerms) {
            // Buscamos el key que coincida exactamente (ignorando mayúsculas/minúsculas)
            const key = keys.find(k => k.toLowerCase() === term.toLowerCase());
            if (key) return key;
        }
        // 2. Fallback a la búsqueda por regex
        return keys.find(k => regexFallback.test(k));
    };

    // Normalización de campos
    if (!newItem.name) {
      const key = findKeyPrioritized(['name', 'nombre', 'pieza', 'producto', 'item'], /pieza|nombre|name|producto|item|title/i);
      if (key) newItem.name = rawItem[key];
    }
    if (!newItem.material) {
      const key = findKeyPrioritized(['material', 'mat', 'tipo'], /material|mat|tipo|compuesto/i);
      if (key) newItem.material = rawItem[key];
    }
    if (!newItem.status) {
      const key = findKeyPrioritized(['status', 'estado', 'condicion'], /estado|status|condicion|condition/i);
      if (key) newItem.status = rawItem[key];
    }
    
    // Lógica mejorada para COLOR: Prioriza 'color' o 'colour' exacto sobre descripciones largas
    if (!newItem.color) {
      const key = findKeyPrioritized(['color', 'colour', 'tono'], /color|colour|tono/i);
      if (key) newItem.color = rawItem[key];
    }

    if (newItem.stock === undefined) {
      const key = findKeyPrioritized(['stock', 'cantidad', 'qty', 'quantity', 'total'], /cantidad|stock|qty|quantity|total/i);
      if (key) newItem.stock = rawItem[key];
    }
    
    // 6. Buscar ID (Prioridad absoluta a row_number, luego a 'id')
    if (rawItem.row_number !== undefined) {
        newItem.id = rawItem.row_number;
    } else if (!newItem.id) {
        const key = findKeyPrioritized(['id', 'sku', 'codigo', 'ref'], /id|sku|codigo|ref/i);
        if (key) newItem.id = rawItem[key];
    }
    
    return newItem;
  };


  const fetchData = async () => {
    const urlToUse = CONFIG_FIJA.getUrl;

    if (!urlToUse.startsWith('http')) {
      setItems(addInternalIds(demoData, 'demo'));
      return;
    }

    if (window.location.protocol === 'https:' && urlToUse.startsWith('http:')) {
      showMsg('Error de Seguridad: No puedes conectar HTTP desde HTTPS.', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log("Intentando conectar a:", urlToUse);
      const response = await fetch(urlToUse, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 500 && errorText.includes('Header name must be a valid')) {
          setHelpTopic('header500'); setShowHelp(true); setShowDiagnostics(true);
          throw new Error('Error de Configuración en n8n (Headers vacíos)');
        }
        throw new Error(`Error del servidor (${response.status})`);
      }
      
      const text = await response.text();
      if (!text || text.trim() === '') throw new Error('Respuesta vacía del servidor.');

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setLastRawData(text); 
        throw new Error(`La respuesta no es un JSON válido.`);
      }
      
      if (!Array.isArray(data)) {
        setLastRawData(data); 
        throw new Error('n8n devolvió un objeto en lugar de una lista (Array).');
      }

      if (data.length > 0) setLastRawData(data[0]);

      const formattedData = data.map((rawItem, index) => {
        const item = normalizeItem(rawItem);
        return {
          ...item,
          _raw: rawItem,
          // Usar ID único de la fila de Sheets (o generar uno si no está)
          id: item.id ? String(item.id) : `gen-${index}`, 
          _internalId: `fetched-${item.id || index}-${Math.random().toString(36).substr(2, 5)}`, // ID único para React
          stock: Number(item.stock) || 0,
          counted: Number(item.stock) || 0,
          name: item.name ? String(item.name) : 'Pieza sin nombre',
          material: item.material ? String(item.material) : 'N/A',
          status: item.status ? String(item.status) : 'N/A',
          color: item.color ? String(item.color) : 'N/A',
        };
      });
      
      setItems(formattedData);
      showMsg(`Inventario cargado: ${formattedData.length} piezas`, 'success');
    } catch (error) {
      console.error("Error de Fetch:", error);
      let errorMsg = error.message;
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errorMsg = 'Error de conexión o CORS bloqueado';
        setHelpTopic('cors');
        setShowHelp(true); 
        setShowDiagnostics(true);
      }
      showMsg(errorMsg, 'error');
      // Si falla la conexión, volvemos a la demo para que el usuario pueda seguir
      if (items.length === 0) setItems(addInternalIds(demoData, 'demo')); 
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar cambios de stock (Update)
  const saveInventory = async () => {
    const urlToUse = CONFIG_FIJA.postUrl;
    if (!urlToUse.startsWith('http')) {
      showMsg('Error: URL POST (Actualización) inválida.', 'error');
      return;
    }
    setSaving(true);
    
    // Solo enviamos los ítems que tienen un cambio
    const changes = items.filter(item => item.stock !== item.counted).map(item => ({
      id: item.id, // row_number para n8n
      name: item.name,
      oldStock: item.stock,
      newStock: item.counted
    }));

    if (changes.length === 0) {
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: changes }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      
      // Actualizamos el stock localmente tras guardar
      setItems(items.map(item => ({ ...item, stock: item.counted })));
      showMsg(`Éxito: ${changes.length} cambios guardados`, 'success');
    } catch (error) {
      showMsg(`Error al guardar: ${error.message}. Verifica CORS en Webhook POST (Update).`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Función para crear un nuevo ítem (Alta)
  const createNewItem = async () => {
    const urlToUse = CONFIG_FIJA.postNewUrl;
    if (!urlToUse.startsWith('http')) {
      showMsg('Error: URL POST (Alta) inválida.', 'error');
      return;
    }
    const itemToCreate = {
      name: newItemData.name,
      material: newItemData.material,
      color: newItemData.color,
      cantidad: Math.max(0, newItemData.counted) // Usamos 'cantidad' para que coincida con el nombre de tu columna
    };

    if (!itemToCreate.name.trim() || itemToCreate.cantidad <= 0) {
        showMsg('Nombre y Cantidad deben ser válidos.', 'error');
        return;
    }

    setSaving(true);
    try {
      const response = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newItem: itemToCreate }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      
      showMsg(`Éxito: Pieza '${itemToCreate.name}' creada.`, 'success');
      setShowNewItemModal(false);
      setNewItemData({ name: '', material: '', color: '', counted: 1 }); // Reset form
      fetchData(); // Refresca la lista para incluir el nuevo ítem
    } catch (error) {
      showMsg(`Error al crear: ${error.message}. Verifica CORS y URL POST (Alta).`, 'error');
    } finally {
      setSaving(false);
    }
  };


  const showMsg = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 6000);
  };

  // Ahora usamos _internalId para identificar el ítem a actualizar
  const updateCount = (internalId, delta) => {
    setItems(items.map(item => 
      item._internalId === internalId 
        ? { ...item, counted: Math.max(0, item.counted + delta) } 
        : item
    ));
  };

  const handleInputChange = (internalId, value) => {
    const val = parseInt(value) || 0;
    setItems(items.map(item => 
      item._internalId === internalId 
        ? { ...item, counted: Math.max(0, val) } 
        : item
    ));
  };

  // Búsqueda multi-criterio: Divide el término por espacios y requiere que CADA palabra coincida con ALGÚN campo
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    
    const searchKeywords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    // Verifica que CADA palabra clave esté presente en al menos uno de los campos del ítem
    return searchKeywords.every(keyword => {
      const inName = item.name && item.name.toLowerCase().includes(keyword);
      const inId = item.id && item.id.toString().includes(keyword);
      const inMaterial = item.material && item.material.toLowerCase().includes(keyword);
      const inColor = item.color && item.color.toLowerCase().includes(keyword);
      const inStatus = item.status && item.status.toLowerCase().includes(keyword);
      
      return inName || inId || inMaterial || inColor || inStatus;
    });
  });

  const pendingChanges = items.filter(i => i.stock !== i.counted).length;
  // La configuración ahora siempre es completa
  const isSetupIncomplete = false; 


  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md z-10">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Box size={24} />
            Inventario 3D
          </h1>
          <div className="flex gap-2">
             <button onClick={() => fetchData()} className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition active:scale-95" disabled={loading}>
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            {/* Botón de Diagnóstico y URLs ELIMINADO */}
            
            {/* Se mantiene el modal, solo es inaccesible */}
            {/* <button onClick={() => setShowDiagnostics(true)} className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition active:scale-95">
              <Settings size={20} />
            </button> */}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200" size={18} />
          <input
            type="text"
            placeholder="Buscar... (ej: pla rojo)"
            className="w-full bg-blue-700 text-white placeholder-blue-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Main List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">

        {loading && (
             <div className="bg-blue-50 text-blue-700 p-4 rounded-xl shadow-md flex items-center justify-center gap-3">
                <RefreshCw size={20} className="shrink-0 animate-spin"/>
                <p className="text-sm font-medium">Cargando inventario desde n8n...</p>
             </div>
        )}

        {filteredItems.length === 0 && !loading ? (
          <div className="text-center text-slate-400 mt-10 px-6">
            <Search size={48} className="mx-auto mb-2 opacity-50" />
            <p>No se encontraron piezas</p>
            <p className="text-xs mt-2">Verifica los nombres de columnas en Sheets: <br/> <strong>Pieza, Material, Estado, Color, Cantidad</strong></p>
            {CONFIG_FIJA.getUrl && (
              <p className="mt-4 text-blue-600 text-sm">
                (Si hay problemas, contacta al administrador para revisar el Diagnóstico de URLs)
              </p>
            )}
          </div>
        ) : (
          // Usamos _internalId como key para evitar errores de React con duplicados
          filteredItems.map((item) => (
            <div key={item._internalId} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col gap-3 transition-all ${item.counted !== item.stock ? 'border-orange-400 bg-orange-50' : 'border-blue-500'}`}>
              <div className="flex justify-between items-start">
                <div className="overflow-hidden pr-2">
                  {/* Nombre de la Pieza */}
                  <h3 className="font-bold text-lg leading-tight truncate mb-1">{item.name}</h3>
                  
                  {/* Chips de Metadatos */}
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    {item.material !== 'N/A' && (
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <Box size={12} className="text-slate-400"/> {item.material}
                      </span>
                    )}
                    {item.color !== 'N/A' && (
                       <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded" style={item.color.toLowerCase() === 'n/a' ? {} : {border: '1px solid currentColor', borderColor: item.color.toLowerCase()}}>
                        <Palette size={12} className="text-slate-400"/> {item.color}
                      </span>
                    )}
                     {item.status !== 'N/A' && (
                       <span className={`flex items-center gap-1 px-2 py-1 rounded ${item.status.toLowerCase().includes('nuevo') || item.status.toLowerCase().includes('ok') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        <Activity size={12} /> {item.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">Fila (ID): {item.id}</p>
                </div>
                
                <div className="text-right shrink-0 min-w-[60px]">
                   <span className="text-xs text-slate-500 block mb-1">Actual</span>
                   <span className="font-mono font-bold text-xl bg-slate-50 px-2 py-1 rounded block">{item.stock}</span>
                </div>
              </div>

              {/* Controles de Conteo usando _internalId */}
              <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1 mt-1">
                <button onClick={() => updateCount(item._internalId, -1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 active:bg-red-50 transition-colors">
                  <Minus size={24} />
                </button>
                <input 
                  type="number" 
                  className="w-20 bg-transparent text-center font-bold text-2xl focus:outline-none text-slate-700" 
                  value={item.counted} 
                  onChange={(e) => handleInputChange(item._internalId, e.target.value)} 
                />
                <button onClick={() => updateCount(item._internalId, 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-md shadow-sm text-green-600 active:bg-green-50 transition-colors">
                  <Plus size={24} />
                </button>
              </div>
              
              {item.counted !== item.stock && (
                <div className="text-center text-xs font-bold text-orange-600 bg-orange-100 py-1 rounded flex justify-center gap-1">
                  <AlertCircle size={14}/> Modificado: {item.counted - item.stock > 0 ? '+' : ''}{item.counted - item.stock}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Floating Save Button */}
      <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none">
        <button onClick={saveInventory} disabled={saving || pendingChanges === 0} className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all transform pointer-events-auto ${pendingChanges > 0 ? 'bg-green-600 hover:bg-green-500 translate-y-0' : 'bg-slate-400 translate-y-20 opacity-0'}`}>
          {saving ? <><RefreshCw className="animate-spin" size={20} /> Guardando...</> : <><Save size={20} /> Confirmar {pendingChanges} cambios</>}
        </button>
      </div>
      
      {/* Floating Add New Item Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
            onClick={() => { setShowNewItemModal(true); setNewItemData({ name: '', material: '', color: '', counted: 1 }); }} 
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-transform transform active:scale-90"
            aria-label="Dar de Alta Nuevo Ítem"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* Modals */}
      {showDiagnostics && (
        <DiagnosticsModal 
            show={showDiagnostics}
            onClose={() => setShowDiagnostics(false)} 
            showDebug={showDebug} 
            setShowDebug={setShowDebug} 
            showHelp={showHelp} 
            setShowHelp={setShowHelp} 
            helpTopic={helpTopic} 
            setHelpTopic={setHelpTopic} 
            lastRawData={lastRawData}
            fetchData={fetchData}
        />
      )}
      
      <NewItemModal
        show={showNewItemModal}
        onClose={() => setShowNewItemModal(false)}
        data={newItemData}
        onChange={setNewItemData}
        onCreate={createNewItem}
        saving={saving}
      />

      {/* Message System */}
      {msg && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 text-sm font-medium animate-fade-in max-w-[90vw] border ${msg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : msg.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
          {msg.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : msg.type === 'error' ? <WifiOff size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
          <div>{msg.text}</div>
        </div>
      )}
    </div>
  );
}