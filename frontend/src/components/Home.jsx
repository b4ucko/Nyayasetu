import React from 'react';
import ScrollExperience from './3d/ScrollExperience';

export default function Home() {
  return (
    <div className="w-full h-screen fixed inset-0 z-10">
      <ScrollExperience />
    </div>
  );
}
