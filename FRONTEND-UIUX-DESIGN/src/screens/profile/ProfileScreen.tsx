import React from 'react';

interface ProfileScreenProps {}

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  return (
    <div className="w-full min-h-full bg-white flex-1 flex flex-col items-center justify-center">
      {/* Blank white center area — Profile content will be added in subsequent steps */}
    </div>
  );
};

export default ProfileScreen;
