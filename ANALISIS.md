# ANALISIS.md — Auditoría Técnica ProyectoLyEP2026

**Proyecto:** Panel de Control de Clientes (React 19 + Vite + React Router + Context API)
**Equipo:** Grupo 17
**Repositorio docente:** https://github.com/gustso/ProyectoLyEP2026
**Fecha límite de entrega:** domingo 13 de septiembre de 2026

---

## 1. Resumen ejecutivo

El prototipo implementa un panel de control de clientes funcional en su flujo principal (login, listado, alta y baja de clientes), pero fue desarrollado priorizando la entrega visible sobre las buenas prácticas de seguridad y robustez. La auditoría relevó **23 hallazgos**: el problema más grave es que toda la seguridad (autenticación, autorización por rol y protección de rutas) se resuelve del lado del cliente, con credenciales hardcodeadas y datos sensibles expuestos en el bundle y en pantalla. A esto se suma una capa de persistencia simulada (FakeStoreAPI) que hace creer al usuario que las operaciones de alta/baja tienen efecto real cuando no es así. El código carece de pruebas automatizadas, tiene deuda de mantenibilidad (URLs duplicadas, mezcla de axios/fetch, metadata de otro trabajo) y presenta varias fallas de UX y manejo de errores (sin confirmación de borrado, sin feedback de carga, memory leaks por actualización de estado en componentes desmontados). En conjunto, el prototipo cumple su objetivo didáctico pero no sería apto para producción sin una reingeniería de la capa de seguridad y backend.

---

## 2. Tabla de hallazgos

| N° | Archivo | Dimensión | Impacto | Problema detectado | Propuesta de solución |
|----|---------|-----------|---------|---------------------|------------------------|
| 001 | `autorizacionesServices.js` | Seguridad | Alto | Emails y contraseñas en texto plano de todos los admins embebidos en el código fuente, visibles en el bundle JS del cliente | Autenticación real contra un backend (API + hashing); nunca embeber contraseñas en el cliente |
| 002 | `DetalleCliente.jsx` | Seguridad | Alto | Visibilidad/ejecución de "Eliminar Cliente" depende de `localStorage.getItem("role")`, editable desde la consola del navegador | Unificar con `AutorizacionesContext`; validar el rol siempre en el backend |
| 003 | `DetalleCliente.jsx` | Seguridad | Alto | Se muestra `cliente.password` en texto plano en pantalla | No transportar ni renderizar contraseñas en claro; mostrar un indicador enmascarado |
| 004 | `FormCliente.jsx` | Seguridad | Alto | Todo cliente nuevo se crea con password fijo `"1234"` | Generar una contraseña aleatoria/temporal por cliente |
| 005 | `Dashboard.jsx` / `routes.jsx` / `RutaProtegida.jsx` | Lógica — código muerto | Alto | Rama `!admin` en `Dashboard` nunca se ejecuta porque `RutaProtegida` ya filtra antes | Eliminar la rama duplicada; dejar una única fuente de verdad para el control de acceso |
| 006 | `AutorizacionesContext.jsx` | Seguridad | Alto | Objeto `admin` completo en `localStorage`, sin token ni expiración, sin revalidar contra backend | Persistir solo un token de sesión (idealmente cookie `httpOnly`) con expiración |
| 007 | `clientesService.js`, `FormCliente.jsx`, `DetalleCliente.jsx` | Funcional / Lógica | Medio | El CRUD contra FakeStoreAPI no persiste realmente, pero la app muestra mensajes de éxito reales | Aclarar "modo demo" en la UI o reemplazar por un backend propio |
| 008 | `FormCliente.jsx` | Funcional / Lógica | Medio | Solo valida campos no vacíos; no valida formato de email ni teléfono | Reutilizar el regex de email de `Login.jsx` y agregar validación de teléfono |
| 009 | `Dashboard.jsx` | Funcional / Lógica | Bajo | Las tarjetas del dashboard muestran valores numéricos fijos, no calculados | Calcular los valores a partir de los datos reales (clientes, usuarios por sector) |
| 010 | `package.json`, `Footer.jsx` | Mantenibilidad | Bajo | El `name` del `package.json` y el texto del Footer referencian otra materia/grupo | Actualizar `name` a `proyecto-lyep-2026-grupo17` y el texto del Footer |
| 011 | `clientesService.js`, `ListaClientes.jsx`, `DetalleCliente.jsx` | Arquitectura / Mantenibilidad | Medio | La URL de FakeStoreAPI está escrita en varios archivos, no centralizada | Centralizar todas las operaciones de clientes en `clientesService.js` |
| 012 | `clientesService.js`, `ListaClientes.jsx`, `DetalleCliente.jsx` | Arquitectura / Mantenibilidad | Bajo | Se usa `axios` en el servicio y `fetch` directo en los componentes | Unificar el mecanismo de peticiones HTTP en un solo enfoque |
| 013 | `DetalleCliente.jsx` | Manejo de errores | Medio | No verifica `respuesta.ok` ni tiene `catch` al consultar un cliente | Verificar `respuesta.ok`, agregar `catch` y mensaje de error al usuario |
| 014 | `DetalleCliente.jsx` | Manejo de errores / Funcional | Medio | No hay mensaje cuando el `DELETE` falla | Mostrar un mensaje explícito ante una eliminación fallida |
| 015 | `DetalleCliente.jsx` | Funcional / UX | Medio | El botón elimina directamente, sin confirmación previa | Agregar confirmación (`window.confirm` o modal) antes de eliminar |
| 016 | `ListaClientes.jsx` | Robustez | Medio | El filtro asume que `name.lastname` y `address.city` siempre existen; un registro incompleto rompe toda la vista | Usar optional chaining (`?.`) y valores por defecto |
| 017 | `Login.jsx` | UX / Accesibilidad | Bajo | El login usaba `alert('Verifique los datos')` para errores de credenciales, inconsistente con el resto del formulario que muestra errores en línea | Reemplazar el `alert()` por un mensaje de error en línea, integrado al mismo estado que los demás campos |
| 018 | Proyecto completo | Mantenibilidad | Medio | No hay tests unitarios ni de integración configurados | Incorporar Vitest + React Testing Library |
| 019 | `ErrorPage.jsx` | UX / Navegación | Bajo | El 404 no tiene enlace de vuelta a ninguna parte navegable | Agregar un `Link` de regreso al inicio |
| 020 | `ListaClientes.jsx` | Robustez | Medio | `setState` tras el fetch sin verificar si el componente sigue montado (memory leak) | Flag `isMounted` dentro del `useEffect`, con limpieza en el cleanup |
| 021 | `ListaClientes.jsx` | Rendimiento / UX | Bajo | El filtro se ejecuta en cada tecla, re-renderizando y filtrando todo el array | Aplicar debounce de 300ms antes de filtrar |
| 022 | `Login.jsx` | UX / Feedback | Medio | El botón de login no se deshabilita mientras se autentica, permite doble clic | Estado `cargando`, deshabilitar el botón durante el submit |
| 023 | `RutaProtegida.jsx`, `routes.jsx` | Arquitectura / Seguridad | Alto | `RutaProtegida` solo verifica sesión, no rol; "Soporte" accede igual que "Gerencia" a todas las rutas protegidas | Extender `RutaProtegida` para aceptar `rolesPermitidos` por ruta |

