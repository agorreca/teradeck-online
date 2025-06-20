# 🎮 Reglas del Juego TeraDeck

## 📋 Información General

**TeraDeck** es un juego de cartas estratégico para 2-6 jugadores donde debes completar tu proyecto tecnológico mientras saboteas a tus rivales.

### 🎯 Objetivo

Sé el primero en reunir **4 módulos estables** en tu área de juego para completar tu proyecto.

### ⏱️ Duración

Aproximadamente 20 minutos por partida.

### 🎴 Contenido del Mazo

```mermaid
pie title Composición del Mazo TeraDeck (68 cartas)
    "Módulos" : 21
    "Parches" : 20
    "Bugs" : 17
    "Operaciones" : 10
```

#### Módulos (21 cartas)

- 🔵 Backend: 5 cartas
- 🟡 Frontend: 5 cartas
- 🔴 Mobile: 5 cartas
- 🟢 Data Science: 5 cartas
- 🌈 Multicolor: 1 carta

#### Bugs (17 cartas)

- 🔵 Backend: 4 cartas
- 🟡 Frontend: 4 cartas
- 🔴 Mobile: 4 cartas
- 🟢 Data Science: 4 cartas
- 🌈 Multicolor: 1 carta

#### Parches (20 cartas)

- 🔵 Backend: 4 cartas
- 🟡 Frontend: 4 cartas
- 🔴 Mobile: 4 cartas
- 🟢 Data Science: 4 cartas
- 🌈 Multicolor: 4 cartas

#### Operaciones (10 cartas)

- 🏗️ Cambio de Arquitecto: 3 cartas
- 🎯 Reclutamiento del Groso: 3 cartas
- 🎣 Phishing Interno: 2 cartas
- 🎉 Fiesta de Fin de Año: 1 carta
- 🔄 Project Swap: 1 carta

## 🚀 Preparación del Juego

```mermaid
flowchart TD
    A[Mezclar todas las cartas] --> B[Repartir 3 cartas a cada jugador]
    B --> C[Formar mazo boca abajo]
    C --> D[Crear pila de descarte vacía]
    D --> E[Determinar primer jugador]
    E --> F[¡Comenzar partida!]
```

## 🎲 Secuencia de Turno

```mermaid
flowchart TD
    A[Inicio del Turno] --> B{¿Turno saltado?}
    B -->|Sí| C[Reducir turnos saltados]
    C --> D[Pasar al siguiente jugador]
    B -->|No| E[Elegir Acción]
    E --> F{Tipo de Acción}
    F -->|Jugar Carta| G[Ejecutar efecto de carta]
    F -->|Descartar| H[Descartar 1-3 cartas]
    G --> I[Robar hasta tener 3 cartas]
    H --> I
    I --> J[Verificar condición de victoria]
    J --> K{¿Alguien ganó?}
    K -->|Sí| L[¡Fin del juego!]
    K -->|No| D
    D --> A
```

## 🏗️ Estados de los Módulos

```mermaid
stateDiagram-v2
    [*] --> Libre
    Libre --> Buggeado: Bug aplicado
    Libre --> Parcheado: Parche aplicado
    Buggeado --> Libre: Parche (fixeo)
    Buggeado --> Colapsado: Segundo bug
    Parcheado --> Libre: Bug aplicado
    Parcheado --> Estabilizado: Segundo parche
    Estabilizado --> [*]: Permanente
    Colapsado --> [*]: Destruido
```

### 📊 Descripción de Estados

| Estado              | Descripción                | Puede Ganar |
| ------------------- | -------------------------- | ----------- |
| 🟢 **Libre**        | Sin bugs ni parches        | ✅          |
| 🔴 **Buggeado**     | Tiene al menos un bug      | ❌          |
| 🔧 **Parcheado**    | Protegido con parche       | ✅          |
| 🛡️ **Estabilizado** | Protección permanente      | ✅          |
| 💥 **Colapsado**    | Destruido (va al descarte) | -           |

## 🃏 Efectos de las Cartas

### 🏗️ Módulos

```mermaid
flowchart LR
    A[Jugar Módulo] --> B{¿Ya tienes este tipo?}
    B -->|Sí| C[❌ Jugada inválida]
    B -->|No| D[✅ Colocar en área de juego]
    D --> E[Estado: Libre]
```

**Reglas:**

- No puedes tener dos módulos del mismo tipo
- Los módulos multicolor pueden reemplazar cualquier tipo
- Se colocan en estado "Libre"

### 🐛 Bugs

```mermaid
flowchart TD
    A[Aplicar Bug] --> B{Estado del módulo objetivo}
    B -->|Libre| C[Buggear módulo]
    B -->|Parcheado| D[Destruir parche + bug]
    B -->|Buggeado| E[Colapsar módulo]
    B -->|Estabilizado| F[❌ Inmune]

    C --> G[Estado: Buggeado]
    D --> H[Ambos al descarte]
    E --> I[Todo al descarte]
    H --> J[Estado: según contenido restante]
```

### 🔧 Parches

