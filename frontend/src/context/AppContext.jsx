import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { currentUser } from '../data/mockData.js';
import { getAppContext, isMockMode } from '../services/api.js';

const fallback = { user: currentUser, settings: { timezone:'America/Sao_Paulo', reservationIntervalMinutes:30, maxDestinations:10, allowDifferentDriver:true, requireTicket:false, requireCostCenter:false }, branding: { productName:'Frota Leve', primaryColor:'#0B6B3A', secondaryColor:'#0C2F21' } };
const Context = createContext({ ...fallback, loading:false, error:null });

export function AppContextProvider({ children }) {
  const [value,setValue]=useState(fallback); const [loading,setLoading]=useState(!isMockMode); const [error,setError]=useState(null);
  useEffect(()=>{ if(isMockMode) return; let active=true; getAppContext().then((data)=>{if(active)setValue(data)}).catch((e)=>{if(active)setError(e)}).finally(()=>{if(active)setLoading(false)}); return()=>{active=false}; },[]);
  useEffect(()=>{ const primary=value.branding?.primaryColor; const secondary=value.branding?.secondaryColor; if(primary)document.documentElement.style.setProperty('--brand',primary); if(secondary)document.documentElement.style.setProperty('--brand-dark',secondary); document.title=value.branding?.productName||'Frota Leve'; },[value]);
  const provided=useMemo(()=>({...value,loading,error}),[value,loading,error]);
  return <Context.Provider value={provided}>{children}</Context.Provider>;
}
export const useAppContext=()=>useContext(Context);
