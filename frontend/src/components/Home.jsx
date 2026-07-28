import React from 'react';
import ScrollExperience from './3d/ScrollExperience';

export default function Home() {
  return (
    <div className="w-full h-[calc(100vh-64px)] relative z-10">
      <ScrollExperience />
    </div>
  );
}
