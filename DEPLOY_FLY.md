# Instrucciones de despliegue para Fly.io

## Prerequisitos
1. Instalar flyctl: `scoop install flyctl` (Windows)
2. Autenticarse: `fly auth login`

## 1. Desplegar Base de Datos (PostgreSQL)
```bash
# Crear la base de datos usando la imagen oficial de Postgres
fly postgres create --name tp-devops-db --region mia --vm-size shared-cpu-1x --volume-size 10

# Esto creará automáticamente:
# - La aplicación PostgreSQL
# - Usuario y contraseña
# - Volume persistente
# - Configuración de red interna
```

## 2. Desplegar Backend
```bash
cd tp-devops-be

# Lanzar aplicación (sin desplegar aún)
fly launch --no-deploy

# Configurar secretos (usar las credenciales de la DB creada anteriormente)
fly secrets set DB_PASS="contraseña_generada_por_postgres"
fly secrets set JWT_SECRET="tu_jwt_secret"

# Desplegar
fly deploy
```

## 3. Desplegar Frontend
```bash
cd ../tp-devops-fe

# Lanzar aplicación
fly launch --no-deploy

# El frontend ya está configurado para conectarse al backend
# Verifica que BE_HOST apunte al nombre correcto del backend
# Si el backend tiene un nombre diferente, actualiza en fly.toml

# Desplegar
fly deploy
```

## Variables de entorno importantes

### Backend (tp-devops-be)
- `DB_PASS`: Contraseña de PostgreSQL (usar fly secrets set)
- `JWT_SECRET`: Secret para JWT (usar fly secrets set)
- `DB_HOST`: tp-devops-db.internal (ya configurado)

### Frontend (tp-devops-fe)
- `BE_HOST`: Debe apuntar al dominio del backend (ej: tp-devops-be.fly.dev)

## Comandos útiles
```bash
# Ver logs
fly logs -a tp-devops-be
fly logs -a tp-devops-fe
fly logs -a tp-devops-db

# Verificar estado
fly status -a tp-devops-be
fly status -a tp-devops-fe

# Conectarse a la DB
fly postgres connect -a tp-devops-db

# Escalar aplicaciones
fly scale count 2 -a tp-devops-be
```

## Notas importantes
1. La base de datos se crea con `fly postgres create` que es más fácil que usar un fly.toml custom
2. Las aplicaciones se comunican usando dominios internos (*.internal) y externos (*.fly.dev)
3. Los secretos deben configurarse usando `fly secrets set` no variables de entorno públicas
4. Los volúmenes para PostgreSQL se crean automáticamente con el comando `fly postgres create`