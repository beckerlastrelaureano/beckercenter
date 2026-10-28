/* =========================================================
   RENDIMIENTO.JS — decide cuánto 3D aguanta el dispositivo
   Se carga en el <head>, antes que todo.

   Niveles:
   - "alto"  : 3D completo (materiales de metal, partículas)
   - "medio" : 3D simplificado (menos resolución y partículas)
   - "bajo"  : sin 3D, solo efectos livianos

   Para probar un nivel a mano, agregá al link:
   ?nivel=alto   ?nivel=medio   ?nivel=bajo
   No hace falta editar este archivo.
   ========================================================= */

window.BC_PERF = (function () {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ahorro = !!(navigator.connection && navigator.connection.saveData);
  const nucleos = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;   // en GB (solo Chrome lo informa)

  const webgl = (function () {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  })();

  let nivel = 'alto';
  if (reducir || ahorro || !webgl) nivel = 'bajo';
  else if (nucleos <= 4 || memoria <= 3) nivel = 'medio';

  const forzado = new URLSearchParams(location.search).get('nivel');
  if (['alto', 'medio', 'bajo'].includes(forzado)) nivel = forzado;

  document.documentElement.dataset.nivel = nivel;

  return {
    nivel,
    reducir: reducir && !forzado,
    // Si el 3D anda lento, se baja de nivel en el momento
    bajar() {
      this.nivel = this.nivel === 'alto' ? 'medio' : 'bajo';
      document.documentElement.dataset.nivel = this.nivel;
      return this.nivel;
    }
  };
})();
