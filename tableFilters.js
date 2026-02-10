/// TableFilters: Filtros avanzados para tablas HTML
// v1.0 - 2024-06-20
// Autor: [Daniel Caballero] decp72@gmail.com
// Descripción breve: Módulo JavaScript para agregar filtros dinámicos, ordenamiento,
// persistencia y exportación a Excel en tablas HTML, sin dependencias de backend.

/// NOTA IMPORTANTE: Este módulo está diseñado para ser utilizado en entornos controlados

/* FORMA DE USO
tableFilters.js es un módulo JavaScript orientado a aplicaciones web internas (Intranet),
diseñado para extender tablas HTML con funcionalidades de filtrado avanzado, ordenamiento
de columnas, persistencia de estado y exportación a Excel, trabajando exclusivamente del
lado cliente (frontend).

El módulo NO depende de backend ni de frameworks JS (React, Vue, etc.). Su funcionamiento
se basa en manipulación directa del DOM y en el uso de localStorage para persistir el
estado de la tabla (filtros aplicados y orden activo). Si bien puede ejecutarse en sitios
web públicos, su uso está recomendado únicamente en entornos controlados, ya que no
implementa autenticación, control de usuarios ni mecanismos de seguridad.

────────────────────────────────────────────────────────────
DEPENDENCIAS OBLIGATORIAS (deben incluirse en el HTML)
────────────────────────────────────────────────────────────

1) Bootstrap 5 (estilos de filtros y layout):
yo uso para estilo   <link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/litera/bootstrap.min.css">
Si es necesario usar los siguientes estilos para los filtros:
En el caso el Multiselect puede ser eliminado si se modifican las referencias a el en este codigo.

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <!-- Bootstrap Multiselect CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-multiselect/dist/css/bootstrap-multiselect.css">

  body ... 

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Bootstrap Multiselect JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap-multiselect/dist/js/bootstrap-multiselect.min.js"></script>

2) SheetJS (exportación a Excel):
<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

3) tableFilters.js (este archivo):
<script src="tableFilters.js"></script>

⚠ IMPORTANTE:
- tableFilters.js debe cargarse DESPUÉS de las librerías anteriores.
- La inicialización debe ejecutarse una vez que la tabla exista en el DOM.

────────────────────────────────────────────────────────────
FORMATO REQUERIDO DE LA TABLA
────────────────────────────────────────────────────────────

La tabla debe tener estructura HTML estándar con thead y tbody.
Las columnas se referencian por índice (base 0).

Ejemplo:

<table id="tablaProduccion" class="table table-sm table-striped">
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Orden</th>
            <th>Cliente</th>
            <th>Cantidad</th>
            <th>Estado</th>
        </tr>
        <tr> <!--Fila   de filtros-->
            <th><select id="filtroFecha" multiple="multiple"></select></th> <!--Filtro tipo Fecha-->
            <th><select id="filtroOrden" multiple="multiple"></select></th> <!--Filtro tipo Texto--> podria ser un rango si es solo numerico
            <th><select id="filtroCliente" multiple="multiple"></select></th> <!--Filtro tipo Texto-->
            <th><div id="filtroCantidad"></div></th>  <!--cuando es un rango no uso select sino div-->
            <th><select id="filtroEstado"></select></th> <!--cuando es un Boolean no hace falta el multiple-->
        </tr>
    </thead>

    <tbody id="tablaProduccion">
      <!-- Filas dinámicas --> o datos estáticos
    </tbody>

    <tfoot>  <!-- si queremos totales -->
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tfoot>
</table>

────────────────────────────────────────────────────────────
DEFINICIÓN DE FILTROS EN EL HTML
────────────────────────────────────────────────────────────
Hay 4 tipos de filtros: texto, fecha, rango y booleanos

Los filtros se declaran mediante atributos data-filter y data-column.

────────────────────────────────────────────────────────────
INICIALIZACIÓN DEL MÓDULO
────────────────────────────────────────────────────────────

La inicialización es obligatoria y se realiza llamando a:

        TableFilters.init('tablaProduccion', { 
         columns: {
          0: { type: 'date', target:'filtroFecha' },
          1: { type: 'text', target:'filtroOrden' },
          2: { type: 'text', target:'filtroCliente' },
          3: { type: 'range', target: 'filtroCantidad'},
          4: { type: 'boolean', target:'filtroEstado' },
         },
         columnToggle: {
            target: 'toggleColumnas'
         },

         footerTotals: true, --> activa fila de totales en el tfoot (debe existir en la tabla)

          persist: {
            key: 'produccion',
            user: usuario // opcional, para diferenciar estados por usuario
          }
        }); // 🔹 inicializa los filtros

Parámetros:
- tableId: ID de la tabla HTML a controlar en el ejemplo tablaProduccion.
- storageKey: Clave única usada en localStorage para persistir filtros y orden.
  (permite reutilizar el módulo en múltiples tablas/páginas sin conflictos)
  en el ejemplo produccion.

────────────────────────────────────────────────────────────
FUNCIONALIDADES IMPLEMENTADAS
────────────────────────────────────────────────────────────

- Filtrado dinámico por texto, fechas, rango numérico y valores booleanos.
- Ordenamiento de columnas haciendo click sobre los encabezados <th>.
- Persistencia automática de filtros y orden en localStorage.
- Restauración completa del estado al recargar la página.
- Exportación a Excel de las filas visibles (respeta filtros y orden).
        <button type="button" onclick="TableFilters.exportToExcel('produccion.csv')" class="btn btn-sm btn-outline-secondary" >
          Exportar Excel
        </button>
- Filtrado de columnas visibles mediante un multiselect generado dinámicamente.
        <div class="mb-2">
          <label  class="me-2 mb-0" ">Columnas visibles:</label>
          <select id="toggleColumnas" multiple="multiple">
          </select>
        </div>
- Totales dinámicos en el footer (suma para columnas numéricas, conteo para texto/fecha/booleanos).
- Cambio del tamaño de la columna (ajuste de ancho arrastrando el borde del encabezado).
────────────────────────────────────────────────────────────
NOTAS FINALES
────────────────────────────────────────────────────────────
Este archivo está diseñado para ser reutilizable, configurable y desacoplado
del contenido de la tabla, siempre que se respeten las convenciones indicadas.

Utilize este codigo si borrar estas indicaciones y respetando la infomacion de autoria y version.

Cualquier duda o mejora, no dude en contactarme a decp72@gmail.com
*/


