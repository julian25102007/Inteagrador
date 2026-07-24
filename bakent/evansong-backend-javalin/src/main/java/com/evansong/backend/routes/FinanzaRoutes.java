package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Finanza;
import io.javalin.Javalin;

import java.sql.*;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: FINANZA
 */
public class FinanzaRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/finanzas  (?tipo=Ingreso|Egreso)
        app.get("/finanzas", ctx -> {
            String tipo = ctx.queryParam("tipo");
            String sql = "SELECT * FROM finanza" + (tipo != null ? " WHERE tipo = ?" : "") + " ORDER BY fecha DESC";
            List<Finanza> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (tipo != null) ps.setString(1, tipo);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer finanzas: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/finanzas
        app.post("/finanzas", ctx -> {
            Finanza f = ctx.bodyAsClass(Finanza.class);
            if (f.getMonto() == null || f.getMonto().signum() <= 0) {
                ctx.status(400).result("El monto debe ser un número mayor a 0.");
                return;
            }
            String sql = "INSERT INTO finanza (tipo, monto, fecha, concepto, id_usuario) VALUES (?,?,?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, f.getTipo());
                ps.setBigDecimal(2, f.getMonto());
                ps.setDate(3, Date.valueOf(f.getFecha()));
                ps.setString(4, f.getConcepto());
                ps.setInt(5, f.getIdUsuario());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    f.setIdFinanza(keys.getInt(1));
                }
                ctx.status(201).json(f);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/finanzas/1
        app.put("/finanzas/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Finanza f = ctx.bodyAsClass(Finanza.class);
            if (f.getMonto() == null || f.getMonto().signum() <= 0) {
                ctx.status(400).result("El monto debe ser un número mayor a 0.");
                return;
            }
            String sql = "UPDATE finanza SET tipo=?, monto=?, fecha=?, concepto=? WHERE id_finanza = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, f.getTipo());
                ps.setBigDecimal(2, f.getMonto());
                ps.setDate(3, Date.valueOf(f.getFecha()));
                ps.setString(4, f.getConcepto());
                ps.setInt(5, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Movimiento financiero actualizado correctamente.");
                else ctx.status(404).result("No se encontró el movimiento.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/finanzas/1
        app.delete("/finanzas/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM finanza WHERE id_finanza = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Movimiento con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el movimiento con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static Finanza mapear(ResultSet rs) throws SQLException {
        Finanza f = new Finanza();
        f.setIdFinanza(rs.getInt("id_finanza"));
        f.setTipo(rs.getString("tipo"));
        f.setMonto(rs.getBigDecimal("monto"));
        f.setFecha(rs.getDate("fecha") != null ? rs.getDate("fecha").toString() : null);
        f.setConcepto(rs.getString("concepto"));
        f.setIdUsuario(rs.getInt("id_usuario"));
        return f;
    }
}
