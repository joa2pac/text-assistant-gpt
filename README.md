# Carrier VTEX Service

**Klaviyo-VTEX Integration**\
This project is a backend integration that connects VTEX (e-commerce platform) with Klaviyo (email marketing and automation platform), enabling two-way data synchronization between the two platforms.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Installing Dependencies](#installing-dependencies)
- [Docker Compose (Development)](#docker-compose-development)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Flow Diagrams](#flow-diagrams)
- [Middleware and Validations](#middleware-and-validations)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Lint and Prettier](#lint-and-prettier)

---

## Tech Stack

**Server:**

- **Node.js** (v18, as per Dockerfile)
- **Express.js** (Web framework)
- **TypeScript** (Programming language)
- **MongoDB** (Mongoose as ODM)

---

## Environment Variables

Configure the following variables in your environment (`.env`):

```bash
PORT=5420
NODE_ENV=development

API_URL="https://localhost:$PORT"
FRONTEND_URL="https://localhost:3000"
KLAVIYO_API_URL=https://a.klaviyo.com/api

CRYPTOJS_SECRET_KEY=123456

MONGODB_URL=mongodb://127.0.0.1:27017/carrier-vtex

JWT_SECRET=myVerySecretString

NUMBER_OF_BATCH_FOR_ORDERS_CRON=20
NUMBER_OF_BATCH_FOR_PRODUCTS_CRON=100
```

---

## Installing Dependencies

To install all dependencies, run:

```bash
yarn install-all
```

---

## Docker Compose (Development)

To run the project locally, you'll need **MongoDB** and **Redis**. Below is an example `docker-compose.yml` for your local setup:

> 📝 This file is not included in the repository. Create it manually based on your configuration.

```yaml
version: '3.9'

networks:
  klaviyovtex:
    driver: overlay

services:
  mongodb:
    image: mongo:latest
    ports:
      - '27017:27017'
    volumes:
      - ./data/db:/data/db

  redis:
    image: redis:latest
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  app:
    image: IMAGE_URI
    working_dir: /opt/app
    networks:
      - klaviyovtex
    ports:
      - "9001:3000"

volumes:
  redis_data:
    driver: local
```

---

## Running the Project

Start the servers in development mode:

```bash
npm run start-dev
```

---

## Project Structure

```
.
├── src/                              # Source files
│   ├── config/                       # Configuration files
│   ├── constants/                    # Constants
│   ├── controllers/                  # Controllers
│   ├── docs/                         # Documentation files
│   ├── enums/                        # TypeScript enums
│   ├── interfaces/                   # TypeScript interfaces
│   ├── jobs/                         # Background jobs and cron tasks
│   ├── lib/                          # Core libraries and utilities
│   ├── middlewares/                  # Express middlewares
│   ├── models/                       # Mongoose models
│   ├── routes/                       # API routes
│   ├── services/                     # Business logic services
│   ├── tests/                        # Test files
│   ├── utils/                        # Utility functions
│   ├── validations/                  # Request validation schemas
│   ├── app.ts                        # Express app configuration
│   ├── index.ts                      # Application entry point
│   ├── custom.d.ts                   # Custom TypeScript declarations
│   └── declaration.d.ts              # TypeScript declarations
├── deployment/                       # Deployment configurations
│   └── docker-compose.yml            # Production docker-compose
├── dist/                             # Compiled JavaScript files
├── .github/                          # GitHub configurations
├── .husky/                           # Git hooks
├── .vscode/                          # VS Code configurations
├── docker-compose.yml                # Development docker-compose
├── Dockerfile                        # Docker configuration
├── Jenkinsfile                       # CI/CD pipeline configuration
├── ecosystem.config.json             # PM2 configuration
├── jest.config.cjs                   # Jest testing configuration
├── package.json                      # Project dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── .commitlintrc.json                # Commit linting rules
├── .dockerignore                     # Docker ignore rules
├── .editorconfig                     # Editor configuration
├── .eslintignore                     # ESLint ignore rules
├── .eslintrc.json                    # ESLint configuration
├── .gitattributes                    # Git attributes
├── .gitignore                        # Git ignore rules
├── .lintstagedrc                     # Lint-staged configuration
├── .npmrc                            # NPM configuration
├── .prettierignore                   # Prettier ignore rules
├── .prettierrc.json                  # Prettier configuration
├── .versionrc                        # Version configuration
├── CHANGELOG.md                      # Changelog
├── README.md                         # Project documentation
└── TODO.md                           # Project todos
```

---

## API Endpoints

List of available routes (base path: `/api/v1`):

### Auth Routes:

- `POST /auth/login` – User authentication
- `POST /auth/refresh-token` – Refresh authentication token

### Onboarding Routes:

- `POST /onboarding/vtex` – VTEX integration setup
- `GET /onboarding/vtex/sales-channel` – Get VTEX sales channels
- `POST /onboarding/vtex/sales-channel` – Set VTEX sales channel
- `GET /onboarding/timezone` – Get available timezones
- `POST /onboarding/auth` – Authentication setup
- `GET /onboarding/sync` – Get sync status
- `POST /onboarding/resync` – Retry synchronization

### Webhooks Routes:

- `POST /webhooks/vtex/orders` – Handle VTEX order webhooks
- `POST /webhooks/vtex/products` – Handle VTEX product webhooks

### Support Routes:

- `GET /support/account-status` – Get account status

### Jobs Routes:

- `GET /jobs` – Get jobs status

### Vitals Routes:

- `GET /` – Health check endpoint

---

## Flow Diagrams

### AUTH:

```mermaid
---
config:
  theme: neo-dark
  look: neo
  themeVariables:
    sequenceMessageTextColor: "#ffffff"
---
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as AuthService
    participant DB as Base de Datos
    participant MW as Middleware

    rect rgb(100, 100, 100)
    U->>FE: POST /api/v1/auth/login\n(vtexUrl, password)
    FE->>BE: POST /api/v1/auth/login
    end

    rect rgb(100, 100, 100)
    BE->>DB: 1. Buscar usuario
    DB-->>BE: Registro de usuario
    BE->>BE: 2. Comparar password
    alt Credenciales válidas
        BE->>BE: 3. Generar JWT (24h)
        BE-->>FE: 200 OK\n{ token }
    else Credenciales inválidas
        BE-->>FE: 401 Unauthorized\nError: credenciales
    end
    end

    rect rgb(100, 100, 100)
    FE-->>U: Respuesta con token
    U->>FE: GET /protected\n(Authorization: Bearer token)
    FE->>BE: GET /protected
    BE->>MW: verifyToken
    alt Token válido
        MW-->>BE: Decodifica userId
        BE-->>FE: 200 OK\n{ datos protegidos }
    else Token inválido/expirado
        MW-->>FE: Error de autenticación
        BE-->>FE: 401 Unauthorized\nToken inválido
    end
    FE-->>U: Respuesta protegida
    end

    rect rgb(100, 100, 100)
    U->>FE: POST /api/v1/auth/refresh-token\n(Authorization: Bearer token exp.)
    FE->>BE: POST /api/v1/auth/refresh-token
    BE->>BE: Verificar token actual
    alt Token actual válido
        BE->>BE: Generar nuevo JWT
        BE-->>FE: 200 OK\n{ newToken }
    else Token inválido
        BE-->>FE: 401 Unauthorized\nRefresh token inválido
    end
    FE-->>U: Respuesta de renovación
    end
```

### ONBOARDING:

```mermaid
---
config:
  theme: neo-dark
  look: neo
  themeVariables:
    sequenceMessageTextColor: "#ffffff"
---
sequenceDiagram
    participant U as Usuario
    participant OS as OnboardingService
    participant VT as VTEX
    participant DB as Base de Datos
    participant KL as Klaviyo
    participant SY as SyncService

    %% Inicio
    rect rgb(100,100,100)
    U->>OS: Inicia Onboarding
    end

    %% Paso 1: VTEX
    rect rgb(100,100,100)
    OS->>VT: POST /api/v1/onboarding/vtex\n(vtexUrl, token)
    VT-->>OS: { valid: true } / { valid: false }
    alt Credenciales VTEX inválidas
        OS-->>U: 401 VTEX inválidas
    else Credenciales VTEX válidas
        OS->>DB: Crear usuario en DB
        DB-->>OS: userId
    end
    end

    %% Paso 2: Klaviyo
    rect rgb(100,100,100)
    OS->>KL: POST /api/v1/onboarding/auth\n(klaviyoKey)
    KL-->>OS: { valid: true } / { valid: false }
    alt Credenciales Klaviyo inválidas
        OS-->>U: 401 Klaviyo inválidas
    else Credenciales Klaviyo válidas
        OS-->>OS: Configurar sincronización
    end
    end

    %% Opciones al cliente
    rect rgb(100,100,100)
    OS-->>U: { syncProducts: bool, periodo: meses }
    end

    %% Confirmación y arranque de sincronización
    rect rgb(100,100,100)
    U->>OS: Confirmar opciones\n(syncProducts, periodo)
    OS->>SY: Inicializar Sync\n(params)
    end

    %% Proceso de sincronización paralelo
    rect rgb(100,100,100)
    par Sincronizar Productos
        SY->>SY: Sync Products
        SY->>SY: Actualizar syncProductsStatus
    and Sincronizar Órdenes
        SY->>SY: Sync Orders
        SY->>SY: Actualizar syncOrdersStatus
    and Sincronizar Customers
        SY->>SY: Sync Customers
        SY->>SY: Actualizar syncCustomersStatus
    end
    SY-->>OS: Estados actualizados
    OS-->>U: Onboarding completado
    end

    %% Configuración adicional
    rect rgb(100,100,100)
    U->>OS: POST /api/v1/preferences\n(timezone)
    OS->>DB: Guardar preferences
    DB-->>OS: OK
    end
```

### WEBHOOK:

```mermaid
---
config:
  theme: neo-dark
  look: neo
  themeVariables:
    sequenceMessageTextColor: "#ffffff"
---
sequenceDiagram
    participant VTEX
    participant WS as WebhookService
    participant OP as OrderProcessor
    participant C as Cliente
    participant PR as Productos
    participant AD as Dirección
    participant PC as Precios
    participant TS as Timestamps
    participant KL as KlaviyoAPI
    participant EH as ErrorHandler
    participant DB as BaseDeDatos

    %% Recepción de Webhook
    rect rgb(100,100,100)
    VTEX->>WS: Evento de Orden
    WS->>OP: POST /api/v1/webhooks/vtex/orders
    end

    %% Validación de Sales Channel
    rect rgb(100,100,100)
    OP->>OP: Validar Sales Channel
    alt No válido
        OP-->>VTEX: 200 OK (orden descartada)
    else Válido
        OP->>OP: Formatear Precios (dividir por 100)
    end
    end

    %% Procesamiento y Formateo de Datos
    rect rgb(100,100,100)
    OP->>OP: Procesar Orden
    OP->>C: Extraer Cliente
    OP->>PR: Extraer Productos
    OP->>AD: Extraer Dirección
    OP->>PC: Extraer Precios
    OP->>TS: Extraer Timestamps
    end

    %% Determinar y Trackear Evento en Klaviyo
    rect rgb(100,100,100)
    OP->>OP: Determinar Tipo de Evento
    alt Canceled
        OP->>KL: Track Canceled Order
    else Invoiced
        OP->>KL: Track Invoiced Order
    else Ready-for-handling
        OP->>KL: Track Ready to Ship
    else Order-accepted
        OP->>KL: Track Placed Order
    end
    end

    %% Manejo de errores
    rect rgb(100,100,100)
    KL-->>OP: Error?
    opt Manejo de Errores
        OP->>EH: Handle Error
        EH->>DB: Actualizar Error Stack
    end
    end

    %% Confirmación final
    rect rgb(100,100,100)
    KL-->>VTEX: 200 OK (evento trackeado)
    end
```

---

## Middleware and Validations

### verifyToken Middleware

```typescript
// src/middlewares/verifyToken.middleware.ts
export const verifyToken: RequestHandler = (req, _res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('Token not present in the request header.');

        const decodedToken = jwt.verify(token, config.jwtSecret);
        if (typeof decodedToken === 'object') {
            const content = decodedToken as IMiddlemanTokenContent;
            req.userId = content.userId;
        }
        next();
    } catch (error) {
        next(new ApiError(httpStatus.UNAUTHORIZED, 'Se detectó un problema con la autenticación'));
    }
};
```

### Validations

#### Auth Validations

```typescript
// src/validations/auth.validation.ts
export const login = {
    body: Joi.object().keys({
        // ... esquema de validación para login
    }),
};
```

#### Onboarding Validations

```typescript
// src/validations/onboarding.validation.ts
export const vtex = {
    body: Joi.object().keys({
        // ... esquema de validación para VTEX
    }),
};
```

#### Account Status Validations

```typescript
// src/validations/accountStatus.validation.ts
export const getAccountStatus = {
    query: Joi.object().keys({
        // ... esquema de validación para estado de cuenta
    }),
};
```

---

## Error Handling

```typescript
// src/middlewares/error.middleware.ts
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const { code } = err;
    let { message } = err;
    const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    // ... manejo de errores
};
```

---

## Logging

# Logging System

El proyecto utiliza el sistema de logging de `conexa-core-server`, que está basado en la biblioteca [Winston](https://github.com/winstonjs/winston).

## Importación del Logger

```typescript
import { Logger } from 'conexa-core-server';
```

## Niveles de Severidad

Los logs deben realizarse según los siguientes niveles de severidad (en orden ascendente, del más importante al menos importante):

```typescript
Logger.error('message'); // level 0 - Errores críticos
Logger.warn('message');  // level 1 - Advertencias
Logger.info('message');  // level 2 - Información general
Logger.http('message');  // level 3 - Logs de peticiones HTTP
Logger.verbose('message'); // level 4 - Información detallada
Logger.debug('message'); // level 5 - Información de depuración
```

## Modos de Operación

### Modo Desarrollo

En modo desarrollo (`NODE_ENV=development`), se imprimen en consola todos los niveles de log.

### Modo Producción

En modo producción (`NODE_ENV=production`), solo se imprimen en consola los logs de nivel info, warn y error.

## Configuración

El sistema de logging está configurado automáticamente según el entorno:

```typescript
// src/app.ts
conexaCore.configure({
    secretKey: config.cryptojsKey,
    securityBypass: config.env !== 'production',
    debug: config.env !== 'production',
    env: config.env,
});
```

## Logging HTTP

El proyecto incluye un logger HTTP específico para las peticiones web:

```typescript
// src/app.ts
app.use(conexaCore.HttpLogger.errorHandler);
```

---

## Lint and Prettier

El proyecto utiliza ESLint y Prettier para mantener la calidad y consistencia del código.

### Configuración de ESLint

La configuración de ESLint se encuentra en `.eslintrc.json`. El proyecto utiliza:

- Extensión de `airbnb-base` y `airbnb-typescript/base` para TypeScript
- Plugins:
  - `jest` para testing
  - `security` para seguridad
  - `prettier` para integración con Prettier
- Reglas personalizadas para TypeScript en archivos `.ts`

Para modificar la configuración de ESLint, actualiza el archivo `.eslintrc.json`.

### Configuración de Prettier

La configuración de Prettier se encuentra en `.prettierrc.json`. Configuración actual:

```json
{
  "parser": "typescript",
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 110,
  "endOfLine": "auto",
  "tabWidth": 4
}
```

