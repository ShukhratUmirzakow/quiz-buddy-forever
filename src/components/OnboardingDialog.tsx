import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveUserProfile, UserProfile } from '@/lib/userStorage';
import defaultAvatar from '@/assets/user.png';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const profile: UserProfile = {
      name: trimmedName,
      avatarUrl: avatarPreview,
      createdAt: Date.now(),
    };

    saveUserProfile(profile);
    onComplete(profile);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Welcome! 👋</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Avatar Selection */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden glass-card border-2 border-white/20 press-effect"
          >
            <img
              src={avatarPreview || defaultAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold">Change</span>
            </div>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-white/40 text-xs -mt-3">Tap to add photo (optional)</p>

          {/* Name Input */}
          <div className="w-full space-y-2">
            <Label htmlFor="name" className="text-white/60 text-sm font-semibold">
              What's your name? *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              className="h-14 rounded-2xl glass-card border-white/10 bg-white/5 text-white placeholder:text-white/30 text-lg font-medium focus:border-white/20"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs font-medium">{error}</p>
            )}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl gradient-success text-white font-bold text-lg press-effect"
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
