package com.evansong.dtos.canto;

public class SearchCantoDTO {

    private String texto;
    private Integer idTiempo;
    private Integer idMomento;
    private String dificultad;

    public SearchCantoDTO() {
    }

    public SearchCantoDTO(String texto, Integer idTiempo,
                          Integer idMomento, String dificultad) {
        this.texto = texto;
        this.idTiempo = idTiempo;
        this.idMomento = idMomento;
        this.dificultad = dificultad;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Integer getIdTiempo() {
        return idTiempo;
    }

    public void setIdTiempo(Integer idTiempo) {
        this.idTiempo = idTiempo;
    }

    public Integer getIdMomento() {
        return idMomento;
    }

    public void setIdMomento(Integer idMomento) {
        this.idMomento = idMomento;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }
}