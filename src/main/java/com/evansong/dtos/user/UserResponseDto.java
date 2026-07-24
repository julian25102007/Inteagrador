package com.evansong.dtos.user;

public class UserResponseDto {

    private boolean success;
    private String message;
    private Integer idUsuario;
    private String nombreCompleto;
    private String correo;
    private String telefono;
    private String rol;
    private String token;

    // Constructor vacío
    public UserResponseDto() {
    }

    // Constructor completo
    public UserResponseDto(
            boolean success,
            String message,
            Integer idUsuario,
            String nombreCompleto,
            String correo,
            String telefono,
            String rol,
            String token
    ) {

        this.success = success;
        this.message = message;
        this.idUsuario = idUsuario;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.telefono = telefono;
        this.rol = rol;
        this.token = token;

    }

    // Getters

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public String getCorreo() {
        return correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getRol() {
        return rol;
    }

    public String getToken() {
        return token;
    }

    // Setters

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public void setToken(String token) {
        this.token = token;
    }

}