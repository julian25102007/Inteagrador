package com.evansong.dtos.user;

public class LoginUserDto {

    private String correo;
    private String password;

    // Constructor vacío
    public LoginUserDto() {
    }

    // Constructor
    public LoginUserDto(String correo, String password) {
        this.correo = correo;
        this.password = password;
    }

    // Getters

    public String getCorreo() {
        return correo;
    }

    public String getPassword() {
        return password;
    }

    // Setters

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}