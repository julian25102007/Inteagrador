package com.evansong.backend.model;

public class Asistencia {
    private int idAsistencia;
    private int idEvento;
    private int idUsuario;
    private boolean asistira;

    public Asistencia() {}

    public int getIdAsistencia() { return idAsistencia; }
    public void setIdAsistencia(int idAsistencia) { this.idAsistencia = idAsistencia; }
    public int getIdEvento() { return idEvento; }
    public void setIdEvento(int idEvento) { this.idEvento = idEvento; }
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
    public boolean isAsistira() { return asistira; }
    public void setAsistira(boolean asistira) { this.asistira = asistira; }
}
