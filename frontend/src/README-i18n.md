# Migración de Internacionalización a i18next

## Estado Actual

El proyecto utiliza un sistema de internacionalización básico con objetos JavaScript que contienen las traducciones en español e inglés.

## Plan de Migración

Migrar a **i18next** para mejorar la escalabilidad y agregar soporte para más idiomas.

### Idiomas Objetivo

- ✅ Español (es)
- ✅ Inglés (en)
- 🎯 Portugués (pt)
- 🎯 Francés (fr)
- 🎯 Italiano (it)
- 🎯 Alemán (de)

### Estructura Propuesta

```
frontend/src/
├── i18n/
│   ├── index.ts              # Configuración de i18next
│   ├── resources/
│   │   ├── es/
│   │   │   ├── common.json   # Elementos comunes
│   │   │   ├── game.json     # Interfaz del juego
│   │   │   ├── cards.json    # Nombres y descripciones de cartas
│   │   │   └── landing.json  # Página de inicio
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── game.json
│   │   │   ├── cards.json
│   │   │   └── landing.json
│   │   └── pt/...            # Otros idiomas
│   └── hooks/
│       └── useTranslation.ts # Hook personalizado
```

### Ejemplo de Uso Futuro

```typescript
// En lugar de:
const title = appState.language === 'es' ? 'Tu Proyecto' : 'Your Project';

// Usaremos:
const { t } = useTranslation();
const title = t('game.yourProject');
```

### Archivos JSON Ejemplo

```json
// es/game.json
{
  "yourProject": "Tu Proyecto",
  "otherPlayers": "Otros Jugadores",
  "gameLog": "Registro del Juego",
  "actions": {
    "playCard": "Jugar Carta",
    "discardCards": "Descartar Cartas"
  }
}
```

### Beneficios de la Migración

1. **Escalabilidad**: Fácil agregar nuevos idiomas
2. **Mantenibilidad**: Traducciones separadas del código
3. **Características Avanzadas**: Pluralización, interpolación, namespaces
4. **Herramientas**: Integración con servicios de traducción
5. **Rendimiento**: Carga lazy de idiomas

### Tareas Pendientes

- [ ] Instalar y configurar i18next
- [ ] Crear estructura de archivos JSON
- [ ] Migrar traducciones existentes
- [ ] Implementar hook useTranslation personalizado
- [ ] Actualizar todos los componentes
- [ ] Agregar idiomas adicionales
- [ ] Configurar carga lazy de traducciones
