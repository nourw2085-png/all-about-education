
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X } from 'lucide-react';

const AVATAR_OPTIONS = [
  '/placeholder.svg',
  'https://source.unsplash.com/ZHvM3XIOHoE',
  'https://source.unsplash.com/b1Hg7QI-zcc',
  'https://source.unsplash.com/Qg-r7OxXHEA',
  'https://source.unsplash.com/d2MSDujJl2g',
];

const AvatarUpload: React.FC = () => {
  const { user, updateUserAvatar } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would upload to storage here
    // For now, we'll use a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setSelectedAvatar(result);
    };
    reader.readAsDataURL(file);
  };
  
  const saveAvatar = () => {
    if (selectedAvatar) {
      updateUserAvatar(selectedAvatar);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully"
      });
    }
  };
  
  const clearSelection = () => {
    setSelectedAvatar(null);
  };
  
  const selectPresetAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={selectedAvatar || user?.avatar} />
          <AvatarFallback className="bg-edu-purple-200 text-edu-purple-700 text-2xl">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Upload size={16} className="mr-2" />
            Upload
          </Button>
          {selectedAvatar && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                <X size={16} className="mr-2" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={saveAvatar}
              >
                Save
              </Button>
            </>
          )}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Select an avatar:</h3>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_OPTIONS.map((avatar, index) => (
            <button
              key={index}
              onClick={() => selectPresetAvatar(avatar)}
              className={`relative rounded-full overflow-hidden w-12 h-12 ${
                selectedAvatar === avatar ? 'ring-2 ring-edu-purple-500' : ''
              }`}
            >
              <img src={avatar} alt={`Avatar option ${index+1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
