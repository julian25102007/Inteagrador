package com.evansong.backend.model;

public class Evento {
    private int idEvento;
    private String nombre;
    private String fecha;
    private String horaInicio;
    private String horaFin;
    private String lugar;
    private String descripcion;
    private boolean activarAsistencia;
    private int idUsuario;

    public Evento() {}

    public int getIdEvento() { return idEvento; }
    public void setIdEvento(int idEvento) { this.idEvento = idEvento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }
    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }
    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public boolean isActivarAsistencia() { return activarAsistencia; }
    public void setActivarAsistencia(boolean activarAsistencia) { this.activarAsistencia = activarAsistencia; }
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}