const TableFilters = (() => {

  let table, tbody;
  let activeFilters = {};
  let sortState = {};
  let visibleColumns = new Set();
  let persistConfig = null;
  let columnDefs = {};
  /* =========================
     INIT
  ========================== */
  function init(tableId, config = {}) {
    table = document.getElementById(tableId);
    if (!table) throw `Tabla ${tableId} no encontrada`;

    tbody = table.querySelector('tbody');

    columnDefs = config.columns || {}; 

    ensureColgroup();
    makeResizable();
    initSorting(config.columns || {});

    // columnas visibles por defecto
    table.querySelectorAll('thead tr:first-child th')
      .forEach((_, i) => visibleColumns.add(i));

    // filtros
    if (config.columns) {
      Object.entries(config.columns).forEach(([i, cfg]) => {
        switch (cfg.type) {
          case 'text':    createTextFilter(+i, cfg.target); break;
          case 'date':    createDateFilter(+i, cfg.target); break;
          case 'range':   createRangeFilter(+i, cfg.target); break;
          case 'boolean': createBooleanFilter(+i, cfg.target); break;
        }
      });
    }

    if (config.columnToggle) createColumnToggle(config.columnToggle.target);
    if (config.footerTotals) createFooter();

    if (config.persist) {
      persistConfig = config.persist;
      loadState();
    }

    enableLiveRefilter();
    applyFilters();
    createFooter();
  }

  /* =========================
     CELL VALUE (CLAVE)
  ========================== */
  function getCellValue(row, col) {
    const cell = row.cells[col];
    if (!cell) return '';

    const input = cell.querySelector('input,select,textarea');
    if (input) {
      if (input.type === 'checkbox') return input.checked ? 'true' : 'false';
      return input.value?.trim() || '';
    }

    return cell.innerText.trim();
  }

  /* =========================
     TEXT FILTER
  ========================== */
  function createTextFilter(col, id) {
    const sel = document.getElementById(id);
    fillSelectFromColumn(col, sel);
    $(sel).multiselect(commonMulti(() =>
      updateFilter(col, 'text', new Set($(sel).val() || []))
    ));
  }

  /* =========================
     DATE FILTER
  ========================== */
  function createDateFilter(col, id) {
    const sel = document.getElementById(id);
    fillDateSelect(col, sel);
    $(sel).multiselect({
      ...commonMulti(() =>
        updateFilter(col, 'date', new Set($(sel).val() || []))
      ),
      enableClickableOptGroups: true
    });
  }

  /* =========================
     RANGE FILTER
  ========================== */

function createRangeFilter(col, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <input type="number" class="form-control mb-1" placeholder="Min" step="any">
    <input type="number" class="form-control" placeholder="Max" step="any">
  `;

  const [minInput, maxInput] = container.querySelectorAll('input');

  const applyRange = () => {
    const minVal = minInput.value.trim();
    const maxVal = maxInput.value.trim();

    // 🔹 Si ambos están vacíos, eliminamos el filtro
    if (minVal === '' && maxVal === '') {
      delete activeFilters[col];
      applyFilters();
      createFooter?.();
      saveState?.();
      return;
    }

    activeFilters[col] = {
      type: 'range',
      min: minVal !== '' ? Number(minVal) : null,
      max: maxVal !== '' ? Number(maxVal) : null
    };

    applyFilters();
    createFooter?.();
    saveState?.();
  };

  // Filtrar mientras escribe
  minInput.addEventListener('input', applyRange);
  maxInput.addEventListener('input', applyRange);

  // Opcional: filtrar también al perder foco
  minInput.addEventListener('change', applyRange);
  maxInput.addEventListener('change', applyRange);
}


  /* =========================
     BOOLEAN FILTER
  ========================== */
  function createBooleanFilter(col, id) {
    const sel = document.getElementById(id);
    sel.innerHTML = `
      <option value="">Todos</option>
      <option value="true">Sí</option>
      <option value="false">No</option>
    `;
    sel.addEventListener('change', () => {
      activeFilters[col] = { type:'boolean', value: sel.value };
      applyFilters();
      createFooter();
      saveState();
    });
  }

  /* =========================
     APPLY FILTERS
  ========================== */
  function applyFilters() {
    Array.from(tbody.rows).forEach(row => {
      let visible = true;

      for (const [c, f] of Object.entries(activeFilters)) {
        const v = getCellValue(row, Number(c));

        if (f.type === 'text' && f.values.size && !f.values.has(v)) visible = false;

        if (f.type === 'date' && f.values.size && !f.values.has(v)) visible = false;

        if (f.type === 'range') {
          if (v === '') visible = false;
          const n = Number(v.replace(',', '.'));
          if (isNaN(n)) visible = false;
          if (f.min !== null && n < f.min) visible = false;
          if (f.max !== null && n > f.max) visible = false;
        }

        if (f.type === 'boolean') {
          if (f.value !== '' && v !== f.value) visible = false;
        }

        if (!visible) break;
      }

      row.style.display = visible ? '' : 'none';
    });
  }

  function updateFilter(col, type, values) {
    activeFilters[col] = { type, values };
    applyFilters();
    createFooter();
    saveState();
  }

  function applyVisibleColumns() {
    const cols = Array.from(visibleColumns);

    table.querySelectorAll('tr').forEach(tr => {
      Array.from(tr.children).forEach((cell, i) => {
        cell.style.display = cols.includes(i) ? '' : 'none';
      });
    });

    createFooter();
  }

  /* =========================
     HELPERS
  ========================== */
  function fillSelectFromColumn(col, sel) {
    const s = new Set();
    Array.from(tbody.rows).forEach(r => {
      const v = getCellValue(r, col);
      if (v) s.add(v);
    });
    s.forEach(v => sel.add(new Option(v, v)));
  }

  function fillDateSelect(col, sel) {
    const map = {};
    Array.from(tbody.rows).forEach(r => {
      const v = getCellValue(r, col);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
      const [y,m] = v.split('-');
      map[y] ??= {};
      map[y][m] ??= [];
      map[y][m].push(v);
    });

    Object.entries(map).forEach(([y,months]) => {
      Object.entries(months).forEach(([m,days]) => {
        const g = document.createElement('optgroup');
        g.label = `${y}-${m}`;
        days.forEach(d => g.appendChild(new Option(d,d)));
        sel.appendChild(g);
      });
    });
  }

  function commonMulti(cb) {
    return {
      includeSelectAllOption: true,
      selectAllText: 'Marcar todos',
      enableFiltering: true,
      enableCaseInsensitiveFiltering: true,
      nonSelectedText: 'Todos',
      allSelectedText: 'Todos',
      numberDisplayed: 1,
      onChange: cb,
      onSelectAll: cb,
      onDeselectAll: cb
    };
  }

  /* =========================
     LIVE REFILTER
  ========================== */
  function enableLiveRefilter() {
    tbody.addEventListener('change', e => {
      if (e.target.matches('input,select,textarea')) {
        applyFilters();
        createFooter();
        saveState();
      }
    });
  }

  /* =========================
     FOOTER TOTALS
  ========================== */
  function createFooter() {
  const tfoot = table.tFoot;
  if (!tfoot || !tfoot.rows.length) return;

  const rows = Array.from(tbody.rows)
    .filter(r => r.style.display !== 'none');

  Array.from(tfoot.rows[0].cells).forEach((td, i) => {

    // columna oculta
    if (!visibleColumns.has(i)) {
      td.textContent = '';
      return;
    }

    const def = columnDefs[i] || {};
    const type = def.type || 'text';

    let sum = 0;
    let count = 0;

    rows.forEach(r => {
      const v = getCellValue(r, i);
      if (v === '' || v == null) return;

      if (type === 'range') {
        const n = Number(String(v).replace(',', '.'));
        if (!isNaN(n)) sum += n;
      } else {
        count++;
      }
    });

    switch (type) {
      case 'range':
        td.textContent = sum.toFixed(2);
        break;

      case 'text':
      case 'date':
      case 'boolean':
      default:
        td.textContent = `(${count})`;
        break;
    }
  });
}

  /* =========================
     COLUMNAS VISIBLES
  ========================== */

  function applyColumnVisibility(){
    table.querySelectorAll('tr').forEach(tr=>{
      tr.querySelectorAll('th,td').forEach((c,i)=>{
        c.style.display = visibleColumns.has(i)?'':'none';
      });
    });
  }
function createColumnToggle(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = '';
  visibleColumns.clear();

  table.querySelectorAll('thead tr:first-child th')
    .forEach((th, i) => {
      visibleColumns.add(i);

      const opt = new Option(th.innerText.trim(), i, true, true);
      select.appendChild(opt);
    });

  $(select).multiselect({
    includeSelectAllOption: true,
    nonSelectedText: 'Columnas',
    numberDisplayed: 2,
    onChange: update,
    onSelectAll: update,
    onDeselectAll: update
  });

  function update() {
    visibleColumns = new Set(
      ($(select).val() || []).map(v => +v)
    );
    applyColumnVisibility();
    createFooter();
    saveState();
  }
   applyColumnVisibility();
}

  /* =========================
     Ordenar tabla
  ========================== */
  function initSorting(columns) {
    table.querySelectorAll('thead tr:first-child th').forEach((th,i)=>{
      if(!columns[i])return;
      th.style.cursor='pointer';
      th.addEventListener('click',()=>ordenarTabla(i));
    });
  }

  function ordenarTabla(col) {
    const asc = !sortState[col];
    sortState = { [col]: asc };
    const rows = Array.from(tbody.rows);

    rows.sort((a,b)=>{
      const A = getCellValue(a,col);
      const B = getCellValue(b,col);
      return asc ? A.localeCompare(B) : B.localeCompare(A);
    });

    rows.forEach(r=>tbody.appendChild(r));
  }

  /* =========================
     RESIZE Cambia el tamaña de la columna arrastrando su borde
  ========================== */
  function ensureColgroup() {
    if (table.querySelector('colgroup')) return;
    const cg=document.createElement('colgroup');
    table.querySelectorAll('thead tr:first-child th')
      .forEach(()=>{const c=document.createElement('col');c.style.width='120px';cg.appendChild(c);});
    table.prepend(cg);
  }

  function makeResizable() {
    const cols = table.querySelectorAll('colgroup col');
    table.querySelectorAll('thead th').forEach((th,i)=>{
      const r=document.createElement('div');
      r.className='resizer';
      th.appendChild(r);
      r.onmousedown=e=>{
        const x=e.pageX,w=cols[i].offsetWidth;
        document.onmousemove=ev=>cols[i].style.width=w+ev.pageX-x+'px';
        document.onmouseup=()=>document.onmousemove=null;
      };
    });
  }

  /* =========================
     EXPORT EXCEL
  ========================== */
  function exportToExcel(name='export.csv'){
    let csv=[];
    const head=[];
    table.querySelectorAll('thead tr:first-child th')
      .forEach((th,i)=>{if(visibleColumns.has(i))head.push(`"${th.innerText}"`);});
    csv.push(head.join(';'));

    Array.from(tbody.rows)
      .filter(r=>r.style.display!=='none')
      .forEach(r=>{
        const line=[];
        visibleColumns.forEach(i=>line.push(`"${getCellValue(r,i)}"`));
        csv.push(line.join(';'));
      });

    const blob=new Blob([csv.join('\n')],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=name;
    a.click();
  }

  /* =========================
     PERSISTENCIA
  ========================== */
function saveState() {
  if (!persistConfig) return;

  const key = persistConfig.key + '_' + (persistConfig.user ?? '');

  const state = {
    filters: serializeFilters(),
    visibleColumns: Array.from(visibleColumns),
    sortState
  };

  localStorage.setItem(key, JSON.stringify(state));
}


function loadState() {
  if (!persistConfig) return;

  const key = persistConfig.key + '_' + (persistConfig.user ?? '');
  const raw = localStorage.getItem(key);
  if (!raw) return;

  const state = JSON.parse(raw);

  if (state.visibleColumns) {
    visibleColumns = new Set(state.visibleColumns);
    applyVisibleColumns();
  }

  if (state.filters) {
    restoreFilters(state.filters);
  }

  if (state.sortState) {
    sortState = state.sortState;
    applySort();
  }
}

  function serializeFilters(){
    const o={};
    Object.entries(activeFilters).forEach(([k,v])=>{
      o[k]={...v,values:[...(v.values||[])]};
    });
    return o;
  }

  function deserializeFilters(obj){
    const o={};
    Object.entries(obj).forEach(([k,v])=>{
      o[k]={...v,values:new Set(v.values||[])};
    });
    return o;
  }

  function restoreFilters(saved) {
  if (!saved) return;

  activeFilters = saved;

  Object.entries(saved).forEach(([i, f]) => {
    const def = columnDefs[i];
    if (!def) return;

    // 🔹 RANGE (min / max)
    if (def.type === 'range') {
      const c = document.getElementById(def.target);
      if (!c) return;

      const inputs = c.querySelectorAll('input');
      if (inputs.length >= 2) {
        inputs[0].value = f.min ?? '';
        inputs[1].value = f.max ?? '';
      }
      return;
    }

    // 🔹 TEXT / DATE / BOOLEAN (multiselect)
    const sel = document.getElementById(def.target);
    if (!sel) return;

    // esperar a que el multiselect esté inicializado
    setTimeout(() => {
      $(sel).multiselect('deselectAll', false);
      if (f.values?.length) {
        $(sel).multiselect('select', f.values);
      }
      $(sel).multiselect('refresh');
    });
  });
}

function applySort() {
  if (!sortState || sortState.col == null) return;

  const { col, dir } = sortState;
  const def = columnDefs[col] || {};
  const type = def.type || 'text';

  const rows = Array.from(tbody.rows);

  rows.sort((a, b) => {
    let va = getCellValue(a, col);
    let vb = getCellValue(b, col);

    // normalización
    va = va ?? '';
    vb = vb ?? '';

    // 🔹 RANGE (números)
    if (type === 'range') {
      const na = parseFloat(String(va).replace(',', '.')) || 0;
      const nb = parseFloat(String(vb).replace(',', '.')) || 0;
      return dir === 'asc' ? na - nb : nb - na;
    }

    // 🔹 DATE (YYYY-MM-DD)
    if (type === 'date') {
      const da = va ? new Date(va) : new Date(0);
      const db = vb ? new Date(vb) : new Date(0);
      return dir === 'asc' ? da - db : db - da;
    }

    // 🔹 TEXT / BOOLEAN
    return dir === 'asc'
      ? String(va).localeCompare(String(vb), 'es', { numeric:true })
      : String(vb).localeCompare(String(va), 'es', { numeric:true });
  });

  // reinsertar filas ordenadas
  rows.forEach(r => tbody.appendChild(r));
}

  return { init, exportToExcel, ordenarTabla };
})();
