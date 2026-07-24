package com.evansong.services;

import com.evansong.dtos.user.LoginUserDto;
import com.evansong.dtos.user.RegisterUserDto;
import com.evansong.dtos.user.UserResponseDto;
import com.evansong.models.Rol;
import com.evansong.models.Usuario;
import com.evansong.repositories.autenticacion.AuthRepository;
import com.evansong.repositories.autenticacion.AuthRepositoryImpl;
import com.evansong.utils.JwtUtil;
import com.evansong.utils.PasswordUtil;

public class AuthService {

    private final AuthRepository authRepository;

    public AuthService() {
        this.authRepository = new AuthRepositoryImpl();
    }

    /**
     * Registrar usuario
     */
    public UserResponseDto register(RegisterUserDto dto) {

        UserResponseDto response = new UserResponseDto();

        // Validar campos vacíos
        if (dto.getNombreCompleto() == null || dto.getNombreCompleto().trim().isEmpty()
                || dto.getCorreo() == null || dto.getCorreo().trim().isEmpty()
                || dto.getTelefono() == null || dto.getTelefono().trim().isEmpty()
                || dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {

            response.setSuccess(false);
            response.setMessage("Todos los campos son obligatorios.");
            return response;
        }

        // Verificar si el correo ya existe
        if (authRepository.existsByCorreo(dto.getCorreo())) {

            response.setSuccess(false);
            response.setMessage("El correo ya está registrado.");
            return response;
        }

        // Crear rol Corista (id = 2)
        Rol rol = new Rol();
        rol.setIdRol(2);

        // Crear usuario
        Usuario usuario = new Usuario();

        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setCorreo(dto.getCorreo());
        usuario.setTelefono(dto.getTelefono());

        // Encriptar contraseña
        usuario.setPassword(
                PasswordUtil.hashPassword(dto.getPassword())
        );

        usuario.setRol(rol);

        // Guardar
        boolean registrado = authRepository.register(usuario);

        if (!registrado) {

            response.setSuccess(false);
            response.setMessage("No fue posible registrar el usuario.");

            return response;

        }

        response.setSuccess(true);
        response.setMessage("Usuario registrado correctamente.");

        return response;

    }

    /**
     * Iniciar sesión
     */
    public UserResponseDto login(LoginUserDto dto) {

        UserResponseDto response = new UserResponseDto();

        // Validar campos
        if (dto.getCorreo() == null || dto.getCorreo().trim().isEmpty()
                || dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {

            response.setSuccess(false);
            response.setMessage("Correo y contraseña son obligatorios.");

            return response;
        }

        // Buscar usuario
        Usuario usuario = authRepository.findByCorreo(dto.getCorreo());

        if (usuario == null) {

            response.setSuccess(false);
            response.setMessage("Correo o contraseña incorrectos.");

            return response;
        }

        // Verificar contraseña
        boolean coincide = PasswordUtil.verifyPassword(
                dto.getPassword(),
                usuario.getPassword()
        );

        if (!coincide) {

            response.setSuccess(false);
            response.setMessage("Correo o contraseña incorrectos.");

            return response;
        }

        // Generar JWT
        String token = JwtUtil.generateToken(
                usuario.getIdUsuario(),
                usuario.getCorreo(),
                usuario.getRol().getNombre()
        );

        // Respuesta
        response.setSuccess(true);
        response.setMessage("Inicio de sesión exitoso.");

        response.setIdUsuario(usuario.getIdUsuario());
        response.setNombreCompleto(usuario.getNombreCompleto());
        response.setCorreo(usuario.getCorreo());
        response.setTelefono(usuario.getTelefono());
        response.setRol(usuario.getRol().getNombre());
        response.setToken(token);

        return response;

    }

}