package com.evansong.models;

import java.sql.Timestamp;

public class Usuario {

    private int idUsuario;

    private String nombreCompleto;

    private String correo;

    private String telefono;

    private String password;

    private Timestamp createdAt;

    private Rol rol;

    // Constructor vacío
    public Usuario() {
    }

    // Constructor completo
    public Usuario(
            int idUsuario,
            String nombreCompleto,
            String correo,
            String telefono,
            String password,
            Timestamp createdAt,
            Rol rol
    ) {

        this.idUsuario = idUsuario;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.telefono = telefono;
        this.password = password;
        this.createdAt = createdAt;
        this.rol = rol;

    }

    // Getters

    public int getIdUsuario() {
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

    public String getPassword() {
        return password;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public Rol getRol() {
        return rol;
    }

    // Setters

    public void setIdUsuario(int idUsuario) {
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

    public void setPassword(String password) {
        this.password = password;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

}