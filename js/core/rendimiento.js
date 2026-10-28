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
  if (ahorro || !webgl) nivel = 'bajo';
  // Con "Quitar animaciones" el 3D se muestra igual, pero quieto (ver "quieto")
  else if (nucleos <= 4 || memoria <= 3 || reducir) nivel = 'medio';

  const forzado = new URLSearchParams(location.search).get('nivel');
  if (['alto', 'medio', 'bajo'].includes(forzado)) nivel = forzado;

  document.documentElement.dataset.nivel = nivel;

  return {
    nivel,
    // reducir: sin animaciones de scroll ni scroll suave
    reducir: reducir && !forzado,
    // quieto: la figura 3D no se mueve sola, solo cuando la tocan
    quieto: reducir && !forzado,
    // Si el 3D anda lento, se baja de nivel en el momento
    bajar() {
      this.nivel = this.nivel === 'alto' ? 'medio' : 'bajo';
      document.documentElement.dataset.nivel = this.nivel;
      return this.nivel;
    }
  };
})();
