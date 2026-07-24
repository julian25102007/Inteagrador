package com.evansong.repositories.canto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.evansong.database.DatabaseConfig;
import com.evansong.dtos.canto.CreateCantoDTO;
import com.evansong.dtos.canto.SearchCantoDTO;
import com.evansong.dtos.canto.UpdateCantoDTO;
import com.evansong.models.Canto;

public class CantoRepositoryImpl implements CantoRepository {

    public CantoRepositoryImpl() {
    }

    /**
     * Convierte un ResultSet en un objeto Canto.
     */
    private Canto mapRow(ResultSet rs) throws SQLException {

        Canto canto = new Canto();

        canto.setIdCanto(rs.getInt("id_canto"));
        canto.setTitulo(rs.getString("titulo"));
        canto.setAutor(rs.getString("autor"));
        canto.setIdTiempo(rs.getInt("id_tiempo"));
        canto.setIdMomento(rs.getInt("id_momento"));
        canto.setDificultad(rs.getString("dificultad"));
        canto.setLetra(rs.getString("letra"));
        canto.setUrlYoutube(rs.getString("url_youtube"));

        return canto;
    }

    @Override
    public Canto crear(CreateCantoDTO dto) {

        String sql = """
                INSERT INTO canto
                (
                    titulo,
                    autor,
                    id_tiempo,
                    id_momento,
                    dificultad,
                    letra,
                    url_youtube
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        try (
                Connection connection = DatabaseConfig.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
        ) {

            ps.setString(1, dto.getTitulo());

            if (dto.getAutor() == null || dto.getAutor().isBlank()) {
                ps.setString(2, "Desconocido");
            } else {
                ps.setString(2, dto.getAutor());
            }

            ps.setInt(3, dto.getIdTiempo());
            ps.setInt(4, dto.getIdMomento());
            ps.setString(5, dto.getDificultad());
            ps.setString(6, dto.getLetra());
            ps.setString(7, dto.getUrlYoutube());

            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();

            if (keys.next()) {
                return obtenerPorId(keys.getInt(1)).orElse(null);
            }

            return null;

        } catch (SQLException e) {
            throw new RuntimeException("Error al registrar el canto.", e);
        }

    }

    @Override
    public Optional<Canto> obtenerPorId(Integer idCanto) {

        String sql = """
                SELECT *
                FROM canto
                WHERE id_canto = ?
                """;

        try (
                Connection connection = DatabaseConfig.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)
        ) {

            ps.setInt(1, idCanto);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return Optional.of(mapRow(rs));
            }

            return Optional.empty();

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener el canto.", e);
        }

    }

    // =====================================================
    // MÉTODOS PENDIENTES (Parte 2)
    // =====================================================

    @Override
    public List<Canto> obtenerTodos(){ String sql = """
            SELECT *
            FROM canto
            ORDER BY titulo
            """;

            List<Canto> cantos = new ArrayList<>();

            try (
            Connection connection = DatabaseConfig.getConnection();
            PreparedStatement ps = connection.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()
            )
            {

        while (rs.next()) {
            cantos.add(mapRow(rs));
        }

        return cantos;
        }
        catch (SQLException e) {
            throw new RuntimeException("Error al obtener los cantos.", e);
             }

    }

    @Override
    public List<Canto> buscar(SearchCantoDTO filtros) {

    StringBuilder sql = new StringBuilder("""
            SELECT *
            FROM canto
            WHERE 1 = 1
            """);

    if (filtros.getTexto() != null && !filtros.getTexto().isBlank()) {
        sql.append(" AND titulo LIKE ?");
    }

    if (filtros.getIdTiempo() != null) {
        sql.append(" AND id_tiempo = ?");
    }

    if (filtros.getIdMomento() != null) {
        sql.append(" AND id_momento = ?");
    }

    if (filtros.getDificultad() != null && !filtros.getDificultad().isBlank()) {
        sql.append(" AND dificultad = ?");
    }

    sql.append(" ORDER BY titulo");

    List<Canto> cantos = new ArrayList<>();

try (
        Connection connection = DatabaseConfig.getConnection();
        PreparedStatement ps = connection.prepareStatement(sql.toString())
) {

    int indice = 1;

    if (filtros.getTexto() != null && !filtros.getTexto().isBlank()) {
        ps.setString(indice++, "%" + filtros.getTexto().trim() + "%");
    }

    if (filtros.getIdTiempo() != null) {
        ps.setInt(indice++, filtros.getIdTiempo());
    }

    if (filtros.getIdMomento() != null) {
        ps.setInt(indice++, filtros.getIdMomento());
    }

    if (filtros.getDificultad() != null && !filtros.getDificultad().isBlank()) {
        ps.setString(indice++, filtros.getDificultad().trim());
    }

    ResultSet rs = ps.executeQuery();

    while (rs.next()) {
        cantos.add(mapRow(rs));
    }

    return cantos;

} catch (SQLException e) {
    throw new RuntimeException("Error al buscar los cantos.", e);
}
    }


@Override
public boolean actualizar(UpdateCantoDTO dto) {

    String sql = """
            UPDATE canto
            SET
                titulo = ?,
                autor = ?,
                id_tiempo = ?,
                id_momento = ?,
                dificultad = ?,
                letra = ?,
                url_youtube = ?
            WHERE id_canto = ?
            """;

    try (
            Connection connection = DatabaseConfig.getConnection();
            PreparedStatement ps = connection.prepareStatement(sql)
    ) {

        ps.setString(1, dto.getTitulo());

        if (dto.getAutor() == null || dto.getAutor().isBlank()) {
            ps.setString(2, "Desconocido");
        } else {
            ps.setString(2, dto.getAutor());
        }

        ps.setInt(3, dto.getIdTiempo());
        ps.setInt(4, dto.getIdMomento());
        ps.setString(5, dto.getDificultad());
        ps.setString(6, dto.getLetra());
        ps.setString(7, dto.getUrlYoutube());
        ps.setInt(8, dto.getIdCanto());

        int filasAfectadas = ps.executeUpdate();

        return filasAfectadas > 0;

    } catch (SQLException e) {
        throw new RuntimeException("Error al actualizar el canto.", e);
    } 
      
}

    @Override
public boolean eliminar(Integer idCanto) {

    String sql = """
            DELETE FROM canto
            WHERE id_canto = ?
            """;

    try (
            Connection connection = DatabaseConfig.getConnection();
            PreparedStatement ps = connection.prepareStatement(sql)
    ) {

        ps.setInt(1, idCanto);

        int filasAfectadas = ps.executeUpdate();

        return filasAfectadas > 0;

    } catch (SQLException e) {
        throw new RuntimeException("Error al eliminar el canto.", e);
    }
}
    @Override
public boolean existe(Integer idCanto) {

    String sql = """
            SELECT 1
            FROM canto
            WHERE id_canto = ?
            """;

    try (
            Connection connection = DatabaseConfig.getConnection();
            PreparedStatement ps = connection.prepareStatement(sql)
    ) {

        ps.setInt(1, idCanto);

        ResultSet rs = ps.executeQuery();

        return rs.next();

    } catch (SQLException e) {
        throw new RuntimeException("Error al verificar la existencia del canto.", e);
    }
}

    @Override
public boolean existeTiempoLiturgico(Integer idTiempo) {

    String sql = """
            SELECT 1
            FROM tiempo_liturgico
            WHERE id_tiempo = ?
            """;

    try (
            Connection connection = DatabaseConfig.getConnection();
            PreparedStatement ps = connection.prepareStatement(sql)
    ) {

        ps.setInt(1, idTiempo);

        ResultSet rs = ps.executeQuery();

        return rs.next();

    } catch (SQLException e) {
        throw new RuntimeException("Error al verificar la existencia del tiempo litúrgico.", e);
    }
}

    @Override
public boolean existeMomentoMisa(Integer idMomento) {

    String sql = """
            SELECT 1
            FROM momento_misa
            WHERE id_momento = ?
            """;

    try (
            Connection connection = DatabaseConfig.getConnection();
            PreparedStatement ps = connection.prepareStatement(sql)
    ) {

        ps.setInt(1, idMomento);

        ResultSet rs = ps.executeQuery();

        return rs.next();

    } catch (SQLException e) {
        throw new RuntimeException("Error al verificar la existencia del momento de la misa.", e);
    }
}

}