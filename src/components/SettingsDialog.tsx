import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserProfile, saveUserProfile, UserProfile } from '@/lib/userStorage';
import { Language, LANGUAGES, getCurrentLanguage } from '@/lib/i18n';
import { useLanguage } from '@/hooks/useLanguage';
import defaultAvatar from '@/assets/user-default.png';
import flagEn from '@/assets/flag-en.png';
import flagUz from '@/assets/flag-uz.png';
import flagRu from '@/assets/flag-ru.png';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function SettingsDialog({ open, onOpenChange, onProfileUpdate }: SettingsDialogProps) {
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, changeLanguage } = useLanguage();

  useEffect(() => {
    if (open) {
      const profile = getUserProfile();
      if (profile) {
        setName(profile.name);
        setAvatarPreview(profile.avatarUrl);
      }
      setSelectedLanguage(getCurrentLanguage());
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

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('enter_your_name'));
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 12) {
      setError('Name must be 12 characters or less');
      return;
    }

    // Save language
    changeLanguage(selectedLanguage);

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
          <DialogTitle className="text-xl font-bold text-center">{t('settings')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-2">
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
              {t('change_photo')}
            </button>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="settings-name" className="text-white/60 text-sm font-semibold">
              {t('name')}
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => {
                const value = e.target.value.slice(0, 12);
                setName(value);
                setError('');
              }}
              placeholder={t('enter_your_name')}
              maxLength={12}
              className="h-12 rounded-xl glass-card border-white/10 bg-white/5 text-white placeholder:text-white/30 font-medium focus:border-white/20"
            />
            {error && (
              <p className="text-red-400 text-xs font-medium">{error}</p>
            )}
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-white/60 text-sm font-semibold">
              {t('language')}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => {
                const flagSrc = lang.code === 'en' ? flagEn : lang.code === 'uz' ? flagUz : flagRu;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all press-effect
                      ${selectedLanguage === lang.code 
                        ? 'glass-card border-white/30 bg-white/10' 
                        : 'glass-button hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={flagSrc} alt={lang.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-white/70 font-medium">{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="flex-1 h-12 rounded-xl glass-button text-white font-semibold press-effect hover:bg-white/10"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 rounded-xl gradient-success text-white font-semibold press-effect"
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
