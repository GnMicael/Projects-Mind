import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div><h1 className="text-2xl font-extrabold">Algo deu errado</h1>
          <p className="mt-2 text-muted">Seus dados estão salvos. Recarregue a página para continuar.</p>
          <button className="btn-primary mt-4" onClick={() => window.location.reload()}>Recarregar</button></div>
      </div>
    );
  }
}
