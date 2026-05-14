const db = require('../config/database'); // Ajusta la ruta según tu configuración

class MetaRepository {
    
    async create(meta) {
        const query = `
            INSERT INTO metas (NombreUsuario, NombreMeta, Descripcion, MontoObjetivo, MontoActual, FechaInicio, FechaLimite, Estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            meta.NombreUsuario,
            meta.NombreMeta,
            meta.Descripcion,
            meta.MontoObjetivo,
            meta.MontoActual || 0,
            meta.FechaInicio,
            meta.FechaLimite || null,
            meta.Estado || 'pendiente'
        ];
        
        const [result] = await db.execute(query, values);
        return result.insertId;
    }

    async findAllByUser(NombreUsuario) {
        const query = `
            SELECT * FROM metas 
            WHERE NombreUsuario = ? 
            ORDER BY 
                CASE Estado 
                    WHEN 'pendiente' THEN 1 
                    WHEN 'completada' THEN 2 
                    WHEN 'cancelada' THEN 3 
                END,
                FechaLimite ASC
        `;
        const [rows] = await db.execute(query, [NombreUsuario]);
        return rows;
    }

    async findById(idMeta, NombreUsuario) {
        const query = `SELECT * FROM metas WHERE idMeta = ? AND NombreUsuario = ?`;
        const [rows] = await db.execute(query, [idMeta, NombreUsuario]);
        return rows[0] || null;
    }

    async update(idMeta, NombreUsuario, metaData) {
        const fields = [];
        const values = [];

        if (metaData.NombreMeta !== undefined) {
            fields.push('NombreMeta = ?');
            values.push(metaData.NombreMeta);
        }
        if (metaData.Descripcion !== undefined) {
            fields.push('Descripcion = ?');
            values.push(metaData.Descripcion);
        }
        if (metaData.MontoObjetivo !== undefined) {
            fields.push('MontoObjetivo = ?');
            values.push(metaData.MontoObjetivo);
        }
        if (metaData.MontoActual !== undefined) {
            fields.push('MontoActual = ?');
            values.push(metaData.MontoActual);
        }
        if (metaData.FechaInicio !== undefined) {
            fields.push('FechaInicio = ?');
            values.push(metaData.FechaInicio);
        }
        if (metaData.FechaLimite !== undefined) {
            fields.push('FechaLimite = ?');
            values.push(metaData.FechaLimite);
        }
        if (metaData.Estado !== undefined) {
            fields.push('Estado = ?');
            values.push(metaData.Estado);
        }

        if (fields.length === 0) return false;

        values.push(idMeta, NombreUsuario);
        const query = `UPDATE metas SET ${fields.join(', ')} WHERE idMeta = ? AND NombreUsuario = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    }

    async updateProgress(idMeta, NombreUsuario, nuevoMonto) {
        const query = `
            UPDATE metas 
            SET MontoActual = ?,
                Estado = CASE 
                    WHEN ? >= MontoObjetivo THEN 'completada'
                    ELSE Estado
                END
            WHERE idMeta = ? AND NombreUsuario = ?
        `;
        const [result] = await db.execute(query, [nuevoMonto, nuevoMonto, idMeta, NombreUsuario]);
        return result.affectedRows > 0;
    }

    async delete(idMeta, NombreUsuario) {
        const query = `DELETE FROM metas WHERE idMeta = ? AND NombreUsuario = ?`;
        const [result] = await db.execute(query, [idMeta, NombreUsuario]);
        return result.affectedRows > 0;
    }

    async getEstadisticas(NombreUsuario) {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN Estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN Estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
                AVG(CASE WHEN Estado = 'pendiente' THEN (MontoActual / MontoObjetivo) * 100 ELSE NULL END) as progresoPromedio
            FROM metas 
            WHERE NombreUsuario = ?
        `;
        const [rows] = await db.execute(query, [NombreUsuario]);
        return rows[0];
    }
}

module.exports = new MetaRepository();