### Clasificación por dimensión

| Dimensión | Cantidad | Hallazgos |
|---|---|---|
| Seguridad | 6 | 001, 002, 003, 004, 006, 023 |
| Arquitectura / Mantenibilidad | 5 | 005, 010, 011, 012, 018 |
| Funcional / Lógica | 3 | 007, 008, 009 |
| Manejo de errores / Robustez | 4 | 013, 014, 016, 020 |
| UX / Navegación (incluye rendimiento) | 5 | 015, 017, 019, 021, 022 |
| **Total** | **23** | |

### Clasificación por impacto

| Nivel de impacto | Cantidad |
|---|---|
| Crítico / Alto | 7 |
| Importante / Medio | 10 |
| Menor / Bajo | 6 |
| **Total** | **23** |

---

## 3. Mejora seleccionada por participante

- **H02 — Unificar el control de acceso de "Eliminar Cliente" con AutorizacionesContext** *(Ingrid Monserrat Benitez)*
  Se reemplazó la lectura directa de `localStorage.getItem("role")` en `DetalleCliente.jsx` por el rol expuesto desde `AutorizacionesContext` (`admin?.sector`), dejando una única fuente de verdad en el frontend para decidir quién puede eliminar clientes. Se eligió esta corrección porque ataca directamente un caso de control de acceso manipulable desde la consola del navegador (OWASP A01:2021), sin requerir cambios en el backend ni en FakeStoreAPI.

  > **Estado:** Resuelto (issue #7).

- **H03 — Ocultar la contraseña real del cliente en la vista de detalle** *(Paola Carolina Marcos)*
  Se reemplazó el valor real de `cliente.password` por un indicador enmascarado (`••••••••`), conservando solo el `username` visible. Se eligió esta corrección porque es la de menor riesgo dentro del alcance frontend del TP: no depende de modificar FakeStoreAPI (fuera de nuestro control) ni requiere cifrado en el cliente, y elimina de inmediato una exposición de datos sensibles (OWASP A02:2021) sin afectar ninguna funcionalidad existente.

  > **Estado:** Resuelto (issue #1).

- **H04 — Generar contraseña aleatoria al crear un cliente nuevo** *(Ingrid Monserrat Benitez)*
  Se reemplazó el valor fijo `password: "1234"` en `FormCliente.jsx` por una función `generarPasswordTemporal()` que genera una cadena aleatoria distinta para cada cliente nuevo. Se eligió esta corrección porque elimina una credencial débil y predecible (compartida por todos los registros) sin depender de un backend propio ni de cambios en FakeStoreAPI.

  > **Estado:** Resuelto (issue #12).

- **H15 — Confirmación previa antes de eliminar un cliente** *(Agustina Quispe)*
  Se agregó `confirmarEliminacion`, que usa `window.confirm()` antes de invocar `eliminarCliente()`. Se seleccionó por ser una corrección de bajo riesgo que no toca la lógica de eliminación existente ni agrega dependencias, y resuelve directamente un problema de UX destructiva (borrado accidental sin posibilidad de cancelar).

- **H17 — Reemplazar el alert() de login por un error en línea** *(Yael Coria)*
  Se sustituyó el `alert('Verifique los datos')` por un campo de error (`errores.credenciales`) integrado al mismo estado y estilo que ya usaba el formulario. Se priorizó esta mejora porque no modifica la lógica de autenticación, mejora la accesibilidad (los `alert()` nativos son menos amigables para lectores de pantalla) y da consistencia visual a todo el formulario.

  > **Estado:** Resuelto (issue #2). PR: #4 y #5.

- **H20 — Evitar actualización de estado en componente desmontado** *(Angelo Rosario Abigail)*
  Se incorporó un flag `isMounted` dentro del `useEffect` de `ListaClientes.jsx`, con limpieza en el cleanup, para que `setClientes`, `setCargando` y `setError` no se ejecuten sobre un componente ya desmontado. Se eligió por ser la corrección mínima que elimina un memory leak real y los warnings de consola, sin tocar la lógica de carga ni agregar dependencias.

  > **Estado:** Resuelto (issue #8).

- **H21 — Debounce en el filtro de búsqueda** *(Angelo Rosario Abigail)*
  Se implementó un debounce de 300ms sobre el input de búsqueda antes de ejecutar el `.filter()`. Se seleccionó porque es una optimización estándar de bajo riesgo: no cambia el resultado del filtro, solo su frecuencia de ejecución, y mejora la percepción de fluidez en listas grandes.

  > **Estado:** Resuelto (issue #8).

- **H22 — Deshabilitar el botón de login durante la autenticación** *(Angelo Rosario Abigail)*
  Se agregó el estado `cargando`, que deshabilita el botón y cambia su texto a "Ingresando..." mientras se resuelve el login. Se priorizó por prevenir condiciones de carrera por doble submit y por ser la mejora de feedback visual más solicitada en formularios web, sin modificar la lógica de autenticación.

  > **Estado:** Resuelto (issue #8).

*(Nota: se listan las ocho mejoras efectivamente implementadas por los integrantes del equipo, según lo acordado en el reparto grupal de hallazgos.)*
---

## 4. Backlog priorizado (futuras iteraciones)

### Prioridad crítica — seguridad y control de acceso
1. **H01** — Mover la autenticación a un backend real (API + hashing); eliminar credenciales hardcodeadas del bundle cliente.
2. **H06** — Persistir solo un token de sesión (cookie `httpOnly`) con expiración, en vez del objeto `admin` completo.
3. **H23** — Extender `RutaProtegida` para aceptar `rolesPermitidos` y centralizar la autorización por rol a nivel de rutas.

### Prioridad alta — código muerto y arquitectura
4. **H05** — Eliminar la rama `!admin` inalcanzable en `Dashboard.jsx`.
5. **H11** — Centralizar la URL de la API y las operaciones de clientes en `clientesService.js`.
6. **H18** — Incorporar Vitest + React Testing Library, empezando por funciones puras y componentes chicos.

### Prioridad media — funcionalidad y manejo de errores
7. **H07** — Aclarar "modo demo" en la UI o reemplazar FakeStoreAPI por un backend propio con persistencia real.
8. **H08** — Reutilizar el regex de email de `Login.jsx` y agregar validación de formato de teléfono en `FormCliente.jsx`.
9. **H13** — Verificar `respuesta.ok` y agregar manejo de errores al consultar el detalle de un cliente.
10. **H14** — Mostrar mensaje de error cuando la eliminación de un cliente falla.
11. **H16** — Usar optional chaining y valores por defecto en el filtro de `ListaClientes.jsx`.
12. **H12** — Unificar el uso de `axios`/`fetch` en un solo mecanismo de peticiones HTTP.

### Prioridad baja — mantenibilidad y UX menor
13. **H09** — Calcular los valores de las tarjetas del Dashboard a partir de datos reales.
14. **H10** — Actualizar `name` del `package.json` y el texto del Footer al proyecto y grupo correctos.
15. **H19** — Agregar un enlace de regreso al inicio en la página de error 404.
