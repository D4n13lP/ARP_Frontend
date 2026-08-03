

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { useAppStore } from '../stores/useAppStore';
import getCroppedImg from '../utils/cropImage';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Usuario&background=16A085&color=fff";

export default function ManageAccount_Page() {
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const updateUserField = useAppStore(state => state.updateUserField);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Estados para el Modal de Cropping
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleEditClick = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveClick = () => {
    if (editingField) {
      updateUserField(editingField as keyof typeof user, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      
      // Cleanup the file input value so we can select the same file again later if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixelsInfo: any) => {
    setCroppedAreaPixels(croppedAreaPixelsInfo);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageToCrop && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(
          imageToCrop,
          croppedAreaPixels,
          0
        );
        if (croppedImage) {
          updateUserField('avatarUrl', croppedImage);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setImageToCrop(null);
  }, [imageToCrop, croppedAreaPixels, updateUserField]);

  const renderField = (label: string, fieldKey: keyof typeof user, isEditable: boolean = true) => {
    const isEditing = editingField === fieldKey;

    return (
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-4">
          <span className="text-[#e2694b] font-medium w-48 text-lg">{label}</span>
          {!isEditing && isEditable && (
            <button 
              onClick={() => handleEditClick(fieldKey, user[fieldKey])}
              className="text-[#e2694b] hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2 flex items-center gap-4 ml-12">
            <input 
              type="text" 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#e2694b] text-gray-800"
            />
            <button 
              onClick={handleSaveClick}
              className="bg-[#16A085] hover:bg-emerald-600 text-white px-4 py-1.5 rounded text-sm transition-colors"
            >
              Guardar
            </button>
            <button 
              onClick={() => setEditingField(null)}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <span className="text-gray-800 ml-12 mt-1 text-lg">{user[fieldKey]}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <img 
            src={logoEmpresa} 
            alt="LogoEmpresa" 
            className="h-20 w-auto object-contain" 
          />
        </div>
        <div className="flex items-center text-[#e2694b]">
          <h1 className="text-4xl font-bold tracking-tight">
            Administrar cuenta
          </h1>
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-12 mt-4">
        {/* Lado izquierdo: Formularios/Campos */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between w-full max-w-md mb-6">
             <span className="text-[#e2694b] font-medium text-lg">Nivel de cuenta</span>
             <span className="text-gray-800 text-lg">{user.nivelCuenta}</span>
          </div>
          
          <div className="flex items-center justify-between w-full max-w-md mb-10">
             <span className="text-[#e2694b] font-medium text-lg">Código de administrador</span>
             <span className="text-gray-800 text-lg">{user.codigoAdmin}</span>
          </div>

          {renderField('Nombre de usuario', 'nombreUsuario')}
          {renderField('Correo electrónico', 'correo')}
          {renderField('Número de teléfono', 'telefono')}

          <div className="mt-12 flex flex-col gap-8">
            <button 
              onClick={() => navigate('/retiros')}
              className="flex items-center gap-4 text-[#e2694b] hover:text-emerald-400 transition-colors w-fit group text-lg font-medium cursor-pointer"
            >
              <span>Hacer retiro</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button 
              onClick={() => navigate('/cuentas')}
              className="flex items-center gap-4 text-[#e2694b] hover:text-emerald-400 transition-colors w-fit group text-lg font-medium cursor-pointer"
            >
              <span>Administra mas cuentas</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lado derecho: Imagen de perfil */}
        <div className="flex flex-col items-center pt-4">
          <div 
            onClick={handleImageClick}
            className="w-48 h-48 bg-gray-200 cursor-pointer overflow-hidden relative group"
            title="Cambiar imagen de perfil"
          >
             <img 
                src={user.avatarUrl || DEFAULT_AVATAR} 
                alt="Imagen de perfil" 
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
               <span className="mb-1">Cambiar</span>
               <span>Imagen</span>
               <span>de Perfil</span>
             </div>
             {(!user.avatarUrl && !DEFAULT_AVATAR) && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 text-sm font-medium p-4 text-center">
                 Imagen de Perfil
               </div>
             )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {imageToCrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg flex flex-col gap-6 relative animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Ajustar imagen de perfil</h2>
              <button 
                onClick={() => setImageToCrop(null)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative w-full h-72 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(Number(e.target.value))
                }}
                className="w-full accent-[#16A085]"
              />
            </div>
            
            <div className="flex justify-end gap-4 mt-2">
              <button 
                onClick={() => setImageToCrop(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={showCroppedImage}
                className="bg-[#16A085] hover:bg-emerald-600 text-white px-6 py-2 rounded shadow-sm text-sm font-medium transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
