package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Usuario;
import com.evansong.backend.util.AuthMiddleware;
import io.javalin.Javalin;
import io.javalin.http.ForbiddenResponse;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: USUARIO
 * La creación va en AuthRoutes (/auth/registro), aquí solo leer/editar/eliminar.
 */
public class UsuarioRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/usuarios  (?rol=Coordinador|Corista) (solo Coordinador)
        app.get("/usuarios", ctx -> {
            AuthMiddleware.exigirRol(ctx, "Coordinador");
            String rol = ctx.queryParam("rol");
            String sql = "SELECT * FROM usuario" + (rol != null ? " WHERE rol = ?" : "") + " ORDER BY id_usuario";
            List<Usuario> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (rol != null) ps.setString(1, rol);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer usuarios: " + e.getMessage());
            }
        });

        // LEER UNO (GET) -> http://localhost:3000/usuarios/1  (Coordinador o el propio usuario)
        app.get("/usuarios/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            exigirCoordinadorODueno(ctx, id);
            String sql = "SELECT * FROM usuario WHERE id_usuario = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) ctx.json(mapear(rs));
                    else ctx.status(404).result("No se encontró el usuario con ID " + id);
                }
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/usuarios/1  (perfil, sin contrasena) (Coordinador o el propio usuario)
        app.put("/usuarios/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            exigirCoordinadorODueno(ctx, id);
            Usuario u = ctx.bodyAsClass(Usuario.class);
            String sql = "UPDATE usuario SET nombre_completo=?, correo=?, telefono=?, foto_perfil=?, observacion=? WHERE id_usuario = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, u.getNombreCompleto());
                ps.setString(2, u.getCorreo());
                ps.setString(3, u.getTelefono());
                ps.setString(4, u.getFotoPerfil());
                ps.setString(5, u.getObservacion());
                ps.setInt(6, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Usuario actualizado correctamente.");
                else ctx.status(404).result("No se encontró el usuario.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/usuarios/1  (solo Coordinador)
        app.delete("/usuarios/{id}", ctx -> {
            AuthMiddleware.exigirRol(ctx, "Coordinador");
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM usuario WHERE id_usuario = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Usuario con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el usuario con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    /** Permite la acción si el usuario es Coordinador, o si está editando/viendo su propio perfil. */
    private static void exigirCoordinadorODueno(io.javalin.http.Context ctx, int idSolicitado) {
        String rol = AuthMiddleware.rolActual(ctx);
        int idPropio = AuthMiddleware.idUsuarioActual(ctx);
        if (!"Coordinador".equals(rol) && idPropio != idSolicitado) {
            throw new ForbiddenResponse("No tienes permisos para acceder a este perfil.");
        }
    }

    private static Usuario mapear(ResultSet rs) throws SQLException {
        Usuario u = new Usuario();
        u.setIdUsuario(rs.getInt("id_usuario"));
        u.setNombreCompleto(rs.getString("nombre_completo"));
        u.setCorreo(rs.getString("correo"));
        u.setTelefono(rs.getString("telefono"));
        u.setRol(rs.getString("rol"));
        u.setFotoPerfil(rs.getString("foto_perfil"));
        Timestamp fecha = rs.getTimestamp("fecha_registro");
        u.setFechaRegistro(fecha != null ? fecha.toString().replace(' ', 'T') : null);
        u.setObservacion(rs.getString("observacion"));
        // OJO: nunca incluimos la contraseña en la respuesta
        return u;
    }
}
