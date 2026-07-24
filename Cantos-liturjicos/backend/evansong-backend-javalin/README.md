# Evansong Backend — Javalin

API REST hecha con **Javalin** (el mismo framework de tu tarea), JDBC puro
y tu esquema real de Evansong. Se conecta a **MySQL o PostgreSQL** según
`config.properties`. No está conectado al frontend React.

No necesitas tener Maven instalado: el proyecto trae el **Maven Wrapper**
(`mvnw` / `mvnw.cmd`), que descarga Maven automáticamente la primera vez.

⚠️ **Nota importante:** este proyecto no lo pude compilar en mi entorno
porque no tengo acceso a Maven Central (de ahí es de donde Maven descarga
Javalin, Jackson, Jetty, etc.). Revisé el código a mano (balance de llaves,
paréntesis, imports, nombres de clase, uso consistente de la API de
Javalin), pero **el primer paso que debes hacer en tu máquina es
`.\mvnw.cmd compile`** para confirmar que compila limpio. Si sale algún
error, mándamelo y lo resolvemos.

---

## 1. Requisitos

- **Java 17+**
- Conexión a internet la primera vez que corras `mvnw` (para que descargue
  Maven y las dependencias del proyecto)
- Tu base de datos ya creada (`sql/schema_mysql.sql` o `sql/schema_postgresql.sql`)

## 2. Configura tu conexión

Edita `config.properties`:
```properties
db.type=mysql
db.host=localhost
db.port=3306
db.name=evansong
db.user=root
db.password=TU_CONTRASENA_AQUI

server.port=3000
```

## 3. Compila y corre

**Windows:**
```powershell
.\mvnw.cmd compile
.\mvnw.cmd exec:java
```

**Mac/Linux:**
```bash
./mvnw compile
./mvnw exec:java
```

Si prefieres generar un `.jar` ejecutable (con todo incluido) y correrlo después sin Maven:
```powershell
.\mvnw.cmd package
java -jar target\evansong-backend-javalin.jar
```

Deberías ver:
```
======================================================
 Evansong Backend (Javalin)
 Escuchando en: http://localhost:3000
 Base de datos: mysql://localhost:3306/evansong
======================================================
```

## 4. Estructura

```
config.properties           -> conexión a la BD y puerto del servidor
sql/schema_mysql.sql          -> DDL para MySQL
sql/schema_postgresql.sql     -> DDL equivalente para PostgreSQL
src/main/java/com/evansong/backend/
  Main.java                    -> arranca Javalin y registra todas las rutas
  config/
    AppConfig.java              -> lee config.properties
    ConnectionManager.java       -> arma la conexión JDBC (MySQL o PostgreSQL)
  model/                          -> un POJO por entidad (para Jackson)
  routes/                         -> una clase por entidad, con SQL explícito:
      AuthRoutes, CorreoCoordinadorRoutes, UsuarioRoutes,
      TiempoLiturgicoRoutes, MomentoMisaRoutes, CantoRoutes,
      ListaRoutes, ListaCantoRoutes, EsquemaRoutes, DetalleEsquemaRoutes,
      EventoRoutes, AsistenciaRoutes, PublicacionRoutes,
      InventarioRoutes, FinanzaRoutes
  util/PasswordUtil.java          -> hash de contraseñas (PBKDF2)
```

Cada clase de `routes/` sigue el mismo patrón que tu tarea:
```java
app.get("/cantos", ctx -> {
    String sql = "SELECT * FROM canto ...";
    try (Connection conexion = ConnectionManager.getConnection();
         PreparedStatement ps = conexion.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {
        ...
        ctx.json(lista);
    } catch (Exception e) {
        ctx.status(500).result("Error: " + e.getMessage());
    }
});
```

## 5. Endpoints

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro` | Crea un usuario. Si `rol` es `"Coordinador"`, valida contra `correo_coordinador`. |
| POST | `/auth/login` | Verifica correo + contraseña. |

### Correos de coordinador
`GET /correos-coordinador`, `POST /correos-coordinador`, `DELETE /correos-coordinador/{id}`

### Usuarios
`GET /usuarios?rol=`, `GET /usuarios/{id}`, `PUT /usuarios/{id}`, `DELETE /usuarios/{id}`

### Catálogo y contenido
| Recurso | Ruta base | Filtros |
|---|---|---|
| Tiempos litúrgicos | `/tiempos-liturgicos` | — |
| Momentos de misa | `/momentos-misa` | — |
| Cantos | `/cantos` | `?titulo=` |
| Listas | `/listas` | `?idUsuario=` |
| Cantos de una lista | `/lista-canto/lista/{idLista}`, `POST /lista-canto`, `DELETE /lista-canto/{idLista}/{idCanto}` | — |
| Esquemas | `/esquemas` | `?idUsuario=` |
| Detalle de esquema | `/detalle-esquema` | `?idEsquema=` |
| Eventos | `/eventos` | `?desde=&hasta=` |
| Asistencias | `POST /asistencias` (upsert), `GET /asistencias/evento/{id}`, `GET /asistencias/usuario/{id}` | — |
| Publicaciones | `/publicaciones` | — |
| Inventario | `/inventario` | `?nombre=` |
| Finanzas | `/finanzas` | `?tipo=` |

Todos siguen: `GET` (listar), `POST` (crear), `PUT /{id}` (actualizar), `DELETE /{id}` (eliminar).

## 6. Notas

- Contraseñas hasheadas con PBKDF2 (JDK puro, sin librería externa extra).
- `usuario.contrasena` nunca se devuelve en las respuestas.
- No tiene autenticación por sesión/token; queda abierto para pruebas con Postman/curl.
