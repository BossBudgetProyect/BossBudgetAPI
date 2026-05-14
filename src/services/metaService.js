const metaRepository = require('../repositories/metaRepository');
const Meta = require('../models/meta');

class MetaService {
    
    async crearMeta(metaData, NombreUsuario) {
        // Validaciones
        if (!metaData.NombreMeta || metaData.NombreMeta.trim() === '') {
            throw new Error('El nombre de la meta es obligatorio');
        }
        
        if (!metaData.MontoObjetivo || metaData.MontoObjetivo <= 0) {
            throw new Error('El monto objetivo debe ser mayor a 0');
        }
        
        if (metaData.MontoActual && metaData.MontoActual < 0) {
            throw new Error('El monto actual no puede ser negativo');
        }
        
        if (metaData.MontoActual && metaData.MontoActual > metaData.MontoObjetivo) {
            throw new Error('El monto actual no puede superar el monto objetivo');
        }
        
        if (!metaData.FechaInicio) {
            throw new Error('La fecha de inicio es obligatoria');
        }
        
        if (metaData.FechaLimite && new Date(metaData.FechaLimite) < new Date(metaData.FechaInicio)) {
            throw new Error('La fecha límite no puede ser anterior a la fecha de inicio');
        }
        
        const meta = {
            NombreUsuario,
            NombreMeta: metaData.NombreMeta.trim(),
            Descripcion: metaData.Descripcion || null,
            MontoObjetivo: metaData.MontoObjetivo,
            MontoActual: metaData.MontoActual || 0,
            FechaInicio: metaData.FechaInicio,
            FechaLimite: metaData.FechaLimite || null,
            Estado: metaData.Estado || 'pendiente'
        };
        
        const idMeta = await metaRepository.create(meta);
        return { idMeta, ...meta };
    }
    
    async listarMetas(NombreUsuario) {
        const metas = await metaRepository.findAllByUser(NombreUsuario);
        return metas.map(meta => new Meta(
            meta.idMeta,
            meta.NombreUsuario,
            meta.NombreMeta,
            meta.Descripcion,
            meta.MontoObjetivo,
            meta.MontoActual,
            meta.FechaInicio,
            meta.FechaLimite,
            meta.Estado
        ));
    }
    
    async obtenerMeta(idMeta, NombreUsuario) {
        const meta = await metaRepository.findById(idMeta, NombreUsuario);
        if (!meta) {
            throw new Error('Meta no encontrada');
        }
        return new Meta(
            meta.idMeta,
            meta.NombreUsuario,
            meta.NombreMeta,
            meta.Descripcion,
            meta.MontoObjetivo,
            meta.MontoActual,
            meta.FechaInicio,
            meta.FechaLimite,
            meta.Estado
        );
    }
    
    async actualizarMeta(idMeta, metaData, NombreUsuario) {
        // Validar que la meta existe
        await this.obtenerMeta(idMeta, NombreUsuario);
        
        // Validaciones específicas
        if (metaData.MontoObjetivo !== undefined && metaData.MontoObjetivo <= 0) {
            throw new Error('El monto objetivo debe ser mayor a 0');
        }
        
        if (metaData.MontoActual !== undefined && metaData.MontoActual < 0) {
            throw new Error('El monto actual no puede ser negativo');
        }
        
        if (metaData.FechaLimite && metaData.FechaInicio && new Date(metaData.FechaLimite) < new Date(metaData.FechaInicio)) {
            throw new Error('La fecha límite no puede ser anterior a la fecha de inicio');
        }
        
        const actualizado = await metaRepository.update(idMeta, NombreUsuario, metaData);
        if (!actualizado) {
            throw new Error('No se pudo actualizar la meta');
        }
        
        return true;
    }
    
    async actualizarProgreso(idMeta, NombreUsuario, nuevoMonto) {
        const meta = await this.obtenerMeta(idMeta, NombreUsuario);
        
        if (nuevoMonto < 0) {
            throw new Error('El monto no puede ser negativo');
        }
        
        if (nuevoMonto > meta.MontoObjetivo) {
            throw new Error(`El monto no puede superar ${meta.MontoObjetivo}`);
        }
        
        const actualizado = await metaRepository.updateProgress(idMeta, NombreUsuario, nuevoMonto);
        if (!actualizado) {
            throw new Error('No se pudo actualizar el progreso');
        }
        
        return true;
    }
    
    async eliminarMeta(idMeta, NombreUsuario) {
        await this.obtenerMeta(idMeta, NombreUsuario);
        const eliminado = await metaRepository.delete(idMeta, NombreUsuario);
        if (!eliminado) {
            throw new Error('No se pudo eliminar la meta');
        }
        return true;
    }
    
    async obtenerEstadisticas(NombreUsuario) {
        return await metaRepository.getEstadisticas(NombreUsuario);
    }
}

module.exports = new MetaService();