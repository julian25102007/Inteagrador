package com.evansong.backend.model;

public class CorreoCoordinador {
    private int idCorreo;
    private String correo;
    private boolean utilizado;
    private String fechaCreacion;

    public CorreoCoordinador() {}

    public int getIdCorreo() { return idCorreo; }
    public void setIdCorreo(int idCorreo) { this.idCorreo = idCorreo; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public boolean isUtilizado() { return utilizado; }
    public void setUtilizado(boolean utilizado) { this.utilizado = utilizado; }
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
