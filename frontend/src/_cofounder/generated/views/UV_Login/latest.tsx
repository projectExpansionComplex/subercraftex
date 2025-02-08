import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '@/store/main';

const UV_Login: React.FC = () => {
 

  const { theme, language } = useSelector((state: RootState) => state.preferences);



  return (
    <>
      <div className={`homepage ${theme} ${language}`}>
      
      

        



        
      </div>
    </>
  );
};

export default UV_Login;