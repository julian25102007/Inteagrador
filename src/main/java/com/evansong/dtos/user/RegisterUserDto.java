package com.evansong.dtos.user;

public class RegisterUserDto {

    private String nombreCompleto;

    private String correo;

    private String telefono;

    private String password;

    // Constructor vacío
    public RegisterUserDto() {
    }

    // Constructor
    public RegisterUserDto(
            String nombreCompleto,
            String correo,
            String telefono,
            String password
    ) {

        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.telefono = telefono;
        this.password = password;

    }

    // Getters

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public String getCorreo() {
        return correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getPassword() {
        return password;
    }

    // Setters

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}