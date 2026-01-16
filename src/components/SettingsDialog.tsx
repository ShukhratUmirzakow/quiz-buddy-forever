import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserProfile, saveUserProfile, UserProfile } from '@/lib/userStorage';
import defaultAvatar from '@/assets/user.png';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function SettingsDialog({ open, onOpenChange, onProfileUpdate }: SettingsDialogProps) {
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const profile = getUserProfile();
      if (profile) {
        setName(profile.name);
        setAvatarPreview(profile.avatarUrl);
      }
    }
  }, [open]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const profile = getUserProfile();
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        name: trimmedName,
        avatarUrl: avatarPreview,
      };
      saveUserProfile(updatedProfile);
      onProfileUpdate(updatedProfile);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* Avatar Selection */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden glass-card border-2 border-white/20 press-effect"
            >
              <img
                src={avatarPreview || defaultAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </motion.button>
            {avatarPreview && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-white/50 text-xs font-medium hover:text-white/70 transition-colors"
          >
            Change photo
          </button>

          {/* Name Input */}
          <div className="w-full space-y-2">
            <Label htmlFor="settings-name" className="text-white/60 text-sm font-semibold">
              Name
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              className="h-12 rounded-xl glass-card border-white/10 bg-white/5 text-white placeholder:text-white/30 font-medium focus:border-white/20"
            />
            {error && (
              <p className="text-red-400 text-xs font-medium">{error}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="w-full flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="flex-1 h-12 rounded-xl glass-button text-white font-semibold press-effect hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 rounded-xl gradient-success text-white font-semibold press-effect"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
