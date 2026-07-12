package com.evansong.repositories.autenticacion;

import com.evansong.database.DatabaseConfig;
import com.evansong.models.Rol;
import com.evansong.models.Usuario;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AuthRepositoryImpl implements AuthRepository {

    @Override
    public Usuario findByCorreo(String correo) {

        String sql = """
                SELECT
                    u.*,
                    r.nombre
                FROM usuario u
                INNER JOIN rol r
                    ON u.id_rol = r.id_rol
                WHERE u.correo = ?
                """;

        try (

                Connection connection = DatabaseConfig.getConnection();

                PreparedStatement statement =
                        connection.prepareStatement(sql)

        ) {

            statement.setString(1, correo);

            ResultSet result = statement.executeQuery();

            if (result.next()) {

                Rol rol = new Rol();

                rol.setIdRol(result.getInt("id_rol"));
                rol.setNombre(result.getString("nombre"));

                Usuario usuario = new Usuario();

                usuario.setIdUsuario(result.getInt("id_usuario"));
                usuario.setNombreCompleto(result.getString("nombre_completo"));
                usuario.setCorreo(result.getString("correo"));
                usuario.setTelefono(result.getString("telefono"));
                usuario.setPassword(result.getString("password"));
                usuario.setCreatedAt(result.getTimestamp("created_at"));
                usuario.setRol(rol);

                return usuario;

            }

        } catch (Exception e) {

            e.printStackTrace();

        }

        return null;

    }

    @Override
    public boolean existsByCorreo(String correo) {

        String sql = """
                SELECT COUNT(*) AS total
                FROM usuario
                WHERE correo = ?
                """;

        try (

                Connection connection = DatabaseConfig.getConnection();

                PreparedStatement statement =
                        connection.prepareStatement(sql)

        ) {

            statement.setString(1, correo);

            ResultSet result = statement.executeQuery();

            if (result.next()) {

                return result.getInt("total") > 0;

            }

        } catch (Exception e) {

            e.printStackTrace();

        }

        return false;

    }

    @Override
    public boolean register(Usuario usuario) {

        String sql = """
                INSERT INTO usuario
                (
                    nombre_completo,
                    correo,
                    telefono,
                    password,
                    id_rol
                )
                VALUES
                (
                    ?,?,?,?,?
                )
                """;

        try (

                Connection connection = DatabaseConfig.getConnection();

                PreparedStatement statement =
                        connection.prepareStatement(sql)

        ) {

            statement.setString(1, usuario.getNombreCompleto());
            statement.setString(2, usuario.getCorreo());
            statement.setString(3, usuario.getTelefono());
            statement.setString(4, usuario.getPassword());

            statement.setInt(5,
                    usuario.getRol().getIdRol());

            return statement.executeUpdate() > 0;

        } catch (Exception e) {

            e.printStackTrace();

        }

        return false;

    }

}