```mermaid
flowchart TD
    A[Aplicar Parche] --> B{Estado del módulo objetivo}
    B -->|Libre| C[Parchear módulo]
    B -->|Buggeado| D[Fixear bug]
    B -->|Parcheado| E[Estabilizar módulo]
    B -->|Estabilizado| F[❌ Ya estable]

    C --> G[Estado: Parcheado]
    D --> H[Bug + parche al descarte]
    E --> I[Estado: Estabilizado]
    H --> J[Estado: según contenido restante]
```

### ⚙️ Operaciones

#### 🏗️ Cambio de Arquitecto

```mermaid
flowchart TD
    A[Cambio de Arquitecto] --> B[Seleccionar jugador 1]
    B --> C[Seleccionar módulo 1]
    C --> D[Seleccionar jugador 2]
    D --> E[Seleccionar módulo 2]
    E --> F{¿Intercambio válido?}
    F -->|Sí| G[Intercambiar módulos]
    F -->|No| H[❌ Tipos duplicados]
    G --> I[✅ Intercambio completado]
```

#### 🎯 Reclutamiento del Groso

```mermaid
flowchart TD
    A[Reclutamiento del Groso] --> B[Seleccionar jugador objetivo]
    B --> C[Seleccionar módulo]
    C --> D{¿Módulo válido?}
    D -->|Estabilizado| E[❌ No se puede robar]
    D -->|Otro estado| F[✅ Robar módulo]
    F --> G{¿Ya tienes este tipo?}
    G -->|Sí| H[❌ No puedes tenerlo]
    G -->|No| I[Módulo robado exitosamente]
```

#### 🎣 Phishing Interno

```mermaid
flowchart TD
    A[Phishing Interno] --> B[Identificar tus bugs]
    B --> C[Por cada bug en tus módulos]
    C --> D[Buscar módulos libres compatibles]
    D --> E{¿Color compatible?}
    E -->|Sí| F[Transferir bug]
    E -->|No| G[Bug permanece contigo]
    F --> H[Bug transferido]
    G --> I[No se puede transferir]
```

#### 🎉 Fiesta de Fin de Año

```mermaid
flowchart TD
    A[Fiesta de Fin de Año] --> B[Todos los demás jugadores]
    B --> C[Descartan toda su mano]
    C --> D[Pierden el próximo turno]
    D --> E[Jugador actual: segundo turno]
    E --> F[Después todos vuelven a la normalidad]
```

#### 🔄 Project Swap

```mermaid
flowchart TD
    A[Project Swap] --> B[Seleccionar jugador objetivo]
    B --> C[Intercambiar TODOS los módulos]
    C --> D[Incluye bugs, parches y estabilizados]
    D --> E[Proyectos completamente intercambiados]
```

## 🌈 Reglas de Compatibilidad de Colores

```mermaid
graph LR
    subgraph "Multicolor puede afectar"
        MC[🌈 Multicolor] --> B1[🔵 Backend]
        MC --> F1[🟡 Frontend]
        MC --> M1[🔴 Mobile]
        MC --> D1[🟢 Data Science]
    end

    subgraph "Cualquier color puede afectar Multicolor"
        B2[🔵 Backend] --> MC2[🌈 Multicolor]
        F2[🟡 Frontend] --> MC2
        M2[🔴 Mobile] --> MC2
        D2[🟢 Data Science] --> MC2
    end
```

### 📋 Tabla de Compatibilidad

| Carta/Módulo    | 🔵 Backend | 🟡 Frontend | 🔴 Mobile | 🟢 Data Science | 🌈 Multicolor |
| --------------- | ---------- | ----------- | --------- | --------------- | ------------- |
| 🔵 Backend      | ✅         | ❌          | ❌        | ❌              | ✅            |
| 🟡 Frontend     | ❌         | ✅          | ❌        | ❌              | ✅            |
| 🔴 Mobile       | ❌         | ❌          | ✅        | ❌              | ✅            |
| 🟢 Data Science | ❌         | ❌          | ❌        | ✅              | ✅            |
| 🌈 Multicolor   | ✅         | ✅          | ✅        | ✅              | ✅            |

## 🏆 Condiciones de Victoria

```mermaid
flowchart TD
    A[Verificar Victoria] --> B[Contar módulos estables]
    B --> C{¿4 módulos estables?}
    C -->|Sí| D[🏆 ¡VICTORIA!]
    C -->|No| E[Continuar jugando]

    subgraph "Módulos Estables"
        F[🟢 Libre]
        G[🔧 Parcheado]
        H[🛡️ Estabilizado]
        I[❌ NO: Buggeado]
    end
```

### ✅ Módulos que Cuentan para Victoria

- ✅ **Libre**: Sin bugs ni parches
- ✅ **Parcheado**: Protegido con parche
- ✅ **Estabilizado**: Protección permanente

### ❌ Módulos que NO Cuentan

- ❌ **Buggeado**: Tiene al menos un bug

## 💡 Estrategias Básicas

### 🛡️ Defensiva

- Estabiliza módulos clave temprano
- Mantén parches para emergencias
- Protege contra ataques específicos

### ⚔️ Ofensiva

- Identifica módulos críticos del rival
- Usa operaciones para disrumpir
- Coordina ataques de múltiples bugs

### 🔄 Adaptativa

- Observa las cartas descartadas
- Ajusta estrategia según el juego
- Aprovecha oportunidades de intercambio

---

**¡Que comience la batalla por el mejor proyecto!** 🚀
