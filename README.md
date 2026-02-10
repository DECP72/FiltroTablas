TableFilters: Filtros avanzados para tablas HTML
v1.0 - 2024-06-20
Autor: [Daniel Caballero] decp72@gmail.com
Descripción breve: Módulo JavaScript para agregar filtros dinámicos, ordenamiento,
   persistencia y exportación a Excel en tablas HTML, sin dependencias de backend.

/// NOTA IMPORTANTE: Este módulo está diseñado para ser utilizado en entornos controlados

FORMA DE USO
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
