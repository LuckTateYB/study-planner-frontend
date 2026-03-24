# Study Planner
### Planificador Inteligente de Estudio

---

## Tabla de Contenidos

1. [Descripción del Problema](#1-descripción-del-problema)
2. [Solución Propuesta](#2-solución-propuesta)
3. [Objetivos del Sistema](#3-objetivos-del-sistema)
4. [Requerimientos Funcionales y No Funcionales](#4-requerimientos-funcionales-y-no-funcionales)
5. [Arquitectura y Tecnologías](#5-arquitectura-y-tecnologías)

---

## 1. Descripción del Problema

Los estudiantes universitarios se enfrentan de manera recurrente a una problemática de organización académica que impacta directamente en su rendimiento: la gestión simultánea de múltiples cursos con distintos niveles de dificultad, fechas de evaluación distribuidas de forma no uniforme y una cantidad limitada de horas disponibles para el estudio.

Esta situación genera consecuencias concretas y medibles:

- **Falta de priorización.** Sin un criterio objetivo, el estudiante tiende a dedicar tiempo a los cursos que le resultan más cómodos o accesibles, descuidando aquellos de mayor dificultad o con evaluaciones más próximas.
- **Mala distribución del tiempo.** La ausencia de una planificación estructurada provoca sesiones de estudio irregulares, sin coherencia entre el esfuerzo invertido y la urgencia real de cada materia.
- **Estudio de último momento.** La falta de anticipación lleva al estudiante a concentrar el esfuerzo en las horas previas a la evaluación, lo cual reduce la retención del conocimiento y eleva los niveles de estrés.
- **Desorganización académica general.** La acumulación de estas situaciones afecta no solo el rendimiento en evaluaciones individuales, sino la trayectoria académica del estudiante en su conjunto.

El problema central no es la falta de tiempo, sino la ausencia de un sistema que analice los datos disponibles —cursos, fechas y horas libres— y los convierta en un plan de estudio ejecutable, priorizado y adaptado a la realidad del estudiante.

---

## 2. Solución Propuesta

Study Planner es una aplicación web que permite al estudiante registrar sus cursos, evaluaciones y disponibilidad horaria, y a partir de esos datos genera automáticamente un plan de estudio diario optimizado.

El sistema resuelve el problema mediante un algoritmo de planificación que combina dos variables clave para calcular la prioridad de cada curso:

- **Urgencia:** determinada por la proximidad de la fecha de evaluación. A menor cantidad de días restantes, mayor peso asignado al curso en el plan diario.
- **Dificultad:** definida por el propio estudiante en una escala del 1 al 5. Los cursos más exigentes reciben una proporción mayor de las horas disponibles.

La fórmula de prioridad aplicada es la siguiente:

```
score = (0.6 × urgencia_normalizada) + (0.4 × dificultad_normalizada)
```

Con base en estos puntajes, el sistema distribuye las horas disponibles por día de forma proporcional entre los cursos activos —aquellos cuya evaluación aún no ha ocurrido— y genera un plan organizado por fechas desde el día actual hasta la última evaluación registrada.

Adicionalmente, el sistema contempla la integración con un servicio externo de inteligencia artificial que puede analizar los patrones de estudio y proponer ajustes opcionales al plan antes de su generación final. Esta integración está diseñada como una interfaz intercambiable, de modo que el proveedor de IA puede ser reemplazado sin afectar el núcleo del sistema.

El plan es tratado como un artefacto regenerable: cada vez que el estudiante modifica sus datos —agrega un curso, actualiza una fecha o cambia sus horas disponibles— el sistema recalcula y reemplaza el plan anterior por completo, garantizando que el resultado siempre refleje el estado actual de la información.

---

## 3. Objetivos del Sistema

### Objetivo General

Desarrollar una aplicación web que permita a los estudiantes generar automáticamente un plan de estudio diario optimizado, basado en la dificultad de sus cursos, las fechas de sus evaluaciones y el tiempo disponible para estudiar.

### Objetivos Específicos

- Permitir el registro, edición y eliminación de cursos con su respectivo nivel de dificultad.
- Permitir el registro, edición y eliminación de evaluaciones asociadas a cursos existentes.
- Implementar un algoritmo de planificación que combine urgencia y dificultad para distribuir las horas de estudio disponibles de forma priorizada.
- Generar un plan de estudio diario que se actualice automáticamente ante cualquier cambio en los datos del estudiante.
- Integrar un servicio externo de inteligencia artificial como capa opcional de análisis y sugerencia sobre el plan generado.
- Presentar el plan de estudio al estudiante de forma organizada, clara y navegable por fecha.
- Garantizar el aislamiento de datos entre usuarios mediante autenticación y asociación explícita de cada recurso a un usuario registrado.

---

## 4. Requerimientos Funcionales y No Funcionales

### 4.1 Requerimientos Funcionales

| ID | Descripción |
|----|-------------|
| RF-01 | El sistema debe permitir al usuario registrar cursos con nombre y nivel de dificultad del 1 al 5. |
| RF-02 | El sistema debe permitir al usuario editar y eliminar cursos registrados. |
| RF-03 | El sistema debe permitir registrar evaluaciones asociadas a un curso, incluyendo nombre y fecha. |
| RF-04 | El sistema debe permitir editar y eliminar evaluaciones registradas. |
| RF-05 | El sistema debe permitir al usuario definir las horas disponibles de estudio por día. |
| RF-06 | El sistema debe generar automáticamente un plan de estudio basado en los datos registrados. |
| RF-07 | El sistema debe mostrar el plan de estudio organizado por días, con los cursos priorizados dentro de cada jornada. |
| RF-08 | El sistema debe permitir recalcular el plan cuando el usuario modifique cualquier dato de entrada. |
| RF-09 | El sistema debe reemplazar el plan anterior al generar uno nuevo, manteniendo únicamente el plan activo más reciente. |
| RF-10 | El sistema debe autenticar al usuario y aislar sus datos del resto de usuarios registrados. |

### 4.2 Requerimientos No Funcionales

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Rendimiento | El sistema debe generar un plan de estudio en menos de 2 segundos para hasta 20 cursos registrados. |
| RNF-02 | Usabilidad | La interfaz debe permitir al usuario registrar cursos, evaluaciones y visualizar el plan sin necesidad de documentación adicional. |
| RNF-03 | Escalabilidad | La arquitectura debe permitir incorporar nuevas funcionalidades —como estadísticas de rendimiento o recomendaciones personalizadas— sin rediseñar el sistema base. |
| RNF-04 | Mantenibilidad | El código debe seguir los principios de separación de responsabilidades mediante la arquitectura MVC, facilitando la modificación independiente de cada capa. |
| RNF-05 | Interoperabilidad | La integración con el servicio de IA externa debe estar abstraída mediante una interfaz, permitiendo cambiar de proveedor sin afectar el núcleo del sistema. |
| RNF-06 | Seguridad | Los datos de cada usuario deben estar aislados mediante autenticación. Ningún usuario debe poder acceder a los recursos de otro. |
| RNF-07 | Disponibilidad | El sistema debe operar de forma estable en entorno de desarrollo con H2 en memoria, y estar preparado para migración a motor relacional en producción. |

---

## 5. Arquitectura y Tecnologías

### 5.1 Modelo de Arquitectura

Study Planner sigue una arquitectura de capas desacopladas bajo el patrón **MVC (Modelo - Vista - Controlador)**, con frontend y backend independientes que se comunican exclusivamente a través de una **API REST**.

```
Angular Client (Frontend)
        ↓  HTTP / REST
StudyPlanController (Backend)
        ↓
   Service Layer
        ↓
   Algorithm Layer  ←→  AI Service (API Externa)
        ↓
  Repository Layer
        ↓
   Base de Datos
```

El sistema se divide en dos capas conceptuales:

- **Capa de Interacción de Usuario:** comprende el frontend Angular y los servicios de registro de datos (cursos y evaluaciones). Su responsabilidad es recibir la entrada del usuario, validarla y comunicarla al backend.
- **Core del Proyecto — IA + Algoritmo:** comprende el servicio de generación del plan, el algoritmo de planificación y la integración con el servicio de IA externa. Su responsabilidad es procesar los datos y producir el plan de estudio optimizado.

### 5.2 Tecnologías

#### Backend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Java | 21 | Lenguaje principal del backend |
| Spring Boot | 3.3 | Framework base de la aplicación |
| Spring Web | — | Exposición de endpoints REST |
| Spring Data JPA | — | Persistencia y acceso a datos |
| Hibernate | — | ORM para mapeo objeto-relacional |
| H2 Database | — | Base de datos en memoria para desarrollo |
| Lombok | — | Reducción de código repetitivo en entidades y DTOs |
| Bean Validation | — | Validación declarativa de entrada en DTOs |
| Spring Boot DevTools | — | Recarga automática en desarrollo |

#### Frontend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Angular | 20 | Framework principal del frontend |
| TypeScript | 5.4 | Lenguaje de desarrollo del frontend |
| RxJS | 7.8 | Programación reactiva y manejo de observables |
| Angular Forms | — | Formularios reactivos con validación |
| Angular Router | — | Navegación entre páginas de la aplicación |
| Angular HttpClient | — | Comunicación HTTP con el backend |
| Node.js | 22 | Entorno de ejecución para Angular CLI |
| fnm | — | Gestor de versiones de Node.js |

#### Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| IntelliJ IDEA | IDE para el desarrollo del backend |
| Visual Studio Code | IDE para el desarrollo del frontend |
| Maven | Gestión de dependencias y build del backend |
| Angular CLI | Scaffolding y build del frontend |

### 5.3 Modelo de Datos

El esquema de base de datos está compuesto por cinco entidades relacionales. El usuario es la entidad raíz del sistema; todos los recursos le pertenecen y están aislados por su identidad.

```
users
  id, name, email, password_hash, created_at

courses
  id, user_id (FK), name, difficulty_level

exams
  id, course_id (FK), name, exam_date

study_plans
  id, user_id (FK, UNIQUE), daily_available_hours,
  start_date, end_date, generated_at

study_sessions
  id, study_plan_id (FK), course_id (FK),
  session_date, hours_assigned, priority_order
```

**Relaciones principales:**

- Un usuario posee muchos cursos.
- Un usuario posee un único plan de estudio activo (`UNIQUE` sobre `user_id`).
- Un curso tiene muchas evaluaciones.
- Un plan de estudio contiene muchas sesiones de estudio.
- Cada sesión de estudio referencia el curso al que corresponde.
- La eliminación en cascada garantiza que al eliminar un curso se eliminan sus evaluaciones y sus sesiones asociadas; al regenerar un plan, las sesiones anteriores se eliminan automáticamente.

---

*Documento generado para el proyecto Study Planner.*