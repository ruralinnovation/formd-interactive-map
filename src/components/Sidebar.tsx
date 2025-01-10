import React, { useState, useMemo } from 'react';
import style from './styles/Sidebar.module.css';

interface SidebarProps {
  selected_geoid: string | null,
}
    
const Sidebar: React.FC<SidebarProps> = ({ selected_geoid }) => {

  return (
    <div className={style['sidebar']}>
      {selected_geoid? selected_geoid: "Welcome"}
    </div>
  );

}

export default Sidebar;
  