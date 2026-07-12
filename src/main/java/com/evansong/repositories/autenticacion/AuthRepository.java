package com.evansong.repositories.autenticacion;

import com.evansong.models.Usuario;

public interface AuthRepository {

    /**
     * Buscar usuario por correo
     */
    Usuario findByCorreo(String correo);

    /**
     * Verifica si el correo ya existe
     */
    boolean existsByCorreo(String correo);

    /**
     * Registrar usuario
     */
    boolean register(Usuario usuario);

}