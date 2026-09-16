import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';

export function AsyncState({ loading, error, onRetry, children }) {
  if (loading) return <section className="section-card async-state"><LoaderCircle className="spin" size={24}/><strong>Carregando dados</strong><p>Consultando as informações da frota.</p></section>;
  if (error) return <section className="section-card async-state error"><AlertCircle size={24}/><strong>Não foi possível carregar</strong><p>{error}</p><button className="button secondary small" onClick={onRetry}><RefreshCw size={15}/> Tentar novamente</button></section>;
  return children;
}
