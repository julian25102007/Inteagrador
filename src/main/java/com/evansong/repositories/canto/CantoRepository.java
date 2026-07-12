package com.evansong.repositories.canto;

import java.util.List;
import java.util.Optional;

import com.evansong.dtos.canto.CreateCantoDTO;
import com.evansong.dtos.canto.SearchCantoDTO;
import com.evansong.dtos.canto.UpdateCantoDTO;
import com.evansong.models.Canto;

public interface CantoRepository {

    // ==========================
    // CRUD
    // ==========================

    Canto crear(CreateCantoDTO dto);

    Optional<Canto> obtenerPorId(Integer idCanto);

    List<Canto> obtenerTodos();

    boolean actualizar(UpdateCantoDTO dto);

    boolean eliminar(Integer idCanto);

    // ==========================
    // BÚSQUEDA
    // ==========================

    List<Canto> buscar(SearchCantoDTO filtros);

    // ==========================
    // VALIDACIONES
    // ==========================

    boolean existe(Integer idCanto);

    boolean existeTiempoLiturgico(Integer idTiempo);

    boolean existeMomentoMisa(Integer idMomento);

}